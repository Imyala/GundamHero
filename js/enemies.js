// HERO FRAME — enemy definitions.
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

GH.enemyBuilders = {
  husk: function () { return GH.models.buildHusk(1); },
  shardling: function () { return GH.models.buildShardling(); },
  orb: function () { return GH.models.buildOrb(); },
  spiker: function () { return GH.models.buildSpiker(); },
  brute: function () { return GH.models.buildHusk(1.7, 0x7a736a); },
  creeper: function () { return GH.models.buildCreeper(); },
  cinder: function () { return GH.models.buildCinder(); },
  volt: function () { return GH.models.buildVolt(); },
  warden: function () { return GH.models.buildWarden(); },
  carapace: function () { return GH.models.buildCarapace(); },
  harrow: function () { return GH.models.buildHarrow(); }
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
