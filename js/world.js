// HERO FRAME — THE SHATTERED REACH
// A zone-streamed world: each territory is its own HUGE map (500×500),
// linked by travel gates, and every territory hides a gated DUNGEON —
// a separate dark map holding its guardian packs, its sealed vault, and
// the corrupt-frame lair at the far end. Only one zone is ever loaded;
// zone builds are procedural and effectively instant, so travel is a
// fade, not a loading screen. Scars persist per zone forever.
GH.world = (function () {
  var W = {};

  W.OVERWORLD_SIZE = 500;   // one territory map
  W.DUNGEON_SIZE = 220;     // one dungeon map

  // travel graph: which side of each territory carries the gate to whom
  var GATE_SIDES = {
    wreck: { glacier: 'W', cloister: 'E' },
    glacier: { wreck: 'E', ember: 'S' },
    cloister: { wreck: 'W', storm: 'S' },
    ember: { glacier: 'N', null: 'E' },
    storm: { cloister: 'N', null: 'W' },
    null: { ember: 'W', storm: 'E' }
  };

  W.ZONES = [
    { id: 'wreck', danger: 1 },     // the hub: camp, circuit, duel pit
    { id: 'glacier', danger: 2 },
    { id: 'cloister', danger: 2 },
    { id: 'ember', danger: 3 },
    { id: 'storm', danger: 3 },
    { id: 'null', danger: 4 }
  ];

  // fixed hub features (live in the wreck zone only)
  W.CAMP = { x: 0, z: 150, r: 16 };
  W.CIRCUIT = { x: 165, z: 140, r: 26, gates: 10 };
  W.DUEL_PIT = { x: -60, z: 185 };

  // the currently loaded zone: clamps and minimap read these live
  W.BOUNDS = { x: W.OVERWORLD_SIZE / 2, z: W.OVERWORLD_SIZE / 2 };
  W.current = null; // {id, danger, dungeon, parent, size, name}

  W.zoneInfo = function (zoneId) {
    // legacy saves: 'dungeon_<zone>' was the single-dungeon era
    if (zoneId.indexOf('dungeon_') === 0) {
      zoneId = GH.dungeons.makeId(zoneId.slice(8), 'depths', 1);
    }
    var dg = GH.dungeons.parseId(zoneId);
    if (dg) {
      var pz = W.zoneById(dg.zone);
      var arch = GH.dungeons.ARCHETYPES[dg.arch];
      return {
        id: zoneId, dungeon: true, parent: dg.zone,
        arch: dg.arch, tier: dg.tier,
        danger: Math.min(4, pz.danger + dg.tier),
        size: arch.size,
        name: W.stageFor(dg.zone).name + ' ' + arch.name + (dg.tier === 2 ? ' II' : '')
      };
    }
    var zn = W.zoneById(zoneId);
    return {
      id: zoneId, dungeon: false, parent: zoneId,
      danger: zn.danger, size: W.OVERWORLD_SIZE,
      name: W.stageFor(zoneId).name
    };
  };

  W.zoneById = function (id) {
    for (var i = 0; i < W.ZONES.length; i++) if (W.ZONES[i].id === id) return W.ZONES[i];
    return W.ZONES[0];
  };

  W.setZone = function (zoneId) {
    W.current = W.zoneInfo(zoneId);
    W.BOUNDS = { x: W.current.size / 2, z: W.current.size / 2 };
    return W.current;
  };

  W.stageFor = function (zoneId) {
    if (zoneId) {
      if (zoneId.indexOf('dungeon_') === 0) zoneId = zoneId.slice(8);
      var dg = GH.dungeons.parseId(zoneId);
      if (dg) zoneId = dg.zone;
    }
    for (var i = 0; i < GH.stages.length; i++) {
      if (GH.stages[i].id === zoneId) return GH.stages[i];
    }
    return GH.stages[0];
  };

  // deterministic per-zone placement rng
  function zrng(seedStr) {
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

  function gatePos(side, size) {
    var m = size / 2 - 16;
    if (side === 'N') return { x: 0, z: -m };
    if (side === 'S') return { x: 0, z: m };
    if (side === 'E') return { x: m, z: 0 };
    return { x: -m, z: 0 };
  }

  // ---------------------------------------------------------------
  // Zone layout: everything a single map contains, deterministically.
  // ---------------------------------------------------------------
  W.layoutFor = function (zoneId) {
    var info = W.zoneInfo(zoneId);
    var size = info.size;
    var half = size / 2;
    var rnd = zrng('reach:' + zoneId);
    var lay = { nests: [], gates: [], packs: [], relay: null, lair: null, vault: null, dungeonGate: null };

    if (!info.dungeon) {
      var sides = GATE_SIDES[zoneId] || {};
      for (var to in sides) {
        var gp = gatePos(sides[to], size);
        lay.gates.push({ to: to, x: gp.x, z: gp.z, side: sides[to] });
      }
      // THREE dungeon gates per territory: the depths plus two more
      // archetypes from the zone's set, scattered deep in the map
      var archList = ['depths'].concat(GH.dungeons.ZONE_SETS[zoneId] || []);
      archList.forEach(function (arch, ai) {
        var dgx = (rnd() - 0.5) * (size * 0.62);
        var dgz = (rnd() - 0.5) * (size * 0.62);
        if (zoneId === 'wreck') {
          // keep the hub's gates clear of camp and circuit
          if (ai === 0) { dgx = -140; dgz = -120; }
          if (GH.dist2(dgx, dgz, W.CAMP.x, W.CAMP.z) < 45 * 45) dgz -= 110;
          if (GH.dist2(dgx, dgz, W.CIRCUIT.x, W.CIRCUIT.z) < 50 * 50) dgx -= 110;
        }
        lay.gates.push({ to: GH.dungeons.makeId(zoneId, arch, 1), x: dgx, z: dgz, arch: arch });
      });

      // husk nests scattered wide
      var count = zoneId === 'wreck' ? 8 : 14;
      for (var i = 0; i < count; i++) {
        var nx = (rnd() - 0.5) * (size - 60);
        var nz = (rnd() - 0.5) * (size - 60);
        if (zoneId === 'wreck') {
          if (GH.dist2(nx, nz, W.CAMP.x, W.CAMP.z) < 45 * 45) nx -= 90;
          if (GH.dist2(nx, nz, W.CIRCUIT.x, W.CIRCUIT.z) < 50 * 50) nz -= 90;
        }
        for (var g2 = 0; g2 < lay.gates.length; g2++) {
          if (GH.dist2(nx, nz, lay.gates[g2].x, lay.gates[g2].z) < 30 * 30) { nx *= 0.7; nz *= 0.7; }
        }
        lay.nests.push({
          id: zoneId + '_n' + i, zone: zoneId, x: nx, z: nz,
          hp: 120 * info.danger, maxHp: 120 * info.danger
        });
      }
      // siege relays hold the middle of two territories
      if (zoneId === 'wreck') lay.relay = { id: 'relay_wreck', zone: zoneId, x: 110, z: -80 };
      if (zoneId === 'storm') lay.relay = { id: 'relay_storm', zone: zoneId, x: -90, z: 100 };

      // landmarks: ruin rings, crashed hulks, sub-biome stains, and
      // roads running from each travel gate toward the map's heart
      lay.ruins = [];
      for (var ru = 0; ru < 3; ru++) {
        lay.ruins.push({
          x: (rnd() - 0.5) * (size * 0.7),
          z: (rnd() - 0.5) * (size * 0.7),
          kind: ru === 2 ? 'hulk' : 'ring'
        });
      }
      lay.stains = [];
      for (var stn = 0; stn < 4; stn++) {
        lay.stains.push({
          x: (rnd() - 0.5) * (size * 0.8),
          z: (rnd() - 0.5) * (size * 0.8),
          r: 22 + rnd() * 26
        });
      }
    } else {
      // ---- DUNGEONS: exit gate south, archetype decides the rest ----
      lay.gates.push({ to: info.parent, x: 0, z: half - 16, exit: true });
      var arch2 = info.arch;

      if (arch2 === 'depths') {
        var packs = 5;
        for (var p = 0; p < packs; p++) {
          lay.packs.push({
            x: (rnd() - 0.5) * (size - 70),
            z: half - 50 - p * ((size - 90) / packs) + (rnd() - 0.5) * 24,
            n: 3 + Math.floor(rnd() * 3)
          });
        }
        if (info.tier === 1) {
          lay.vault = { id: 'vault_' + info.parent, zone: info.parent, x: (rnd() < 0.5 ? -1 : 1) * (half - 45), z: 0 };
          lay.lair = { id: 'lair_' + info.parent, zone: info.parent, x: 0, z: -half + 30, boss: W.stageFor(info.parent).unlocks };
        } else {
          // tier 2: no vault — a denser garrison and a corrupt rematch
          lay.packs.push({ x: 0, z: 0, n: 5 });
          lay.lair = { id: 'lair2_' + info.parent, zone: info.parent, x: 0, z: -half + 30, boss: W.stageFor(info.parent).unlocks, rematch: true };
        }
      } else if (arch2 === 'hive') {
        var hp2 = 7 + (info.tier === 2 ? 3 : 0);
        for (var h = 0; h < hp2; h++) {
          lay.packs.push({
            x: (rnd() - 0.5) * (size - 60),
            z: (rnd() - 0.5) * (size - 60),
            n: 3 + Math.floor(rnd() * 3)
          });
        }
      } else if (arch2 === 'bastion') {
        lay.objective = {
          x: 0, z: 0,
          def: GH.dungeons.OBJECTIVES[info.parent],
          hp: 500 + info.danger * 150
        };
        // attackers pour from four breaches
        lay.breaches = [
          { x: -half + 20, z: 0 }, { x: half - 20, z: 0 },
          { x: 0, z: -half + 20 }, { x: half - 30, z: -half + 30 }
        ];
      } else if (arch2 === 'labyrinth') {
        lay.maze = GH.dungeons.genMaze(zoneId, 21, Math.floor(size / 21));
        var mid = Math.floor(lay.maze.n / 2);
        lay.heart = GH.dungeons.mazeCellPos(lay.maze, size, mid, mid);
        // the entry gate must stand square with the maze mouth
        var mouth = GH.dungeons.mazeCellPos(lay.maze, size, lay.maze.n - 1, mid);
        lay.gates[0].x = mouth.x;
        // lurkers in the corridors
        for (var lk = 0; lk < 8 + (info.tier === 2 ? 4 : 0); lk++) {
          var lr, lc, guard = 0;
          do {
            lr = 1 + Math.floor(rnd() * (lay.maze.n - 2));
            lc = 1 + Math.floor(rnd() * (lay.maze.n - 2));
          } while (lay.maze.grid[lr][lc] && guard++ < 40);
          var lp = GH.dungeons.mazeCellPos(lay.maze, size, lr, lc);
          lay.packs.push({ x: lp.x, z: lp.z, n: 1 });
        }
      } else if (arch2 === 'gauntlet') {
        lay.checkpoints = GH.dungeons.genGauntlet(zoneId, size);
        // harriers along the route
        lay.checkpoints.forEach(function (cp, ci) {
          if (ci % 2 === 0) lay.packs.push({ x: cp.x + 8, z: cp.z + 8, n: 2 });
        });
      } else if (arch2 === 'fluxways') {
        lay.flux = GH.dungeons.genFlux(size);
        lay.chest = { x: 0, z: -half + 22 };
        lay.packs.push({ x: 0, z: -half + 40, n: 3 }); // the far-side welcome
      }
      // every non-depths dungeon pays out at a chest (flux set its own)
      if (!lay.chest && arch2 !== 'depths') {
        lay.chest = arch2 === 'labyrinth' ? { x: lay.heart.x, z: lay.heart.z } :
          arch2 === 'gauntlet' ? { x: lay.checkpoints[lay.checkpoints.length - 1].x, z: lay.checkpoints[lay.checkpoints.length - 1].z } :
          { x: 0, z: -half + 26 };
      }
    }
    return lay;
  };

  // total nests across every territory (for the cleanse counter)
  var totalNestsCache = null;
  W.totalNests = function () {
    if (totalNestsCache === null) {
      totalNestsCache = 0;
      W.ZONES.forEach(function (zn) { totalNestsCache += W.layoutFor(zn.id).nests.length; });
    }
    return totalNestsCache;
  };

  // ---------------------------------------------------------------
  // Daily world state — keyed off the real UTC date
  // ---------------------------------------------------------------
  W.dayStamp = function () { return new Date().toISOString().slice(0, 10); };

  W.WEATHERS = {
    glacier: { id: 'whiteout', name: 'WHITEOUT', desc: 'fog swallows the hollow; everything moves slower' },
    wreck: { id: 'kingtide', name: 'KING TIDE', desc: 'the tide washes salvage ashore' },
    cloister: { id: 'sporebloom', name: 'SPOREBLOOM', desc: 'kills shed extra sparks' },
    ember: { id: 'ashfall', name: 'ASHFALL', desc: 'burning cinders rain from the sky' },
    storm: { id: 'stormsurge', name: 'STORM SURGE', desc: 'the sky hunts anything that moves' },
    null: { id: 'nullwind', name: 'NULL WIND', desc: 'drifting eddies ground your weapons' }
  };

  W.weatherToday = function () {
    var rnd = zrng('weather:' + W.dayStamp());
    var ids = W.ZONES.map(function (z) { return z.id; });
    var a = Math.floor(rnd() * ids.length);
    var b = (a + 1 + Math.floor(rnd() * (ids.length - 1))) % ids.length;
    var out = {};
    out[ids[a]] = W.WEATHERS[ids[a]];
    out[ids[b]] = W.WEATHERS[ids[b]];
    return out;
  };

  // THE HARROW roams the overworld: a different territory every day
  W.harrowToday = function () {
    var rnd = zrng('harrow:' + W.dayStamp());
    var candidates = W.ZONES.filter(function (z) { return z.id !== 'wreck'; });
    var zn = candidates[Math.floor(rnd() * candidates.length)];
    return {
      zone: zn.id,
      x: (rnd() - 0.5) * (W.OVERWORLD_SIZE * 0.6),
      z: (rnd() - 0.5) * (W.OVERWORLD_SIZE * 0.6)
    };
  };

  // circuit centerline (hub zone): a wobbled ring for AI + track checks
  W.circuitPath = function () {
    var pts = [];
    var C = W.CIRCUIT;
    for (var i = 0; i < 64; i++) {
      var a = (i / 64) * Math.PI * 2;
      var r = C.r + Math.sin(a * 3) * 4;
      pts.push({ x: C.x + Math.cos(a) * r, z: C.z + Math.sin(a) * r, a: a });
    }
    return pts;
  };

  // ---------------------------------------------------------------
  // Build ONE zone into the scene. Returns handles for dynamic bits.
  // ---------------------------------------------------------------
  W.buildZone = function (scene, zoneId, deadNests, lairsDown, vaultsOpen) {
    var info = W.setZone(zoneId);
    var lay = W.layoutFor(zoneId);
    var size = info.size;
    var group = new THREE.Group();
    var nestMeshes = {};
    var vaultMeshes = {};
    var st = W.stageFor(zoneId);
    var tex = GH.assets.stageTex[st.id];

    // ground
    var floorTex = tex.floor.clone();
    floorTex.repeat.set(20 * size / 80, 20 * size / 80);
    floorTex.needsUpdate = true;
    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(size + 1, size + 1),
      GH.assets.lambert({ map: floorTex, color: info.dungeon ? 0x777788 : 0xffffff })
    );
    ground.rotation.x = -Math.PI / 2;
    group.add(ground);

    // dungeon perimeter: a tight rock collar so the depths read enclosed
    if (info.dungeon) {
      var collar = new THREE.Mesh(
        new THREE.CylinderGeometry(size * 0.74, size * 0.7, 26, 28, 1, true),
        GH.assets.lambert({ map: tex.wall, side: THREE.BackSide })
      );
      collar.position.y = 12;
      group.add(collar);
    }

    // props: dense enough to feel like terrain, not a floor.
    // Mazes and flux floors keep their arenas clean.
    var rnd = zrng('props:' + zoneId);
    var propCount = info.dungeon ?
      (info.arch === 'labyrinth' || info.arch === 'fluxways' ? 0 : 46) : 150;
    for (var i = 0; i < propCount; i++) {
      var kind = st.props[Math.floor(rnd() * st.props.length)];
      var p = GH.models.props[kind]();
      var px = (rnd() - 0.5) * (size - 14);
      var pz = (rnd() - 0.5) * (size - 14);
      if (zoneId === 'wreck') {
        if (GH.dist2(px, pz, W.CAMP.x, W.CAMP.z) < 26 * 26) continue;
        if (GH.dist2(px, pz, W.CIRCUIT.x, W.CIRCUIT.z) < (W.CIRCUIT.r + 12) * (W.CIRCUIT.r + 12)) continue;
      }
      var clear = false;
      for (var g3 = 0; g3 < lay.gates.length; g3++) {
        if (GH.dist2(px, pz, lay.gates[g3].x, lay.gates[g3].z) < 12 * 12) { clear = true; break; }
      }
      if (lay.lair && GH.dist2(px, pz, lay.lair.x, lay.lair.z) < 15 * 15) clear = true;
      if (lay.vault && GH.dist2(px, pz, lay.vault.x, lay.vault.z) < 12 * 12) clear = true;
      if (clear) continue;
      p.position.set(px, 0, pz);
      group.add(p);
    }

    // world features
    lay.nests.forEach(function (n) {
      var nest = GH.models.buildNest(deadNests[n.id]);
      nest.position.set(n.x, 0, n.z);
      group.add(nest);
      nestMeshes[n.id] = nest;
    });
    if (lay.relay) {
      var relay = GH.models.buildRelay();
      relay.position.set(lay.relay.x, 0, lay.relay.z);
      group.add(relay);
    }
    if (lay.lair) {
      var lair = GH.models.buildLair(lairsDown[lay.lair.zone]);
      lair.position.set(lay.lair.x, 0, lay.lair.z);
      group.add(lair);
    }
    if (lay.vault) {
      var vault = GH.models.buildVault(vaultsOpen[lay.vault.id]);
      vault.position.set(lay.vault.x, 0, lay.vault.z);
      vault.rotation.y = lay.vault.x > 0 ? -Math.PI / 2 : Math.PI / 2;
      group.add(vault);
      vaultMeshes[lay.vault.id] = vault;
    }

    // ---- archetype set pieces ----
    var chestMesh = null, objectiveMesh = null, fluxTiles = null, cpMeshes = null;
    if (lay.maze) {
      // raise the maze: one shared material, a box per wall cell
      var wallMat = GH.assets.lambert({ map: tex.wall });
      var mc = lay.maze.cell;
      for (var mr = 0; mr < lay.maze.n; mr++) {
        for (var mcc = 0; mcc < lay.maze.n; mcc++) {
          if (!lay.maze.grid[mr][mcc]) continue;
          var wp = GH.dungeons.mazeCellPos(lay.maze, size, mr, mcc);
          var wall = new THREE.Mesh(new THREE.BoxGeometry(mc, 7, mc), wallMat);
          wall.position.set(wp.x, 3.5, wp.z);
          group.add(wall);
        }
      }
    }
    if (lay.flux) {
      // the shifting floor: one plate per tile, recolored live
      fluxTiles = [];
      var half2 = size / 2;
      for (var fr = 0; fr < lay.flux.rows; fr++) {
        for (var fc = 0; fc < lay.flux.cols; fc++) {
          var tileMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(lay.flux.tile - 0.6, lay.flux.tile - 0.6),
            new THREE.MeshBasicMaterial({ color: 0x992211, transparent: true, opacity: 0.4, depthWrite: false }));
          tileMesh.rotation.x = -Math.PI / 2;
          var tx = -half2 + 20 + (fc + 0.5) * lay.flux.tile;
          var tz = lay.flux.zTop + (fr + 0.5) * lay.flux.tile;
          tileMesh.position.set(tx, 0.06, tz);
          tileMesh.userData.fx = tx;
          tileMesh.userData.fz = tz;
          group.add(tileMesh);
          fluxTiles.push(tileMesh);
        }
      }
    }
    if (lay.checkpoints) {
      cpMeshes = [];
      lay.checkpoints.forEach(function (cp, ci) {
        var ring = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.22, 4, 20),
          GH.assets.basic(ci === lay.checkpoints.length - 1 ? 0xffd050 : 0x60c8ff,
            { transparent: true, opacity: 0.8 }));
        ring.rotation.x = Math.PI / 2;
        ring.position.set(cp.x, 0.4, cp.z);
        group.add(ring);
        cpMeshes.push(ring);
      });
    }
    if (lay.objective) {
      objectiveMesh = GH.models.buildObjective(lay.objective.def.kind);
      objectiveMesh.position.set(lay.objective.x, 0, lay.objective.z);
      group.add(objectiveMesh);
    }
    if (lay.chest) {
      chestMesh = GH.models.buildChest();
      chestMesh.position.set(lay.chest.x, 0, lay.chest.z);
      group.add(chestMesh);
    }

    // ---- overworld landmarks: ruins, hulks, stains, roads ----
    if (!info.dungeon) {
      (lay.stains || []).forEach(function (stn) {
        var stain = new THREE.Mesh(new THREE.CircleGeometry(stn.r, 20),
          new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.16, depthWrite: false }));
        stain.rotation.x = -Math.PI / 2;
        stain.position.set(stn.x, 0.03, stn.z);
        group.add(stain);
      });
      (lay.ruins || []).forEach(function (rn) {
        if (rn.kind === 'hulk') {
          var hulk = GH.models.buildWreckSite();
          hulk.scale.setScalar(2.6);
          hulk.position.set(rn.x, 0, rn.z);
          group.add(hulk);
        } else {
          for (var rp = 0; rp < 7; rp++) {
            var ra = (rp / 7) * Math.PI * 2;
            var pillar = GH.models.buildPillar();
            pillar.position.set(rn.x + Math.cos(ra) * 9, 0, rn.z + Math.sin(ra) * 9);
            group.add(pillar);
          }
        }
      });
      // roads: worn strips from each edge gate toward the middle
      lay.gates.forEach(function (gt) {
        if (gt.arch) return; // dungeon mouths keep their mystery
        var len = Math.sqrt(gt.x * gt.x + gt.z * gt.z) * 0.82;
        var road = new THREE.Mesh(new THREE.PlaneGeometry(6, len),
          new THREE.MeshBasicMaterial({ color: 0xfff2d0, transparent: true, opacity: 0.1, depthWrite: false }));
        road.rotation.x = -Math.PI / 2;
        road.rotation.z = -Math.atan2(gt.x, gt.z);
        road.position.set(gt.x / 2, 0.04, gt.z / 2);
        group.add(road);
      });
    }

    // travel gates
    lay.gates.forEach(function (gt) {
      var toInfo = W.zoneInfo(gt.to);
      var mesh = GH.models.buildGate(gt.exit ? 'exit' : (toInfo.dungeon ? 'dungeon' : 'travel'));
      mesh.position.set(gt.x, 0, gt.z);
      // gates on the map edge face inward
      mesh.rotation.y = Math.atan2(-gt.x, -gt.z);
      group.add(mesh);
      gt.mesh = mesh;
    });

    // the hub: survivor camp + race sites (wreck territory only)
    if (zoneId === 'wreck') {
      var camp = new THREE.Group();
      camp.position.set(W.CAMP.x, 0, W.CAMP.z);
      camp.add(GH.models.buildCampFire());
      var stations = [
        { m: GH.models.buildBrokerTable(), x: -5, z: -3 },
        { m: GH.models.buildShrine(), x: 5, z: -3 },
        { m: GH.models.buildMemorialWall(), x: 0, z: -7 },
        { m: GH.models.buildSimConsole(), x: -5, z: 4 },
        { m: GH.models.buildPylonPair(0x60c8ff), x: 6, z: 5 }
      ];
      stations.forEach(function (s) {
        s.m.position.set(s.x, 0, s.z);
        camp.add(s.m);
      });
      group.add(camp);

      var path = W.circuitPath();
      for (var g = 0; g < W.CIRCUIT.gates; g++) {
        var pp = path[Math.floor(g * path.length / W.CIRCUIT.gates)];
        var next = path[(Math.floor(g * path.length / W.CIRCUIT.gates) + 1) % path.length];
        var ang = Math.atan2(next.x - pp.x, next.z - pp.z);
        var gate = GH.models.buildPylonPair(g === 0 ? 0xffd050 : 0x60c8ff);
        gate.position.set(pp.x, 0, pp.z);
        gate.rotation.y = ang;
        group.add(gate);
      }
    }

    scene.add(group);
    return {
      group: group, nestMeshes: nestMeshes, vaultMeshes: vaultMeshes,
      chestMesh: chestMesh, objectiveMesh: objectiveMesh,
      fluxTiles: fluxTiles, cpMeshes: cpMeshes,
      layout: lay, info: info
    };
  };

  // interact prompts for the loaded zone
  W.interactables = function (layout, zoneId) {
    var list = [];
    if (zoneId === 'wreck') {
      list.push(
        { kind: 'broker', x: W.CAMP.x - 5, z: W.CAMP.z - 3, label: 'TALK TO THE BROKER' },
        { kind: 'shrine', x: W.CAMP.x + 5, z: W.CAMP.z - 3, label: 'PRAY AT THE SHRINE (DEVOTIONS)' },
        { kind: 'memorial', x: W.CAMP.x, z: W.CAMP.z - 7, label: 'READ THE MEMORIAL (COLLECTION LOG)' },
        { kind: 'console', x: W.CAMP.x - 5, z: W.CAMP.z + 4, label: 'RUN SIM MISSIONS' },
        { kind: 'duel', x: W.CAMP.x + 6, z: W.CAMP.z + 5, label: 'ENTER THE TRACE DUEL' },
        { kind: 'circuit', x: W.CIRCUIT.x + W.CIRCUIT.r + 2, z: W.CIRCUIT.z, label: 'RACE THE SUNSPIRE CIRCUIT' }
      );
    }
    if (layout.relay) {
      list.push({ kind: 'relay', id: layout.relay.id, x: layout.relay.x, z: layout.relay.z, label: 'ACTIVATE THE RELAY (SIEGE)' });
    }
    if (layout.vault) {
      list.push({ kind: 'vault', id: layout.vault.id, x: layout.vault.x, z: layout.vault.z, label: 'BREACH THE VAULT (FIELD TRIAL)' });
    }
    if (layout.objective) {
      list.push({ kind: 'objective', x: layout.objective.x, z: layout.objective.z, label: 'AWAKEN ' + layout.objective.def.name + ' (DEFENSE)' });
    }
    if (layout.chest) {
      list.push({ kind: 'chest', x: layout.chest.x, z: layout.chest.z, label: 'OPEN THE REWARD CACHE' });
    }
    return list;
  };

  return W;
})();
