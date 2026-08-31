// HERO FRAME — persistent meta progression (localStorage)
// Pilot profiles (Standard / Iron Frame / Iron Core), salvage bank, shell &
// stage unlocks, devotions, contracts, collection log, stage trials, records.
GH.meta = (function () {
  var M = {};

  M.PROFILES = {
    standard: { key: 'hf_meta_v2', name: 'STANDARD', desc: 'Full hangar support.' },
    iron: { key: 'hf_meta_iron_v1', name: 'IRON FRAME', desc: 'No devotions, no loadout kits. Self-reliant.' },
    hardcore: { key: 'hf_meta_hc_v1', name: 'IRON CORE', desc: 'Iron rules — and one death wipes the profile.' }
  };
  M.profile = 'standard';

  var defaults = function () {
    return {
      salvage: 0,
      shells: { aegis: true, vulcan: true },
      stages: 1,
      devotion: { sol: 0, pyre: 0, keen: 0, verd: 0, ruin: 0 },
      activeDevotion: 'sol',
      bestWave: {},
      bestArena: 0,
      victories: {},
      weekly: null,
      // hunt contracts
      broker: { active: null, points: 0, completed: 0, unlocks: {} },
      // collection log
      collection: {
        kills: {},          // enemy id -> count
        weapons: {},        // upgrade card id -> true
        resonances: {},     // resonance label -> true
        gems: {},           // gem type -> sockets made
        totalRuns: 0, totalKills: 0, totalWins: 0
      },
      // stage trials: stageId -> { taskId: true }
      trials: {},
      // pilot mastery: mechId -> xp
      mastery: {},
      // relic season: reset when id changes
      season: {
        id: null, pts: 0, done: {}, relics: [], claimed: 0,
        counters: { kills: 0, sparks: 0, resonances: 0, contracts: 0 },
        stagesCleared: {}, framesWon: {}
      },
      // signal ciphers: dry-streak pity + owned chase cosmetics
      cipher: { dry: 0, caches: 0 },
      style: { trail: null, paint: null, drone: null, owned: {} }
    };
  };

  M.data = defaults();

  function storageKey() { return M.PROFILES[M.profile].key; }

  M.load = function (profile) {
    if (profile && M.PROFILES[profile]) M.profile = profile;
    else {
      try { M.profile = localStorage.getItem('hf_profile') || 'standard'; } catch (e) { M.profile = 'standard'; }
      if (!M.PROFILES[M.profile]) M.profile = 'standard';
    }
    M.data = defaults();
    try {
      localStorage.setItem('hf_profile', M.profile);
      var raw = localStorage.getItem(storageKey());
      if (raw) {
        var d = JSON.parse(raw);
        var base = M.data;
        for (var k in base) {
          if (d[k] === undefined) continue;
          // merge one level deep so new sub-fields keep defaults
          if (base[k] && typeof base[k] === 'object' && !Array.isArray(base[k]) &&
            d[k] && typeof d[k] === 'object') {
            for (var k2 in d[k]) base[k][k2] = d[k][k2];
          } else {
            base[k] = d[k];
          }
        }
      }
      // migrate the pre-meta coin bank into the standard profile
      if (M.profile === 'standard') {
        var old = parseInt(localStorage.getItem('hf_coins') || '0', 10);
        if (old > 0) {
          M.data.salvage += old;
          localStorage.removeItem('hf_coins');
          M.save();
        }
      }
    } catch (e) { /* storage unavailable — session-only meta */ }
  };

  M.save = function () {
    try { localStorage.setItem(storageKey(), JSON.stringify(M.data)); } catch (e) { /* ignore */ }
  };

  M.isIron = function () { return M.profile === 'iron' || M.profile === 'hardcore'; };
  M.isHardcore = function () { return M.profile === 'hardcore'; };

  // Iron Core death: wipe the profile, engrave the fallen pilot
  M.hardcoreWipe = function (frameName, stageName, wave) {
    var entry = {
      frame: frameName, stage: stageName, wave: wave,
      when: new Date().toISOString().slice(0, 10)
    };
    try {
      var mem = JSON.parse(localStorage.getItem('hf_memorial') || '[]');
      mem.unshift(entry);
      localStorage.setItem('hf_memorial', JSON.stringify(mem.slice(0, 12)));
    } catch (e) { /* ignore */ }
    M.data = defaults();
    M.save();
    return entry;
  };

  M.memorial = function () {
    try { return JSON.parse(localStorage.getItem('hf_memorial') || '[]'); } catch (e) { return []; }
  };

  M.unlockShell = function (id) {
    if (!M.data.shells[id]) {
      M.data.shells[id] = true;
      M.save();
      return true;
    }
    return false;
  };

  M.unlockStage = function (n) {
    if (n > M.data.stages) { M.data.stages = n; M.save(); }
  };

  M.devotionCost = function (path) {
    return 25 + M.data.devotion[path] * 25;
  };

  M.buyDevotion = function (path) {
    if (M.isIron()) return false;
    var cost = M.devotionCost(path);
    if (M.data.devotion[path] >= 5 || M.data.salvage < cost) return false;
    M.data.salvage -= cost;
    M.data.devotion[path]++;
    M.save();
    return true;
  };

  M.devotionBonus = function () {
    if (M.isIron()) {
      return { maxHP: 0, regen: 0, damageMult: 0, atkSpdMult: 0, crit: 0, magnet: 0, xpGain: 0, critMult: 0, boostRegen: 0 };
    }
    var d = M.data.devotion;
    return {
      maxHP: d.sol * 8,
      regen: d.sol >= 4 ? 0.5 : 0,
      damageMult: d.pyre * 0.03,
      atkSpdMult: d.keen * 0.02,
      crit: d.keen * 1,
      magnet: d.verd * 0.08,
      xpGain: d.verd * 0.04,
      critMult: d.ruin * 0.06,
      boostRegen: d.ruin >= 3 ? 0.15 : 0
    };
  };

  // dev overrides: ?unlock=all etc.
  M.applyDevParams = function (search) {
    try {
      var p = new URLSearchParams(search);
      if (p.get('unlock') === 'all') {
        GH.mechs.forEach(function (m) { M.data.shells[m.id] = true; });
        M.data.stages = 6;
      }
      if (p.get('salvage')) M.data.salvage += parseInt(p.get('salvage'), 10) || 0;
      if (p.get('weakboss') === '1') GH.devWeakBoss = true;
      if (p.get('phaseboss') === '1') GH.devPhaseBoss = true;
      if (p.get('god') === '1') GH.devGod = true;
    } catch (e) { /* ignore */ }
  };

  return M;
})();
