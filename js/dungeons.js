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
    raceway: { name: 'RACEWAY', desc: 'a combat race — drift, nitro, three laps of live fire', size: 300 },
    halls: { name: 'CIPHER HALLS', desc: 'beams, plates, the jammer — think your way through', size: 200 },
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
  // CIPHER HALLS: handcrafted chamber-chain puzzles.
  // Design law (the Portal rule): teach each element alone with a
  // single readable solution, then combine, then subvert. Elements
  // (the Talos kit, reworked): pressure plates, carryable weights,
  // beam emitters + carryable relays + receptors (beams have limited
  // reach; walls and CLOSED seals cut them), one signal jammer that
  // forces any unhardened seal open while it sits aimed at it, timed
  // switches, and violet matter screens the pilot walks through but
  // carried objects cannot.
  //   variant 'teach'  — glacier: four chambers, one lesson each.
  //   variant 'master' — the null reach: same alphabet, no mercy.
  // ---------------------------------------------------------------
  D.genHalls = function (size, variant) {
    var h = size / 2; // authored for size 200 (h = 100); scaled by k
    var k = h / 100;
    var T = 10 * k;   // wall thickness
    var scaleRects = function (list) {
      list.forEach(function (r) { r.x *= k; r.z *= k; r.w *= k; r.d *= k; });
      return list;
    };
    var scalePts = function (list) {
      list.forEach(function (p) { p.x *= k; p.z *= k; });
      return list;
    };
    var lay;
    if (variant === 'master') {
      // ---- THE NULL VARIANT: retrieve, sacrifice, sprint, combine ----
      lay = {
        walls: scaleRects([
          // row A (z 50): two gaps — east (screen + door plate), west (jam-only)
          { x: -77.5, z: 50, w: 45, d: 10 },
          { x: 0, z: 50, w: 60, d: 10 },
          { x: 77.5, z: 50, w: 45, d: 10 },
          // row B (z 5): center gap
          { x: -56.25, z: 5, w: 87.5, d: 10 },
          { x: 56.25, z: 5, w: 87.5, d: 10 },
          // row C (z -28): east gap
          { x: -35, z: -28, w: 130, d: 10 },
          { x: 77.5, z: -28, w: 45, d: 10 },
          // row D (z -60): west gap
          { x: -77.5, z: -60, w: 45, d: 10 },
          { x: 35, z: -60, w: 130, d: 10 }
        ]),
        barriers: scaleRects([
          { id: 'b1', x: 42.5, z: 50, w: 25, d: 4, opener: 'plate', plate: 'p1' },
          { id: 'b1w', x: -42.5, z: 50, w: 25, d: 4, opener: 'jam' },
          { id: 'b2', x: 0, z: 5, w: 25, d: 4, opener: 'receptor', receptor: 'r1' },
          { id: 'b3', x: 42.5, z: -28, w: 25, d: 4, opener: 'switch', noJam: true },
          { id: 'b4', x: -42.5, z: -60, w: 25, d: 4, opener: 'receptor', receptor: 'r3', plate: 'p4', noJam: true },
          // beam locks: low conduit fences that cut beams until jammed
          { id: 'lk2', x: -25, z: 17, w: 4, d: 30, opener: 'lock' },
          { id: 'lk3', x: -31, z: -46, w: 4, d: 20, opener: 'lock' }
        ]),
        screens: scaleRects([
          { id: 's1', x: 42.5, z: 56.5, w: 25, d: 2 },   // items never enter by the east door
          { id: 's2', x: -42.5, z: -66, w: 25, d: 2 }    // nothing carried leaves for the vault
        ]),
        plates: scalePts([
          { id: 'p1', x: 42.5, z: 50, r: 4.5, door: true },
          { id: 'p4', x: -70, z: -40, r: 2.6 }
        ]),
        emitters: scalePts([
          { id: 'e1', x: -50, z: 24 },
          { id: 'e3', x: -20, z: -40 }
        ]),
        receptors: scalePts([
          { id: 'r1', x: 0, z: 10 },
          { id: 'r3', x: -42.5, z: -52 }
        ]),
        switches: scalePts([
          { id: 'sw1', x: -8, z: -12, opens: 'b3', window: 12 },
          { id: 'sw2', x: 48, z: -38, opens: 'b3', window: 12 }
        ]),
        items: scalePts([
          { id: 'l1', kind: 'relay', x: 10, z: 70 },
          { id: 'j1', kind: 'jammer', x: -10, z: 70 },
          { id: 'c2', kind: 'core', x: 30, z: -45 }
        ])
      };
    } else {
      // ---- THE TEACHING SET: plates, then beams, then the jammer, then all three ----
      lay = {
        walls: scaleRects([
          // row A (z 50): gap x 15..40
          { x: -42.5, z: 50, w: 115, d: 10 },
          { x: 70, z: 50, w: 60, d: 10 },
          // row B (z 5): gap x -40..-15
          { x: -70, z: 5, w: 60, d: 10 },
          { x: 42.5, z: 5, w: 115, d: 10 },
          // row C (z -28): gap x 15..40
          { x: -42.5, z: -28, w: 115, d: 10 },
          { x: 70, z: -28, w: 60, d: 10 },
          // row D (z -60): gap x -40..-15
          { x: -70, z: -60, w: 60, d: 10 },
          { x: 42.5, z: -60, w: 115, d: 10 }
        ]),
        barriers: scaleRects([
          { id: 'b1', x: 27.5, z: 50, w: 25, d: 4, opener: 'plate', plate: 'p1' },
          { id: 'b2', x: -27.5, z: 5, w: 25, d: 4, opener: 'receptor', receptor: 'r1' },
          { id: 'b3', x: 27.5, z: -28, w: 25, d: 4, opener: 'jam' },
          { id: 'b4', x: -27.5, z: -60, w: 25, d: 4, opener: 'receptor', receptor: 'r2', plate: 'p2', noJam: true },
          // the conduit fence across chamber four's only bridging lane
          { id: 'lk1', x: -7.5, z: -44, w: 55, d: 4, opener: 'lock' }
        ]),
        screens: scaleRects([
          { id: 's1', x: -27.5, z: -66, w: 25, d: 2 }   // the vault admits pilots, not cargo
        ]),
        plates: scalePts([
          { id: 'p1', x: 27.5, z: 50, r: 4.5, door: true },
          { id: 'p2', x: -27.5, z: -60, r: 4.5, door: true }
        ]),
        emitters: scalePts([
          { id: 'e1', x: -62, z: 27 },
          { id: 'e2', x: 20, z: -34 }
        ]),
        receptors: scalePts([
          { id: 'r1', x: -27.5, z: 12 },
          { id: 'r2', x: -27.5, z: -52 }
        ]),
        switches: [],
        items: scalePts([
          { id: 'c1', kind: 'core', x: -20, z: 68 },
          { id: 'l1', kind: 'relay', x: 30, z: 30 },
          { id: 'j1', kind: 'jammer', x: -30, z: -12 },
          { id: 'l2', kind: 'relay', x: 30, z: -50 }
        ])
      };
    }
    lay.variant = variant === 'master' ? 'master' : 'teach';
    lay.linkRange = 28 * k;
    lay.jamRange = 14 * k;
    return lay;
  };

  // point-in-any-solid-rect (walls always; barriers only while closed;
  // violet matter screens only while the pilot is carrying something)
  D.hallsBlocked = function (halls, barrierState, x, z, pad, carrying) {
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
    if (carrying && halls.screens) {
      for (var s = 0; s < halls.screens.length; s++) {
        var sc = halls.screens[s];
        if (Math.abs(x - sc.x) < sc.w / 2 + pad && Math.abs(z - sc.z) < sc.d / 2 + pad) return true;
      }
    }
    return false;
  };

  // is this point inside a matter screen? (pickups are refused there,
  // so nobody can strand themselves mid-screen holding cargo)
  D.inScreen = function (halls, x, z, pad) {
    if (!halls.screens) return false;
    pad = pad === undefined ? 0.8 : pad;
    for (var s = 0; s < halls.screens.length; s++) {
      var sc = halls.screens[s];
      if (Math.abs(x - sc.x) < sc.w / 2 + pad && Math.abs(z - sc.z) < sc.d / 2 + pad) return true;
    }
    return false;
  };

  // beam sightline: sampled march against walls + CLOSED seals.
  // Matter screens never cut light; skipId lets a jam ray ignore the
  // very seal it is aimed at.
  D.segClear = function (halls, barrierState, x1, z1, x2, z2, skipId) {
    var dx = x2 - x1, dz = z2 - z1;
    var len = Math.sqrt(dx * dx + dz * dz);
    var steps = Math.max(2, Math.ceil(len / 1.2));
    for (var i = 1; i < steps; i++) {
      var t = i / steps;
      var px = x1 + dx * t, pz = z1 + dz * t;
      for (var w = 0; w < halls.walls.length; w++) {
        var wl = halls.walls[w];
        if (Math.abs(px - wl.x) < wl.w / 2 + 0.3 && Math.abs(pz - wl.z) < wl.d / 2 + 0.3) return false;
      }
      for (var b = 0; b < halls.barriers.length; b++) {
        var br = halls.barriers[b];
        if (br.id === skipId) continue;
        if (barrierState && barrierState[br.id]) continue; // open seals pass light
        if (Math.abs(px - br.x) < br.w / 2 + 0.3 && Math.abs(pz - br.z) < br.d / 2 + 0.3) return false;
      }
    }
    return true;
  };

  // distance from a point to a rect's edge (0 when inside)
  function rectDist(r, x, z) {
    var ddx = Math.max(Math.abs(x - r.x) - r.w / 2, 0);
    var ddz = Math.max(Math.abs(z - r.z) - r.d / 2, 0);
    return Math.sqrt(ddx * ddx + ddz * ddz);
  }

  // the power graph: emitters are live; a grounded relay is live when it
  // can see a live node in range; a receptor lights the same way.
  // Returns { lit: {receptorId:true}, links: [{x1,z1,x2,z2}] }.
  D.hallsPower = function (halls, barrierState, itemPos, carryingId) {
    var nodes = []; // {x, z, live}
    var links = [];
    halls.emitters.forEach(function (em) {
      nodes.push({ x: em.x, z: em.z, live: true });
    });
    var relays = [];
    halls.items.forEach(function (it) {
      if (it.kind !== 'relay') return;
      if (carryingId === it.id) return; // a shouldered relay links nothing
      var p = (itemPos && itemPos[it.id]) || it;
      relays.push({ x: p.x, z: p.z, live: false });
      nodes.push(relays[relays.length - 1]);
    });
    var range = halls.linkRange;
    var changed = true;
    while (changed) {
      changed = false;
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (n.live) continue;
        for (var j = 0; j < nodes.length; j++) {
          var m = nodes[j];
          if (!m.live) continue;
          var dx = n.x - m.x, dz = n.z - m.z;
          if (dx * dx + dz * dz > range * range) continue;
          if (!D.segClear(halls, barrierState, m.x, m.z, n.x, n.z)) continue;
          n.live = true;
          n.from = m;
          changed = true;
          break;
        }
      }
    }
    nodes.forEach(function (n) {
      if (n.live && n.from) links.push({ x1: n.from.x, z1: n.from.z, x2: n.x, z2: n.z });
    });
    var lit = {};
    halls.receptors.forEach(function (rc) {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!n.live) continue;
        var dx = rc.x - n.x, dz = rc.z - n.z;
        if (dx * dx + dz * dz > range * range) continue;
        if (!D.segClear(halls, barrierState, n.x, n.z, rc.x, rc.z)) continue;
        lit[rc.id] = true;
        links.push({ x1: n.x, z1: n.z, x2: rc.x, z2: rc.z });
        break;
      }
    });
    return { lit: lit, links: links };
  };

  // the jammer: grounded, it seizes the nearest unhardened seal within
  // jamRange of its edge (sightline required, ignoring the target itself)
  // and holds it open. Returns { jammed: {barrierId:true}, ray: {...} }.
  D.hallsJam = function (halls, barrierState, itemPos, carryingId) {
    var out = { jammed: {}, ray: null };
    halls.items.forEach(function (it) {
      if (it.kind !== 'jammer' || carryingId === it.id) return;
      var p = (itemPos && itemPos[it.id]) || it;
      var best = null, bestD = halls.jamRange;
      halls.barriers.forEach(function (br) {
        if (br.noJam) return;
        var d = rectDist(br, p.x, p.z);
        if (d > bestD) return;
        if (!D.segClear(halls, barrierState, p.x, p.z, br.x, br.z, br.id)) return;
        best = br; bestD = d;
      });
      if (best) {
        out.jammed[best.id] = true;
        out.ray = { x1: p.x, z1: p.z, x2: best.x, z2: best.z };
      }
    });
    return out;
  };

  // one settling pass of the whole circuit: plates -> jam -> power ->
  // seal states. Call with the previous frame's open map; it converges
  // in a couple of frames as light finds newly opened paths.
  D.hallsSolve = function (halls, prevOpen, itemPos, carryingId, pressed, switchOpen) {
    var jam = D.hallsJam(halls, prevOpen, itemPos, carryingId);
    // light travels through what the jam is holding open right now
    var midState = {};
    for (var kdb in prevOpen) midState[kdb] = prevOpen[kdb];
    for (var kj in jam.jammed) midState[kj] = true;
    var power = D.hallsPower(halls, midState, itemPos, carryingId);
    var open = {};
    halls.barriers.forEach(function (br) {
      var o = false;
      if (br.opener === 'plate') o = !!pressed[br.plate];
      else if (br.opener === 'receptor') {
        o = !!power.lit[br.receptor];
        if (o && br.plate) o = !!pressed[br.plate];
      } else if (br.opener === 'switch') o = !!switchOpen[br.id];
      if (jam.jammed[br.id]) o = true;
      open[br.id] = o;
    });
    return { open: open, lit: power.lit, links: power.links, jammed: jam.jammed, jamRay: jam.ray };
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
