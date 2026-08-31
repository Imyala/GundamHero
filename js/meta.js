// HERO FRAME — persistent meta progression (localStorage)
// Salvage bank, shell unlocks, stage unlocks, devotion ranks, records.
GH.meta = (function () {
  var M = {};
  var KEY = 'hf_meta_v2';

  var defaults = function () {
    return {
      salvage: 0,
      shells: { aegis: true, vulcan: true },   // stage bosses unlock the rest
      stages: 1,                                // highest unlocked stage (1-based)
      devotion: { sol: 0, pyre: 0, keen: 0, verd: 0, ruin: 0 },
      activeDevotion: 'sol',
      bestWave: {},                             // per stage id
      bestArena: 0,
      victories: {}
    };
  };

  M.data = defaults();

  M.load = function () {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var d = JSON.parse(raw);
        var base = defaults();
        for (var k in base) if (d[k] !== undefined) base[k] = d[k];
        M.data = base;
      }
      // migrate v1 coin bank
      var old = parseInt(localStorage.getItem('hf_coins') || '0', 10);
      if (old > 0) {
        M.data.salvage += old;
        localStorage.removeItem('hf_coins');
        M.save();
      }
    } catch (e) { /* storage unavailable — session-only meta */ }
  };

  M.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(M.data)); } catch (e) { /* ignore */ }
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
    var cost = M.devotionCost(path);
    if (M.data.devotion[path] >= 5 || M.data.salvage < cost) return false;
    M.data.salvage -= cost;
    M.data.devotion[path]++;
    M.save();
    return true;
  };

  // permanent stat bonuses granted by devotion ranks
  M.devotionBonus = function () {
    var d = M.data.devotion;
    return {
      maxHP: d.sol * 8,
      regen: d.sol >= 4 ? 0.5 : 0,
      damageMult: d.pyre * 0.03,
      atkSpdMult: d.keen * 0.02,
      crit: d.keen * 1,
      magnet: d.verd * 0.08,       // multiplier add
      xpGain: d.verd * 0.04,
      critMult: d.ruin * 0.06,
      boostRegen: d.ruin >= 3 ? 0.15 : 0
    };
  };

  // dev override: ?unlock=all
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
