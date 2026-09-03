// STAALREUS — enemy definitions.
// Corrupt shell bosses are dark-mirror versions of unlockable frames:
// beating one on wave 20 unlocks that frame and the next stage.
GH.enemyDefs = {
  husk: {
    name: 'Husk',
    hp: 26, speed: 3.2, damage: 7, radius: 0.55, xp: 1, mass: 1,
    behavior: 'chase'
  },
  shardling: {
    name: 'Shardling',
    hp: 10, speed: 6.0, damage: 5, radius: 0.4, xp: 1, mass: 0.5,
    behavior: 'chase'
  },
  orb: {
    name: 'Orb Sentry',
    hp: 34, speed: 2.6, damage: 7, radius: 0.55, xp: 2, mass: 0.8,
    behavior: 'ranged', shootInterval: 2.4, shotSpeed: 9, keepDist: 9
  },
  spiker: {
    name: 'Spiker',
    hp: 18, speed: 3.4, damage: 10, radius: 0.42, xp: 2, mass: 0.6,
    behavior: 'dasher', dashInterval: 3.0, dashSpeed: 16, dashTime: 0.45
  },
  brute: {
    name: 'Brute',
    hp: 130, speed: 2.2, damage: 16, radius: 0.95, xp: 6, mass: 3,
    behavior: 'chase'
  },
  creeper: {
    name: 'Creeper',           // cloister crawler: fast lunges, tanky-ish
    hp: 44, speed: 4.2, damage: 9, radius: 0.6, xp: 3, mass: 1.4,
    behavior: 'dasher', dashInterval: 4.0, dashSpeed: 12, dashTime: 0.5
  },
  cinder: {
    name: 'Cinder',            // ember imp: leaves burning ground on death
    hp: 22, speed: 4.6, damage: 8, radius: 0.45, xp: 2, mass: 0.6,
    behavior: 'chase', deathBurn: true
  },
  volt: {
    name: 'Volt Wisp',         // storm wisp: ranged zapper
    hp: 26, speed: 3.4, damage: 8, radius: 0.45, xp: 2, mass: 0.6,
    behavior: 'ranged', shootInterval: 2.0, shotSpeed: 12, keepDist: 8, shotElement: 'shock'
  },

  // ---- zone-native hostiles: each territory fields its own fauna ----
  scarab: {
    name: 'Dune Scarab',         // dune coast: armoured, slow, shrugs off hits
    hp: 80, speed: 2.8, damage: 12, radius: 0.7, xp: 4, mass: 2.5,
    behavior: 'chase', armorMult: 0.6
  },
  burrower: {
    name: 'Sand Maw',            // dune coast: tunnels under you, erupts to bite
    hp: 70, speed: 7.5, damage: 18, radius: 0.75, xp: 6, mass: 2,
    behavior: 'burrower', surfaceTime: 2.6
  },
  stalker: {
    name: 'Frost Stalker',       // frost range: pack hunter, pounces
    hp: 44, speed: 5.0, damage: 11, radius: 0.55, xp: 3, mass: 1,
    behavior: 'dasher', dashInterval: 3.2, dashSpeed: 19, dashTime: 0.38
  },
  frostwisp: {
    name: 'Rime Wisp',           // frost range: chilling shots slow the frame
    hp: 30, speed: 3.0, damage: 7, radius: 0.45, xp: 2, mass: 0.6,
    behavior: 'ranged', shootInterval: 2.3, shotSpeed: 11, keepDist: 8, shotElement: 'frost'
  },
  lurker: {
    name: 'Vine Lurker',         // rain canopy: hides as a bush, snares, lunges
    hp: 58, speed: 6.2, damage: 15, radius: 0.6, xp: 4, mass: 1.3,
    behavior: 'ambusher', dashInterval: 3.5, dashSpeed: 15, dashTime: 0.45
  },
  bloat: {
    name: 'Spore Bloat',         // rain canopy: slow sac, bursts into a chilling cloud
    hp: 95, speed: 1.7, damage: 9, radius: 0.8, xp: 4, mass: 2.2,
    behavior: 'chase', deathCloud: true
  },
  crawler: {
    name: 'Magma Crawler',       // cinder wastes: leaves a burning trail behind it
    hp: 50, speed: 3.9, damage: 10, radius: 0.6, xp: 3, mass: 1.2,
    behavior: 'chase', trailBurn: true
  },
  drake: {
    name: 'Drake',               // cinder wastes / highlands: circles overhead, dives
    hp: 72, speed: 5.4, damage: 13, radius: 0.7, xp: 5, mass: 1.5,
    behavior: 'flyer', shootInterval: 2.4, shotSpeed: 14
  },
  sentinel: {
    name: 'Storm Sentinel',      // highlands: floating obelisk, three-shot arc bursts
    hp: 64, speed: 2.4, damage: 9, radius: 0.6, xp: 4, mass: 1.5,
    behavior: 'ranged', shootInterval: 3.0, shotSpeed: 13, keepDist: 10, shotElement: 'shock', burst: 3
  },
  phantom: {
    name: 'Void Phantom',        // void sanctum: blinks out, reappears at your back
    hp: 52, speed: 3.4, damage: 14, radius: 0.55, xp: 5, mass: 1,
    behavior: 'phantom', blinkInterval: 3.4
  },
  nullshard: {
    name: 'Null Shard',          // void sanctum: crystalline skirmisher
    hp: 36, speed: 3.0, damage: 8, radius: 0.5, xp: 3, mass: 0.8,
    behavior: 'ranged', shootInterval: 2.0, shotSpeed: 13, keepDist: 9, shotElement: 'void'
  },

  // ---- more fauna: beaks, leeches, callers, golems, turrets, masks ----
  beakstrider: {
    name: 'Beak Strider',        // dune coast: tall runner, brutal charge
    hp: 60, speed: 4.6, damage: 14, radius: 0.6, xp: 4, mass: 1.4,
    behavior: 'dasher', dashInterval: 3.6, dashSpeed: 24, dashTime: 0.5
  },
  tideleech: {
    name: 'Tide Leech',          // shallows: latches on and bleeds you
    hp: 26, speed: 4.4, damage: 6, radius: 0.45, xp: 2, mass: 0.5,
    behavior: 'latcher'
  },
  howler: {
    name: 'Howler',              // frost range: keeps its distance and calls the pack
    hp: 90, speed: 3.6, damage: 10, radius: 0.75, xp: 7, mass: 2,
    behavior: 'caller', keepDist: 11, callInterval: 8, calls: 'stalker', callCount: 2
  },
  skitter: {
    name: 'Mandible Skitter',    // rain canopy: fast, climbs onto you
    hp: 34, speed: 5.6, damage: 9, radius: 0.5, xp: 3, mass: 0.7,
    behavior: 'latcher'
  },
  bellowtoad: {
    name: 'Bellow Toad',         // canopy and warrens: lobs heavy spit
    hp: 84, speed: 2.0, damage: 16, radius: 0.85, xp: 5, mass: 2.4,
    behavior: 'ranged', shootInterval: 3.0, shotSpeed: 8, keepDist: 9, shotElement: 'void'
  },
  cinderhound: {
    name: 'Cinder Hound',        // cinder wastes: pack chaser
    hp: 30, speed: 5.4, damage: 9, radius: 0.5, xp: 2, mass: 0.7,
    behavior: 'chase'
  },
  slaggolem: {
    name: 'Slag Golem',          // cinder wastes and ruins: slow, slams the ground
    hp: 220, speed: 1.9, damage: 22, radius: 1.1, xp: 10, mass: 6,
    behavior: 'slammer', slamInterval: 4.5, armorMult: 0.7
  },
  rodsentry: {
    name: 'Rod Sentry',          // highlands: rooted arc turret
    hp: 140, speed: 0, damage: 10, radius: 0.8, xp: 6, mass: 8,
    behavior: 'turret', shootInterval: 2.6, shotSpeed: 15, burst: 3, shotElement: 'shock'
  },
  eyecluster: {
    name: 'Eye Cluster',         // void: three-way spread shots
    hp: 48, speed: 2.6, damage: 8, radius: 0.55, xp: 4, mass: 0.9,
    behavior: 'ranged', shootInterval: 2.4, shotSpeed: 12, keepDist: 10, shotElement: 'void', spread: 3
  },
  slinger: {
    name: 'Masked Slinger',      // hive: mechanical legs, a mask, a gun, no courage
    hp: 56, speed: 3.4, damage: 9, radius: 0.55, xp: 4, mass: 1,
    behavior: 'ranged', shootInterval: 2.2, shotSpeed: 16, keepDist: 13, burst: 2
  },
  habbrute: {
    name: 'Hab Brute',           // hive: the big one
    hp: 170, speed: 2.3, damage: 18, radius: 1.0, xp: 7, mass: 3.5,
    behavior: 'chase'
  },
  wardenknight: {
    name: 'Warden Knight',       // keep: shielded, lunges
    hp: 120, speed: 3.2, damage: 16, radius: 0.7, xp: 7, mass: 2.5,
    behavior: 'dasher', dashInterval: 3.4, dashSpeed: 17, dashTime: 0.4, armorMult: 0.5
  },
  ballista: {
    name: 'Ballista',            // keep: rooted bolt thrower
    hp: 160, speed: 0, damage: 22, radius: 0.9, xp: 6, mass: 8,
    behavior: 'turret', shootInterval: 3.2, shotSpeed: 20, burst: 1
  },
  gravestalker: {
    name: 'Grave Stalker',       // ruins: pale pack hunter
    hp: 50, speed: 5.0, damage: 12, radius: 0.55, xp: 4, mass: 1,
    behavior: 'dasher', dashInterval: 3.0, dashSpeed: 19, dashTime: 0.38
  },
  carrionkite: {
    name: 'Carrion Kite',        // ruins: flyer
    hp: 60, speed: 5.2, damage: 11, radius: 0.65, xp: 4, mass: 1.3,
    behavior: 'flyer', shootInterval: 2.6, shotSpeed: 13
  },
  glowmite: {
    name: 'Glow Mite',           // warrens: swarm
    hp: 12, speed: 6.2, damage: 5, radius: 0.4, xp: 1, mass: 0.5,
    behavior: 'chase'
  },
  tunnelmaw: {
    name: 'Tunnel Maw',          // warrens: burrower
    hp: 90, speed: 7.0, damage: 20, radius: 0.8, xp: 7, mass: 2.5,
    behavior: 'burrower', surfaceTime: 2.4
  },
  fungalshambler: {
    name: 'Fungal Shambler',     // warrens: spore sac
    hp: 110, speed: 1.8, damage: 10, radius: 0.85, xp: 5, mass: 2.4,
    behavior: 'chase', deathCloud: true
  },
  aetherray: {
    name: 'Aether Ray',          // sky: wide-winged glider
    hp: 66, speed: 5.8, damage: 12, radius: 0.75, xp: 5, mass: 1.4,
    behavior: 'flyer', shootInterval: 2.2, shotSpeed: 14
  },
  cloudwisp: {
    name: 'Cloud Wisp',          // sky: arc shots
    hp: 32, speed: 3.2, damage: 8, radius: 0.45, xp: 2, mass: 0.6,
    behavior: 'ranged', shootInterval: 2.2, shotSpeed: 12, keepDist: 8, shotElement: 'shock'
  },

  // ---- midbosses ----
  warden: {
    name: 'RUST WARDEN', boss: true, mid: true,
    hp: 900, speed: 2.5, damage: 20, radius: 1.3, xp: 30, mass: 10,
    behavior: 'boss', slamInterval: 6, summonInterval: 11
  },
  carapace: {
    name: 'GRAVE CARAPACE', boss: true, mid: true,
    hp: 1500, speed: 2.1, damage: 22, radius: 1.6, xp: 45, mass: 14,
    behavior: 'boss', slamInterval: 7, summonInterval: 6, summons: 'shardling', summonCount: 5
  },

  // ---- RACEWAY rivals: hostile racer frames in vehicle form ----
  racer: {
    name: 'Rival Racer',
    hp: 160, speed: 14, damage: 10, radius: 1.1, xp: 10, mass: 4,
    behavior: 'racer', shootInterval: 2.6, shotSpeed: 16
  },

  // ---- THE HARROW — the world boss that roams the Shattered Reach daily ----
  harrow: {
    name: 'THE HARROW', boss: true,
    hp: 5200, speed: 2.3, damage: 30, radius: 2.2, xp: 150, mass: 22,
    behavior: 'boss', slamInterval: 5, summonInterval: 9, summonCount: 4
  },

  // ---- corrupt shell bosses (wave 20) — one per unlockable frame ----
  fang:  { name: 'CORRUPTED FANG', boss: true, corrupt: true,
    hp: 2200, speed: 3.6, damage: 24, radius: 1.15, xp: 60, mass: 10, behavior: 'corrupt' },
  hexen: { name: 'CORRUPTED HEXEN', boss: true, corrupt: true,
    hp: 2600, speed: 2.6, damage: 26, radius: 1.15, xp: 70, mass: 10, behavior: 'corrupt' },
  viper: { name: 'CORRUPTED VIPER', boss: true, corrupt: true,
    hp: 3000, speed: 3.4, damage: 26, radius: 1.15, xp: 80, mass: 10, behavior: 'corrupt' },
  morrow:{ name: 'CORRUPTED MORROW', boss: true, corrupt: true,
    hp: 3600, speed: 2.9, damage: 30, radius: 1.2, xp: 90, mass: 12, behavior: 'corrupt' },
  strix: { name: 'CORRUPTED STRIX', boss: true, corrupt: true,
    hp: 4200, speed: 3.2, damage: 32, radius: 1.15, xp: 100, mass: 10, behavior: 'corrupt' },
  titan: { name: 'CORRUPTED TITAN', boss: true, corrupt: true,
    hp: 5600, speed: 2.2, damage: 38, radius: 1.5, xp: 140, mass: 20, behavior: 'corrupt' }
};

