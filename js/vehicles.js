// HERO FRAME — vehicle (VECTOR) designs. Every lineage folds into two
// different machines; relics have their own. A design pairs a drivetrain
// (GH.VECTORS kind — how it handles) with a silhouette (models.buildSpeeder
// shape) and a name. The first design of a lineage is free; the second is
// built in the workshop. The pick is remembered per lineage.
GH.vehicles = (function () {
  var V = {};

  // handling models (extends mechs.js GH.VECTORS)
  GH.VECTORS.wing = { name: 'WAVERIDER', top: 1.2, accel: 1.05, grip: 0.85, driftGrip: 0.75, jump: 1.6, ram: 1.1, glide: true };
  GH.VECTORS.beast = { name: 'BEAST', top: 1.0, accel: 1.3, grip: 1.5, driftGrip: 1.1, jump: 1.45, ram: 1.3 };
  GH.VECTORS.crawler = { name: 'SIEGE CRAWLER', top: 0.78, accel: 0.8, grip: 1.6, driftGrip: 1.6, jump: 0.55, ram: 2.2 };

  V.DESIGNS = [
    // AEGIS — paladin: a shield-nosed hover-tank, then a war-sled that rams
    { id: 'aegis_paladin', lineage: 'aegis', name: 'PALADIN TANK', kind: 'tank', shape: 'shieldtank', free: true,
      desc: 'A hover-tank with the heater shield bolted to its bow. Rams like a battering ram.' },
    { id: 'aegis_sled', lineage: 'aegis', name: 'WAR-SLED', kind: 'crawler', shape: 'sled',
      desc: 'Low, wide, and unstoppable: a siege sled with twin lances forward. Slow, but nothing pushes it around.' },
    // VULCAN — gunner: a gun-tank, then a halftrack with a rotary cannon
    { id: 'vulcan_guntank', lineage: 'vulcan', name: 'GUN-TANK', kind: 'tank', shape: 'guntank', free: true,
      desc: 'Twin cannons on a turret ring. The foundry on treads.' },
    { id: 'vulcan_halftrack', lineage: 'vulcan', name: 'HALFTRACK', kind: 'crawler', shape: 'halftrack',
      desc: 'Rotary cannon over an armoured cab. Grips anything, drifts nothing.' },
    // FANG — striker: a talon bike, then a four-legged beast
    { id: 'fang_talon', lineage: 'fang', name: 'TALON BIKE', kind: 'bike', shape: 'bike', free: true,
      desc: 'A hover-bike with claw skids. Quick off the line, quick to slide.' },
    { id: 'fang_beast', lineage: 'fang', name: 'RIDGE-CAT', kind: 'beast', shape: 'beast',
      desc: 'The frame drops to all fours. Pounces off crests, never bogs, holds a line like it has teeth in the ground.' },
    // HEXEN — wizard: a sigil disc, then a staff-glider
    { id: 'hexen_sigil', lineage: 'hexen', name: 'SIGIL DISC', kind: 'disc', shape: 'disc', free: true,
      desc: 'A hovering saucer ringed with runes. Loiters, floats over water, turns on nothing.' },
    { id: 'hexen_broom', lineage: 'hexen', name: 'STAFF-GLIDER', kind: 'wing', shape: 'broom',
      desc: 'The spellcannon staff becomes the keel of a narrow glider. Fast and long in the air.' },
    // VIPER — rogue: a stealth bike, then a blade-wing waverider
    { id: 'viper_stealth', lineage: 'viper', name: 'STEALTH BIKE', kind: 'bike', shape: 'stealthbike', free: true,
      desc: 'Low, black, faceted. A knife on skids.' },
    { id: 'viper_bladewing', lineage: 'viper', name: 'BLADE-WING', kind: 'wing', shape: 'wing',
      desc: 'Both daggers swing out into a flat delta wing. Long jumps, thin grip.' },
    // MORROW — reaper: a reaper disc, then a hearse crawler
    { id: 'morrow_reaper', lineage: 'morrow', name: 'REAPER DISC', kind: 'disc', shape: 'reaperdisc', free: true,
      desc: 'A dark saucer with the scythe folded around its rim. Everything it passes gets cut.' },
    { id: 'morrow_hearse', lineage: 'morrow', name: 'HEARSE', kind: 'crawler', shape: 'hearse',
      desc: 'A long armoured crawler with blade fins. Heavy, grim, and it rams like a funeral.' },
    // STRIX — duelist: an interceptor jet, then a lance bike
    { id: 'strix_jet', lineage: 'strix', name: 'INTERCEPTOR', kind: 'wing', shape: 'jet', free: true,
      desc: 'The lance is the fuselage. A true jet: fastest on the straight, widest in the air.' },
    { id: 'strix_lancebike', lineage: 'strix', name: 'LANCE BIKE', kind: 'bike', shape: 'lancebike',
      desc: 'A slim hover-bike with the lance run forward as a ram spike.' },
    // TITAN — artillery: a siege crawler, then a fortress disc
    { id: 'titan_crawler', lineage: 'titan', name: 'SIEGE CRAWLER', kind: 'crawler', shape: 'crawler', free: true,
      desc: 'The mortar rides a tracked hull. The slowest thing on the Reach and the hardest to stop.' },
    { id: 'titan_fortress', lineage: 'titan', name: 'FORTRESS DISC', kind: 'disc', shape: 'fortressdisc',
      desc: 'A heavy hover-platform with the mortar on a pintle. Floats over mud and lakes it would otherwise sink in.' },
    // RELICS — one bespoke machine each
    { id: 'relic_moonlight_v', lineage: 'relic_moonlight', name: 'MOONLIGHT SKIFF', kind: 'wing', shape: 'skiff', free: true, desc: 'A white sky-skiff with a single sweeping wing.' },
    { id: 'relic_ark_v', lineage: 'relic_ark', name: 'ARK BARGE', kind: 'crawler', shape: 'barge', free: true, desc: 'The fortress on the move: a walking barge with two turrets.' },
    { id: 'relic_corebreaker_v', lineage: 'relic_corebreaker', name: 'DRILL-BIKE', kind: 'beast', shape: 'drillbike', free: true, desc: 'A drill for a nose and legs for wheels. It digs in and launches.' },
    { id: 'relic_seer_v', lineage: 'relic_seer', name: 'BINDER DISC', kind: 'disc', shape: 'binderdisc', free: true, desc: 'A saucer flanked by fin-funnel binders.' },
    { id: 'relic_crimson_v', lineage: 'relic_crimson', name: 'COMET', kind: 'wing', shape: 'comet', free: true, desc: 'Red, three times faster, tail of fire.' },
    { id: 'relic_keyhead_v', lineage: 'relic_keyhead', name: 'DRILL-POD', kind: 'beast', shape: 'drillpod', free: true, desc: 'A head-sized pod on stub legs. The fastest thing on the ground.' },
    { id: 'relic_revenant_v', lineage: 'relic_revenant', name: 'FERAL GAIT', kind: 'beast', shape: 'feral', free: true, desc: 'The frame crawls on four arms. Grown, not built.' }
  ];
  V.BUILD_COST = { alloy: 120, cores: 1, salvage: 150 };

  V.byId = function (id) {
    for (var i = 0; i < V.DESIGNS.length; i++) if (V.DESIGNS[i].id === id) return V.DESIGNS[i];
    return null;
  };
  V.forLineage = function (lineage) {
    return V.DESIGNS.filter(function (d) { return d.lineage === lineage; });
  };
  function lineageOf(def) { return def.kind === 'relic' ? def.id : (def.lineage || def.id); }
  V.lineageOf = lineageOf;

  V.owned = function (id) {
    var d = V.byId(id);
    if (!d) return false;
    if (d.free) return true;
    var o = GH.meta.data.vectorsOwned || {};
    return !!o[id];
  };

  // the design a frame currently folds into
  V.activeFor = function (def) {
    var ln = lineageOf(def);
    var list = V.forLineage(ln);
    if (!list.length) return { id: null, kind: def.vector || 'bike', shape: def.vector || 'bike', name: (GH.VECTORS[def.vector] || GH.VECTORS.bike).name };
    var picks = GH.meta.data.vectorPick || {};
    var pick = picks[ln] ? V.byId(picks[ln]) : null;
    if (!pick || !V.owned(pick.id) || pick.lineage !== ln) pick = list[0];
    return pick;
  };

  V.setPick = function (lineage, id) {
    if (!V.owned(id)) return false;
    GH.meta.data.vectorPick = GH.meta.data.vectorPick || {};
    GH.meta.data.vectorPick[lineage] = id;
    GH.meta.save();
    return true;
  };

  // cycle the pick among owned designs for a frame's lineage
  V.cycle = function (def) {
    var ln = lineageOf(def);
    var list = V.forLineage(ln).filter(function (d) { return V.owned(d.id); });
    if (list.length < 2) return V.activeFor(def);
    var cur = V.activeFor(def);
    var i = 0;
    for (var k = 0; k < list.length; k++) if (list[k].id === cur.id) i = k;
    var next = list[(i + 1) % list.length];
    V.setPick(ln, next.id);
    return next;
  };

  V.canBuild = function (id) {
    var d = V.byId(id);
    if (!d || V.owned(id)) return false;
    var m = GH.meta.data.mats, c = V.BUILD_COST;
    // the lineage's base frame has to be yours first
    if (!GH.meta.data.shells[d.lineage]) return false;
    return m.alloy >= c.alloy && m.cores >= c.cores && GH.meta.data.salvage >= c.salvage;
  };
  V.build = function (id) {
    if (!V.canBuild(id)) return false;
    var c = V.BUILD_COST;
    GH.meta.data.mats.alloy -= c.alloy; GH.meta.data.mats.cores -= c.cores; GH.meta.data.salvage -= c.salvage;
    GH.meta.data.vectorsOwned = GH.meta.data.vectorsOwned || {};
    GH.meta.data.vectorsOwned[id] = true;
    GH.meta.save();
    return true;
  };
  V.ownedCount = function () {
    var n = 0;
    V.DESIGNS.forEach(function (d) { if (V.owned(d.id)) n++; });
    return n;
  };

  return V;
})();
