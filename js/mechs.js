// STAALREUS — playable frame definitions.
// Archetypes mirror the classic survivor-mech lineup: a block-healing paladin
// starter, a dodge-fed light striker, an element-cycling wizard, a dagger
// rogue, a wounded-fury reaper, plus gunner / railgun / artillery frames.
// stats.speed is in UI units (game speed = speed * 0.42).
// vehicle forms: what each frame folds into, and how it drives
GH.VECTORS = {
  bike: { name: 'HOVER-BIKE', top: 1.12, accel: 1.15, grip: 1.0, driftGrip: 0.7, jump: 1.25, ram: 0.8 },
  tank: { name: 'HOVER-TANK', top: 0.86, accel: 0.9, grip: 1.35, driftGrip: 1.4, jump: 0.7, ram: 1.7 },
  disc: { name: 'DISC', top: 0.96, accel: 1.0, grip: 0.8, driftGrip: 0.9, jump: 1.0, ram: 1.0, hover: true }
};

GH.mechs = [
  {
    id: 'aegis', vector: 'tank',
    name: 'AEGIS',
    role: 'Paladin frame · starter',
    icon: '⚔',
    desc: 'Sword and shield. The heater shield makes AEGIS the best blocker in the hangar, and the blade comes off it fast — quick, wide swings with real knockback. Blocking restores HP; boosting rams for force damage that scales with Block and Armor.',
    model: { body: 0x9aa09a, accent: 0xd8b040, dark: 0x30342e, trim: 0x787e76, prop: 'sword' },
    stats: { maxHP: 125, speed: 16, armor: 5, block: 14, crit: 5, lifesteal: 0 },
    levelUp: { armor: 1, maxHP: 2, block: 1 },
    levelText: '+1 Armor Rating\n+2 Max Health\n+1% Block',
    baseText: '+16 Speed\n+5 Armor Rating\n+25 Max Health\n+14% Block — shield-wall of the lineup',
    weapon: {
      type: 'melee', name: 'Blade & Shield', cls: 'QUICK · PHYSICAL',
      damage: 21, interval: 0.48, range: 3.2, arc: 2.2, knockback: 7
    },
    special: 'block', specialText: 'BLOCK — hold to brace: 70% damage cut, blocked hits mend the frame',
    hudStats: ['block', 'armor', 'crit']
  },
  {
    id: 'vulcan', vector: 'tank',
    name: 'VULCAN',
    role: 'Gunner frame · starter',
    icon: '◉',
    desc: 'A walking foundry. Twin autocannons trade drum size for cycle rate — the fastest trigger in the lineup, but only 14 rounds between snap reloads. Special: OVERDRIVE doubles fire rate for a burst.',
    model: { body: 0x8a3028, accent: 0xf0c040, dark: 0x381410, trim: 0x5a201a, prop: 'guns' },
    stats: { maxHP: 95, speed: 17, armor: 2, block: 0, crit: 10, lifesteal: 0 },
    levelUp: { damage: 1, atkSpd: 2, maxHP: 1 },
    levelText: '+1 Damage\n+2% Attack Speed\n+1 Max Health',
    baseText: '+17 Speed\n+2 Armor Rating\n-5 Max Health\nFastest fire rate · smallest drums',
    weapon: {
      type: 'shot', name: 'Twin Autocannons', cls: 'RAPID · PHYSICAL',
      damage: 6, interval: 0.11, speed: 30, life: 0.9, size: 0.2,
      color: 0xf0d040, spread: 0.16, count: 1, clip: 14, reload: 0.85
    },
    special: 'overdrive', specialText: 'OVERDRIVE — 3s of doubled fire rate',
    hudStats: ['crit', 'atkSpd', 'damage']
  },
  {
    id: 'fang', vector: 'bike',
    name: 'FANG',
    role: 'Striker frame',
    icon: '≡',
    desc: 'A light-weapons predator. Claws shred in fast, close swings, and every boost feeds FRENZY — stacking attack speed. Stay moving, stay untouchable.',
    model: { body: 0x6a2a34, accent: 0xff5040, dark: 0x2a1014, trim: 0x8a4040, prop: 'claws' },
    stats: { maxHP: 90, speed: 19, armor: 1, block: 0, crit: 12, lifesteal: 4 },
    levelUp: { atkSpd: 3, speed: 0.2, maxHP: 1 },
    levelText: '+3% Attack Speed\n+0.2 Speed\n+1 Max Health',
    baseText: '+19 Speed\n+1 Armor Rating\n-10 Max Health\nBoost feeds Frenzy\nFastest swings · shortest reach',
    weapon: {
      type: 'melee', name: 'Talon Rake', cls: 'SAVAGE · PHYSICAL',
      damage: 7, interval: 0.2, range: 2.2, arc: 1.9, knockback: 2
    },
    special: 'lunge', specialText: 'LUNGE — a second short dash that slashes through enemies',
    passive: 'frenzy',
    hudStats: ['atkSpd', 'crit', 'lifesteal']
  },
  {
    id: 'hexen', vector: 'disc',
    name: 'HEXEN',
    role: 'Wizard frame',
    icon: '✦',
    desc: 'An arcane engine wearing armor. Its spellcannon cycles element every 5 seconds — flame that burns, storm that stuns, frost that slows. Special: NOVA bursts with the current element.',
    model: { body: 0x6a5a9a, accent: 0x50e8d8, dark: 0x241a40, trim: 0x8a7ac0, prop: 'staff' },
    stats: { maxHP: 85, speed: 16, armor: 1, block: 0, crit: 8, lifesteal: 0 },
    levelUp: { damage: 2, maxHP: 1, magnet: 2 },
    levelText: '+2 Damage\n+1 Max Health\n+2% Magnet Range',
    baseText: '+16 Speed\n+1 Armor Rating\n-15 Max Health\n+15% Elemental Damage\nSlow, heavy splash shots',
    weapon: {
      type: 'shot', name: 'Spellcannon', cls: 'SLOW · ELEMENTAL · SPLASH',
      damage: 22, interval: 0.75, speed: 15, life: 2.4, size: 0.36,
      color: 0x50e8d8, spread: 0.3, count: 1, homing: 4, aoe: 2.2,
      cycle: ['burn', 'shock', 'frost'], clip: 6, reload: 1.2
    },
    special: 'nova', specialText: 'NOVA — an elemental shockwave that shoves the swarm away',
    hudStats: ['damage', 'magnet', 'crit']
  },
  {
    id: 'viper', vector: 'bike',
    name: 'VIPER',
    role: 'Rogue frame',
    icon: '⌁',
    desc: 'A knife in mech armor. Twin daggers land vicious close-in flurries that crit hard; boosting sharpens your edge (+crit for 2s). Special: SHADE — vanish and reappear behind the fight.',
    model: { body: 0x3a4448, accent: 0x9ae848, dark: 0x161c1e, trim: 0x5a686e, prop: 'daggers' },
    stats: { maxHP: 80, speed: 18, armor: 1, block: 0, crit: 16, lifesteal: 0 },
    levelUp: { crit: 1, damage: 1, atkSpd: 1 },
    levelText: '+1% Critical\n+1 Damage\n+1% Attack Speed',
    baseText: '+18 Speed\n+1 Armor Rating\n-20 Max Health\nBoost sharpens crit\nNarrow, rapid precision flurries',
    weapon: {
      type: 'melee', name: 'Dagger Flurry', cls: 'PRECISE · PHYSICAL',
      damage: 8, interval: 0.17, range: 2.4, arc: 1.0, knockback: 1
    },
    special: 'blink', specialText: 'SHADE — teleport through danger, untouchable for a breath',
    passive: 'edge',
    hudStats: ['crit', 'atkSpd', 'damage']
  },
  {
    id: 'morrow', vector: 'disc',
    name: 'MORROW',
    role: 'Reaper frame',
    icon: '†',
    desc: 'A harvester of scrap and souls. A whirling scythe grinds everything nearby and every wound feeds the frame — WRATH: the lower your hull, the harder you hit (up to +60%).',
    model: { body: 0x3a3a42, accent: 0xb03050, dark: 0x141418, trim: 0x585864, prop: 'scythe' },
    stats: { maxHP: 105, speed: 17, armor: 3, block: 0, crit: 6, lifesteal: 12 },
    levelUp: { lifesteal: 1, maxHP: 2, damage: 1 },
    levelText: '+1% Lifesteal\n+2 Max Health\n+1 Damage',
    baseText: '+17 Speed\n+3 Armor Rating\n+5 Max Health\nWrath: missing HP → damage',
    weapon: {
      type: 'aura', name: 'Reap Cycle', cls: 'HEAVY · ALL-AROUND',
      damage: 14, interval: 0.45, range: 3.2
    },
    special: 'frenzy', specialText: 'FRENZY — the reap radius briefly doubles',
    passive: 'wrath',
    hudStats: ['lifesteal', 'armor', 'damage']
  },
  {
    id: 'strix', vector: 'bike',
    name: 'STRIX',
    role: 'Duelist frame',
    icon: '➳',
    desc: 'A duelist tuned for reach. The powered lance thrusts fast and far in a narrow line — outrange every other melee frame and crit hard, but the haft blocks poorly next to a real shield. Special: BLINK — a short teleport through danger.',
    model: { body: 0xc8c8d0, accent: 0xf05060, dark: 0x404048, trim: 0x8a8a96, prop: 'lance' },
    stats: { maxHP: 80, speed: 18, armor: 1, block: 4, crit: 18, lifesteal: 0 },
    levelUp: { crit: 1, speed: 0.2, damage: 1 },
    levelText: '+1% Critical\n+0.2 Speed\n+1 Damage',
    baseText: '+18 Speed\n+1 Armor Rating\n-20 Max Health\n+4% Block — a haft is no shield\nLongest melee reach, narrow thrust',
    weapon: {
      type: 'melee', name: 'Rail Lance', cls: 'REACH · PHYSICAL',
      damage: 15, interval: 0.36, range: 4.4, arc: 0.7, knockback: 4
    },
    special: 'blink', specialText: 'BLINK — teleport through danger',
    hudStats: ['crit', 'speed', 'damage']
  },
  {
    id: 'titan', vector: 'tank',
    name: 'TITAN',
    role: 'Artillery frame',
    icon: '◆',
    desc: 'A siege engine that learned to walk. Mortar shells arc over the swarm and detonate in wide force blasts. Slow, but nearly unbreakable. Special: BULWARK — brief immovable overplating.',
    model: { body: 0x5a6a5a, accent: 0xf0a030, dark: 0x242c24, trim: 0x8a988a, prop: 'mortar' },
    stats: { maxHP: 160, speed: 13, armor: 8, block: 6, crit: 4, lifesteal: 0 },
    levelUp: { armor: 1, maxHP: 4, damage: 2 },
    levelText: '+1 Armor Rating\n+4 Max Health\n+2 Damage',
    baseText: '+13 Speed\n+8 Armor Rating\n+60 Max Health\nSlowest weapon · biggest blast',
    weapon: {
      type: 'mortar', name: 'Siege Mortar', cls: 'SIEGE · PHYSICAL · SPLASH',
      damage: 42, interval: 1.8, aoe: 3.3, arcTime: 0.85, color: 0xffa040
    },
    special: 'bulwark', specialText: 'BULWARK — 4s of +12 armor and knockback immunity',
    hudStats: ['armor', 'damage', 'block']
  }
];

GH.mechById = function (id) {
  for (var i = 0; i < GH.mechs.length; i++) if (GH.mechs[i].id === id) return GH.mechs[i];
  return GH.mechs[0];
};

GH.statGlyphs = {
  block: '⛨', armor: '⚙', crit: '✗',
  atkSpd: '↻', damage: '⚔', magnet: '◎',
  lifesteal: '♥', speed: '↠'
};

GH.statLabel = {
  block: 'Block', armor: 'Armor', crit: 'Crit', atkSpd: 'Atk Spd',
  damage: 'Damage', magnet: 'Magnet', lifesteal: 'Lifesteal', speed: 'Speed'
};

GH.elements = {
  burn: { name: 'Burn', color: 0xff6020, css: '#ff8040' },
  shock: { name: 'Shock', color: 0x70c0ff, css: '#90d0ff' },
  frost: { name: 'Frost', color: 0xa0e8ff, css: '#c0f0ff' }
};
