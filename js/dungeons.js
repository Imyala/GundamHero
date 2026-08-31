// HERO FRAME — dungeon archetype data & generators
// Every territory carries THREE dungeon gates, each leading to a
// different kind of run (inspired by the classic dungeon-crawler and
// bullet-hell traditions — shifting floors included). Clearing tier 1
// opens a red DEEPER gate to tier 2: smaller, hotter, richer.
//
//   depths      — the classic crawl: packs, the vault, the lair boss
//   hive        — EXTERMINATE: wipe every hostile in the map
//   bastion     — DEFENSE: an ancient objective survives four waves
//   labyrinth   — a true walled maze; find the heart chamber
//   gauntlet    — a timed checkpoint rush (skimmer form shines)
//   fluxways    — the floor itself shifts: ride the safe lanes across
GH.dungeons = (function () {
  var D = {};

  // which three extra archetypes each territory offers (gate 0 is always
  // depths) — all eleven types are represented somewhere in the world
  D.ZONE_SETS = {
    wreck: ['hive', 'gauntlet', 'raceway'],
    glacier: ['labyrinth', 'bastion', 'halls'],
    cloister: ['bastion', 'convoy', 'hive'],
    ember: ['fluxways', 'crucible', 'gauntlet'],
    storm: ['raceway', 'fluxways', 'convoy'],
    null: ['halls', 'crucible', 'heist']
  };

  D.ARCHETYPES = {
    depths: { name: 'DEPTHS', desc: 'the crawl: packs, the vault, the lair', size: 220 },
    hive: { name: 'HIVE', desc: 'EXTERMINATE — leave nothing alive', size: 220 },
    bastion: { name: 'BASTION', desc: 'DEFEND the relic through four waves', size: 200 },
    labyrinth: { name: 'LABYRINTH', desc: 'find the heart of the maze', size: 230 },
    gauntlet: { name: 'GAUNTLET', desc: 'a timed rush — ride the checkpoints', size: 260 },
    fluxways: { name: 'FLUXWAYS', desc: 'the floor shifts — cross on the safe lanes', size: 200 },
    raceway: { name: 'RACEWAY', desc: 'a combat race — three laps, live fire', size: 300 },
    halls: { name: 'CIPHER HALLS', desc: 'plates, cores, barriers — think your way through', size: 200 },
    convoy: { name: 'CONVOY', desc: 'ESCORT the hauler through the ambush line', size: 260 },
    crucible: { name: 'CRUCIBLE', desc: 'a boss rush — corrupt frames back to back', size: 180 },
    heist: { name: 'HEIST', desc: 'seize the relic, then outrun the alarm', size: 240 }
  };

  // ---------------------------------------------------------------
  // TIER MODIFIERS — every ascension past tier 1 stacks another one,
  // seeded per dungeon per tier so a given climb is always the same.
  // ---------------------------------------------------------------
  D.MODIFIERS = [
    { id: 'frenzied', name: 'FRENZIED', desc: 'hostiles attack faster' },
    { id: 'armored', name: 'ARMORED', desc: 'hostiles carry +40% hull' },
    { id: 'volatile', name: 'VOLATILE', desc: 'hostiles detonate on death' },
    { id: 'swift', name: 'SWIFT', desc: 'hostiles move +25% faster' },
    { id: 'regen', name: 'REGENERATING', desc: 'hostiles knit themselves back together' },
    { id: 'thorns', name: 'THORNED', desc: 'melee hits sting you back' },
    { id: 'dampened', name: 'DAMPENED', desc: 'your energy regenerates slower here' },
    { id: 'gilded', name: 'GILDED', desc: 'hostiles shed bonus salvage' }
  ];

  // tier N carries min(N-1, 4) modifiers, deterministically
  D.modsFor = function (baseId, tier) {
    var n = Math.min(Math.max(0, tier - 1), 4);
    if (n === 0) return [];
    var rnd = rng('mods:' + baseId + ':' + tier);
    var pool = D.MODIFIERS.slice();
    var out = [];
    while (out.length < n && pool.length) {
      out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    }
    return out;
  };

  // base id (no tier) — the ascension ladder is keyed on this
  D.baseId = function (zone, arch) { return 'dg_' + zone + '_' + arch; };

  // what the BASTION relic is, per territory (all original fiction)
  D.OBJECTIVES = {
    wreck: { name: 'DORMANT TITANFRAME', kind: 'mech' },
    glacier: { name: 'THE HEARTCRYSTAL', kind: 'crystal' },
    cloister: { name: 'THE SEED ORB', kind: 'orb' },
    ember: { name: 'THE ANCIENT FORGE', kind: 'forge' },
    storm: { name: 'THE SPIRE CAPACITOR', kind: 'capacitor' },
    null: { name: 'THE VOID ARCHIVE', kind: 'archive' }
  };

  // tier scaling: unbounded — every ascension compounds the garrison
  D.tierMult = function (tier) {
    var t = Math.max(1, tier || 1);
    return {
      hp: Math.pow(1.55, t - 1),
      dmg: Math.pow(1.25, t - 1),
      loot: t
    };
  };

  // dungeon zone ids: dg_<zone>_<archetype>_t<tier>
  D.makeId = function (zone, arch, tier) { return 'dg_' + zone + '_' + arch + '_t' + (tier || 1); };

  D.parseId = function (id) {
    var m = /^dg_([a-z]+)_([a-z]+)_t(\d+)$/.exec(id);
    if (!m) return null;
    return { zone: m[1], arch: m[2], tier: Math.max(1, parseInt(m[3], 10)) };
  };

  // seeded rng (self-contained so generators stay pure)
  function rng(seedStr) {
    var s = 0;
    for (var i = 0; i < seedStr.length; i++) s = (Math.imul(s, 31) + seedStr.charCodeAt(i)) >>> 0;
    s = s || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }
  D.rng = rng;

  // ---------------------------------------------------------------
  // LABYRINTH generator: odd-sized grid maze via recursive backtracker.
  // Returns { n, cell, grid } — grid[r][c] true = wall. The entry
  // corridor (bottom middle) and heart (center) are always open.
  // ---------------------------------------------------------------
  D.genMaze = function (seed, n, cell) {
    n = n || 21; // odd
    var rnd = rng('maze:' + seed);
    var grid = [];
    for (var r = 0; r < n; r++) {
      grid.push([]);
      for (var c = 0; c < n; c++) grid[r].push(true);
    }
    // carve from the center on odd cells
    var stack = [[1, 1]];
    grid[1][1] = false;
    var dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]];
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var options = [];
      for (var d = 0; d < 4; d++) {
        var nr = cur[0] + dirs[d][0], nc = cur[1] + dirs[d][1];
        if (nr > 0 && nr < n - 1 && nc > 0 && nc < n - 1 && grid[nr][nc]) options.push(d);
      }
      if (!options.length) { stack.pop(); continue; }
      var pick = options[Math.floor(rnd() * options.length)];
      var mr = cur[0] + dirs[pick][0] / 2, mc = cur[1] + dirs[pick][1] / 2;
      var tr = cur[0] + dirs[pick][0], tc = cur[1] + dirs[pick][1];
      grid[mr][mc] = false;
      grid[tr][tc] = false;
      stack.push([tr, tc]);
    }
    // gate mouth: open the bottom middle into the maze
    var mid = Math.floor(n / 2);
    grid[n - 1][mid] = false;
    grid[n - 2][mid] = false;
    // heart chamber: a 3x3 clearing at the center
    for (var hr = mid - 1; hr <= mid + 1; hr++) {
      for (var hc = mid - 1; hc <= mid + 1; hc++) grid[hr][hc] = false;
    }
    // a few extra breaches so it loops instead of being one true path
    for (var b = 0; b < Math.floor(n * 0.6); b++) {
      var rr2 = 1 + Math.floor(rnd() * (n - 2));
      var cc2 = 1 + Math.floor(rnd() * (n - 2));
      if ((rr2 % 2 === 1 || cc2 % 2 === 1)) grid[rr2][cc2] = false;
    }
    return { n: n, cell: cell || 10, grid: grid };
  };

  // world position → maze cell lookup (true = blocked)
  D.mazeBlocked = function (maze, size, x, z) {
    var half = size / 2;
    var c = Math.floor((x + half) / maze.cell);
    var r = Math.floor((z + half) / maze.cell);
    if (r < 0 || c < 0 || r >= maze.n || c >= maze.n) return false;
    return maze.grid[r][c];
  };

  // cell center in world coords
  D.mazeCellPos = function (maze, size, r, c) {
    var half = size / 2;
    return { x: (c + 0.5) * maze.cell - half, z: (r + 0.5) * maze.cell - half };
  };

  // ---------------------------------------------------------------
  // GAUNTLET: a winding chain of checkpoints from the entry to the
  // far chamber. Touch them in order; each adds seconds to the clock.
  // ---------------------------------------------------------------
  D.genGauntlet = function (seed, size) {
    var rnd = rng('rush:' + seed);
    var half = size / 2;
    var pts = [];
    var n = 6;
    for (var i = 0; i < n; i++) {
      var t = (i + 1) / (n + 1);
      pts.push({
        idx: i,
        x: (rnd() - 0.5) * (size * 0.72) * (i === n - 1 ? 0.3 : 1),
        z: (half - 26) - t * (size - 56)
      });
    }
    return pts; // last point is the finish chamber
  };

  // ---------------------------------------------------------------
  // FLUXWAYS: a band of shifting tiles. Pattern: diagonal safe lanes
  // that sweep sideways over time; everything else scorches.
  // safeAt(cfg, time, x, z) is the single source of truth.
  // ---------------------------------------------------------------
  D.genFlux = function (size) {
    return {
      tile: 10,
      cols: Math.floor((size - 40) / 10),
      rows: Math.floor((size * 0.6) / 10),
      zTop: -size / 2 + 30,           // band start (far side is the prize)
      period: 2.2,                     // lane sweep speed
      laneEvery: 3                     // one safe lane per 3 columns
    };
  };

  // ---------------------------------------------------------------
  // RACEWAY: a wide ring circuit with ordered gates. Rivals follow the
  // centerline; everyone's lap/gate progress uses the same points.
  // ---------------------------------------------------------------
  D.genRaceway = function (size) {
    var r = size * 0.36;
    var pts = [];
    for (var i = 0; i < 72; i++) {
      var a = (i / 72) * Math.PI * 2 + Math.PI / 2; // start line by the south entry
      var rr = r + Math.sin(a * 4) * (size * 0.05);
      pts.push({ x: Math.cos(a) * rr, z: Math.sin(a) * rr, a: a });
    }
    return { path: pts, gates: 8, laps: 3, r: r };
  };

  // ---------------------------------------------------------------
  // CIPHER HALLS: a handcrafted three-chamber puzzle, walls as solid
  // blockers, energy barriers opened by pressure plates, and carryable
  // power cores that can hold a plate down for you.
  // Coordinates are fractions of the map half-size (mirrored later).
  // ---------------------------------------------------------------
  D.genHalls = function (size) {
    var h = size / 2;
    var u = size / 20; // one wall unit
    var walls = [];    // static rects {x, z, w, d}
    var addWall = function (x, z, w, d) { walls.push({ x: x, z: z, w: w, d: d }); };
    // three chamber dividers across the map (entry at south)
    addWall(-h * 0.55, h * 0.30, h * 0.9, u);  // divider 1, gap on the right
    addWall(h * 0.62, h * 0.30, h * 0.75, u);
    addWall(h * 0.55, -h * 0.15, h * 0.9, u);  // divider 2, gap on the left
    addWall(-h * 0.62, -h * 0.15, h * 0.75, u);
    addWall(-h * 0.55, -h * 0.60, h * 0.9, u); // divider 3, gap on the right
    addWall(h * 0.62, -h * 0.60, h * 0.75, u);
    return {
      walls: walls,
      // barriers close the three gaps until their plates are held
      barriers: [
        { id: 'b1', x: h * 0.12, z: h * 0.30, w: h * 0.25, d: u, plate: 'p1' },
        { id: 'b2', x: -h * 0.12, z: -h * 0.15, w: h * 0.25, d: u, plate: 'p2' },
        { id: 'b3', x: h * 0.12, z: -h * 0.60, w: h * 0.25, d: u, plates: ['p3', 'p4'] }
      ],
      // chamber 1: a plate right beside its barrier (stand OR weight it)
      // chamber 2: the plate is far from the gap — you need the core
      // chamber 3: two plates at once — core on one, pilot on the other
      plates: [
        { id: 'p1', x: -h * 0.30, z: h * 0.45 },
        { id: 'p2', x: h * 0.55, z: h * 0.05 },
        { id: 'p3', x: -h * 0.45, z: -h * 0.42 },
        { id: 'p4', x: h * 0.35, z: -h * 0.42 }
      ],
      cores: [
        { id: 'c1', x: h * 0.45, z: h * 0.55 },   // chamber 1 spare weight
        { id: 'c2', x: -h * 0.55, z: h * 0.08 }   // chamber 2's key
      ]
    };
  };

  // point-in-any-solid-rect (walls always; barriers only while closed)
  D.hallsBlocked = function (halls, barrierState, x, z, pad) {
    pad = pad || 0.6;
    for (var i = 0; i < halls.walls.length; i++) {
      var w = halls.walls[i];
      if (Math.abs(x - w.x) < w.w / 2 + pad && Math.abs(z - w.z) < w.d / 2 + pad) return true;
    }
    for (var b = 0; b < halls.barriers.length; b++) {
      var br = halls.barriers[b];
      if (barrierState && barrierState[br.id]) continue; // open
      if (Math.abs(x - br.x) < br.w / 2 + pad && Math.abs(z - br.z) < br.d / 2 + pad) return true;
    }
    return false;
  };

  // ---------------------------------------------------------------
  // CONVOY: the hauler's route — south entry to north exit, weaving,
  // with ambush triggers at every second waypoint.
  // ---------------------------------------------------------------
  D.genConvoy = function (seed, size) {
    var rnd = rng('convoy:' + seed);
    var half = size / 2;
    var pts = [];
    var n = 7;
    for (var i = 0; i <= n; i++) {
      var t = i / n;
      pts.push({
        x: i === 0 || i === n ? 0 : (rnd() - 0.5) * (size * 0.55),
        z: (half - 30) - t * (size - 60),
        ambush: i > 0 && i < n && i % 2 === 0
      });
    }
    return pts;
  };

  D.fluxSafe = function (cfg, time, x, z, size) {
    var half = size / 2;
    var zIn = z - cfg.zTop;
    if (zIn < 0 || zIn > cfg.rows * cfg.tile) return true; // outside the band
    var col = Math.floor((x + half - 20) / cfg.tile);
    if (col < 0 || col >= cfg.cols) return true;
    var row = Math.floor(zIn / cfg.tile);
    var sweep = Math.floor(time / cfg.period);
    // diagonal lanes: safe when (col + row + sweep) lines up
    return ((col + row + sweep) % cfg.laneEvery) === 0;
  };

  return D;
})();