// builders receive the zone id so common fauna wears local colours
var HUSK_TINT = { wreck: 0xb0a080, glacier: 0xc8d4e0, cloister: 0x6a7a48, ember: 0x5a3a30, storm: 0x6a6e80, null: 0x9a94a8 };
var BRUTE_TINT = { wreck: 0x8a7a58, glacier: 0x8aa0b8, cloister: 0x4a5a30, ember: 0x3a2420, storm: 0x4a4e60, null: 0x6a6478 };
GH.enemyBuilders = {
  husk: function (zone) { return GH.models.buildHusk(1, HUSK_TINT[zone] || 0x9a9a92); },
  shardling: function () { return GH.models.buildShardling(); },
  orb: function () { return GH.models.buildOrb(); },
  spiker: function () { return GH.models.buildSpiker(); },
  brute: function (zone) { return GH.models.buildHusk(1.7, BRUTE_TINT[zone] || 0x7a736a); },
  scarab: function () { return GH.models.buildScarab(); },
  burrower: function () { return GH.models.buildBurrower(); },
  stalker: function () { return GH.models.buildStalker(); },
  frostwisp: function () { return GH.models.buildFrostWisp(); },
  lurker: function () { return GH.models.buildLurker(); },
  bloat: function () { return GH.models.buildBloat(); },
  crawler: function () { return GH.models.buildCrawler(); },
  drake: function (zone) { return GH.models.buildDrake(zone); },
  sentinel: function () { return GH.models.buildSentinel(); },
  phantom: function () { return GH.models.buildPhantom(); },
  nullshard: function () { return GH.models.buildNullShard(); },
  beakstrider: function () { return GH.models.buildBeakStrider(); },
  tideleech: function () { return GH.models.buildLeech(); },
  howler: function () { return GH.models.buildHowler(); },
  skitter: function () { return GH.models.buildSkitter(); },
  bellowtoad: function () { return GH.models.buildToad(); },
  cinderhound: function () { return GH.models.buildHound(); },
  slaggolem: function (zone) { return zone === 'ruins' ? GH.models.buildGolem(0x6a6a64, 0x60c0a0) : GH.models.buildGolem(); },
  rodsentry: function () { return GH.models.buildTurret('rod'); },
  eyecluster: function () { return GH.models.buildEyeCluster(); },
  slinger: function () { return GH.models.buildSlinger(); },
  habbrute: function () { return GH.models.buildHusk(1.7, 0x4a4f5c); },
  wardenknight: function () { return GH.models.buildKnight(); },
  ballista: function () { return GH.models.buildTurret('ballista'); },
  gravestalker: function () { return GH.models.buildStalker(0x9a9aa0); },
  carrionkite: function () { return GH.models.buildDrake('ruins'); },
  glowmite: function () { return GH.models.buildShardling(0x60e0c0); },
  tunnelmaw: function () { return GH.models.buildBurrower(0x5a4a70); },
  fungalshambler: function () { return GH.models.buildBloat(0x6a5a8a); },
  aetherray: function () { return GH.models.buildRay(); },
  cloudwisp: function () { return GH.models.buildFrostWisp(0xe8e0ff); },
  creeper: function () { return GH.models.buildCreeper(); },
  cinder: function () { return GH.models.buildCinder(); },
  volt: function () { return GH.models.buildVolt(); },
  warden: function () { return GH.models.buildWarden(); },
  carapace: function () { return GH.models.buildCarapace(); },
  harrow: function () { return GH.models.buildHarrow(); },
  racer: function () {
    var liveries = [
      { body: 0xb03838, accent: 0xffd050, dark: 0x381414 },
      { body: 0x3870b0, accent: 0x80ffd0, dark: 0x142038 },
      { body: 0x50a048, accent: 0xf0f0f0, dark: 0x1a3018 }
    ];
    return GH.models.buildSpeeder(liveries[Math.floor(Math.random() * liveries.length)]);
  }
};

// corrupt bosses reuse the mech builder in corrupt colors at boss scale
GH.buildCorrupt = function (mechId) {
  var def = GH.mechById(mechId);
  var cfg = {};
  for (var k in def.model) cfg[k] = def.model[k];
  cfg.corrupt = true;
  var g = GH.models.buildMech(cfg);
  g.scale.setScalar(2.0);
  return g;
};
