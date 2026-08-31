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
    if (zoneId.indexOf('dungeon_') === 0) {
      var parent = zoneId.slice(8);
      var pz = W.zoneById(parent);
      return {
        id: zoneId, dungeon: true, parent: parent,
        danger: Math.min(4, pz.danger + 1),
        size: W.DUNGEON_SIZE,
        name: W.stageFor(parent).name + ' DEPTHS'
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
    if (zoneId && zoneId.indexOf('dungeon_') === 0) zoneId = zoneId.slice(8);
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
      // the dungeon gate sits deep in the territory
      var dgx = (rnd() - 0.5) * (size * 0.5);
      var dgz = (rnd() - 0.5) * (size * 0.5);
      if (zoneId === 'wreck') { dgx = -140; dgz = -120; } // clear of the hub
      lay.dungeonGate = { to: 'dungeon_' + zoneId, x: dgx, z: dgz };
      lay.gates.push(lay.dungeonGate);

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
    } else {
      // DUNGEON: exit gate south, guardian packs along the hall,
      // the sealed vault mid-depth, the corrupt-frame lair at the end
      lay.gates.push({ to: info.parent, x: 0, z: half - 16, exit: true });
      var packs = 5;
      for (var p = 0; p < packs; p++) {
        lay.packs.push({
          x: (rnd() - 0.5) * (size - 70),
          z: half - 50 - p * ((size - 90) / packs) + (rnd() - 0.5) * 24,
          n: 3 + Math.floor(rnd() * 3)
        });
      }
      lay.vault = { id: 'vault_' + info.parent, zone: info.parent, x: (rnd() < 0.5 ? -1 : 1) * (half - 45), z: 0 };
      lay.lair = { id: 'lair_' + info.parent, zone: info.parent, x: 0, z: -half + 30, boss: W.stageFor(info.parent).unlocks };
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

    // props: dense enough to feel like terrain, not a floor
    var rnd = zrng('props:' + zoneId);
    var propCount = info.dungeon ? 46 : 150;
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

    // travel gates
    lay.gates.forEach(function (gt) {
      var toInfo = gt.to.indexOf('dungeon_') === 0 ? { dungeon: true } : W.zoneInfo(gt.to);
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
    return { group: group, nestMeshes: nestMeshes, vaultMeshes: vaultMeshes, layout: lay, info: info };
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
    return list;
  };

  return W;
})();
