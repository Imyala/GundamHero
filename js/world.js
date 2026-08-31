// HERO FRAME — THE SHATTERED REACH
// One persistent continent: six biome territories with fixed danger (no
// scaling), husk nests that spawn until their cores are broken, corrupt-frame
// lairs guarding new shells, siege relays, a survivor camp you walk around,
// and two race sites for transformed frames. All layout is deterministic so
// the world is the same place every visit; what you break stays broken.
GH.world = (function () {
  var W = {};

  // continent grid: 3×2 cells of 80×80, centered on origin
  W.CELL = 80;
  W.BOUNDS = { x: 120, z: 80 };
  W.ZONES = [
    { id: 'glacier', cx: -80, cz: -40, danger: 2 },
    { id: 'wreck', cx: 0, cz: -40, danger: 1 },     // camp lives here
    { id: 'cloister', cx: 80, cz: -40, danger: 2 },
    { id: 'ember', cx: -80, cz: 40, danger: 3 },
    { id: 'storm', cx: 0, cz: 40, danger: 3 },
    { id: 'null', cx: 80, cz: 40, danger: 4 }
  ];

  W.CAMP = { x: 0, z: -52, r: 14 };
  W.CIRCUIT = { x: 80, z: -45, r: 18, gates: 10 };
  W.DUEL_PIT = { x: -14, z: -60 };

  W.zoneAt = function (x, z) {
    var best = W.ZONES[1], bd = 1e9;
    for (var i = 0; i < W.ZONES.length; i++) {
      var zn = W.ZONES[i];
      var d = GH.dist2(x, z, zn.cx, zn.cz);
      if (d < bd) { bd = d; best = zn; }
    }
    return best;
  };

  W.stageFor = function (zoneId) {
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

  // fixed world features, generated once (same every session)
  W.layout = function () {
    var nests = [], lairs = [], relays = [], vaults = [];
    W.ZONES.forEach(function (zn) {
      var rnd = zrng('reach:' + zn.id);
      var count = zn.id === 'wreck' ? 3 : 5;
      for (var i = 0; i < count; i++) {
        var nx = zn.cx + (rnd() - 0.5) * (W.CELL - 22);
        var nz = zn.cz + (rnd() - 0.5) * (W.CELL - 22);
        // keep clear of the camp and the circuit
        if (GH.dist2(nx, nz, W.CAMP.x, W.CAMP.z) < 26 * 26) { nx += 30; }
        if (GH.dist2(nx, nz, W.CIRCUIT.x, W.CIRCUIT.z) < 26 * 26) { nz += 30; }
        nests.push({
          id: zn.id + '_n' + i, zone: zn.id, x: nx, z: nz,
          hp: 120 * zn.danger, maxHp: 120 * zn.danger
        });
      }
      // one corrupt-frame lair per zone, far corner from the continent center
      var lx = zn.cx + (zn.cx >= 0 ? 1 : -1) * (W.CELL / 2 - 12);
      var lz = zn.cz + (zn.cz >= 0 ? 1 : -1) * (W.CELL / 2 - 12);
      lairs.push({
        id: 'lair_' + zn.id, zone: zn.id, x: lx, z: lz,
        boss: W.stageFor(zn.id).unlocks
      });
      // one sealed vault per territory, tucked in the corner opposite the lair
      var vx = zn.cx - (zn.cx >= 0 ? 1 : -1) * (W.CELL / 2 - 14);
      var vz = zn.cz - (zn.cz >= 0 ? 1 : -1) * (W.CELL / 2 - 14);
      if (GH.dist2(vx, vz, W.CAMP.x, W.CAMP.z) < 22 * 22) vx += 26;
      if (GH.dist2(vx, vz, W.CIRCUIT.x, W.CIRCUIT.z) < 24 * 24) vz -= 26;
      vaults.push({ id: 'vault_' + zn.id, zone: zn.id, x: vx, z: vz });
    });
    relays.push({ id: 'relay_wreck', zone: 'wreck', x: 28, z: -18 });
    relays.push({ id: 'relay_storm', zone: 'storm', x: -8, z: 52 });
    return { nests: nests, lairs: lairs, relays: relays, vaults: vaults };
  };

  // ---------------------------------------------------------------
  // Daily world state — everything keyed off the real UTC date so the
  // whole Reach shifts once a day, the same way for every pilot.
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

  // two territories carry a weather front each day
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

  // THE HARROW roams: a different territory every day (never the camp's)
  W.harrowToday = function () {
    var rnd = zrng('harrow:' + W.dayStamp());
    var candidates = W.ZONES.filter(function (z) { return z.id !== 'wreck'; });
    var zn = candidates[Math.floor(rnd() * candidates.length)];
    return {
      zone: zn.id,
      x: zn.cx + (rnd() - 0.5) * 30,
      z: zn.cz + (rnd() - 0.5) * 30
    };
  };

  // circuit centerline: a wobbled ring, sampled fine for AI + track checks
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
  // Build all world meshes into the scene. Returns handles for the
  // dynamic pieces (nest cores by id) so the sim can mark them dead.
  // ---------------------------------------------------------------
  W.build = function (scene, deadNests, lairsDown, vaultsOpen) {
    var group = new THREE.Group();
    var nestMeshes = {};
    var vaultMeshes = {};
    vaultsOpen = vaultsOpen || {};
    var mat = GH.assets.mat;

    // biome ground tiles
    W.ZONES.forEach(function (zn) {
      var tex = GH.assets.stageTex[zn.id];
      var ground = new THREE.Mesh(
        new THREE.PlaneGeometry(W.CELL + 0.5, W.CELL + 0.5),
        GH.assets.lambert({ map: tex.floor })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(zn.cx, 0, zn.cz);
      group.add(ground);

      // props per zone
      var st = W.stageFor(zn.id);
      var rnd = zrng('props:' + zn.id);
      for (var i = 0; i < 14; i++) {
        var kind = st.props[Math.floor(rnd() * st.props.length)];
        var p = GH.models.props[kind]();
        var px = zn.cx + (rnd() - 0.5) * (W.CELL - 10);
        var pz = zn.cz + (rnd() - 0.5) * (W.CELL - 10);
        if (GH.dist2(px, pz, W.CAMP.x, W.CAMP.z) < 20 * 20) continue;
        if (GH.dist2(px, pz, W.CIRCUIT.x, W.CIRCUIT.z) < 24 * 24) continue;
        p.position.set(px, 0, pz);
        group.add(p);
      }
    });

    // world features
    var lay = W.layout();
    lay.nests.forEach(function (n) {
      var nest = GH.models.buildNest(deadNests[n.id]);
      nest.position.set(n.x, 0, n.z);
      group.add(nest);
      nestMeshes[n.id] = nest;
    });
    lay.lairs.forEach(function (l) {
      var lair = GH.models.buildLair(lairsDown[l.zone]);
      lair.position.set(l.x, 0, l.z);
      group.add(lair);
    });
    lay.relays.forEach(function (r) {
      var relay = GH.models.buildRelay();
      relay.position.set(r.x, 0, r.z);
      group.add(relay);
    });
    lay.vaults.forEach(function (v) {
      var vault = GH.models.buildVault(vaultsOpen[v.id]);
      vault.position.set(v.x, 0, v.z);
      group.add(vault);
      vaultMeshes[v.id] = vault;
    });

    // the survivor camp: stations arranged around a fire
    var camp = new THREE.Group();
    camp.position.set(W.CAMP.x, 0, W.CAMP.z);
    camp.add(GH.models.buildCampFire());
    var stations = [
      { m: GH.models.buildBrokerTable(), x: -5, z: -3 },
      { m: GH.models.buildShrine(), x: 5, z: -3 },
      { m: GH.models.buildMemorialWall(), x: 0, z: -7 },
      { m: GH.models.buildSimConsole(), x: -5, z: 4 },
      { m: GH.models.buildPylonPair(0x60c8ff), x: 6, z: 5 } // duel pit gate
    ];
    stations.forEach(function (s) {
      s.m.position.set(s.x, 0, s.z);
      camp.add(s.m);
    });
    group.add(camp);

    // circuit track: gate pylons + start arch
    var path = W.circuitPath();
    for (var g = 0; g < W.CIRCUIT.gates; g++) {
      var p = path[Math.floor(g * path.length / W.CIRCUIT.gates)];
      var next = path[(Math.floor(g * path.length / W.CIRCUIT.gates) + 1) % path.length];
      var ang = Math.atan2(next.x - p.x, next.z - p.z);
      var gate = GH.models.buildPylonPair(g === 0 ? 0xffd050 : 0x60c8ff);
      gate.position.set(p.x, 0, p.z);
      gate.rotation.y = ang;
      group.add(gate);
    }

    scene.add(group);
    return { group: group, nestMeshes: nestMeshes, vaultMeshes: vaultMeshes, layout: lay };
  };

  // camp interactables + world features as one prompt list
  W.interactables = function (layout) {
    var list = [
      { kind: 'broker', x: W.CAMP.x - 5, z: W.CAMP.z - 3, label: 'TALK TO THE BROKER' },
      { kind: 'shrine', x: W.CAMP.x + 5, z: W.CAMP.z - 3, label: 'PRAY AT THE SHRINE (DEVOTIONS)' },
      { kind: 'memorial', x: W.CAMP.x, z: W.CAMP.z - 7, label: 'READ THE MEMORIAL (COLLECTION LOG)' },
      { kind: 'console', x: W.CAMP.x - 5, z: W.CAMP.z + 4, label: 'RUN SIM MISSIONS' },
      { kind: 'duel', x: W.CAMP.x + 6, z: W.CAMP.z + 5, label: 'ENTER THE TRACE DUEL' },
      { kind: 'circuit', x: W.CIRCUIT.x + W.CIRCUIT.r + 2, z: W.CIRCUIT.z, label: 'RACE THE SUNSPIRE CIRCUIT' }
    ];
    layout.relays.forEach(function (r) {
      list.push({ kind: 'relay', id: r.id, x: r.x, z: r.z, label: 'ACTIVATE THE RELAY (SIEGE)' });
    });
    layout.vaults.forEach(function (v) {
      list.push({ kind: 'vault', id: v.id, x: v.x, z: v.z, label: 'BREACH THE VAULT (FIELD TRIAL)' });
    });
    return list;
  };

  return W;
})();
