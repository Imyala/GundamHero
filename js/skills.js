// STAALREUS — the pilot skill tree + combat abilities
// Replaces mid-run power-up cards with persistent, deliberate character
// building (in the spirit of the classic MMO/ARPG trees): every level-up
// pays one skill point, spent here across three disciplines. Points and
// ranks persist on the profile — your pilot grows, not the run.
GH.skills = (function () {
  var S = {};

  // ---------------------------------------------------------------
  // The tree: three disciplines, tiered by points already spent in
  // that discipline (req). One point per rank.
  // ---------------------------------------------------------------
  S.TREE = [
    // ASSAULT — hitting harder
    { id: 'as_dmg', branch: 'assault', name: 'Weapons Calibration', max: 5, req: 0,
      desc: '+4% damage per rank.' },
    { id: 'as_spd', branch: 'assault', name: 'Servo Timing', max: 5, req: 0,
      desc: '+3% attack speed per rank.' },
    { id: 'as_crit', branch: 'assault', name: 'Target Analysis', max: 5, req: 2,
      desc: '+2% critical chance per rank.' },
    { id: 'as_slot2', branch: 'assault', name: 'Ability — SWEEP', max: 1, req: 2,
      desc: 'Unlock ability slot 2: a knockback strike hitting everything around you.' },
    { id: 'as_exec', branch: 'assault', name: 'Executioner Logic', max: 3, req: 4,
      desc: '+8% damage per rank against targets below 35% hull.' },
    { id: 'as_cleave', branch: 'assault', name: 'Resonant Edge', max: 1, req: 6,
      desc: 'Capstone: auto-attacks carry +1 projectile / a wider arc.' },

    // BULWARK — surviving
    { id: 'bw_hull', branch: 'bulwark', name: 'Layered Plating', max: 5, req: 0,
      desc: '+8 max hull per rank.' },
    { id: 'bw_armor', branch: 'bulwark', name: 'Composite Weave', max: 5, req: 0,
      desc: '+1 armor per rank.' },
    { id: 'bw_ward', branch: 'bulwark', name: 'Ward Harmonics', max: 5, req: 2,
      desc: 'Wards drain 8% slower per rank.' },
    { id: 'bw_slot3', branch: 'bulwark', name: 'Ability — SHACKLE', max: 1, req: 2,
      desc: 'Unlock ability slot 3: chain your target and everything beside it in place.' },
    { id: 'bw_block', branch: 'bulwark', name: 'Deflection Array', max: 3, req: 4,
      desc: '+2% block per rank.' },
    { id: 'bw_cap', branch: 'bulwark', name: 'Aegis Core', max: 1, req: 6,
      desc: 'Capstone: COUNTER stacks cap raised 5 → 8.' },

    // SYSTEMS — the reactor
    { id: 'sy_cap', branch: 'systems', name: 'Capacitor Cells', max: 5, req: 0,
      desc: '+12 max energy per rank.' },
    { id: 'sy_regen', branch: 'systems', name: 'Reactor Tuning', max: 5, req: 0,
      desc: '+10% energy regeneration per rank.' },
    { id: 'sy_cd', branch: 'systems', name: 'Coolant Loops', max: 5, req: 2,
      desc: 'Ability cooldowns 4% shorter per rank.' },
    { id: 'sy_slot4', branch: 'systems', name: 'Ability — OVERLOAD', max: 1, req: 2,
      desc: 'Unlock ability slot 4: detonate your target’s position.' },
    { id: 'sy_boost', branch: 'systems', name: 'Afterburner Feed', max: 3, req: 4,
      desc: '+10% boost regeneration per rank.' },
    { id: 'sy_skim', branch: 'systems', name: 'Transform Surge', max: 1, req: 6,
      desc: 'Capstone: skimmer cannons +40% damage; transforming grants a speed surge.' }
  ];

  S.BRANCHES = [
    { id: 'assault', name: 'ASSAULT', css: '#ff9070' },
    { id: 'bulwark', name: 'BULWARK', css: '#90d0ff' },
    { id: 'systems', name: 'SYSTEMS', css: '#9ae848' }
  ];

  S.nodeById = function (id) {
    for (var i = 0; i < S.TREE.length; i++) if (S.TREE[i].id === id) return S.TREE[i];
    return null;
  };

  S.rank = function (id) { return GH.meta.data.skills[id] || 0; };

  S.spentIn = function (branch) {
    var n = 0;
    S.TREE.forEach(function (node) {
      if (node.branch === branch) n += S.rank(node.id);
    });
    return n;
  };

  S.spentTotal = function () {
    var n = 0;
    for (var k in GH.meta.data.skills) n += GH.meta.data.skills[k];
    return n;
  };

  S.canSpend = function (id) {
    var node = S.nodeById(id);
    if (!node) return false;
    if (GH.meta.data.skillPoints < 1) return false;
    if (S.rank(id) >= node.max) return false;
    return S.spentIn(node.branch) >= node.req;
  };

  S.spend = function (id) {
    if (!S.canSpend(id)) return false;
    GH.meta.data.skills[id] = S.rank(id) + 1;
    GH.meta.data.skillPoints--;
    GH.meta.save();
    return true;
  };

  // ---------------------------------------------------------------
  // Pilot level: a persistent XP pool fed by every spark you ever
  // collect, on a slowing curve — each level pays one skill point.
  // ---------------------------------------------------------------
  S.pilotLevel = function (xp) {
    // cumulative XP for level n is 30 * n^1.7
    return Math.floor(Math.pow(Math.max(0, xp) / 30, 1 / 1.7));
  };

  S.pilotProgress = function () {
    var xp = GH.meta.data.pilotXP || 0;
    var lvl = S.pilotLevel(xp);
    var cur = 30 * Math.pow(lvl, 1.7);
    var next = 30 * Math.pow(lvl + 1, 1.7);
    return { lvl: lvl, xp: xp, into: xp - cur, need: next - cur };
  };

  // feed XP; returns how many pilot levels (skill points) were gained
  S.gainPilotXP = function (amount) {
    var before = S.pilotLevel(GH.meta.data.pilotXP || 0);
    GH.meta.data.pilotXP = (GH.meta.data.pilotXP || 0) + amount;
    var after = S.pilotLevel(GH.meta.data.pilotXP);
    if (after > before) {
      GH.meta.data.skillPoints += after - before;
      GH.meta.save();
    }
    return after - before;
  };

  S.RESPEC_COST = 200;

  S.respec = function () {
    if (GH.meta.data.salvage < S.RESPEC_COST) return false;
    var refunded = S.spentTotal();
    if (refunded === 0) return false;
    GH.meta.data.salvage -= S.RESPEC_COST;
    GH.meta.data.skills = {};
    GH.meta.data.skillPoints += refunded;
    GH.meta.save();
    return true;
  };

  // aggregated bonuses, consumed once at frame spawn (and on tree change)
  S.bonuses = function () {
    var r = S.rank;
    return {
      damageMult: r('as_dmg') * 0.04,
      atkSpdMult: r('as_spd') * 0.03,
      crit: r('as_crit') * 2,
      execute: r('as_exec') * 0.08,     // vs targets under 35% hull
      cleave: r('as_cleave') > 0,
      maxHP: r('bw_hull') * 8,
      armor: r('bw_armor') * 1,
      wardDrainMult: 1 - r('bw_ward') * 0.08,
      block: r('bw_block') * 2,
      counterCap: r('bw_cap') > 0 ? 8 : 5,
      energyMax: 100 + r('sy_cap') * 12,
      energyRegen: 12 * (1 + r('sy_regen') * 0.10),
      cdMult: 1 - r('sy_cd') * 0.04,
      boostRegen: r('sy_boost') * 0.10,
      surge: r('sy_skim') > 0,
      slots: { 1: true, 2: r('as_slot2') > 0, 3: r('bw_slot3') > 0, 4: r('sy_slot4') > 0 }
    };
  };

  // ---------------------------------------------------------------
  // Abilities: the hotbar. Damage scales off the primary weapon, so
  // gems, resonances, and the frame you fly all still matter.
  // ---------------------------------------------------------------
  // Signature abilities: one per lineage, always unlocked, slot 5.
  // Relics inherit their base lineage's signature at 1.25x power.
  S.SIGNATURES = {
    aegis:  { name: 'SHIELD WALL', glyph: '⛨', cost: 35, cd: 18, desc: 'For 5 s take 60% less damage, each hit mends 3% hull, and the cast shoves everything near you back.' },
    vulcan: { name: 'BARRAGE', glyph: '⋔', cost: 30, cd: 12, desc: 'Empty the drums: fourteen shots in a fan ahead of you, instantly.' },
    fang:   { name: 'POUNCE', glyph: '↯', cost: 25, cd: 9, desc: 'Leap onto your target for 2.5× damage and two FRENZY stacks.' },
    hexen:  { name: 'SPELLSTORM', glyph: '✵', cost: 40, cd: 14, desc: 'Cycle the element and loose twelve homing bolts of it.' },
    viper:  { name: 'SHADOW STEP', glyph: '☾', cost: 30, cd: 10, desc: 'Vanish and reappear behind your target: they lose you for a breath, your next 4 s of hits crit.' },
    morrow: { name: 'HARVEST', glyph: '☥', cost: 35, cd: 15, desc: 'Drag everything within 9 m to you, reap it, and mend 30% of the damage dealt.' },
    strix:  { name: 'RAIL CHARGE', glyph: '➤', cost: 30, cd: 10, desc: 'A 10 m charge that runs through the line for 2.2×, then 3 s of sharpened crits.' },
    titan:  { name: 'SIEGE STANCE', glyph: '⛫', cost: 40, cd: 16, desc: 'Plant for 5 s: cannot move or be knocked back, +12 armor, fire rate ×2.2, blasts 50% wider.' }
  };
  S.signatureFor = function (def) {
    var key = def.kind === 'relic' ? def.relicBase : (def.lineage || def.id);
    return S.SIGNATURES[key] || S.SIGNATURES.aegis;
  };

  S.ABILITIES = {
    1: { name: 'RUPTURE', glyph: '†', cost: 20, cd: 6,
      desc: 'A focused 2.2× strike on your target.' },
    2: { name: 'SWEEP', glyph: '➰', cost: 30, cd: 10,
      desc: 'Blast everything around you for 1.3× with heavy knockback.' },
    3: { name: 'SHACKLE', glyph: '⛓', cost: 25, cd: 12,
      desc: 'Chain your target and its neighbors: damage, slow, and a stun chance.' },
    4: { name: 'OVERLOAD', glyph: '☀', cost: 45, cd: 18,
      desc: 'Detonate the target’s position for 2.8× burning area damage.' }
  };

  return S;
})();
