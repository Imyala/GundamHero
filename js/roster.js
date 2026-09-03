// STAALREUS — the full 135-frame roster.
// 8 base frames (mechs.js) + 120 lineage variants (8 lineages × 5 packs ×
// 3 marks) + 7 RELIC frames. Two starters are free, four base frames are
// earned by feats, everything else is BUILT in the Frame Workshop from
// ALLOY and FRAME CORES recovered in the field.
GH.roster = (function () {
  var R = {};

  R.STARTERS = ['aegis', 'vulcan'];

  // ---------------------------------------------------------------
  // Feat frames: earned by doing something, not by spending
  // ---------------------------------------------------------------
  R.FEATS = {
    fang: { stage: 'wreck', desc: 'Clear TIDE WRECKAGE in CLASSIC — bring down CORRUPTED FANG on wave 20 (or its lair in the Reach).' },
    hexen: { stage: 'glacier', desc: 'Clear GLACIER HOLLOW in CLASSIC — bring down CORRUPTED HEXEN on wave 20 (or its lair in the Reach).' },
    viper: { stage: 'cloister', desc: 'Clear VERDANT CLOISTER in CLASSIC — bring down CORRUPTED VIPER on wave 20 (or its lair in the Reach).' },
    morrow: { stage: 'ember', desc: 'Clear EMBER FURNACE in CLASSIC — bring down CORRUPTED MORROW on wave 20 (or its lair in the Reach).' }
  };

  // ---------------------------------------------------------------
  // Packs: what a variant is FOR. Each pack leans the stats one way,
  // recolours the accent, and bolts a silhouette onto the frame.
  // ---------------------------------------------------------------
  R.PACKS = [
    { id: 'aile', name: 'AILE', glyph: '▲', css: '#80d8ff', accent: 0x60c8ff,
      desc: 'Mobility pack: lighter plate, hotter servos. Faster, a little thinner.',
      stats: { speed: 1.12, maxHP: 0.95, armor: -1, crit: 2 }, weapon: { interval: 0.92 }, vector: 'bike' },
    { id: 'sword', name: 'SWORD', glyph: '⚔', css: '#ff9070', accent: 0xff6040,
      desc: 'Strike pack: overcharged actuators. Hits harder and reaches farther.',
      stats: { maxHP: 0.98, crit: 2 }, weapon: { damage: 1.10, range: 1.08, aoe: 1.06 } },
    { id: 'launcher', name: 'LAUNCHER', glyph: '◆', css: '#f0c060', accent: 0xf0a030,
      desc: 'Siege pack: layered plating and stabilisers. Tough and slow.',
      stats: { maxHP: 1.10, armor: 2, block: 1, speed: 0.88 }, weapon: { damage: 0.98 }, vector: 'tank' },
    { id: 'storm', name: 'STORM', glyph: '϶', css: '#c090ff', accent: 0xa060ff,
      desc: 'Element pack: a reactor tuned for arc and flame. Sharp crits, elemental bite.',
      stats: { crit: 4, maxHP: 0.95 }, weapon: { damage: 1.0 }, elemMult: 1.2 },
    { id: 'phantom', name: 'PHANTOM', glyph: '☾', css: '#9ae8c0', accent: 0x60e8a0,
      desc: 'Hunter pack: siphon coils and a quiet drive. Lifesteal, speed, precision.',
      stats: { lifesteal: 5, crit: 3, speed: 1.03, maxHP: 0.93 }, weapon: { interval: 0.98 } }
  ];

  R.MARKS = [
    { id: 'mk2', name: 'MK.II', roman: 'II', mult: 1.06, cost: { alloy: 60, cores: 0, salvage: 80 } },
    { id: 'custom', name: 'CUSTOM', roman: 'III', mult: 1.14, cost: { alloy: 150, cores: 2, salvage: 200 } },
    { id: 'proto', name: 'PROTOTYPE', roman: 'IV', mult: 1.24, cost: { alloy: 320, cores: 5, salvage: 450 } }
  ];

  // 8 lineages × 5 packs × 3 marks: one codename each, in that order
  var CODENAMES = [
    // AEGIS
    'KESTREL', 'GOSHAWK', 'PEREGRINE', 'CLAYMORE', 'ESPADON', 'DURENDAL', 'RAMPART', 'BASTILLE', 'CITADEL',
    'THUNDERHEAD', 'STORMWALL', 'TEMPEST', 'VESPER', 'NOCTURNE', 'GLOAMING',
    // VULCAN
    'SWIFT', 'MARTIN', 'HARRIER', 'BAYONET', 'HALBERD', 'PARTISAN', 'BULWARK', 'REDOUBT', 'BARBICAN',
    'FULMINE', 'SFERICS', 'CORONA', 'WRAITH', 'REVENANT', 'SPECTRE',
    // FANG
    'LYNX', 'OCELOT', 'CARACAL', 'SABRE', 'KUKRI', 'TALWAR', 'GARRISON', 'PALISADE', 'BULWARK-9',
    'STATIC', 'FLASHOVER', 'ARCLIGHT', 'STALKER', 'SHADE', 'UMBRA',
    // HEXEN
    'SPARROW', 'STARLING', 'WAXWING', 'ATHAME', 'GLAIVE', 'RUNEBLADE', 'REDOUBT-X', 'OBELISK', 'MONOLITH',
    'ZEPHYR', 'SIROCCO', 'MISTRAL', 'HALLOW', 'SEANCE', 'ELEGY',
    // VIPER
    'ADDER', 'KRAIT', 'MAMBA', 'STILETTO', 'RONDEL', 'MISERICORDE', 'CARAPACE', 'PAVISE', 'TESTUDO',
    'VOLTAIC', 'IONSTORM', 'PLASMID', 'GHOST', 'WISP', 'PHANTASM',
    // MORROW
    'ROOK', 'RAVEN', 'CORVID', 'REAPER-K', 'SICKLE', 'HARVESTER', 'MAUSOLEUM', 'OSSUARY', 'CATACOMB',
    'EMBER', 'PYRECLAST', 'CINDER', 'SHROUD', 'PALL', 'REQUIEM',
    // STRIX
    'MERLIN', 'SAKER', 'GYRFALCON', 'LANCEA', 'PILUM', 'SARISSA', 'AEGISLANCE', 'BARRIER', 'BREAKWATER',
    'FULGUR', 'LEVIN', 'BOLTSTRIKE', 'NIGHTJAR', 'HAWKMOTH', 'LUNA',
    // TITAN
    'CONDOR', 'ALBATROSS', 'ROC', 'MAUL', 'WARHAMMER', 'MACE', 'FORTRESS', 'KEEP', 'DONJON',
    'CALDERA', 'MAGMA', 'FURNACE', 'JUGGERNAUT', 'COLOSSUS', 'BEHEMOTH'
  ];

  // ---------------------------------------------------------------
  // Seven RELIC frames: unique end-game builds
  // ---------------------------------------------------------------
  var RELICS = [
    { id: 'relic_moonlight', name: 'MOONLIGHT', icon: '☽', base: 'aegis', vector: 'disc', prop: 'sword',
      role: 'Relic frame · sword saint', model: { body: 0xe8e8f0, accent: 0xc0e0ff, dark: 0x303848, trim: 0x8090b0 },
      stats: { maxHP: 150, speed: 19, armor: 6, block: 14, crit: 12, lifesteal: 3 },
      weapon: { damage: 1.3, interval: 0.85, range: 1.2, knockback: 1.4 },
      desc: 'A white relic that eats its pilot slowly and gives back everything. The finest blade in the hangar.',
      feat: { kind: 'stages', n: 6, desc: 'Clear all six CLASSIC stages.' } },
    { id: 'relic_ark', name: 'ARK HULL', icon: '⛫', base: 'titan', vector: 'tank', prop: 'mortar',
      role: 'Relic frame · walking fortress', model: { body: 0x3a3a48, accent: 0xff6020, dark: 0x181820, trim: 0x707080 },
      stats: { maxHP: 215, speed: 12, armor: 10, block: 7, crit: 4, lifesteal: 0 },
      weapon: { damage: 1.4, interval: 0.92, aoe: 1.25 },
      desc: 'A captured siege hull folded into a frame. Nothing walks slower; nothing walks through it.',
      feat: { kind: 'nests', n: 12, desc: 'Break 12 nests in the Shattered Reach.' } },
    { id: 'relic_corebreaker', name: 'COREBREAKER', icon: '⟁', base: 'fang', vector: 'bike', prop: 'claws', style: 'drill',
      role: 'Relic frame · hype engine', model: { body: 0xc02030, accent: 0xffd040, dark: 0x301010, trim: 0xe08030 },
      stats: { maxHP: 125, speed: 21, armor: 3, block: 0, crit: 16, lifesteal: 7 },
      weapon: { damage: 1.4, interval: 0.95, range: 1.1 },
      desc: 'Drills for hands and a stolen red mid-frame. Every boost is a battle cry.',
      feat: { kind: 'dungeonTier', n: 3, desc: 'Ascend any dungeon to tier 3.' } },
    { id: 'relic_seer', name: 'SEER', icon: '◎', base: 'hexen', vector: 'disc', prop: 'staff',
      role: 'Relic frame · remote weapons', model: { body: 0xf0d8f0, accent: 0xff70c0, dark: 0x402040, trim: 0xa070c0 },
      stats: { maxHP: 115, speed: 18, armor: 3, block: 0, crit: 12, lifesteal: 0 },
      weapon: { damage: 1.15, interval: 0.78, homing: 2, aoe: 1.15 }, elemMult: 1.25,
      desc: 'Hidden eyes and sweeping binders. Its shots think for themselves.',
      feat: { kind: 'pilot', n: 12, desc: 'Reach pilot level 12.' } },
    { id: 'relic_crimson', name: 'CRIMSON', icon: '☄', base: 'viper', vector: 'bike', prop: 'daggers',
      role: 'Relic frame · the rival', model: { body: 0xb01828, accent: 0xffe060, dark: 0x300810, trim: 0x702030 },
      stats: { maxHP: 118, speed: 21, armor: 3, block: 2, crit: 20, lifesteal: 3 },
      weapon: { damage: 1.2, interval: 0.9 },
      desc: 'Three times faster, they said. Painted red until you beat it — and then it is yours.',
      feat: { kind: 'harrow', n: 1, desc: 'Bring down THE HARROW.' } },
    { id: 'relic_keyhead', name: 'KEYHEAD', icon: '⌘', base: 'strix', vector: 'bike', prop: 'lance', style: 'drill',
      role: 'Relic frame · spike-dock trainer', model: { body: 0x50c050, accent: 0xffffff, dark: 0x183018, trim: 0x90e090 },
      stats: { maxHP: 105, speed: 23, armor: 2, block: 5, crit: 16, lifesteal: 0 },
      weapon: { damage: 1.25, interval: 0.85, range: 1.12 },
      desc: 'The smallest relic and the fastest thing on the ground. A drill-pod with a lance.',
      feat: { kind: 'race', n: 1, desc: 'Win the SUNSPIRE CIRCUIT or a TRACE DUEL.' } },
    { id: 'relic_revenant', name: 'REVENANT-13', icon: '♆', base: 'morrow', vector: 'disc', prop: 'scythe', style: 'eva',
      role: 'Relic frame · bio-organic', model: { body: 0x6040a0, accent: 0x60ff80, dark: 0x201040, trim: 0xa080e0 },
      stats: { maxHP: 135, speed: 18, armor: 4, block: 0, crit: 10, lifesteal: 14 },
      weapon: { damage: 1.4, interval: 0.88, range: 1.15 },
      desc: 'Grown, not built. Four arms, one hunger. Wounds feed it faster than any reactor could.',
      feat: { kind: 'mastery', n: 20, desc: 'Reach a total pilot mastery of 20 (any frames).' } }
  ];
  var RELIC_COST = { alloy: 500, cores: 12, salvage: 1000 };

  // ---------------------------------------------------------------
  // Generation
  // ---------------------------------------------------------------
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function scaleWeapon(w, pack, mult) {
    var out = clone(w);
    if (out.damage !== undefined) out.damage = Math.round(out.damage * mult * (pack.damage || 1) * 10) / 10;
    if (out.interval !== undefined && pack.interval) out.interval = Math.round(out.interval * pack.interval * 1000) / 1000;
    if (out.range !== undefined && pack.range) out.range = Math.round(out.range * pack.range * 100) / 100;
    if (out.aoe !== undefined && pack.aoe) out.aoe = Math.round(out.aoe * pack.aoe * 100) / 100;
    if (out.knockback !== undefined && pack.knockback) out.knockback = Math.round(out.knockback * pack.knockback * 10) / 10;
    if (pack.homing && out.homing !== undefined) out.homing += pack.homing;
    return out;
  }

  function fmtStats(s) {
    return '+' + s.speed + ' Speed\n+' + s.armor + ' Armor Rating\n' + s.maxHP + ' Max Health\n+' +
      s.block + '% Block\n+' + s.crit + '% Crit' + (s.lifesteal ? '\n+' + s.lifesteal + '% Lifesteal' : '');
  }

  function lighten(c, f) {
    var r = Math.min(255, Math.round(((c >> 16) & 255) * f)), g = Math.min(255, Math.round(((c >> 8) & 255) * f)),
      b = Math.min(255, Math.round((c & 255) * f));
    return (r << 16) | (g << 8) | b;
  }

  R.BASE = GH.mechs.slice();
  R.byBase = {};
  R.recipes = {};   // frame id -> { alloy, cores, salvage, requires: id|null, feat: {..}|null }
  R.variants = [];
  R.relics = [];

  var ci = 0;
  R.BASE.forEach(function (base) {
    R.byBase[base.id] = [];
    base.lineage = base.id;
    base.kind = R.STARTERS.indexOf(base.id) !== -1 ? 'starter' : (R.FEATS[base.id] ? 'feat' : 'craft');
    if (base.kind === 'craft') {
      R.recipes[base.id] = base.id === 'strix'
        ? { alloy: 200, cores: 3, salvage: 300, requires: null, feat: null }
        : { alloy: 260, cores: 4, salvage: 400, requires: null, feat: null };
    }
    R.PACKS.forEach(function (pack) {
      var prev = base.id;
      R.MARKS.forEach(function (mark, mi) {
        var code = CODENAMES[ci++] || (base.name + '-' + pack.id + mi);
        var m = mark.mult;
        var bs = base.stats;
        var ps = pack.stats;
        var stats = {
          maxHP: Math.round(bs.maxHP * m * (ps.maxHP || 1)),
          speed: Math.round(bs.speed * (ps.speed || 1) * (1 + (m - 1) * 0.3) * 10) / 10,
          armor: Math.max(0, Math.round(bs.armor * m + (ps.armor || 0))),
          block: Math.max(0, bs.block + (ps.block || 0) + mi),
          crit: bs.crit + (ps.crit || 0) + mi,
          lifesteal: bs.lifesteal + (ps.lifesteal || 0)
        };
        var def = {
          id: base.id + '_' + pack.id + '_' + mark.id,
          lineage: base.id, pack: pack.id, mark: mark.id, kind: 'craft',
          vector: pack.vector || base.vector,
          name: base.name + ' ' + code,
          role: base.role.split('·')[0].trim() + ' · ' + pack.name + ' PACK · ' + mark.name,
          icon: base.icon,
          desc: pack.desc + ' ' + mark.name + ' refit of the ' + base.name + ' line: ' +
            base.desc.split('.')[0] + '.',
          model: {
            body: base.model.body, accent: pack.accent,
            dark: base.model.dark, trim: lighten(base.model.trim, 1 + mi * 0.18),
            prop: base.model.prop, pack: pack.id, mark: mi + 1
          },
          stats: stats,
          levelUp: clone(base.levelUp),
          levelText: base.levelText,
          baseText: fmtStats(stats) + '\n' + pack.name + ' pack · ' + mark.name,
          weapon: scaleWeapon(base.weapon, pack.weapon || {}, m),
          special: base.special, specialText: base.specialText,
          passive: base.passive,
          hudStats: base.hudStats,
          elemMult: (base.id === 'hexen' ? 1.15 : 1) * (pack.elemMult || 1)
        };
        R.recipes[def.id] = { alloy: mark.cost.alloy, cores: mark.cost.cores, salvage: mark.cost.salvage, requires: prev, feat: null };
        prev = def.id;
        R.variants.push(def);
        R.byBase[base.id].push(def);
        GH.mechs.push(def);
      });
    });
  });

  RELICS.forEach(function (rl) {
    var base = GH.mechById(rl.base);
    var def = {
      id: rl.id, lineage: 'relic', relicBase: rl.base, kind: 'relic', vector: rl.vector,
      name: rl.name, role: rl.role, icon: rl.icon, desc: rl.desc,
      model: { body: rl.model.body, accent: rl.model.accent, dark: rl.model.dark, trim: rl.model.trim, prop: rl.prop, style: rl.style || null, pack: 'relic', mark: 4 },
      stats: rl.stats,
      levelUp: clone(base.levelUp), levelText: base.levelText,
      baseText: fmtStats(rl.stats) + '\nRELIC — ' + rl.feat.desc,
      weapon: scaleWeapon(base.weapon, rl.weapon, 1),
      special: base.special, specialText: base.specialText, passive: base.passive,
      hudStats: base.hudStats, elemMult: rl.elemMult || 1
    };
    R.recipes[def.id] = { alloy: RELIC_COST.alloy, cores: RELIC_COST.cores, salvage: RELIC_COST.salvage, requires: null, feat: rl.feat };
    R.relics.push(def);
    GH.mechs.push(def);
  });

  R.TOTAL = GH.mechs.length; // 135

  // ---------------------------------------------------------------
  // Feat checks (used for relic prerequisites and the help screen)
  // ---------------------------------------------------------------
  R.featProgress = function (feat) {
    var d = GH.meta.data, w = d.world;
    var have = 0;
    if (feat.kind === 'stages') have = Object.keys(d.victories || {}).length;
    else if (feat.kind === 'nests') have = Object.keys(w.nests || {}).length;
    else if (feat.kind === 'dungeonTier') { for (var k in (w.dgTier || {})) have = Math.max(have, w.dgTier[k]); }
    else if (feat.kind === 'pilot') have = GH.skills.pilotProgress().lvl;
    else if (feat.kind === 'harrow') have = d.feats && d.feats.harrow ? 1 : 0;
    else if (feat.kind === 'race') have = (w.duelWins || 0) + (w.raceBest ? 1 : 0) > 0 ? 1 : 0;
    else if (feat.kind === 'mastery') have = GH.progress.masteryTotal();
    return { have: Math.min(have, feat.n), need: feat.n, done: have >= feat.n };
  };

  // why a frame isn't yours yet, and whether it can be built right now
  R.status = function (id) {
    var d = GH.meta.data;
    if (d.shells[id]) return { owned: true, text: 'OWNED' };
    var def = GH.mechById(id);
    if (def.kind === 'feat') {
      var f = R.FEATS[id];
      return { owned: false, feat: true, text: 'FEAT: ' + f.desc };
    }
    var rc = R.recipes[id];
    if (!rc) return { owned: false, text: 'UNAVAILABLE' };
    var mats = d.mats || { alloy: 0, cores: 0 };
    var blockers = [];
    if (rc.requires && !d.shells[rc.requires]) blockers.push('needs ' + GH.mechById(rc.requires).name + ' first');
    if (rc.feat) {
      var fp = R.featProgress(rc.feat);
      if (!fp.done) blockers.push(rc.feat.desc + ' (' + fp.have + '/' + fp.need + ')');
    }
    var canPay = mats.alloy >= rc.alloy && mats.cores >= rc.cores && d.salvage >= rc.salvage;
    return {
      owned: false, recipe: rc, blockers: blockers, canPay: canPay,
      canBuild: !blockers.length && canPay,
      text: blockers.length ? 'LOCKED — ' + blockers.join('; ') : (canPay ? 'READY TO BUILD' : 'NEEDS MATERIALS')
    };
  };

  R.build = function (id) {
    var st = R.status(id);
    if (st.owned || !st.canBuild) return false;
    var d = GH.meta.data;
    d.mats.alloy -= st.recipe.alloy;
    d.mats.cores -= st.recipe.cores;
    d.salvage -= st.recipe.salvage;
    d.shells[id] = true;
    d.collection.built = (d.collection.built || 0) + 1;
    GH.meta.save();
    return true;
  };

  R.owned = function () {
    var n = 0;
    GH.mechs.forEach(function (m) { if (GH.meta.data.shells[m.id]) n++; });
    return n;
  };

  R.packById = function (id) {
    for (var i = 0; i < R.PACKS.length; i++) if (R.PACKS[i].id === id) return R.PACKS[i];
    return null;
  };
  R.markById = function (id) {
    for (var i = 0; i < R.MARKS.length; i++) if (R.MARKS[i].id === id) return R.MARKS[i];
    return null;
  };

  // where materials come from — shown in the workshop and the help screen
  R.SOURCES = [
    'ALLOY drops from any hostile (about one kill in eight), always from elites, and in piles from bosses, nests, dungeon caches and cleared stages.',
    'FRAME CORES come from bosses: wave-20 corrupted frames, wardens, THE HARROW, dungeon reward caches, and every CLASSIC stage clear.',
    'SALVAGE is the coin you already bank at the end of every run and at the survivor camp.',
    'Each pack climbs MK.II → CUSTOM → PROTOTYPE: build the earlier mark first. RELIC frames need a feat plus a heavy bill of cores.'
  ];

  return R;
})();
