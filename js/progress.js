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

  return P;
})();
