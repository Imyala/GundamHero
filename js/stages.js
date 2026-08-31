// HERO FRAME — stage definitions (6 arenas, 20 waves each)
// Beating a stage's wave-20 CORRUPTED shell unlocks that shell + the next stage.
GH.stages = [
  {
    id: 'wreck', name: 'TIDE WRECKAGE', sub: 'Stage 1',
    // sun-bleached island ruin
    floor: { base: 0xb0a078, dark: '#3a3020', mortar: '#584c34' },
    sky: ['#7ec8d8', '#3a7890', '#1a3a48'],
    fog: 0x8fc0c8, hemiSky: 0xd8f0e8, hemiGround: 0x3a5a4a, sun: 0xfff0d0,
    wall: { base: '#6a8a7a', top: '#2a4438' },
    props: ['pillar', 'tree'],
    roster: function (w) {
      var t = [{ id: 'husk', w: 10 }];
      if (w >= 2) t.push({ id: 'shardling', w: 6 + w });
      if (w >= 4) t.push({ id: 'spiker', w: 4 });
      if (w >= 6) t.push({ id: 'brute', w: 2 + w * 0.2 });
      return t;
    },
    tint: 0x9ab0a0,
    unlocks: 'fang',
    hpMult: 1, dmgMult: 1
  },
  {
    id: 'glacier', name: 'GLACIER HOLLOW', sub: 'Stage 2',
    floor: { base: 0x8ab0c8, dark: '#16282e', mortar: '#2e4852' },
    sky: ['#bfe8ff', '#5a90c0', '#182848'],
    fog: 0x9fc8dc, hemiSky: 0xbfe8ff, hemiGround: 0x24485a, sun: 0xeaf6ff,
    wall: { base: '#9ec8dc', top: '#4a7890' },
    props: ['pillar', 'crystal'],
    roster: function (w) {
      var t = [{ id: 'husk', w: 8 }, { id: 'shardling', w: 8 + w }];
      if (w >= 3) t.push({ id: 'orb', w: 5 });
      if (w >= 5) t.push({ id: 'spiker', w: 4 });
      if (w >= 7) t.push({ id: 'brute', w: 2 + w * 0.25 });
      return t;
    },
    tint: 0xa0c8e0,
    unlocks: 'hexen',
    hpMult: 1.35, dmgMult: 1.15
  },
  {
    id: 'cloister', name: 'VERDANT CLOISTER', sub: 'Stage 3',
    floor: { base: 0x7a8a58, dark: '#1c2410', mortar: '#3a4424' },
    sky: ['#b8d890', '#4a7840', '#122a18'],
    fog: 0x8aa878, hemiSky: 0xd0e8b0, hemiGround: 0x24381a, sun: 0xfff8d0,
    wall: { base: '#5a7848', top: '#243418' },
    props: ['tree', 'tree', 'pillar'],
    roster: function (w) {
      var t = [{ id: 'husk', w: 6 }, { id: 'spiker', w: 6 + w * 0.5 }];
      if (w >= 2) t.push({ id: 'shardling', w: 6 });
      if (w >= 4) t.push({ id: 'creeper', w: 5 });
      if (w >= 6) t.push({ id: 'orb', w: 4 });
      if (w >= 8) t.push({ id: 'brute', w: 3 + w * 0.25 });
      return t;
    },
    tint: 0x90b080,
    unlocks: 'viper',
    hpMult: 1.8, dmgMult: 1.32
  },
  {
    id: 'ember', name: 'EMBER CORE', sub: 'Stage 4',
    floor: { base: 0x9a5848, dark: '#200a08', mortar: '#48201a' },
    sky: ['#ff9060', '#8a3020', '#180604'],
    fog: 0x6a3028, hemiSky: 0xff9060, hemiGround: 0x2a0e0a, sun: 0xffb080,
    wall: { base: '#7a4030', top: '#301008' },
    props: ['pillar', 'crystal'],
    roster: function (w) {
      var t = [{ id: 'husk', w: 6 }, { id: 'cinder', w: 6 + w * 0.5 }];
      if (w >= 3) t.push({ id: 'orb', w: 5 });
      if (w >= 4) t.push({ id: 'shardling', w: 6 });
      if (w >= 5) t.push({ id: 'brute', w: 4 + w * 0.3 });
      if (w >= 8) t.push({ id: 'spiker', w: 5 });
      return t;
    },
    tint: 0xc08070,
    unlocks: 'morrow',
    hpMult: 2.4, dmgMult: 1.55
  },
  {
    id: 'storm', name: 'STORMSPIRE', sub: 'Stage 5',
    floor: { base: 0x707890, dark: '#141422', mortar: '#2c2c44' },
    sky: ['#9090b8', '#3c3c68', '#0a0a1c'],
    fog: 0x585c78, hemiSky: 0xa8a8d0, hemiGround: 0x1c1c30, sun: 0xd0d0ff,
    wall: { base: '#585c78', top: '#20203a' },
    props: ['pillar', 'crystal', 'tree'],
    roster: function (w) {
      var t = [{ id: 'husk', w: 5 }, { id: 'volt', w: 6 + w * 0.5 }];
      if (w >= 2) t.push({ id: 'orb', w: 6 });
      if (w >= 3) t.push({ id: 'shardling', w: 7 });
      if (w >= 5) t.push({ id: 'spiker', w: 5 });
      if (w >= 6) t.push({ id: 'brute', w: 4 + w * 0.3 });
      return t;
    },
    tint: 0x9098b8,
    unlocks: 'strix',
    hpMult: 3.2, dmgMult: 1.8
  },
  {
    id: 'null', name: 'NULL SANCTUM', sub: 'Final Stage',
    floor: { base: 0x8a8a92, dark: '#0a0a0e', mortar: '#26262e' },
    sky: ['#d8d8e0', '#404048', '#000004'],
    fog: 0x3a3a44, hemiSky: 0xe8e8f0, hemiGround: 0x101014, sun: 0xffffff,
    wall: { base: '#4a4a55', top: '#101014' },
    props: ['pillar', 'crystal'],
    roster: function (w) {
      var t = [
        { id: 'husk', w: 5 }, { id: 'shardling', w: 7 }, { id: 'volt', w: 4 },
        { id: 'cinder', w: 4 }, { id: 'creeper', w: 4 }
      ];
      if (w >= 3) t.push({ id: 'orb', w: 5 });
      if (w >= 4) t.push({ id: 'spiker', w: 5 });
      if (w >= 5) t.push({ id: 'brute', w: 5 + w * 0.35 });
      return t;
    },
    tint: 0xb0b0b8,
    unlocks: 'titan',
    hpMult: 4.2, dmgMult: 2.1
  }
];

