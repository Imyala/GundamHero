// HERO FRAME — wave reward pool: weapons, traits, protocols, gems.
// kind: 'weapon' (adds/levels a secondary), 'trait' (stat buff),
// 'protocol' (passive ability), 'gem' (socket into a chosen weapon).
GH.upgrades = [
  // ======== SECONDARY WEAPONS ========
  {
    id: 'flakfan', kind: 'weapon', name: 'Flak Fan', glyph: '⋔', w: 9, rarity: 'common',
    cls: 'LIGHT · PHYSICAL',
    desc: 'Sprays a fan of shells toward your aim. Levels add shells.',
    weapon: { type: 'shot', damage: 6, interval: 0.8, speed: 22, life: 0.7, size: 0.2, color: 0xf0d040, spread: 0.6, count: 3 },
    perLevel: function (w) { w.count += 2; w.damage += 2; }
  },
  {
    id: 'missiles', kind: 'weapon', name: 'Missile Rack', glyph: '⌁', w: 8, rarity: 'common',
    cls: 'HEAVY · PHYSICAL',
    desc: 'Seeking missiles burst into crystal shrapnel. Levels add missiles.',
    weapon: { type: 'shot', damage: 18, interval: 1.6, speed: 14, life: 3.0, size: 0.24, color: 0xff8040, spread: 3.0, count: 2, homing: 6, aoe: 2.0 },
    perLevel: function (w) { w.count += 1; w.damage += 6; }
  },
  {
    id: 'blades', kind: 'weapon', name: 'Orbit Blades', glyph: '❋', w: 8, rarity: 'common',
    cls: 'LIGHT · PHYSICAL',
    desc: 'Blades circle your frame and shred whatever they touch. Levels add blades.',
    weapon: { type: 'orbit', damage: 10, interval: 0.25, count: 2, radius: 2.4, spin: 3.2 },
    perLevel: function (w) { w.count += 1; w.damage += 4; }
  },
  {
    id: 'tesla', kind: 'weapon', name: 'Arc Coil', glyph: '϶', w: 7, rarity: 'rare',
    cls: 'LIGHT · ELEMENTAL',
    desc: 'Chain lightning stuns what it touches. Levels add jumps.',
    weapon: { type: 'zap', damage: 14, interval: 1.1, range: 9, targets: 2, element: 'shock' },
    perLevel: function (w) { w.targets += 1; w.damage += 5; }
  },
  {
    id: 'mines', kind: 'weapon', name: 'Mine Layer', glyph: '☒', w: 6, rarity: 'common',
    cls: 'HEAVY · PHYSICAL',
    desc: 'Drops proximity mines behind you. Levels grow the blast.',
    weapon: { type: 'mine', damage: 30, interval: 1.8, aoe: 2.6, life: 12 },
    perLevel: function (w) { w.damage += 14; w.aoe += 0.4; }
  },
  {
    id: 'drone', kind: 'weapon', name: 'Gun Drone', glyph: '⬡', w: 6, rarity: 'rare',
    cls: 'LIGHT · PHYSICAL',
    desc: 'A drone circles overhead and snipes the nearest enemy. Levels speed it up.',
    weapon: { type: 'drone', damage: 12, interval: 0.55, speed: 30, size: 0.18, color: 0x60e0ff, life: 1.2 },
    perLevel: function (w) { w.damage += 5; w.interval = Math.max(0.2, w.interval - 0.08); }
  },
  {
    id: 'flamer', kind: 'weapon', name: 'Flame Projector', glyph: '♨', w: 7, rarity: 'common',
    cls: 'LIGHT · ELEMENTAL',
    desc: 'A cone of continuous fire. Low damage, but everything burns.',
    weapon: { type: 'cone', damage: 4, interval: 0.22, range: 5.0, arc: 0.8, element: 'burn' },
    perLevel: function (w) { w.damage += 2; w.range += 0.8; }
  },
  {
    id: 'mortarpod', kind: 'weapon', name: 'Mortar Pod', glyph: '☄', w: 6, rarity: 'rare',
    cls: 'HEAVY · PHYSICAL',
    desc: 'Slow shells arc over the swarm and detonate wide. Levels add shells.',
    weapon: { type: 'mortar', damage: 26, interval: 2.2, aoe: 2.6, arcTime: 0.9, color: 0xffa040, count: 1 },
    perLevel: function (w) { w.count = (w.count || 1) + 1; w.damage += 8; }
  },
  {
    id: 'frostcaster', kind: 'weapon', name: 'Frost Repeater', glyph: '❆', w: 6, rarity: 'rare',
    cls: 'HEAVY · ELEMENTAL',
    desc: 'Lobs rime bolts that chill and slow the horde.',
    weapon: { type: 'shot', damage: 12, interval: 0.9, speed: 16, life: 1.6, size: 0.26, color: 0xa0e8ff, spread: 0.5, count: 2, element: 'frost', aoe: 1.4 },
    perLevel: function (w) { w.count += 1; w.damage += 4; }
  },

  // ======== TRAITS ========
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
    desc: '+15% XP from sparks.', apply: function (p) { p.stats.xpGain += 0.15; } },
  { id: 't_proj', kind: 'trait', name: 'Split Chamber', glyph: '⋈', w: 5, rarity: 'epic',
    desc: '+1 projectile on your primary weapon.', apply: function (p) { p.stats.bonusProj += 1; } },
  { id: 't_steal', kind: 'trait', name: 'Siphon Edge', glyph: '☨', w: 5, rarity: 'rare',
    desc: '+5% lifesteal on all damage.', apply: function (p) { p.stats.lifesteal += 5; } },
  { id: 't_block', kind: 'trait', name: 'Gyro Stabilizers', glyph: '⛨', w: 6, rarity: 'common',
    desc: '+6% block chance.', apply: function (p) { p.stats.block += 6; } },
  { id: 't_elem', kind: 'trait', name: 'Element Feed', glyph: '♨', w: 6, rarity: 'rare',
    desc: '+25% elemental damage (burn, shock, frost).', apply: function (p) { p.stats.elemMult += 0.25; } },

  // ======== PROTOCOLS (passive abilities) ========
  { id: 'p_boost', kind: 'protocol', name: 'Afterburner Cell', glyph: '➤', w: 6, rarity: 'rare',
    desc: 'PROTOCOL: boost costs 25% less and recharges 30% faster.',
    apply: function (p) { p.stats.boostRegen *= 1.3; p.stats.boostCost *= 0.75; } },
  { id: 'p_reclaim', kind: 'protocol', name: 'Reclaimer', glyph: '♻', w: 6, rarity: 'rare',
    desc: 'PROTOCOL: kills have a 15% chance to mend 3 HP.',
    apply: function (p) { p.protocols.reclaim = (p.protocols.reclaim || 0) + 0.15; } },
  { id: 'p_reactor', kind: 'protocol', name: 'Spark Reactor', glyph: '⚡', w: 5, rarity: 'epic',
    desc: 'PROTOCOL: collecting a spark may fire a bolt at the nearest enemy.',
    apply: function (p) { p.protocols.reactor = (p.protocols.reactor || 0) + 0.12; } },
  { id: 'p_thorns', kind: 'protocol', name: 'Thorn Plating', glyph: '✴', w: 6, rarity: 'rare',
    desc: 'PROTOCOL: attackers take force damage equal to twice your armor.',
    apply: function (p) { p.protocols.thorns = true; } },
  { id: 'p_vents', kind: 'protocol', name: 'Emergency Vents', glyph: '☁', w: 6, rarity: 'rare',
    desc: 'PROTOCOL: below 35% hull, +20% move speed and +10% block.',
    apply: function (p) { p.protocols.vents = true; } }
];

// gem cards are generated (5 affinities), weighted lower than weapons/traits
GH.gemCard = function (typeId) {
  var t = GH.gems.types[typeId];
  return {
    id: 'gem_' + typeId, kind: 'gem', gemType: typeId,
    name: t.name + ' Gem', glyph: t.glyph, rarity: 'gem',
    desc: t.desc + '\nSocket: ' + t.bonusText + '.\n4 matched sockets grant a Resonance.'
  };
};

// Roll distinct cards (3, or 4 for mastered frames); from wave 3 onward one
// slot may be a gem.
GH.rollRewards = function (player, wave, count) {
  count = count || 3;
  var pool = GH.upgrades.slice();
  var picks = [];
  var gemChance = wave >= 3 ? 0.55 : 0;
  if (Math.random() < gemChance) {
    picks.push(GH.gemCard(GH.pick(GH.gems.typeIds)));
  }
  while (picks.length < count && pool.length) {
    var card = GH.weightedPick(pool);
    pool.splice(pool.indexOf(card), 1);
    // don't offer a 6th weapon slot
    if (card.kind === 'weapon' && player && player.weapons.length >= 5 &&
      !player.weaponLevels[card.id]) continue;
    picks.push(card);
  }
  return picks;
};
