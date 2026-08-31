// HERO FRAME — wave reward card pool
// kind: 'weapon' adds/levels a secondary weapon; 'trait' buffs stats.
GH.upgrades = [
  // ---- secondary weapons ----
  {
    id: 'flakfan', kind: 'weapon', name: 'Flak Fan', glyph: '⋔', w: 10, rarity: 'common',
    desc: 'Sprays a fan of shells toward your aim. Levels add shells.',
    weapon: { type: 'shot', damage: 6, interval: 0.8, speed: 22, life: 0.7, size: 0.2, color: 0xf0d040, spread: 0.6, count: 3 },
    perLevel: function (w) { w.count += 2; w.damage += 2; }
  },
  {
    id: 'missiles', kind: 'weapon', name: 'Missile Rack', glyph: '⌁', w: 8, rarity: 'common',
    desc: 'Launches seeking missiles at random targets. Levels add missiles and damage.',
    weapon: { type: 'shot', damage: 18, interval: 1.6, speed: 14, life: 3.0, size: 0.24, color: 0xff8040, spread: 3.0, count: 2, homing: 6, aoe: 2.0 },
    perLevel: function (w) { w.count += 1; w.damage += 6; }
  },
  {
    id: 'blades', kind: 'weapon', name: 'Orbit Blades', glyph: '❋', w: 8, rarity: 'common',
    desc: 'Blades circle your frame and shred whatever they touch. Levels add blades.',
    weapon: { type: 'orbit', damage: 10, interval: 0.25, count: 2, radius: 2.4, spin: 3.2 },
    perLevel: function (w) { w.count += 1; w.damage += 4; }
  },
  {
    id: 'tesla', kind: 'weapon', name: 'Arc Coil', glyph: '϶', w: 7, rarity: 'rare',
    desc: 'Zaps the nearest enemies with chain lightning. Levels add targets.',
    weapon: { type: 'zap', damage: 14, interval: 1.1, range: 9, targets: 2 },
    perLevel: function (w) { w.targets += 1; w.damage += 5; }
  },
  {
    id: 'mines', kind: 'weapon', name: 'Mine Layer', glyph: '☒', w: 6, rarity: 'common',
    desc: 'Drops proximity mines behind you. Levels add damage and blast size.',
    weapon: { type: 'mine', damage: 30, interval: 1.8, aoe: 2.6, life: 12 },
    perLevel: function (w) { w.damage += 14; w.aoe += 0.4; }
  },
  {
    id: 'drone', kind: 'weapon', name: 'Gun Drone', glyph: '⬡', w: 6, rarity: 'rare',
    desc: 'A drone circles overhead and snipes the nearest enemy. Levels speed it up.',
    weapon: { type: 'drone', damage: 12, interval: 0.55, speed: 30, size: 0.18, color: 0x60e0ff, life: 1.2 },
    perLevel: function (w) { w.damage += 5; w.interval = Math.max(0.2, w.interval - 0.08); }
  },

  // ---- traits ----
  { id: 't_dmg', kind: 'trait', name: 'Overcharged Servos', glyph: '⚔', w: 10, rarity: 'common',
    desc: '+15% damage to all weapons.', apply: function (p) { p.stats.damageMult += 0.15; } },
  { id: 't_asp', kind: 'trait', name: 'Rapid Loaders', glyph: '↻', w: 10, rarity: 'common',
    desc: '+12% attack speed.', apply: function (p) { p.stats.atkSpdMult += 0.12; } },
  { id: 't_hp', kind: 'trait', name: 'Reinforced Hull', glyph: '⛊', w: 10, rarity: 'common',
    desc: '+25 max health, and heal 25.', apply: function (p) { p.stats.maxHP += 25; p.heal(25); } },
  { id: 't_arm', kind: 'trait', name: 'Ablative Plating', glyph: '⚙', w: 9, rarity: 'common',
    desc: '+2 armor rating.', apply: function (p) { p.stats.armor += 2; } },
  { id: 't_spd', kind: 'trait', name: 'Thruster Tune', glyph: '↠', w: 8, rarity: 'common',
    desc: '+10% move speed.', apply: function (p) { p.stats.speed *= 1.10; } },
  { id: 't_crit', kind: 'trait', name: 'Target Computer', glyph: '✗', w: 8, rarity: 'common',
    desc: '+7% critical chance.', apply: function (p) { p.stats.crit += 7; } },
  { id: 't_regen', kind: 'trait', name: 'Nanite Weld', glyph: '♥', w: 7, rarity: 'rare',
    desc: 'Regenerate 1.5 HP per second.', apply: function (p) { p.stats.regen += 1.5; } },
  { id: 't_mag', kind: 'trait', name: 'Salvage Magnet', glyph: '◎', w: 7, rarity: 'common',
    desc: '+40% pickup magnet range.', apply: function (p) { p.stats.magnet *= 1.4; } },
  { id: 't_xp', kind: 'trait', name: 'Core Sampler', glyph: '✦', w: 7, rarity: 'common',
    desc: '+15% XP from gems.', apply: function (p) { p.stats.xpGain += 0.15; } },
  { id: 't_proj', kind: 'trait', name: 'Split Chamber', glyph: '⋈', w: 5, rarity: 'epic',
    desc: '+1 projectile on your primary weapon (shot weapons).', apply: function (p) { p.stats.bonusProj += 1; } },
  { id: 't_steal', kind: 'trait', name: 'Siphon Edge', glyph: '☨', w: 5, rarity: 'rare',
    desc: '+5% lifesteal on all damage.', apply: function (p) { p.stats.lifesteal += 5; } },
  { id: 't_boost', kind: 'trait', name: 'Afterburner', glyph: '➤', w: 6, rarity: 'common',
    desc: 'Boost recharges 30% faster.', apply: function (p) { p.stats.boostRegen *= 1.3; } }
];

// pick 3 distinct cards; weapons already at max sensible level are still fine (they level up)
GH.rollRewards = function (player) {
  var pool = GH.upgrades.slice();
  var picks = [];
  while (picks.length < 3 && pool.length) {
    var card = GH.weightedPick(pool);
    pool.splice(pool.indexOf(card), 1);
    picks.push(card);
  }
  return picks;
};
