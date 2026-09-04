// STAALREUS — pilot attributes and Combat Art runes.
//
// The character layer under every frame, in the tradition of the old
// German action-RPGs: six ATTRIBUTES that grow on their own each pilot
// level (a tenth of the lineage's starting spread) plus ONE FREE POINT per
// level to steer, so a lineage keeps its identity and a point is never a
// trap. COMBAT ARTS are learned deeper by reading RUNES: every rank makes
// the art hit harder but lengthens its recharge, and only REACTOR shortens
// it again. Cooldown is the cost; the attribute is the pressure valve.
GH.attrs = (function () {
  var A = {};

  A.LIST = [
    { id: 'might', name: 'MIGHT', glyph: '⚔', css: '#ff9a6a',
      desc: 'Weapon damage +1% per point. +0.4 max hull per point.' },
    { id: 'reactor', name: 'REACTOR', glyph: '✦', css: '#c9a6ff',
      desc: 'Combat Art damage +1.2% per point. Art recharge 0.5% faster per point.' },
    { id: 'hull', name: 'HULL', glyph: '⛨', css: '#e8d8a8',
      desc: '+2 max hull per point. +0.15 armor per point.' },
    { id: 'servo', name: 'SERVO', glyph: '↯', css: '#8fd8ff',
      desc: 'Attack speed +0.5%, block +0.25% and crit +0.2% per point.' },
    { id: 'coolant', name: 'COOLANT', glyph: '❄', css: '#9ae8c0',
      desc: 'Hull regen +0.04/s per point. Boost regen +0.6% per point.' },
    { id: 'uplink', name: 'UPLINK', glyph: '◎', css: '#ffd870',
      desc: 'Spark magnet +1% and XP +0.5% per point. Loot find 10 × √points %.' }
  ];
  A.IDS = A.LIST.map(function (a) { return a.id; });
  A.byId = function (id) {
    for (var i = 0; i < A.LIST.length; i++) if (A.LIST[i].id === id) return A.LIST[i];
    return null;
  };

  // starting spreads per lineage (sum 30): the dominant term of a build
  A.SPREADS = {
    aegis:  { might: 5, reactor: 3, hull: 8, servo: 4, coolant: 5, uplink: 5 },
    vulcan: { might: 7, reactor: 3, hull: 5, servo: 7, coolant: 4, uplink: 4 },
    fang:   { might: 6, reactor: 2, hull: 3, servo: 9, coolant: 5, uplink: 5 },
    hexen:  { might: 2, reactor: 10, hull: 4, servo: 4, coolant: 6, uplink: 4 },
    viper:  { might: 6, reactor: 3, hull: 3, servo: 8, coolant: 4, uplink: 6 },
    morrow: { might: 7, reactor: 6, hull: 5, servo: 3, coolant: 5, uplink: 4 },
    strix:  { might: 7, reactor: 5, hull: 3, servo: 7, coolant: 4, uplink: 4 },
    titan:  { might: 8, reactor: 4, hull: 9, servo: 1, coolant: 5, uplink: 3 }
  };
  A.GROWTH = 0.10; // of the starting spread, per pilot level

  A.spreadFor = function (def) {
    if (!def) return A.SPREADS.aegis;
    var key = def.kind === 'relic' ? def.relicBase : (def.lineage || def.id);
    return A.SPREADS[key] || A.SPREADS.aegis;
  };

  function data() { return GH.meta.data; }
  A.spent = function (id) { return (data().attr && data().attr[id]) || 0; };
  A.spentTotal = function () {
    var n = 0;
    A.IDS.forEach(function (id) { n += A.spent(id); });
    return n;
  };
  A.free = function () { return data().attrPts || 0; };

  // auto-grown value for a lineage at the current pilot level
  A.auto = function (id, def) {
    var lvl = GH.skills.pilotProgress().lvl;
    return A.spreadFor(def)[id] * (1 + A.GROWTH * lvl);
  };
  A.total = function (id, def) { return A.auto(id, def) + A.spent(id); };

  A.spend = function (id) {
    if (A.free() < 1 || !A.byId(id)) return false;
    if (!data().attr) data().attr = {};
    data().attr[id] = A.spent(id) + 1;
    data().attrPts = A.free() - 1;
    GH.meta.save();
    return true;
  };

  A.RESET_COST = 150;
  A.reset = function () {
    var spent = A.spentTotal();
    if (spent === 0 || data().salvage < A.RESET_COST) return false;
    data().salvage -= A.RESET_COST;
    data().attr = {};
    data().attrPts = A.free() + spent;
    GH.meta.save();
    return true;
  };

  // the stat block a frame spawns with (consumed by makePlayer)
  A.bonus = function (def) {
    var t = function (id) { return A.total(id, def); };
    var might = t('might'), reactor = t('reactor'), hull = t('hull'),
      servo = t('servo'), coolant = t('coolant'), uplink = t('uplink');
    return {
      damageMult: might * 0.01,
      maxHP: might * 0.4 + hull * 2,
      armor: hull * 0.15,
      atkSpdMult: servo * 0.005,
      block: servo * 0.25,
      crit: servo * 0.2,
      regen: coolant * 0.04,
      boostRegen: coolant * 0.006,
      magnet: uplink * 0.01,
      xpGain: uplink * 0.005,
      lootFind: 10 * Math.sqrt(Math.max(0, uplink)),
      artMult: 1 + reactor * 0.012,
      artCd: 1 / (1 + reactor * 0.005)
    };
  };

  // ---------------------------------------------------------------
  // COMBAT ART RUNES
  // ---------------------------------------------------------------
  A.ART_SLOTS = [1, 2, 3, 4, 'sig'];
  A.MAX_RANK = 10;
  A.POWER_PER_RANK = 0.12;   // damage
  A.CD_PER_RANK = 1.08;      // recharge, compounding — the rune's price

  A.artRank = function (slot) {
    var arts = data().arts || {};
    return arts[slot === 5 ? 'sig' : slot] || 0;
  };
  A.runeStock = function () { return data().runeStock || 0; };
  A.addRunes = function (n) {
    data().runeStock = A.runeStock() + n;
    GH.meta.save();
  };
  A.readRune = function (slot) {
    var key = slot === 5 ? 'sig' : slot;
    if (A.runeStock() < 1 || A.artRank(key) >= A.MAX_RANK) return false;
    if (!data().arts) data().arts = {};
    data().arts[key] = A.artRank(key) + 1;
    data().runeStock = A.runeStock() - 1;
    GH.meta.save();
    return true;
  };
  // damage and recharge multipliers for an art at its current rank
  A.artPower = function (slot) { return 1 + A.artRank(slot) * A.POWER_PER_RANK; };
  A.artRecharge = function (slot) { return Math.pow(A.CD_PER_RANK, A.artRank(slot)); };
  A.artLabel = function (slot, def) {
    if (slot === 5 || slot === 'sig') return GH.skills.signatureFor(def || GH.mechs[0]);
    return GH.skills.ABILITIES[slot];
  };

  // a rune on the ground: a violet tablet ringed in brass
  A.buildRuneMesh = function () {
    var g = new THREE.Group();
    var tab = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.1),
      new THREE.MeshLambertMaterial({ color: 0x6a4ab0, emissive: 0x30186a, emissiveIntensity: 0.9 }));
    tab.rotation.y = 0.5;
    g.add(tab);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 4, 10),
      new THREE.MeshLambertMaterial({ color: 0xe2b25c, emissive: 0x604010 }));
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    return g;
  };

  // ---------------------------------------------------------------
  // Save migration: profiles that predate attributes convert their old
  // salvage-bought stat lines into spent points and receive the free
  // points every pilot level would have paid.
  // ---------------------------------------------------------------
  A.migrate = function () {
    var d = data();
    if (d.attrMigrated) return;
    if (!d.attr) d.attr = {};
    var old = d.devotion || {};
    var map = { sol: 'hull', pyre: 'might', keen: 'servo', verd: 'uplink', ruin: 'reactor' };
    for (var k in map) if (old[k]) d.attr[map[k]] = (d.attr[map[k]] || 0) + old[k] * 2;
    var lvl = GH.skills ? GH.skills.pilotProgress().lvl : 0;
    d.attrPts = lvl + (d.attrPts || 0);
    if (!d.arts) d.arts = {};
    if (d.runeStock === undefined) d.runeStock = 0;
    d.attrMigrated = true;
    GH.meta.save();
  };

  return A;
})();
