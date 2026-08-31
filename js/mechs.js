// HERO FRAME — playable frame definitions (original archetypes)
GH.mechs = [
  {
    id: 'aegis',
    name: 'AEGIS',
    icon: '⚔',
    desc: 'Built for survivability. Blocking restores HP. Boosting knocks enemies back and deals force damage that scales with Block and Armor.',
    model: { body: 0x9aa09a, accent: 0xd8b040, dark: 0x30342e, prop: 'sword' },
    stats: { maxHP: 125, speed: 16, armor: 5, block: 8, crit: 5, lifesteal: 0 },
    levelUp: { armor: 1, maxHP: 2, block: 1 },
    levelText: '+1 Armor Rating\n+2 Max Health\n+1% Block',
    baseText: '+16 Speed\n+5 Armor Rating\n+25 Max Health',
    weapon: {
      type: 'melee', name: 'Greatblade',
      damage: 24, interval: 0.62, range: 3.4, arc: 2.1, knockback: 7
    },
    special: 'block',   // hold: 70% damage reduction, heal on blocked hit
    hudStats: ['block', 'armor', 'crit']
  },
  {
    id: 'vulcan',
    name: 'VULCAN',
    icon: '◉',
    desc: 'A walking foundry. Twin autocannons hose down everything ahead. Special: OVERDRIVE — a burst of double fire rate.',
    model: { body: 0x8a3028, accent: 0xf0c040, dark: 0x381410, prop: 'guns' },
    stats: { maxHP: 95, speed: 17, armor: 2, block: 0, crit: 10, lifesteal: 0 },
    levelUp: { damage: 1, atkSpd: 2, maxHP: 1 },
    levelText: '+1 Damage\n+2% Attack Speed\n+1 Max Health',
    baseText: '+17 Speed\n+2 Armor Rating\n-5 Max Health',
    weapon: {
      type: 'shot', name: 'Autocannon',
      damage: 8, interval: 0.16, speed: 30, life: 0.9, size: 0.22,
      color: 0xf0d040, spread: 0.14, count: 1
    },
    special: 'overdrive',
    hudStats: ['crit', 'atkSpd', 'damage']
  },
  {
    id: 'hexen',
    name: 'HEXEN',
    icon: '✦',
    desc: 'An arcane engine wearing armor. Fires seeking hexbolts that pierce. Special: NOVA — a shockwave that shoves the swarm away.',
    model: { body: 0x6a5a9a, accent: 0x50e8d8, dark: 0x241a40, prop: 'staff' },
    stats: { maxHP: 85, speed: 16, armor: 1, block: 0, crit: 8, lifesteal: 0 },
    levelUp: { damage: 2, maxHP: 1, magnet: 2 },
    levelText: '+2 Damage\n+1 Max Health\n+2% Magnet Range',
    baseText: '+16 Speed\n+1 Armor Rating\n-15 Max Health',
    weapon: {
      type: 'shot', name: 'Hexbolt',
      damage: 16, interval: 0.52, speed: 18, life: 2.2, size: 0.3,
      color: 0x50e8d8, spread: 0.35, count: 1, homing: 4.5, pierce: 1
    },
    special: 'nova',
    hudStats: ['damage', 'magnet', 'crit']
  },
  {
    id: 'morrow',
    name: 'MORROW',
    icon: '†',
    desc: 'A harvester of scrap and souls. A whirling scythe grinds anything nearby; every wound feeds the frame. Special: FRENZY — briefly doubles the reap radius.',
    model: { body: 0x3a3a42, accent: 0xb03050, dark: 0x141418, prop: 'scythe' },
    stats: { maxHP: 105, speed: 17, armor: 3, block: 0, crit: 6, lifesteal: 12 },
    levelUp: { lifesteal: 1, maxHP: 2, damage: 1 },
    levelText: '+1% Lifesteal\n+2 Max Health\n+1 Damage',
    baseText: '+17 Speed\n+3 Armor Rating\n+5 Max Health',
    weapon: {
      type: 'aura', name: 'Reap Cycle',
      damage: 12, interval: 0.38, range: 3.0
    },
    special: 'frenzy',
    hudStats: ['lifesteal', 'armor', 'damage']
  },
  {
    id: 'strix',
    name: 'STRIX',
    icon: '➳',
    desc: 'A duelist frame tuned for precision. Rail lances punch through entire columns and crit hard. Special: BLINK — a short teleport through danger.',
    model: { body: 0xc8c8d0, accent: 0xf05060, dark: 0x404048, prop: 'lance' },
    stats: { maxHP: 80, speed: 18, armor: 1, block: 0, crit: 18, lifesteal: 0 },
    levelUp: { crit: 1, speed: 0.2, damage: 1 },
    levelText: '+1% Critical\n+0.2 Speed\n+1 Damage',
    baseText: '+18 Speed\n+1 Armor Rating\n-20 Max Health',
    weapon: {
      type: 'shot', name: 'Rail Lance',
      damage: 24, interval: 0.7, speed: 44, life: 1.1, size: 0.24,
      color: 0xff6070, spread: 0.0, count: 1, pierce: 99
    },
    special: 'blink',
    hudStats: ['crit', 'speed', 'damage']
  }
];

GH.statGlyphs = {
  block: '⛨', armor: '⚙', crit: '✗',
  atkSpd: '↻', damage: '⚔', magnet: '◎',
  lifesteal: '♥', speed: '↠'
};

GH.statLabel = {
  block: 'Block', armor: 'Armor', crit: 'Crit', atkSpd: 'Atk Spd',
  damage: 'Damage', magnet: 'Magnet', lifesteal: 'Lifesteal', speed: 'Speed'
};
