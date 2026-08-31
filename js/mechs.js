// HERO FRAME — playable frame definitions.
// Archetypes mirror the classic survivor-mech lineup: a block-healing paladin
// starter, a dodge-fed light striker, an element-cycling wizard, a dagger
// rogue, a wounded-fury reaper, plus gunner / railgun / artillery frames.
// stats.speed is in UI units (game speed = speed * 0.42).
GH.mechs = [
  {
    id: 'aegis',
    name: 'AEGIS',
    role: 'Paladin frame · starter',
    icon: '⚔',
    desc: 'Built for survivability. Blocking restores HP. Boosting rams enemies for force damage that scales with Block and Armor. The greatblade is pure steel — close the distance and swing.',
    model: { body: 0x9aa09a, accent: 0xd8b040, dark: 0x30342e, trim: 0x787e76, prop: 'sword' },
    stats: { maxHP: 125, speed: 16, armor: 5, block: 8, crit: 5, lifesteal: 0 },
    levelUp: { armor: 1, maxHP: 2, block: 1 },
    levelText: '+1 Armor Rating\n+2 Max Health\n+1% Block',
    baseText: '+16 Speed\n+5 Armor Rating\n+25 Max Health',
    weapon: {
      type: 'melee', name: 'Greatblade', cls: 'HEAVY · PHYSICAL',
      damage: 26, interval: 0.62, range: 3.4, arc: 2.1, knockback: 7
    },
    special: 'block', specialText: 'BLOCK — hold to brace: 70% damage cut, blocked hits mend the frame',
    hudStats: ['block', 'armor', 'crit']
  },
  {
    id: 'vulcan',
    name: 'VULCAN',
    role: 'Gunner frame · starter',
    icon: '◉',
    desc: 'A walking foundry. Twin autocannons hose down everything ahead — 24-round drums with a snap reload. Special: OVERDRIVE doubles fire rate for a burst.',
    model: { body: 0x8a3028, accent: 0xf0c040, dark: 0x381410, trim: 0x5a201a, prop: 'guns' },
    stats: { maxHP: 95, speed: 17, armor: 2, block: 0, crit: 10, lifesteal: 0 },
    levelUp: { damage: 1, atkSpd: 2, maxHP: 1 },
    levelText: '+1 Damage\n+2% Attack Speed\n+1 Max Health',
    baseText: '+17 Speed\n+2 Armor Rating\n-5 Max Health',
    weapon: {
      type: 'shot', name: 'Autocannon', cls: 'LIGHT · PHYSICAL',
      damage: 8, interval: 0.15, speed: 30, life: 0.9, size: 0.22,
      color: 0xf0d040, spread: 0.14, count: 1, clip: 24, reload: 1.1
    },
    special: 'overdrive', specialText: 'OVERDRIVE — 3s of doubled fire rate',
    hudStats: ['crit', 'atkSpd', 'damage']
  },
  {
    id: 'fang',
    name: 'FANG',
    role: 'Striker frame',
    icon: '≡',
    desc: 'A light-weapons predator. Claws shred in fast, close swings, and every boost feeds FRENZY — stacking attack speed. Stay moving, stay untouchable.',
    model: { body: 0x6a2a34, accent: 0xff5040, dark: 0x2a1014, trim: 0x8a4040, prop: 'claws' },
    stats: { maxHP: 90, speed: 19, armor: 1, block: 0, crit: 12, lifesteal: 4 },
    levelUp: { atkSpd: 3, speed: 0.2, maxHP: 1 },
    levelText: '+3% Attack Speed\n+0.2 Speed\n+1 Max Health',
    baseText: '+19 Speed\n+1 Armor Rating\n-10 Max Health\nBoost feeds Frenzy',
    weapon: {
      type: 'melee', name: 'Talon Rake', cls: 'LIGHT · PHYSICAL',
      damage: 8, interval: 0.24, range: 2.5, arc: 1.6, knockback: 2
    },
    special: 'lunge', specialText: 'LUNGE — a second short dash that slashes through enemies',
    passive: 'frenzy',
    hudStats: ['atkSpd', 'crit', 'lifesteal']
  },
  {
    id: 'hexen',
    name: 'HEXEN',
    role: 'Wizard frame',
    icon: '✦',
    desc: 'An arcane engine wearing armor. Its spellcannon cycles element every 5 seconds — flame that burns, storm that stuns, frost that slows. Special: NOVA bursts with the current element.',
    model: { body: 0x6a5a9a, accent: 0x50e8d8, dark: 0x241a40, trim: 0x8a7ac0, prop: 'staff' },
    stats: { maxHP: 85, speed: 16, armor: 1, block: 0, crit: 8, lifesteal: 0 },
    levelUp: { damage: 2, maxHP: 1, magnet: 2 },
    levelText: '+2 Damage\n+1 Max Health\n+2% Magnet Range',
    baseText: '+16 Speed\n+1 Armor Rating\n-15 Max Health\n+15% Elemental Damage',
    weapon: {
      type: 'shot', name: 'Spellcannon', cls: 'HEAVY · ELEMENTAL',
      damage: 17, interval: 0.55, speed: 17, life: 2.2, size: 0.32,
      color: 0x50e8d8, spread: 0.3, count: 1, homing: 4, aoe: 1.6,
      cycle: ['burn', 'shock', 'frost'], clip: 8, reload: 1.0
    },
    special: 'nova', specialText: 'NOVA — an elemental shockwave that shoves the swarm away',
    hudStats: ['damage', 'magnet', 'crit']
  },
  {
    id: 'viper',
    name: 'VIPER',
    role: 'Rogue frame',
    icon: '⌁',
    desc: 'A knife in mech armor. Twin daggers land vicious close-in flurries that crit hard; boosting sharpens your edge (+crit for 2s). Special: SHADE — vanish and reappear behind the fight.',
    model: { body: 0x3a4448, accent: 0x9ae848, dark: 0x161c1e, trim: 0x5a686e, prop: 'daggers' },
    stats: { maxHP: 80, speed: 18, armor: 1, block: 0, crit: 16, lifesteal: 0 },
    levelUp: { crit: 1, damage: 1, atkSpd: 1 },
    levelText: '+1% Critical\n+1 Damage\n+1% Attack Speed',
    baseText: '+18 Speed\n+1 Armor Rating\n-20 Max Health\nBoost sharpens crit',
    weapon: {
      type: 'melee', name: 'Dagger Flurry', cls: 'LIGHT · PHYSICAL',
      damage: 9, interval: 0.2, range: 2.6, arc: 1.3, knockback: 1
    },
    special: 'blink', specialText: 'SHADE — teleport through danger, untouchable for a breath',
    passive: 'edge',
    hudStats: ['crit', 'atkSpd', 'damage']
  },
  {
    id: 'morrow',
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
      type: 'aura', name: 'Reap Cycle', cls: 'HEAVY · PHYSICAL',
      damage: 12, interval: 0.38, range: 3.0
    },
    special: 'frenzy', specialText: 'FRENZY — the reap radius briefly doubles',
    passive: 'wrath',
    hudStats: ['lifesteal', 'armor', 'damage']
  },
  {
    id: 'strix',
    name: 'STRIX',
    role: 'Duelist frame',
    icon: '➳',
    desc: 'A duelist tuned for precision. Rail lances punch through entire columns and crit hard. Special: BLINK — a short teleport through danger.',
    model: { body: 0xc8c8d0, accent: 0xf05060, dark: 0x404048, trim: 0x8a8a96, prop: 'lance' },
    stats: { maxHP: 80, speed: 18, armor: 1, block: 0, crit: 18, lifesteal: 0 },
    levelUp: { crit: 1, speed: 0.2, damage: 1 },
    levelText: '+1% Critical\n+0.2 Speed\n+1 Damage',
    baseText: '+18 Speed\n+1 Armor Rating\n-20 Max Health',
    weapon: {
      type: 'shot', name: 'Rail Lance', cls: 'HEAVY · PHYSICAL',
      damage: 26, interval: 0.7, speed: 46, life: 1.1, size: 0.24,
      color: 0xff6070, spread: 0.0, count: 1, pierce: 99, clip: 5, reload: 1.3
    },
    special: 'blink', specialText: 'BLINK — teleport through danger',
    hudStats: ['crit', 'speed', 'damage']
  },
  {
    id: 'titan',
    name: 'TITAN',
    role: 'Artillery frame',
    icon: '◆',
    desc: 'A siege engine that learned to walk. Mortar shells arc over the swarm and detonate in wide force blasts. Slow, but nearly unbreakable. Special: BULWARK — brief immovable overplating.',
    model: { body: 0x5a6a5a, accent: 0xf0a030, dark: 0x242c24, trim: 0x8a988a, prop: 'mortar' },
    stats: { maxHP: 160, speed: 13, armor: 8, block: 4, crit: 4, lifesteal: 0 },
    levelUp: { armor: 1, maxHP: 4, damage: 2 },
    levelText: '+1 Armor Rating\n+4 Max Health\n+2 Damage',
    baseText: '+13 Speed\n+8 Armor Rating\n+60 Max Health',
    weapon: {
      type: 'mortar', name: 'Siege Mortar', cls: 'HEAVY · PHYSICAL',
      damage: 34, interval: 1.5, aoe: 2.8, arcTime: 0.85, color: 0xffa040
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
