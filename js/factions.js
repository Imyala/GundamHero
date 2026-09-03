// STAALREUS — the five houses, reputation, pledges, betrayal, and the
// player's own banner. Rules of the house:
//   1. Any frame line can be built by anyone; a house you stand with just
//      sheds its parts more readily (reward rolls weight its families).
//   2. Betrayal leaves a stain. Work it down with deeds; it fades, slowly.
//   3. Late game you may leave the houses and raise your own banner, align
//      with the others through work or face them all, and in the end take
//      a seat among them.
GH.factions = (function () {
  var F = {};

  F.LIST = [
    { id: 'combine', name: 'SPIRE COMBINE', seat: 'hive', zones: ['hive', 'ember'], color: 0xffb050, glyph: '⚙',
      creed: 'industry, mass production, the drone swarm',
      doctrine: { id: 'industry', name: 'INDUSTRY', desc: '+12% salvage · +6% attack speed' },
      troops: ['slinger', 'habbrute', 'rodsentry', 'crawler'],
      parts: ['flakfan', 'drone', 'mortarpod'], circuit: 'hive', rivals: ['kin'] },
    { id: 'wardens', name: 'WARDENS OF THE KEEP', seat: 'keep', zones: ['keep', 'glacier'], color: 0xb02a2a, glyph: '⛨',
      creed: 'order, walls, the honour duel',
      doctrine: { id: 'bulwark', name: 'BULWARK', desc: '+3 armor · +8% hull' },
      troops: ['wardenknight', 'ballista', 'stalker', 'howler'],
      parts: ['blades', 'javelin', 'halo'], circuit: 'glacier', rivals: ['remnant'] },
    { id: 'remnant', name: 'CITADEL REMNANT', seat: 'ruins', zones: ['ruins', 'cloister'], color: 0x60c0a0, glyph: '☗',
      creed: 'relics, memory, the salvage of the old war',
      doctrine: { id: 'relic', name: 'RELIC LORE', desc: '+6% crit · +10% XP' },
      troops: ['gravestalker', 'carrionkite', 'slaggolem', 'lurker'],
      parts: ['tesla', 'frostcaster', 'anchor'], circuit: 'ember', rivals: ['wardens'] },
    { id: 'kin', name: 'DEEP KIN', seat: 'warrens', zones: ['warrens', 'storm'], color: 0x60e0c0, glyph: '⛏',
      creed: 'survival, capture, the kitbash',
      doctrine: { id: 'scavenge', name: 'SCAVENGE', desc: '+4% lifesteal · +15% magnet' },
      troops: ['glowmite', 'tunnelmaw', 'fungalshambler', 'bellowtoad'],
      parts: ['mines', 'flamer', 'missiles'], circuit: 'storm', rivals: ['combine'] },
    { id: 'court', name: 'AETHER COURT', seat: 'sky', zones: ['sky', 'null'], color: 0xe0b050, glyph: '☼',
      creed: 'ascension, sync, the sky',
      doctrine: { id: 'ascend', name: 'ASCENSION', desc: '+10% boost regen · +8% damage' },
      troops: ['aetherray', 'cloudwisp', 'sentinel', 'phantom'],
      parts: ['blades', 'drone', 'frostcaster'], circuit: 'sky', rivals: ['combine', 'kin'] }
  ];
  F.DOCTRINES = F.LIST.map(function (f) { return f.doctrine; });

  F.byId = function (id) {
    for (var i = 0; i < F.LIST.length; i++) if (F.LIST[i].id === id) return F.LIST[i];
    return null;
  };
  F.byTroop = function (enemyId) {
    for (var i = 0; i < F.LIST.length; i++) if (F.LIST[i].troops.indexOf(enemyId) !== -1) return F.LIST[i];
    return null;
  };
  F.byZone = function (zoneId) {
    if (!zoneId) return null;
    var dg = GH.dungeons.parseId(zoneId);
    if (dg) zoneId = dg.zone;
    for (var i = 0; i < F.LIST.length; i++) if (F.LIST[i].zones.indexOf(zoneId) !== -1) return F.LIST[i];
    return null;
  };

  // ---- state lives in the world save ----
  F.state = function () {
    var w = GH.meta.data.world;
    if (!w.fac) w.fac = { rep: {}, stain: {}, pledge: null, banner: null, seated: false, deeds: 0, log: [] };
    return w.fac;
  };
  F.notify = function (text, size) { /* game.js replaces this with the announce queue */ };

  F.rep = function (id) { return F.state().rep[id] || 0; };
  F.stain = function (id) { return F.state().stain[id] || 0; };
  // a stain caps how high reputation can climb until it fades
  F.repCap = function (id) { return 100 - F.stain(id) * 1.4; };

  F.standing = function (id) {
    var s = F.state();
    if (s.pledge === id) return 'pledged';
    var r = F.rep(id);
    if (r >= 40) return 'allied';
    if (r <= -40) return 'hostile';
    return 'neutral';
  };
  F.standingLabel = function (id) {
    return { pledged: 'PLEDGED', allied: 'ALLIED', hostile: 'HOSTILE', neutral: 'NEUTRAL' }[F.standing(id)];
  };

  F.addRep = function (id, delta, reason) {
    var s = F.state();
    var f = F.byId(id);
    if (!f) return;
    var before = F.rep(id);
    var after = GH.clamp(before + delta, -100, F.repCap(id));
    s.rep[id] = Math.round(after * 10) / 10;
    // crossing a line is worth a word
    var lines = [[40, 'ALLIED'], [-40, 'HOSTILE']];
    lines.forEach(function (ln) {
      if ((before < ln[0] && after >= ln[0]) || (before > ln[0] && after <= ln[0])) {
        F.notify(f.name + ' — NOW ' + (after >= 40 ? 'ALLIED' : after <= -40 ? 'HOSTILE' : 'NEUTRAL'), 22);
      }
    });
    if (s.log.length < 40) s.log.push({ id: id, d: delta, r: reason });
  };

  // a deed: a contract, a dungeon clear, a podium. Deeds wear stains down.
  F.deed = function (zoneId, kind, amount) {
    var s = F.state();
    s.deeds++;
    var owner = F.byZone(zoneId);
    if (owner) {
      F.addRep(owner.id, amount, kind);
      owner.rivals.forEach(function (rv) { F.addRep(rv, -amount * 0.25, 'rival ' + kind); });
    }
    for (var k in s.stain) {
      if (s.stain[k] > 0) s.stain[k] = Math.max(0, s.stain[k] - 3);
      if (s.stain[k] === 0) delete s.stain[k];
    }
    if (s.banner && !s.seated) F.checkSeat();
    GH.meta.save();
  };

  // killing a house's troops: they remember, their rivals approve
  F.troopKilled = function (enemyId) {
    var f = F.byTroop(enemyId);
    if (!f) return;
    F.addRep(f.id, -1, 'troop');
    f.rivals.forEach(function (rv) { F.addRep(rv, 0.4, 'rival troop'); });
  };

  // ---- pledges ----
  F.canPledge = function (id) {
    var s = F.state();
    if (s.banner) return false; // your own banner outranks any pledge
    return F.rep(id) >= 40 && s.pledge !== id;
  };
  F.pledge = function (id) {
    var s = F.state();
    if (!F.canPledge(id)) return false;
    var f = F.byId(id);
    if (s.pledge && s.pledge !== id) F.betray(s.pledge);
    s.pledge = id;
    F.addRep(id, 25, 'pledge');
    // rival houses take it personally
    f.rivals.forEach(function (rv) { F.addRep(rv, -15, 'pledged to a rival'); });
    F.notify('PLEDGED TO THE ' + f.name, 26);
    GH.meta.save();
    return true;
  };
  // walking away is not betrayal; walking to a rival is
  F.renounce = function () {
    var s = F.state();
    if (!s.pledge) return false;
    var old = s.pledge;
    s.pledge = null;
    F.addRep(old, -20, 'renounced');
    F.notify('PLEDGE RENOUNCED — THE ' + F.byId(old).name + ' WILL REMEMBER', 22);
    GH.meta.save();
    return true;
  };
  F.betray = function (oldId) {
    var s = F.state();
    s.stain[oldId] = 100;
    s.rep[oldId] = Math.min(F.rep(oldId), -60);
    F.notify('BETRAYAL — THE ' + F.byId(oldId).name + ' BRAND YOU TRAITOR', 28);
  };

  // ---- parts and doctrine ----
  F.partWeight = function (cardId) {
    var s = F.state();
    var w = 1;
    F.LIST.forEach(function (f) {
      if (f.parts.indexOf(cardId) === -1) return;
      var st = F.standing(f.id);
      if (st === 'pledged') w = Math.max(w, 2.4);
      else if (st === 'allied') w = Math.max(w, 1.6);
      else if (st === 'hostile') w = Math.min(w, 0.7);
    });
    if (s.banner && s.banner.doctrine) {
      // your own house favours the doctrine's parent house's parts a little
      var par = F.LIST.filter(function (f) { return f.doctrine.id === s.banner.doctrine; })[0];
      if (par && par.parts.indexOf(cardId) !== -1) w = Math.max(w, 1.4);
    }
    return w;
  };
  F.activeDoctrine = function () {
    var s = F.state();
    if (s.banner && s.banner.doctrine) {
      for (var i = 0; i < F.DOCTRINES.length; i++) if (F.DOCTRINES[i].id === s.banner.doctrine) return F.DOCTRINES[i];
    }
    if (s.pledge) return F.byId(s.pledge).doctrine;
    return null;
  };
  F.applyDoctrine = function (stats) {
    var d = F.activeDoctrine();
    if (!d) return;
    if (d.id === 'industry') { stats.salvageMult = (stats.salvageMult || 1) * 1.12; stats.atkSpdMult *= 1.06; }
    if (d.id === 'bulwark') { stats.armor += 3; stats.maxHP = Math.round(stats.maxHP * 1.08); }
    if (d.id === 'relic') { stats.crit += 6; stats.xpGain = (stats.xpGain || 1) * 1.10; }
    if (d.id === 'scavenge') { stats.lifesteal += 4; stats.magnet *= 1.15; }
    if (d.id === 'ascend') { stats.boostRegen *= 1.10; stats.damageMult *= 1.08; }
  };

  // ---- your own banner ----
  F.canRaiseBanner = function () {
    var s = F.state();
    if (s.banner) return false;
    var w = GH.meta.data.world;
    var cleared = 0;
    for (var k in (w.dgTier || {})) cleared++;
    var allied = F.LIST.filter(function (f) { return F.rep(f.id) >= 60; }).length;
    return cleared >= 10 || allied >= 2;
  };
  F.bannerRequirement = function () {
    return 'Raise a banner after ascending ten dungeons, or standing at 60 with two houses.';
  };
  F.raiseBanner = function (name, doctrineId, paint) {
    var s = F.state();
    if (!F.canRaiseBanner()) return false;
    if (s.pledge) { F.addRep(s.pledge, -20, 'left for a banner'); s.pledge = null; }
    s.banner = { name: (name || 'THE UNBOUND').toUpperCase().slice(0, 24), doctrine: doctrineId, paint: paint || null, raised: GH.world.dayStamp() };
    F.notify('THE ' + s.banner.name + ' RAISE THEIR BANNER', 30);
    GH.meta.save();
    return true;
  };
  // a seat: three territories held (every nest broken) and either two houses
  // at 60, or three houses at −60. Either way the world makes room for you.
  F.seatProgress = function () {
    var w = GH.meta.data.world;
    var held = 0;
    GH.world.ZONES.forEach(function (zn) {
      var lay = GH.world.layoutFor(zn.id);
      if (!lay.nests.length) return;
      var dead = lay.nests.filter(function (n) { return w.nests[n.id]; }).length;
      if (dead === lay.nests.length) held++;
    });
    var friends = F.LIST.filter(function (f) { return F.rep(f.id) >= 60; }).length;
    var foes = F.LIST.filter(function (f) { return F.rep(f.id) <= -60; }).length;
    return { held: held, friends: friends, foes: foes, ok: held >= 3 && (friends >= 2 || foes >= 3) };
  };
  F.checkSeat = function () {
    var s = F.state();
    if (!s.banner || s.seated) return false;
    var p = F.seatProgress();
    if (!p.ok) return false;
    s.seated = true;
    F.notify('THE ' + s.banner.name + ' TAKE THEIR SEAT — THE CAMP IS YOUR COURT', 32);
    GH.meta.save();
    return true;
  };

  return F;
})();
