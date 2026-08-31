// HERO FRAME — long-horizon progression: hunt contracts, stage trials,
// collection log helpers. All state lives in GH.meta.data (per profile).
GH.progress = (function () {
  var P = {};

  // =================================================================
  // HUNT CONTRACTS — the Broker assigns directed kill missions that
  // persist across runs and pay salvage + broker points.
  // =================================================================
  var CULL_TARGETS = ['husk', 'shardling', 'orb', 'spiker', 'brute', 'creeper', 'cinder', 'volt'];
  var HUNT_TARGETS = [
    { id: 'warden', count: 2, pts: 25, salvage: 60 },
    { id: 'carapace', count: 1, pts: 30, salvage: 80 }
  ];

  P.brokerUnlocks = [
    { id: 'bounty1', name: 'Field Bounty I', cost: 30,
      desc: '+10% damage against your contract target.' },
    { id: 'bounty2', name: 'Field Bounty II', cost: 80, requires: 'bounty1',
      desc: 'Field Bounty rises to +20%.' },
    { id: 'pockets', name: 'Deep Pockets', cost: 50,
      desc: 'Contracts pay +25% salvage.' },
    { id: 'favor', name: "Broker's Favor", cost: 40,
      desc: 'Rerolling a contract is free.' },
    { id: 'ledger', name: 'Boss Ledger', cost: 60,
      desc: 'The Broker may assign midboss hunts (bigger payouts).' }
  ];

  P.rerollCost = function () {
    return GH.meta.data.broker.unlocks.favor ? 0 : 25;
  };

  // enemy availability: which stage rosters can supply a target
  function stagesFor(enemyId) {
    var out = [];
    GH.stages.forEach(function (st, i) {
      if ((i + 1) > GH.meta.data.stages) return;
      var types = st.roster(12);
      for (var t = 0; t < types.length; t++) {
        if (types[t].id === enemyId) { out.push(st); return; }
      }
    });
    return out;
  }

  P.generateContract = function () {
    var b = GH.meta.data.broker;
    var scale = 1 + Math.min(2.5, b.completed * 0.15);
    // boss hunts appear once the ledger is bought
    if (b.unlocks.ledger && Math.random() < 0.3) {
      var h = GH.pick(HUNT_TARGETS);
      return {
        kind: 'hunt', target: h.id, need: h.count, have: 0,
        stage: null,
        pts: Math.round(h.pts * scale), salvage: Math.round(h.salvage * scale)
      };
    }
    // cull: pick a target that at least one unlocked stage can supply
    var target = null, stages = [];
    for (var tries = 0; tries < 12 && !target; tries++) {
      var cand = GH.pick(CULL_TARGETS);
      var s = stagesFor(cand);
      if (s.length) { target = cand; stages = s; }
    }
    if (!target) { target = 'husk'; stages = [GH.stages[0]]; }
    var pinned = Math.random() < 0.5 ? GH.pick(stages) : null;
    var need = Math.round(GH.rand(25, 45) * scale) * (target === 'brute' ? 0.4 : 1);
    need = Math.max(6, Math.round(need));
    return {
      kind: 'cull', target: target, need: need, have: 0,
      stage: pinned ? pinned.id : null,
      pts: Math.round((10 + need * 0.35) * (pinned ? 1.25 : 1)),
      salvage: Math.round((20 + need * 0.8) * (pinned ? 1.25 : 1) * scale)
    };
  };

  P.contractLabel = function (c) {
    if (!c) return '';
    var name = c.kind === 'hunt'
      ? GH.enemyDefs[c.target].name
      : GH.enemyDefs[c.target].name + 's';
    var where = c.stage ? ' in ' + stageName(c.stage) : '';
    return 'Destroy ' + c.need + ' ' + name + where;
  };

  function stageName(id) {
    for (var i = 0; i < GH.stages.length; i++) {
      if (GH.stages[i].id === id) return GH.stages[i].name;
    }
    return id;
  }
  P.stageName = stageName;

  // called from killEnemy; returns true when the kill completed the contract
  P.contractKill = function (enemyId, stageId) {
    var b = GH.meta.data.broker;
    var c = b.active;
    if (!c || c.done) return false;
    if (c.target !== enemyId) return false;
    if (c.stage && c.stage !== stageId) return false;
    c.have++;
    if (c.have >= c.need) {
      c.done = true;
      var sal = c.salvage;
      if (b.unlocks.pockets) sal = Math.round(sal * 1.25);
      GH.meta.data.salvage += sal;
      b.points += c.pts;
      b.completed++;
      b.active = null;
      GH.meta.save();
      return { salvage: sal, pts: c.pts };
    }
    return false;
  };

  P.contractDamageBonus = function (enemyId) {
    var b = GH.meta.data.broker;
    var c = b.active;
    if (!c || c.target !== enemyId) return 1;
    if (b.unlocks.bounty2) return 1.2;
    if (b.unlocks.bounty1) return 1.1;
    return 1;
  };

  // =================================================================
  // STAGE TRIALS — four tiers of per-stage tasks paying permanent,
  // stage-scoped perks.
  // =================================================================
  P.trialTiers = [
    { id: 'I', name: 'TIER I', perk: '+15% salvage drops on this stage',
      tasks: [
        { id: 'wave5', desc: 'Reach wave 5' },
        { id: 'sparks40', desc: 'Gather 40 sparks in one run' }
      ] },
    { id: 'II', name: 'TIER II', perk: '+10% XP from sparks on this stage',
      tasks: [
        { id: 'wave10', desc: 'Reach wave 10' },
        { id: 'warden', desc: 'Destroy the Rust Warden' }
      ] },
    { id: 'III', name: 'TIER III', perk: '+5% damage on this stage',
      tasks: [
        { id: 'carapace', desc: 'Destroy the Grave Carapace' },
        { id: 'resonance', desc: 'Complete a Resonance during a run here' }
      ] },
    { id: 'IV', name: 'TIER IV', perk: 'Bosses here drop two gems',
      tasks: [
        { id: 'clear', desc: 'Clear the stage (Classic)' },
        { id: 'nobound', desc: 'Slay the corrupted frame before it goes UNBOUND' }
      ] }
  ];

  P.trialDone = function (stageId, taskId) {
    var t = GH.meta.data.trials[stageId];
    return !!(t && t[taskId]);
  };

  // returns the completed tier count (0-4): tier N done when both its tasks are
  P.trialTier = function (stageId) {
    var tier = 0;
    for (var i = 0; i < P.trialTiers.length; i++) {
      var all = true;
      P.trialTiers[i].tasks.forEach(function (task) {
        if (!P.trialDone(stageId, task.id)) all = false;
      });
      if (all) tier = i + 1; else break;
    }
    return tier;
  };

  // award a task; returns true if newly completed (caller announces/saves)
  P.trialAward = function (stageId, taskId) {
    var t = GH.meta.data.trials;
    if (!t[stageId]) t[stageId] = {};
    if (t[stageId][taskId]) return false;
    t[stageId][taskId] = true;
    GH.meta.save();
    return true;
  };

  P.taskDesc = function (taskId) {
    for (var i = 0; i < P.trialTiers.length; i++) {
      for (var j = 0; j < P.trialTiers[i].tasks.length; j++) {
        if (P.trialTiers[i].tasks[j].id === taskId) return P.trialTiers[i].tasks[j].desc;
      }
    }
    return taskId;
  };

  // =================================================================
  // NAMED ARTIFACTS — handcrafted relics found at specific places in
  // the Shattered Reach. One may be equipped at a time.
  // =================================================================
  P.artifacts = [
    { id: 'bulwark_fragment', name: 'Bulwark Fragment', source: 'Tide Wreckage lair',
      desc: 'When a ward collapses, it detonates — a force nova shoves and wounds the swarm.' },
    { id: 'glacier_core', name: 'Glacier Core', source: 'Glacier Hollow lair',
      desc: 'Whatever strikes your hull is flash-chilled and slowed.' },
    { id: 'harvest_coil', name: 'Harvest Coil', source: 'Verdant Cloister lair',
      desc: 'Kills sometimes shake loose bonus salvage.' },
    { id: 'cinder_heart', name: 'Cinder Heart', source: 'Ember Core lair',
      desc: 'Burn damage +50%; boosting leaves a trail of fire that scalds pursuers.' },
    { id: 'stormcap', name: 'Stormcap', source: 'Stormspire lair',
      desc: 'Every boost discharges chain lightning into nearby enemies.' },
    { id: 'null_lens', name: 'Null Lens', source: 'Null Sanctum lair',
      desc: 'Shielded elites take full damage; +10% critical chance.' },
    { id: 'circuit_laurel', name: 'Circuit Laurel', source: 'Win the Sunspire Circuit',
      desc: 'A racer’s tuning: +8% move speed.' },
    { id: 'trace_emblem', name: 'Trace Emblem', source: 'Win the Trace Duel',
      desc: 'Boosting briefly leaves a cutting light-wall behind you.' },
    { id: 'harrow_brand', name: 'Harrow Brand', source: 'Fell THE HARROW (roams the Reach daily)',
      desc: 'While hull is above 70%, every volley carries +1 projectile.' }
  ];

  P.artifactById = function (id) {
    for (var i = 0; i < P.artifacts.length; i++) {
      if (P.artifacts[i].id === id) return P.artifacts[i];
    }
    return null;
  };

  P.grantArtifact = function (id) {
    var w = GH.meta.data.world;
    if (w.artifacts[id]) return false;
    w.artifacts[id] = true;
    if (!w.equipped) w.equipped = id;
    GH.meta.save();
    return true;
  };

  P.artifactActive = function (id) {
    return GH.meta.data.world.equipped === id;
  };

  // =================================================================
  // COLLECTION LOG helpers
  // =================================================================
  P.logKill = function (enemyId) {
    var c = GH.meta.data.collection;
    c.kills[enemyId] = (c.kills[enemyId] || 0) + 1;
    c.totalKills++;
  };

  P.logWeapon = function (cardId) {
    var c = GH.meta.data.collection;
    if (!c.weapons[cardId]) { c.weapons[cardId] = true; return true; }
    return false;
  };

  P.logResonance = function (label) {
    var c = GH.meta.data.collection;
    if (!c.resonances[label]) { c.resonances[label] = true; return true; }
    return false;
  };

  P.logGem = function (type) {
    var c = GH.meta.data.collection;
    c.gems[type] = (c.gems[type] || 0) + 1;
  };

  // completion %: enemies seen + weapons found + pure resonances + gem types
  P.completion = function () {
    var c = GH.meta.data.collection;
    var have = 0, total = 0;
    Object.keys(GH.enemyDefs).forEach(function (id) {
      total++;
      if (c.kills[id]) have++;
    });
    GH.upgrades.forEach(function (u) {
      if (u.kind !== 'weapon') return;
      total++;
      if (c.weapons[u.id]) have++;
    });
    total += 6; // 5 pure resonances + prism
    var resLabels = Object.keys(c.resonances);
    ['SANCTITY', 'IMMOLATE', 'FRAGMENT', 'SPOREBLOOM', 'DETONATE', 'PRISM'].forEach(function (r) {
      for (var li = 0; li < resLabels.length; li++) {
        if (resLabels[li].indexOf(r) === 0 && resLabels[li].indexOf('+') === -1) { have++; break; }
      }
    });
    GH.gems.typeIds.forEach(function (t) {
      total++;
      if (c.gems[t]) have++;
    });
    return { have: have, total: total, pct: total ? Math.round(have / total * 100) : 0 };
  };

  // =================================================================
  // PILOT MASTERY — per-frame XP earned across every run.
  // =================================================================
  P.MASTERY_CAP = 50;

  // cumulative XP required to reach a level
  function masteryNeed(level) {
    return Math.round(60 * level + 14 * level * level);
  }

  P.masteryLevel = function (mechId) {
    var xp = GH.meta.data.mastery[mechId] || 0;
    var lvl = 0;
    while (lvl < P.MASTERY_CAP && xp >= masteryNeed(lvl + 1)) lvl++;
    return lvl;
  };

  P.masteryProgress = function (mechId) {
    var xp = GH.meta.data.mastery[mechId] || 0;
    var lvl = P.masteryLevel(mechId);
    if (lvl >= P.MASTERY_CAP) return { lvl: lvl, frac: 1, xp: xp, next: 0 };
    var lo = masteryNeed(lvl), hi = masteryNeed(lvl + 1);
    return { lvl: lvl, frac: (xp - lo) / (hi - lo), xp: xp, next: hi - xp };
  };

  // returns levels gained
  P.masteryGain = function (mechId, amount) {
    var before = P.masteryLevel(mechId);
    GH.meta.data.mastery[mechId] = (GH.meta.data.mastery[mechId] || 0) + Math.round(amount);
    var after = P.masteryLevel(mechId);
    return after - before;
  };

  P.masteryTotal = function () {
    var t = 0;
    GH.mechs.forEach(function (m) { t += P.masteryLevel(m.id); });
    return t;
  };

  P.masteryMilestones = [
    { lvl: 10, desc: 'Gilt paint scheme unlocked' },
    { lvl: 25, desc: '+15% boost recharge on this frame' },
    { lvl: 40, desc: '+10% ability energy regeneration on this frame' },
    { lvl: 50, desc: 'MASTER insignia' }
  ];

  // stat bonuses granted by a frame's mastery level
  P.masteryBonus = function (mechId) {
    var lvl = P.masteryLevel(mechId);
    return {
      damageMult: lvl * 0.005,
      maxHP: lvl,
      boostRegen: lvl >= 25 ? 0.15 : 0,
      energyBonus: lvl >= 40,
      fourthCard: false // retired with the card system
    };
  };

  // =================================================================
  // RELIC SEASONS — a monthly task board; point thresholds grant a
  // choice of run-warping relics that persist all season.
  // =================================================================
  var SEASON_WORDS_A = ['IRON', 'EMBER', 'HOLLOW', 'STORM', 'GILDED', 'SILENT', 'CRIMSON', 'PALE', 'BROKEN', 'RADIANT', 'UMBRAL', 'FERAL'];
  var SEASON_WORDS_B = ['VIGIL', 'MARCH', 'ACCORD', 'REQUIEM', 'SIGNAL', 'HARVEST', 'ECLIPSE', 'FOUNDRY', 'CIRCUIT', 'CROWN', 'TEMPEST', 'RELAY'];

  P.seasonId = function (d) {
    d = d || new Date();
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
  };

  function seasonRng(id, salt) {
    var s = 0;
    var str = 'hfseason:' + id + ':' + (salt || '');
    for (var i = 0; i < str.length; i++) s = (Math.imul(s, 31) + str.charCodeAt(i)) >>> 0;
    s = s || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  P.seasonName = function (id) {
    var rnd = seasonRng(id, 'name');
    return SEASON_WORDS_A[Math.floor(rnd() * SEASON_WORDS_A.length)] + ' ' +
      SEASON_WORDS_B[Math.floor(rnd() * SEASON_WORDS_B.length)];
  };

  P.seasonTasks = [
    { id: 'w10', pts: 10, desc: 'Reach wave 10 in any run' },
    { id: 'w15', pts: 15, desc: 'Reach wave 15 in any run' },
    { id: 'clear1', pts: 25, desc: 'Clear any stage' },
    { id: 'clear3', pts: 40, desc: 'Clear three different stages' },
    { id: 'frames3', pts: 40, desc: 'Win with three different frames' },
    { id: 'kills500', pts: 20, desc: 'Destroy 500 enemies this season' },
    { id: 'kills2000', pts: 40, desc: 'Destroy 2,000 enemies this season' },
    { id: 'res1', pts: 15, desc: 'Complete a Resonance' },
    { id: 'res5', pts: 30, desc: 'Complete five Resonances this season' },
    { id: 'carapace', pts: 15, desc: 'Destroy a Grave Carapace' },
    { id: 'corrupt', pts: 25, desc: 'Destroy a corrupted frame' },
    { id: 'unbound', pts: 20, desc: 'Slay a corrupted frame while it is UNBOUND' },
    { id: 'arena25', pts: 30, desc: 'Reach wave 25 in the Arena' },
    { id: 'contracts3', pts: 25, desc: 'Fill three Broker contracts this season' },
    { id: 'sparks500', pts: 15, desc: 'Gather 500 sparks this season' },
    { id: 'coopwin', pts: 20, desc: 'Clear a stage in co-op' }
  ];

  P.seasonThresholds = [30, 80, 150, 250];

  P.relics = [
    { id: 'vamp', name: 'VAMPIRIC CORE', desc: '+8% lifesteal, but max hull -15%.' },
    { id: 'overclock', name: 'OVERCLOCK', desc: '+20% attack speed, but -2 armor.' },
    { id: 'gravity', name: 'GRAVITY WELL', desc: 'Magnet range doubled; sparks worth +15%.' },
    { id: 'juggernaut', name: 'JUGGERNAUT', desc: '+4 armor, but -10% move speed.' },
    { id: 'glass', name: 'GLASS CANNON', desc: '+30% damage, but max hull -25%.' },
    { id: 'phase', name: 'PHASE DRIVE', desc: 'Boost costs nothing, but recharges 35% slower.' },
    { id: 'salvager', name: 'SALVAGER RIG', desc: '+40% salvage, but -10% XP.' },
    { id: 'twin', name: 'TWIN FEED', desc: 'Primary +1 projectile, but -15% damage.' }
  ];

  // ensure season state matches the current month; resets on rollover
  P.seasonCheck = function () {
    var id = P.seasonId();
    var s = GH.meta.data.season;
    if (s.id !== id) {
      GH.meta.data.season = {
        id: id, pts: 0, done: {}, relics: [], claimed: 0,
        counters: { kills: 0, sparks: 0, resonances: 0, contracts: 0 },
        stagesCleared: {}, framesWon: {}
      };
      GH.meta.save();
    }
    return GH.meta.data.season;
  };

  P.seasonAward = function (taskId) {
    var s = P.seasonCheck();
    if (s.done[taskId]) return false;
    var task = null;
    P.seasonTasks.forEach(function (t) { if (t.id === taskId) task = t; });
    if (!task) return false;
    s.done[taskId] = true;
    s.pts += task.pts;
    GH.meta.save();
    return task;
  };

  // counter-driven tasks
  P.seasonCounter = function (key, amount) {
    var s = P.seasonCheck();
    s.counters[key] = (s.counters[key] || 0) + amount;
    var out = [];
    if (key === 'kills') {
      if (s.counters.kills >= 500) out.push('kills500');
      if (s.counters.kills >= 2000) out.push('kills2000');
    }
    if (key === 'sparks' && s.counters.sparks >= 500) out.push('sparks500');
    if (key === 'resonances') {
      out.push('res1');
      if (s.counters.resonances >= 5) out.push('res5');
    }
    if (key === 'contracts' && s.counters.contracts >= 3) out.push('contracts3');
    var awarded = [];
    out.forEach(function (t) { if (P.seasonAward(t)) awarded.push(t); });
    return awarded;
  };

  // how many relic picks are available right now
  P.relicPicksAvailable = function () {
    var s = P.seasonCheck();
    var earned = 0;
    P.seasonThresholds.forEach(function (t) { if (s.pts >= t) earned++; });
    return earned - s.claimed;
  };

  // the seeded 1-of-3 offer for the next unclaimed threshold
  P.relicOffer = function () {
    var s = P.seasonCheck();
    var rnd = seasonRng(s.id, 'relics' + s.claimed);
    var pool = P.relics.filter(function (r) { return s.relics.indexOf(r.id) === -1; });
    var offer = [];
    while (offer.length < 3 && pool.length) {
      offer.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    }
    return offer;
  };

  P.claimRelic = function (relicId) {
    var s = P.seasonCheck();
    if (P.relicPicksAvailable() <= 0) return false;
    if (s.relics.indexOf(relicId) !== -1) return false;
    s.relics.push(relicId);
    s.claimed++;
    GH.meta.save();
    return true;
  };

  P.hasRelic = function (id) {
    return GH.meta.data.season.relics.indexOf(id) !== -1;
  };

  // =================================================================
  // SIGNAL CIPHERS — rare field riddles paying chase cosmetics with
  // rising bad-luck protection on both the drop and the unique roll.
  // =================================================================
  P.cosmetics = [
    { id: 'trail_ember', kind: 'trail', name: 'Ember Trail', color: 0xff7030 },
    { id: 'trail_verdant', kind: 'trail', name: 'Verdant Trail', color: 0x50e070 },
    { id: 'trail_void', kind: 'trail', name: 'Void Trail', color: 0xc060ff },
    { id: 'trail_gold', kind: 'trail', name: 'Gilt Trail', color: 0xffd050 },
    { id: 'trail_rose', kind: 'trail', name: 'Rose Trail', color: 0xff70b0 },
    { id: 'paint_gilt', kind: 'paint', name: 'Gilt Plating', color: 0xd8b040 },
    { id: 'paint_crimson', kind: 'paint', name: 'Crimson Plating', color: 0xd04040 },
    { id: 'paint_jade', kind: 'paint', name: 'Jade Plating', color: 0x40b080 },
    { id: 'paint_void', kind: 'paint', name: 'Void Plating', color: 0x8050c0 },
    { id: 'paint_pearl', kind: 'paint', name: 'Pearl Plating', color: 0xe8e8f0 },
    { id: 'drone_cube', kind: 'drone', name: 'Pico Cube', shape: 'cube' },
    { id: 'drone_prism', kind: 'drone', name: 'Pico Prism', shape: 'prism' },
    { id: 'drone_ring', kind: 'drone', name: 'Pico Ring', shape: 'ring' },
    { id: 'drone_star', kind: 'drone', name: 'Pico Star', shape: 'star' }
  ];

  P.cosmeticById = function (id) {
    for (var i = 0; i < P.cosmetics.length; i++) {
      if (P.cosmetics[i].id === id) return P.cosmetics[i];
    }
    return null;
  };

  // per-kill drop check with rising pity; only when no cipher is running
  P.cipherRoll = function () {
    var c = GH.meta.data.cipher;
    c.dry++;
    var chance = 0.003 + Math.floor(c.dry / 50) * 0.004;
    if (Math.random() < chance) {
      c.dry = 0;
      return true;
    }
    return false;
  };

  P.cipherSteps = [
    { id: 'stand', desc: 'STAND in the marked signal circle' },
    { id: 'burst', desc: 'DETONATE: destroy 4 hostiles within 14s' },
    { id: 'sprint', desc: 'SPRINT: boost 3 times within 10s' },
    { id: 'hold', desc: 'HOLD: take no damage for 10s' }
  ];

  P.makeCipher = function () {
    var pool = P.cipherSteps.slice();
    var steps = [];
    var n = 2 + (Math.random() < 0.5 ? 1 : 0);
    while (steps.length < n && pool.length) {
      steps.push(GH.pick(pool));
      pool.splice(pool.indexOf(steps[steps.length - 1]), 1);
    }
    return steps;
  };

  // cache reward: guaranteed-new unique while any remain, then salvage/gems
  P.openCache = function () {
    var c = GH.meta.data.cipher;
    c.caches++;
    var owned = GH.meta.data.style.owned;
    var unowned = P.cosmetics.filter(function (cs) { return !owned[cs.id]; });
    var out = { salvage: GH.randInt(30, 80) };
    if (unowned.length) {
      var win = GH.pick(unowned);
      owned[win.id] = true;
      out.unique = win;
    } else {
      out.gem = GH.pick(GH.gems.typeIds);
    }
    GH.meta.save();
    return out;
  };

  return P;
})();