// Wave plan for a stage: timers, spawn rates, set-piece waves.
// Wave 10: warden midboss. Wave 16: OVERRUN spike. Wave 18: carapace midboss.
// Wave 20: CORRUPTED shell boss (the next unlockable frame).
GH.wavePlan = function (stage, wave, arena) {
  var plan = {
    duration: 22 + wave * 0.9,
    rate: (0.7 + wave * 0.24) * (arena ? 1.15 : 1),
    types: stage.roster(wave),
    boss: null, midboss: null,
    hpMult: stage.hpMult * (1 + (wave - 1) * 0.16),
    dmgMult: stage.dmgMult * (1 + (wave - 1) * 0.06),
    overrun: false
  };
  if (arena) {
    // endless: scale forever, corrupt shells appear as roaming bosses every 10
    plan.hpMult = 1 + (wave - 1) * 0.24;
    plan.dmgMult = 1 + (wave - 1) * 0.07;
    plan.types = stage.roster(Math.min(wave, 12));
    if (wave % 10 === 0) plan.midboss = 'warden';
    if (wave >= 14) plan.rate *= 1.25;
    return plan;
  }
  if (wave === 10) plan.midboss = 'warden';
  if (wave === 16) { plan.overrun = true; plan.rate *= 2.4; plan.duration = 26; }
  if (wave === 18) plan.midboss = 'carapace';
  if (wave === 20) { plan.boss = stage.unlocks; plan.rate *= 0.5; }
  return plan;
};
