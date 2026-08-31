// HERO FRAME — enemy definitions & wave composition
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
  boss1: {
    name: 'CARRION HULK', boss: true, tier: 0,
    hp: 1500, speed: 2.4, damage: 22, radius: 1.5, xp: 40, mass: 12,
    behavior: 'boss'
  },
  boss2: {
    name: 'OMEGA HUSK', boss: true, tier: 1,
    hp: 4200, speed: 2.6, damage: 30, radius: 2.0, xp: 100, mass: 20,
    behavior: 'boss'
  }
};

GH.enemyBuilders = {
  husk: function () { return GH.models.buildHusk(1); },
  shardling: function () { return GH.models.buildShardling(); },
  orb: function () { return GH.models.buildOrb(); },
  spiker: function () { return GH.models.buildSpiker(); },
  brute: function () { return GH.models.buildHusk(1.7, 0x7a736a); },
  boss1: function () { return GH.models.buildBoss(0); },
  boss2: function () { return GH.models.buildBoss(1); }
};

// per-wave: duration, spawn budget/sec, allowed types (weighted), boss
GH.wavePlan = function (wave) {
  var plan = {
    duration: 24 + wave * 0.8,
    rate: 0.8 + wave * 0.22,            // enemies per second
    types: [{ id: 'husk', w: 10 }],
    boss: null,
    hpMult: 1 + (wave - 1) * 0.22,
    dmgMult: 1 + (wave - 1) * 0.09
  };
  if (wave >= 2) plan.types.push({ id: 'shardling', w: 7 + wave });
  if (wave >= 3) plan.types.push({ id: 'spiker', w: 4 });
  if (wave >= 4) plan.types.push({ id: 'orb', w: 4 });
  if (wave >= 6) plan.types.push({ id: 'brute', w: 2 + wave * 0.2 });
  if (wave === 10) plan.boss = 'boss1';
  if (wave === 20) plan.boss = 'boss2';
  if (wave === 15) { plan.rate *= 1.5; }               // swarm wave
  return plan;
};
