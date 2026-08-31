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

  // which two extra archetypes each territory offers (gate 0 is always depths)
  D.ZONE_SETS = {
    wreck: ['hive', 'gauntlet'],
    glacier: ['labyrinth', 'bastion'],
    cloister: ['bastion', 'hive'],
    ember: ['gauntlet', 'fluxways'],
    storm: ['fluxways', 'labyrinth'],
    null: ['labyrinth', 'hive']
  };

  D.ARCHETYPES = {
    depths: { name: 'DEPTHS', desc: 'the crawl: packs, the vault, the lair', size: 220 },
    hive: { name: 'HIVE', desc: 'EXTERMINATE — leave nothing alive', size: 220 },
    bastion: { name: 'BASTION', desc: 'DEFEND the relic through four waves', size: 200 },
    labyrinth: { name: 'LABYRINTH', desc: 'find the heart of the maze', size: 230 },
    gauntlet: { name: 'GAUNTLET', desc: 'a timed rush — ride the checkpoints', size: 260 },
    fluxways: { name: 'FLUXWAYS', desc: 'the floor shifts — cross on the safe lanes', size: 200 }
  };

  // what the BASTION relic is, per territory (all original fiction)
  D.OBJECTIVES = {
    wreck: { name: 'DORMANT TITANFRAME', kind: 'mech' },
    glacier: { name: 'THE HEARTCRYSTAL', kind: 'crystal' },
    cloister: { name: 'THE SEED ORB', kind: 'orb' },
    ember: { name: 'THE ANCIENT FORGE', kind: 'forge' },
    storm: { name: 'THE SPIRE CAPACITOR', kind: 'capacitor' },
    null: { name: 'THE VOID ARCHIVE', kind: 'archive' }
  };

  // tier scaling: tougher garrisons, richer clears
  D.tierMult = function (tier) {
    return { hp: tier === 2 ? 1.7 : 1, dmg: tier === 2 ? 1.35 : 1, loot: tier };
  };

  // dungeon zone ids: dg_<zone>_<archetype>_t<tier>
  D.makeId = function (zone, arch, tier) { return 'dg_' + zone + '_' + arch + '_t' + (tier || 1); };

  D.parseId = function (id) {
    var m = /^dg_([a-z]+)_([a-z]+)_t([12])$/.exec(id);
    if (!m) return null;
    return { zone: m[1], arch: m[2], tier: parseInt(m[3], 10) };
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
