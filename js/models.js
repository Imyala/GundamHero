// HERO FRAME — low-poly procedural meshes (mechs, enemies, pickups, props)
GH.models = (function () {
  var M = {};
  var mat = function (c, o) { return GH.assets.mat(c, o); };
  var box = function (w, h, d, c) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  };

  function blobShadow(g, size) {
    var sh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), GH.assets.shadowMat);
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.02;
    g.add(sh);
  }

  // ---------------------------------------------------------------
  // Humanoid mech. cfg: { body, accent, dark, trim, prop, corrupt }
  // Chunky fifth-gen proportions: broad chest, pauldrons, thrusters.
  // ---------------------------------------------------------------
  M.buildMech = function (cfg) {
    var g = new THREE.Group();
    var body = cfg.body, accent = cfg.accent;
    var dark = cfg.dark || 0x30343a;
    var trim = cfg.trim || accent;
    if (cfg.corrupt) {
      body = 0x2c2430; dark = 0x141018; trim = 0x584050; accent = 0xff2838;
    }
    var parts = {};

    // ---- legs ----
    var legL = new THREE.Group(), legR = new THREE.Group();
    [legL, legR].forEach(function (leg, i) {
      var hip = box(0.3, 0.22, 0.34, dark); hip.position.y = 0.02;
      var thigh = box(0.36, 0.52, 0.4, body); thigh.position.y = -0.3;
      var knee = box(0.3, 0.16, 0.32, trim); knee.position.y = -0.6;
      var shin = box(0.3, 0.48, 0.34, dark); shin.position.y = -0.85;
      var foot = box(0.4, 0.18, 0.62, body); foot.position.set(0, -1.12, 0.1);
      var toe = box(0.32, 0.12, 0.16, dark); toe.position.set(0, -1.14, 0.44);
      leg.add(hip, thigh, knee, shin, foot, toe);
      leg.position.set(i === 0 ? -0.28 : 0.28, 1.22, 0);
      g.add(leg);
    });
    parts.legL = legL; parts.legR = legR;

    // ---- waist/torso group (rotates toward aim) ----
    var torso = new THREE.Group();
    var waist = box(0.6, 0.24, 0.44, dark); waist.position.y = -0.14;
    var chest = box(1.0, 0.62, 0.66, body); chest.position.y = 0.32;
    var chestTop = box(0.8, 0.2, 0.7, trim); chestTop.position.y = 0.64;
    var vent = box(0.5, 0.16, 0.1, accent); vent.position.set(0, 0.34, 0.36);
    var cockpit = box(0.24, 0.14, 0.08, cfg.corrupt ? 0xff2838 : 0x202830);
    cockpit.position.set(0, 0.55, 0.38);
    torso.add(waist, chest, chestTop, vent, cockpit);

    // backpack + thrusters
    var pack = box(0.7, 0.5, 0.24, dark); pack.position.set(0, 0.4, -0.42);
    torso.add(pack);
    var flames = [];
    [-0.22, 0.22].forEach(function (x) {
      var nozzle = box(0.16, 0.2, 0.16, 0x1a1a20);
      nozzle.position.set(x, 0.12, -0.44);
      torso.add(nozzle);
      var flame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.55, 4),
        GH.assets.basic(0x70c0ff, { transparent: true, opacity: 0.85 }));
      flame.rotation.x = Math.PI;
      flame.position.set(x, -0.28, -0.44);
      flame.visible = false;
      torso.add(flame);
      flames.push(flame);
    });
    parts.flames = flames;

    // ---- head ----
    var head = box(0.44, 0.38, 0.46, body); head.position.y = 0.98;
    var visor = box(0.36, 0.1, 0.06, accent); visor.position.set(0, 0.98, 0.25);
    var chin = box(0.2, 0.1, 0.1, dark); chin.position.set(0, 0.86, 0.24);
    var crest = box(0.08, 0.32, 0.34, trim); crest.position.set(0, 1.22, -0.02);
    var antenna = box(0.03, 0.34, 0.03, dark); antenna.position.set(0.2, 1.3, -0.1);
    torso.add(head, visor, chin, crest, antenna);
    parts.visor = visor;

    // ---- arms ----
    var armL = new THREE.Group(), armR = new THREE.Group();
    [armL, armR].forEach(function (arm, i) {
      var side = i === 0 ? -1 : 1;
      var pad = box(0.5, 0.36, 0.54, trim); pad.position.set(side * 0.06, 0.16, 0);
      var padTop = box(0.42, 0.1, 0.46, accent); padTop.position.set(side * 0.06, 0.38, 0);
      var upper = box(0.28, 0.5, 0.3, body); upper.position.y = -0.2;
      var elbow = box(0.22, 0.12, 0.24, dark); elbow.position.y = -0.46;
      var fore = box(0.3, 0.34, 0.32, dark); fore.position.y = -0.66;
      var fist = box(0.26, 0.22, 0.26, body); fist.position.y = -0.88;
      arm.add(pad, padTop, upper, elbow, fore, fist);
      arm.position.set(side * 0.76, 0.48, 0);
      torso.add(arm);
    });
    parts.armL = armL; parts.armR = armR;

    torso.position.y = 1.72;
    g.add(torso);
    parts.torso = torso;

    // ---- archetype props ----
    addProp(cfg.prop, parts, accent, trim);

    blobShadow(g, 2.1);
    g.userData.parts = parts;
    return g;
  };

  function addProp(prop, parts, accent, trim) {
    var armL = parts.armL, armR = parts.armR;
    if (prop === 'sword') {
      var sword = new THREE.Group();
      var blade = box(0.12, 1.7, 0.3, 0xd8dce8); blade.position.y = 1.05;
      var edge = box(0.06, 1.7, 0.34, 0xf0f4ff); edge.position.y = 1.05;
      var guard = box(0.4, 0.1, 0.4, accent); guard.position.y = 0.18;
      var grip = box(0.1, 0.34, 0.1, 0x503820); grip.position.y = -0.04;
      sword.add(blade, edge, guard, grip);
      sword.position.set(0.08, -0.88, 0.2);
      sword.rotation.x = 0.35; // resting cant so the blade clears the pauldron
      armR.add(sword);
      parts.weapon = sword;
      // forearm heater shield: small, outboard, riding the left forearm
      var shield = new THREE.Group();
      var plate = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.08, 6), mat(0x14141a));
      plate.rotation.x = Math.PI / 2;
      var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.05, 6), mat(0xd8b040));
      rim.rotation.x = Math.PI / 2; rim.position.z = -0.02;
      var bossM = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.12, 6), mat(0xd8b040));
      bossM.rotation.x = Math.PI / 2; bossM.position.z = 0.06;
      shield.add(rim, plate, bossM);
      shield.position.set(-0.3, -0.72, 0.1);
      armL.add(shield);
      parts.shield = shield;
    } else if (prop === 'guns') {
      [armL, armR].forEach(function (arm) {
        var gun = new THREE.Group();
        var housing = box(0.24, 0.26, 0.5, 0x383840); housing.position.set(0, 0, 0.15);
        var barrel = box(0.1, 0.1, 0.8, 0x1c1c22); barrel.position.set(-0.05, 0.04, 0.7);
        var barrel2 = box(0.1, 0.1, 0.8, 0x1c1c22); barrel2.position.set(0.05, -0.04, 0.7);
        var muzzle = box(0.24, 0.24, 0.1, accent); muzzle.position.set(0, 0, 1.05);
        gun.add(housing, barrel, barrel2, muzzle);
        gun.position.set(0, -0.88, 0.1);
        arm.add(gun);
        if (!parts.muzzles) parts.muzzles = [];
        var mz = new THREE.Sprite(new THREE.SpriteMaterial({
          map: GH.assets.flashTex, transparent: true, depthWrite: false
        }));
        mz.scale.setScalar(0.9);
        mz.position.set(0, 0, 1.2);
        mz.visible = false;
        gun.add(mz);
        parts.muzzles.push(mz);
      });
      parts.weapon = armR;
    } else if (prop === 'staff') {
      var staff = new THREE.Group();
      var pole = box(0.1, 2.1, 0.1, 0x403050); pole.position.y = 0.45;
      var cage = box(0.3, 0.34, 0.3, trim); cage.position.y = 1.5;
      var gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.3),
        mat(accent, { emissive: accent, emissiveIntensity: 0.7 }));
      gem.position.y = 1.52;
      staff.add(pole, cage, gem);
      staff.position.set(0, -0.88, 0.12);
      armR.add(staff);
      parts.weapon = staff; parts.gem = gem;
    } else if (prop === 'scythe') {
      var scy = new THREE.Group();
      var pole2 = box(0.1, 2.3, 0.1, 0x22222a); pole2.position.y = 0.55;
      var neck = box(0.16, 0.16, 0.3, accent); neck.position.set(0.07, 1.65, 0);
      var bladeArm = box(0.95, 0.12, 0.24, 0xc8ccd8); bladeArm.position.set(0.5, 1.65, 0);
      var tip = box(0.4, 0.1, 0.18, 0xdfe4f0); tip.position.set(1.0, 1.5, 0); tip.rotation.z = -0.75;
      scy.add(pole2, neck, bladeArm, tip);
      scy.position.set(0, -0.88, 0.12);
      armR.add(scy);
      parts.weapon = scy;
    } else if (prop === 'lance') {
      var lance = new THREE.Group();
      var shaft = box(0.14, 0.14, 1.9, 0x505868); shaft.position.z = 0.7;
      var coil1 = box(0.26, 0.26, 0.12, accent); coil1.position.z = 1.1;
      var coil2 = box(0.26, 0.26, 0.12, accent); coil2.position.z = 1.4;
      var point = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 4),
        mat(accent, { emissive: accent, emissiveIntensity: 0.5 }));
      point.rotation.x = Math.PI / 2; point.position.z = 1.95;
      lance.add(shaft, coil1, coil2, point);
      lance.position.set(0, -0.88, 0);
      armR.add(lance);
      parts.weapon = lance;
    } else if (prop === 'claws') {
      [armL, armR].forEach(function (arm) {
        var claw = new THREE.Group();
        for (var i = 0; i < 3; i++) {
          var talon = box(0.05, 0.08, 0.6, 0xe0e4f0);
          talon.position.set((i - 1) * 0.1, 0, 0.35);
          talon.rotation.x = -0.1;
          claw.add(talon);
        }
        var wrist = box(0.28, 0.2, 0.2, accent);
        claw.add(wrist);
        claw.position.set(0, -0.9, 0.15);
        arm.add(claw);
      });
      parts.weapon = armR;
    } else if (prop === 'daggers') {
      [armL, armR].forEach(function (arm) {
        var dg = new THREE.Group();
        var bladeD = box(0.07, 0.55, 0.16, 0xe8ecf8); bladeD.position.y = -0.3;
        var hilt = box(0.2, 0.07, 0.2, accent); hilt.position.y = 0;
        dg.add(bladeD, hilt);
        dg.rotation.x = Math.PI;
        dg.position.set(0, -0.95, 0.14);
        arm.add(dg);
      });
      parts.weapon = armR;
    } else if (prop === 'mortar') {
      var tube = new THREE.Group();
      var barrel3 = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1.3, 7), mat(0x3a4048));
      barrel3.rotation.x = Math.PI / 2 - 0.5;
      barrel3.position.set(0, 0.3, 0.3);
      var baseP = box(0.5, 0.3, 0.5, accent); baseP.position.y = -0.05;
      tube.add(barrel3, baseP);
      tube.position.set(0, 0.62, -0.15);
      parts.torso.add(tube);
      parts.weapon = tube;
    }
  }

  // ---------------------------------------------------------------
  // Enemies
  // ---------------------------------------------------------------
  M.buildHusk = function (scale, color) {
    var g = new THREE.Group();
    var c = color || 0x9a9a92;
    var torso = box(0.6, 0.7, 0.4, c); torso.position.y = 1.2;
    var ribs = box(0.64, 0.08, 0.42, 0x6a6a62); ribs.position.y = 1.1;
    var head = box(0.34, 0.3, 0.34, c); head.position.y = 1.75;
    var eye = box(0.26, 0.06, 0.05, 0xff3020); eye.position.set(0, 1.77, 0.18);
    var legL = box(0.18, 0.85, 0.2, c); legL.position.set(-0.18, 0.45, 0);
    var legR = box(0.18, 0.85, 0.2, c); legR.position.set(0.18, 0.45, 0);
    var armL = box(0.14, 0.6, 0.16, c); armL.position.set(-0.42, 1.2, 0);
    var armR = box(0.14, 0.6, 0.16, c); armR.position.set(0.42, 1.2, 0);
    g.add(torso, ribs, head, eye, legL, legR, armL, armR);
    g.userData.limbs = { legL: legL, legR: legR, armL: armL, armR: armR };
    blobShadow(g, 1.3);
    if (scale && scale !== 1) g.scale.setScalar(scale);
    return g;
  };

  M.buildShardling = function (color) {
    var g = new THREE.Group();
    var c = color || 0x38c8b8;
    var core = new THREE.Mesh(new THREE.OctahedronGeometry(0.34), mat(c, { emissive: 0x0a4038 }));
    core.position.y = 0.62;
    core.scale.y = 1.35;
    g.add(core);
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2;
      var leg = box(0.07, 0.5, 0.07, c);
      leg.position.set(Math.cos(a) * 0.3, 0.3, Math.sin(a) * 0.3);
      leg.rotation.z = Math.cos(a) * 0.5;
      leg.rotation.x = -Math.sin(a) * 0.5;
      g.add(leg);
    }
    blobShadow(g, 0.9);
    g.userData.core = core;
    return g;
  };

  M.buildOrb = function () {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), mat(0x2848c8, { emissive: 0x101c60 }));
    body.position.y = 0.9;
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 4, 10), mat(0x70a0ff, { emissive: 0x2040a0 }));
    ring.position.y = 0.9;
    ring.rotation.x = Math.PI / 2;
    g.add(body, ring);
    g.userData.core = body; g.userData.ring = ring;
    blobShadow(g, 1.1);
    return g;
  };

  M.buildSpiker = function () {
    var g = new THREE.Group();
    var c = 0x40c840;
    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), mat(c, { emissive: 0x104010 }));
    core.position.y = 0.5;
    g.add(core);
    for (var i = 0; i < 8; i++) {
      var spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.42, 4), mat(c));
      var a = (i / 8) * Math.PI * 2;
      spike.position.set(Math.cos(a) * 0.36, 0.5, Math.sin(a) * 0.36);
      spike.rotation.z = -a - Math.PI / 2;
      spike.rotation.order = 'YZX';
      spike.rotation.y = -Math.PI / 2;
      g.add(spike);
    }
    blobShadow(g, 0.9);
    g.userData.core = core;
    return g;
  };

  M.buildCreeper = function () {
    // vine-wrapped crawler
    var g = new THREE.Group();
    var body = box(0.7, 0.4, 0.9, 0x3a5a28); body.position.y = 0.35;
    var moss = box(0.74, 0.12, 0.7, 0x58a038); moss.position.y = 0.56;
    var head = box(0.3, 0.26, 0.3, 0x3a5a28); head.position.set(0, 0.45, 0.55);
    var eye = box(0.2, 0.05, 0.04, 0xd0ff40); eye.position.set(0, 0.48, 0.71);
    g.add(body, moss, head, eye);
    for (var i = 0; i < 4; i++) {
      var leg = box(0.1, 0.36, 0.1, 0x2a4018);
      leg.position.set(i < 2 ? -0.4 : 0.4, 0.18, (i % 2) ? 0.3 : -0.3);
      g.add(leg);
      if (i === 0) g.userData.leg = leg;
    }
    blobShadow(g, 1.2);
    return g;
  };

  M.buildCinder = function () {
    // ember imp
    var g = new THREE.Group();
    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 0),
      mat(0xff6020, { emissive: 0x802000 }));
    core.position.y = 0.75;
    var crown = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 4), mat(0x301008));
    crown.position.y = 1.1;
    g.add(core, crown);
    for (var i = 0; i < 2; i++) {
      var legC = box(0.09, 0.5, 0.09, 0x301008);
      legC.position.set(i === 0 ? -0.16 : 0.16, 0.28, 0);
      g.add(legC);
    }
    blobShadow(g, 0.9);
    g.userData.core = core;
    return g;
  };

  M.buildVolt = function () {
    // storm wisp
    var g = new THREE.Group();
    var core = new THREE.Mesh(new THREE.OctahedronGeometry(0.32),
      mat(0x80c0ff, { emissive: 0x2050a0 }));
    core.position.y = 1.0;
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 8),
      mat(0xd0e8ff, { emissive: 0x4060c0 }));
    ring.position.y = 1.0;
    ring.rotation.x = 1.2;
    g.add(core, ring);
    g.userData.core = core; g.userData.ring = ring;
    blobShadow(g, 0.8);
    return g;
  };

  M.buildWarden = function () {
    var g = M.buildHusk(2.2, 0x8a8078);
    var pauldronL = box(0.5, 0.3, 0.5, 0x5a5048); pauldronL.position.set(-0.55, 1.55, 0);
    var pauldronR = box(0.5, 0.3, 0.5, 0x5a5048); pauldronR.position.set(0.55, 1.55, 0);
    var club = box(0.28, 1.4, 0.28, 0x4a4038); club.position.set(0.62, 0.9, 0.2);
    g.add(pauldronL, pauldronR, club);
    return g;
  };

  M.buildCarapace = function () {
    // armored crystal spider broodmother
    var g = new THREE.Group();
    var c = 0x40b8a8;
    var shell = new THREE.Mesh(new THREE.SphereGeometry(1.1, 7, 5), mat(0x2a4a44, { emissive: 0x0a1c18 }));
    shell.position.y = 1.0;
    shell.scale.y = 0.75;
    g.add(shell);
    for (var i = 0; i < 7; i++) {
      var cry = new THREE.Mesh(new THREE.OctahedronGeometry(GH.rand(0.18, 0.34)),
        mat(c, { emissive: 0x0a5048 }));
      cry.position.set(GH.rand(-0.7, 0.7), GH.rand(1.1, 1.7), GH.rand(-0.5, 0.5));
      cry.rotation.set(Math.random(), Math.random(), Math.random());
      g.add(cry);
    }
    for (var j = 0; j < 6; j++) {
      var a = (j / 6) * Math.PI * 2;
      var leg = box(0.12, 0.9, 0.12, 0x1c332e);
      leg.position.set(Math.cos(a) * 1.1, 0.45, Math.sin(a) * 1.1);
      leg.rotation.z = Math.cos(a) * 0.7;
      leg.rotation.x = -Math.sin(a) * 0.7;
      g.add(leg);
    }
    var eyeRow = box(0.5, 0.08, 0.06, 0xff3040);
    eyeRow.position.set(0, 1.0, 1.05);
    g.add(eyeRow);
    blobShadow(g, 3.2);
    return g;
  };

  // ---------------------------------------------------------------
  // Pickups
  // ---------------------------------------------------------------
  M.buildSpark = function (size) {
    // sparks (XP): 0 small teal / 1 med green / 2 big violet
    var colors = [0x38d8c8, 0x48d048, 0xa050e8];
    var radii = [0.16, 0.22, 0.3];
    var m = new THREE.Mesh(new THREE.OctahedronGeometry(radii[size]),
      mat(colors[size], { emissive: colors[size], emissiveIntensity: 0.4 }));
    m.scale.y = 1.5;
    return m;
  };

  M.buildGemDrop = function (typeId) {
    var t = GH.gems.types[typeId];
    var g = new THREE.Group();
    var m = new THREE.Mesh(new THREE.OctahedronGeometry(0.3),
      mat(t.color, { emissive: t.color, emissiveIntensity: 0.5 }));
    m.scale.y = 1.3;
    g.add(m);
    var halo = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 4, 10),
      GH.assets.basic(t.color, { transparent: true, opacity: 0.6 }));
    halo.rotation.x = Math.PI / 2;
    g.add(halo);
    g.userData.spin = m;
    return g;
  };

  M.buildHeart = function () {
    var g = new THREE.Group();
    var m = mat(0xf050b0, { emissive: 0x701040 });
    var a = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), m); a.position.x = -0.09;
    var b = new THREE.Mesh(new THREE.SphereGeometry(0.13, 6, 5), m); b.position.x = 0.09;
    var c = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.3, 4), m);
    c.position.y = -0.16; c.rotation.x = Math.PI; c.rotation.y = Math.PI / 4;
    g.add(a, b, c);
    return g;
  };

  M.buildCoin = function () {
    var m = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 8),
      mat(0xe83838, { emissive: 0x601010 }));
    m.rotation.x = Math.PI / 2;
    return m;
  };

  M.buildCipher = function () {
    // a glowing signal shard
    var g = new THREE.Group();
    var core = new THREE.Mesh(new THREE.OctahedronGeometry(0.26),
      mat(0x60e8ff, { emissive: 0x2080a0, emissiveIntensity: 0.8 }));
    core.scale.y = 1.6;
    g.add(core);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 4, 12),
      GH.assets.basic(0x60e8ff, { transparent: true, opacity: 0.7 }));
    ring.rotation.x = Math.PI / 2;
    g.add(ring);
    g.userData.spin = core;
    return g;
  };

  M.buildCache = function () {
    // a supply cache crate
    var g = new THREE.Group();
    var crate = box(0.55, 0.4, 0.42, 0x8a7040);
    crate.position.y = 0.05;
    var lid = box(0.58, 0.12, 0.45, 0xb09050); lid.position.y = 0.3;
    var band = box(0.6, 0.08, 0.1, 0xf0d060); band.position.y = 0.1;
    var glow = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.04, 4, 12),
      GH.assets.basic(0xffd050, { transparent: true, opacity: 0.7 }));
    glow.rotation.x = Math.PI / 2;
    glow.position.y = 0.1;
    g.add(crate, lid, band, glow);
    return g;
  };

  M.buildPico = function (shape) {
    // tiny cosmetic companion drone
    var g = new THREE.Group();
    var m;
    var pm = mat(0xd0e0ff, { emissive: 0x4060a0, emissiveIntensity: 0.5 });
    if (shape === 'cube') m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), pm);
    else if (shape === 'prism') m = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 3), pm);
    else if (shape === 'ring') {
      m = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.05, 4, 8), pm);
    } else {
      m = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), pm);
    }
    g.add(m);
    var winglet = box(0.3, 0.03, 0.08, 0x385868);
    winglet.position.y = -0.12;
    g.add(winglet);
    return g;
  };

  M.buildShrub = function () {
    var g = new THREE.Group();
    var pot = box(0.24, 0.2, 0.24, 0x4a3828); pot.position.y = 0.1;
    var bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0),
      mat(0x48c058, { emissive: 0x104818 }));
    bush.position.y = 0.42;
    g.add(pot, bush);
    return g;
  };

  // ---------------------------------------------------------------
  // World structures (The Shattered Reach)
  // ---------------------------------------------------------------
  M.buildNest = function (dead) {
    var g = new THREE.Group();
    var c = dead ? 0x4a4a46 : 0x6a5a48;
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2 + 0.4;
      var spike = new THREE.Mesh(new THREE.ConeGeometry(0.5, GH.rand(2.2, 3.4), 5), mat(c));
      spike.position.set(Math.cos(a) * 1.4, 1.1, Math.sin(a) * 1.4);
      spike.rotation.z = Math.cos(a) * 0.4;
      spike.rotation.x = -Math.sin(a) * 0.4;
      g.add(spike);
    }
    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0),
      dead ? mat(0x2a2a28) : mat(0xd04030, { emissive: 0x601008, emissiveIntensity: 0.7 }));
    core.position.y = 1.4;
    g.add(core);
    g.userData.core = core;
    blobShadow(g, 4);
    return g;
  };

  M.buildLair = function (down) {
    var g = new THREE.Group();
    var arch1 = box(0.8, 5, 0.8, 0x3a3440); arch1.position.set(-2.2, 2.5, 0);
    var arch2 = box(0.8, 5, 0.8, 0x3a3440); arch2.position.set(2.2, 2.5, 0);
    var lintel = box(5.6, 0.8, 0.9, 0x2a2430); lintel.position.y = 5.2;
    g.add(arch1, arch2, lintel);
    var eye = new THREE.Mesh(new THREE.OctahedronGeometry(0.5),
      down ? mat(0x333333) : mat(0xff2838, { emissive: 0x800a10, emissiveIntensity: 0.9 }));
    eye.position.y = 4.2;
    g.add(eye);
    g.userData.eye = eye;
    blobShadow(g, 5);
    return g;
  };

  M.buildRelay = function () {
    var g = new THREE.Group();
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 6, 6), mat(0x707880));
    mast.position.y = 3;
    var dish = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.8, 8), mat(0x9aa0a8));
    dish.position.y = 6.2;
    dish.rotation.x = Math.PI;
    var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5),
      mat(0xffd050, { emissive: 0x806010, emissiveIntensity: 0.8 }));
    lamp.position.y = 6.6;
    g.add(mast, dish, lamp);
    blobShadow(g, 3);
    return g;
  };

  // travel gate: a standing ring you walk through to change zones.
  // kinds: 'travel' (territory link, blue), 'dungeon' (violet maw),
  // 'exit' (back to the surface, warm gold)
  M.buildGate = function (kind) {
    var g = new THREE.Group();
    var glow = kind === 'dungeon' ? 0xc050ff : kind === 'exit' ? 0xffd050 :
      kind === 'deeper' ? 0xff4050 : 0x60c8ff;
    var stone = kind === 'dungeon' || kind === 'deeper' ? 0x241f2c : 0x3a4450;
    var jambL = box(1.0, 5.4, 1.0, stone); jambL.position.set(-2.6, 2.7, 0);
    var jambR = box(1.0, 5.4, 1.0, stone); jambR.position.set(2.6, 2.7, 0);
    var lintel = box(6.6, 1.0, 1.1, stone); lintel.position.y = 5.6;
    g.add(jambL, jambR, lintel);
    var veil = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 4.6),
      GH.assets.basic(glow, { transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false }));
    veil.position.y = 2.8;
    g.add(veil);
    g.userData.veil = veil;
    var lampL = new THREE.Mesh(new THREE.OctahedronGeometry(0.3),
      GH.assets.basic(glow, { transparent: true, opacity: 0.95 }));
    lampL.position.set(-2.6, 5.9, 0);
    var lampR = lampL.clone();
    lampR.position.x = 2.6;
    g.add(lampL, lampR);
    blobShadow(g, 5);
    return g;
  };

  // CONVOY hauler: a heavy six-legged cargo crawler
  M.buildHauler = function () {
    var g = new THREE.Group();
    var hull = box(3.2, 2.0, 4.6, 0x6a6248); hull.position.y = 2.0;
    var cab = box(2.2, 1.2, 1.4, 0x7a7258); cab.position.set(0, 3.2, 1.8);
    var lamp = new THREE.Mesh(new THREE.SphereGeometry(0.24, 6, 5),
      GH.assets.basic(0xffd050, { transparent: true, opacity: 0.95 }));
    lamp.position.set(0, 4.0, 2.2);
    g.add(hull, cab, lamp);
    var legs = [];
    [[-1.6, 1.6], [1.6, 1.6], [-1.6, 0], [1.6, 0], [-1.6, -1.6], [1.6, -1.6]].forEach(function (p) {
      var leg = box(0.5, 1.6, 0.5, 0x4a4436);
      leg.position.set(p[0], 0.8, p[1]);
      g.add(leg);
      legs.push(leg);
    });
    g.userData.legs = legs;
    g.userData.core = lamp;
    blobShadow(g, 5);
    return g;
  };

  // BASTION objectives: the ancient relic on its pedestal, per flavor
  M.buildObjective = function (kind) {
    var g = new THREE.Group();
    var base = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 0.8, 8), mat(0x3a3642));
    base.position.y = 0.4;
    g.add(base);
    var top = null;
    if (kind === 'mech') {
      top = M.buildMech({ body: 0x6a6a70, accent: 0x6a6a70, dark: 0x3a3a40, trim: 0x55555c, prop: 'sword' });
      top.scale.setScalar(1.5);
      top.position.y = 0.8;
    } else if (kind === 'crystal') {
      top = new THREE.Mesh(new THREE.OctahedronGeometry(1.6),
        mat(0x80d8ff, { emissive: 0x2a5a80, emissiveIntensity: 0.8 }));
      top.position.y = 2.8;
    } else if (kind === 'orb') {
      top = new THREE.Mesh(new THREE.SphereGeometry(1.3, 10, 8),
        mat(0x90f0a0, { emissive: 0x2a6030, emissiveIntensity: 0.8 }));
      top.position.y = 2.4;
    } else if (kind === 'forge') {
      top = new THREE.Group();
      var block = box(2.4, 1.4, 1.6, 0x40342c); block.position.y = 1.5;
      var emberGlow = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.3, 1.2),
        GH.assets.basic(0xff7030, { transparent: true, opacity: 0.9 }));
      emberGlow.position.y = 2.3;
      top.add(block, emberGlow);
    } else if (kind === 'capacitor') {
      top = new THREE.Group();
      [-0.8, 0, 0.8].forEach(function (x) {
        var coil = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.6, 6),
          mat(0x9090c0, { emissive: 0x303060, emissiveIntensity: 0.6 }));
        coil.position.set(x, 2.1, 0);
        top.add(coil);
      });
    } else { // archive
      top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.4, 1.2),
        mat(0x241f2c, { emissive: 0x50208a, emissiveIntensity: 0.5 }));
      top.position.y = 2.5;
    }
    g.add(top);
    g.userData.core = top;
    blobShadow(g, 5);
    return g;
  };

  // dungeon reward cache: a heavy chest with a light seam
  M.buildChest = function () {
    var g = new THREE.Group();
    var body = box(2.0, 1.0, 1.3, 0x5a4a2a); body.position.y = 0.5;
    var lid = box(2.1, 0.5, 1.4, 0x6a5a36); lid.position.y = 1.2;
    var band = box(2.15, 0.2, 1.45, 0xd8b040); band.position.y = 0.95;
    var seam = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.1, 1.35),
      GH.assets.basic(0xffe080, { transparent: true, opacity: 0.9 }));
    seam.position.y = 1.0;
    g.add(body, lid, band, seam);
    g.userData.core = seam;
    blobShadow(g, 3);
    return g;
  };

  // ---- the cipher-hall puzzle kit ----
  // beam emitter: a lensed pylon, always live
  M.buildEmitter = function () {
    var g = new THREE.Group();
    var base = box(1.6, 0.6, 1.6, 0x3a4450); base.position.y = 0.3;
    var stem = box(0.7, 2.2, 0.7, 0x2a3038); stem.position.y = 1.7;
    var head = box(1.2, 1.0, 1.2, 0x3a4450); head.position.y = 3.0;
    g.add(base, stem, head);
    var lens = new THREE.Mesh(new THREE.OctahedronGeometry(0.55),
      GH.assets.basic(0x60e0ff, { transparent: true, opacity: 0.95 }));
    lens.position.y = 3.0;
    g.add(lens);
    g.userData.lens = lens;
    blobShadow(g, 2.4);
    return g;
  };

  // beam receptor: a cradle whose eye lights when the beam arrives
  M.buildReceptor = function () {
    var g = new THREE.Group();
    var base = box(1.8, 0.5, 1.8, 0x3a4450); base.position.y = 0.25;
    var prongL = box(0.4, 2.6, 0.4, 0x2a3038); prongL.position.set(-0.7, 1.5, 0);
    var prongR = box(0.4, 2.6, 0.4, 0x2a3038); prongR.position.set(0.7, 1.5, 0);
    g.add(base, prongL, prongR);
    var eye = new THREE.Mesh(new THREE.OctahedronGeometry(0.5),
      GH.assets.basic(0x60e0ff, { transparent: true, opacity: 0.25 }));
    eye.position.y = 2.4;
    g.add(eye);
    g.userData.eye = eye;
    blobShadow(g, 2.4);
    return g;
  };

  // carryable beam relay: a tripod holding a floating prism
  M.buildRelay = function () {
    var g = new THREE.Group();
    for (var i = 0; i < 3; i++) {
      var a = (i / 3) * Math.PI * 2;
      var leg = box(0.22, 1.4, 0.22, 0x2a3038);
      leg.position.set(Math.cos(a) * 0.5, 0.6, Math.sin(a) * 0.5);
      leg.rotation.z = Math.cos(a) * 0.35;
      leg.rotation.x = -Math.sin(a) * 0.35;
      g.add(leg);
    }
    var prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.45),
      GH.assets.basic(0x8ae8ff, { transparent: true, opacity: 0.9 }));
    prism.position.y = 1.6;
    g.add(prism);
    g.userData.prism = prism;
    blobShadow(g, 1.6);
    return g;
  };

  // carryable signal jammer: a squat dish that seizes one seal
  M.buildJammer = function () {
    var g = new THREE.Group();
    var base = box(1.0, 0.5, 1.0, 0x3a3040); base.position.y = 0.25;
    var neck = box(0.3, 0.8, 0.3, 0x2a2430); neck.position.y = 0.8;
    g.add(base, neck);
    var dish = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.5, 8, 1, true),
      mat(0xc06adf));
    dish.rotation.x = Math.PI / 2;
    dish.position.set(0, 1.3, 0.2);
    g.add(dish);
    var tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.2),
      GH.assets.basic(0xe080ff, { transparent: true, opacity: 0.95 }));
    tip.position.set(0, 1.3, 0.5);
    g.add(tip);
    g.userData.tip = tip;
    g.userData.dish = dish;
    blobShadow(g, 1.5);
    return g;
  };

  // timed switch: a floor lever with a countdown lamp
  M.buildSwitchLever = function () {
    var g = new THREE.Group();
    var slab = box(1.6, 0.4, 1.2, 0x3a4450); slab.position.y = 0.2;
    var arm = box(0.25, 1.6, 0.25, 0xd8b040);
    arm.position.set(0, 1.0, 0);
    arm.rotation.z = 0.5;
    g.add(slab, arm);
    var lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.3),
      GH.assets.basic(0xffd050, { transparent: true, opacity: 0.5 }));
    lamp.position.set(0, 1.9, 0);
    g.add(lamp);
    g.userData.arm = arm;
    g.userData.lamp = lamp;
    blobShadow(g, 1.8);
    return g;
  };

  // raceway start gantry: a crossbar of three countdown lamps
  M.buildStartGantry = function () {
    var g = new THREE.Group();
    var postL = box(0.6, 7.5, 0.6, 0x3a4450); postL.position.set(-7, 3.75, 0);
    var postR = box(0.6, 7.5, 0.6, 0x3a4450); postR.position.set(7, 3.75, 0);
    var bar = box(15.2, 0.8, 0.8, 0x2a3038); bar.position.y = 7.4;
    g.add(postL, postR, bar);
    g.userData.lamps = [];
    for (var i = -1; i <= 1; i++) {
      var lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.55),
        GH.assets.basic(0x552222, { transparent: true, opacity: 0.9 }));
      lamp.position.set(i * 2.4, 6.5, 0);
      g.add(lamp);
      g.userData.lamps.push(lamp);
    }
    return g;
  };

  // sealed treasure vault: a squat stone door with a glowing seam;
  // breached vaults stand open and dark
  M.buildVault = function (open) {
    var g = new THREE.Group();
    var jambL = box(0.9, 3.4, 0.9, 0x4a4650); jambL.position.set(-1.6, 1.7, 0);
    var jambR = box(0.9, 3.4, 0.9, 0x4a4650); jambR.position.set(1.6, 1.7, 0);
    var lintel = box(4.4, 0.9, 1.0, 0x3a3642); lintel.position.y = 3.6;
    g.add(jambL, jambR, lintel);
    if (open) {
      // the door lies fallen; the chamber gapes dark
      var slab = box(2.4, 0.4, 2.8, 0x2e2a34);
      slab.position.set(0, 0.2, 2.2);
      slab.rotation.y = 0.3;
      g.add(slab);
    } else {
      var door = box(2.4, 3.0, 0.5, 0x37333f); door.position.y = 1.5;
      var seam = box(0.16, 2.6, 0.56, 0x000000);
      seam.position.y = 1.5;
      var seamGlow = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.4, 0.6),
        GH.assets.basic(0xc050ff, { transparent: true, opacity: 0.8 }));
      seamGlow.position.y = 1.5;
      g.add(door, seam, seamGlow);
      g.userData.seam = seamGlow;
    }
    blobShadow(g, 4);
    return g;
  };

  // THE HARROW — the roaming colossus: a slab-bodied quadruped walker,
  // scorched iron shot through with molten fissures
  M.buildHarrow = function () {
    var g = new THREE.Group();
    var hull = box(3.4, 2.2, 4.2, 0x2c2622); hull.position.y = 3.1;
    var ridge = box(2.2, 1.0, 3.0, 0x201b18); ridge.position.y = 4.5;
    g.add(hull, ridge);
    // molten fissures
    [[-1.1, 3.2, 1.6], [0.9, 3.5, -1.2], [0, 2.6, 2.1]].forEach(function (p) {
      var vein = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.9, 0.24),
        mat(0xff5a20, { emissive: 0x903008, emissiveIntensity: 1.0 }));
      vein.position.set(p[0], p[1], p[2]);
      vein.rotation.z = 0.4;
      g.add(vein);
    });
    // four column legs
    var legs = [];
    [[-1.5, 1.7], [1.5, 1.7], [-1.5, -1.7], [1.5, -1.7]].forEach(function (p, i) {
      var leg = box(0.9, 2.4, 0.9, 0x241f1c);
      leg.position.set(p[0], 1.2, p[1]);
      g.add(leg);
      legs.push(leg);
    });
    // the eye-furnace
    var eye = new THREE.Mesh(new THREE.OctahedronGeometry(0.6),
      mat(0xffa020, { emissive: 0xa04808, emissiveIntensity: 1.0 }));
    eye.position.set(0, 3.4, 2.3);
    g.add(eye);
    g.userData.core = eye;
    g.userData.parts = { legL: legs[0], legR: legs[1] };
    blobShadow(g, 6);
    return g;
  };

  // warning totem raised wherever THE HARROW stands today
  M.buildHarrowTotem = function () {
    var g = new THREE.Group();
    var spike = new THREE.Mesh(new THREE.ConeGeometry(0.7, 9, 5), mat(0x241f1c));
    spike.position.y = 4.5;
    g.add(spike);
    var brazier = new THREE.Mesh(new THREE.OctahedronGeometry(0.5),
      GH.assets.basic(0xff4020, { transparent: true, opacity: 0.9 }));
    brazier.position.y = 9.4;
    g.add(brazier);
    g.userData.core = brazier;
    blobShadow(g, 3);
    return g;
  };

  M.buildCampFire = function () {
    var g = new THREE.Group();
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2;
      var log = box(0.18, 0.18, 1.2, 0x4a3828);
      log.position.set(Math.cos(a) * 0.4, 0.12, Math.sin(a) * 0.4);
      log.rotation.y = a + 0.6;
      g.add(log);
    }
    var flame = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.1, 5),
      GH.assets.basic(0xffa040, { transparent: true, opacity: 0.85 }));
    flame.position.y = 0.7;
    g.add(flame);
    g.userData.flame = flame;
    return g;
  };

  M.buildBrokerTable = function () {
    var g = new THREE.Group();
    var top = box(2.2, 0.15, 1.1, 0x6a5638); top.position.y = 0.9;
    var leg1 = box(0.15, 0.9, 0.15, 0x4a3a24); leg1.position.set(-0.9, 0.45, 0.4);
    var leg2 = box(0.15, 0.9, 0.15, 0x4a3a24); leg2.position.set(0.9, 0.45, -0.4);
    g.add(top, leg1, leg2);
    var broker = M.buildHusk(0.9, 0x8a7a5a); // a hooded scavenger figure
    broker.position.set(0, 0, -1.2);
    g.add(broker);
    return g;
  };

  M.buildShrine = function () {
    var g = new THREE.Group();
    var base = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.2, 0.5, 6), mat(0x8a8a86));
    base.position.y = 0.25;
    var column = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.6, 6), mat(0x9a9a94));
    column.position.y = 1.3;
    var gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.45),
      mat(0xfff2c8, { emissive: 0x807040, emissiveIntensity: 0.7 }));
    gem.position.y = 2.5;
    g.add(base, column, gem);
    g.userData.gem = gem;
    return g;
  };

  M.buildMemorialWall = function () {
    var g = new THREE.Group();
    var wall = box(4.5, 2.2, 0.4, 0x76766f);
    wall.position.y = 1.1;
    g.add(wall);
    for (var i = 0; i < 6; i++) {
      var plaque = box(0.5, 0.34, 0.06, 0xd8b040);
      plaque.position.set(-1.6 + (i % 3) * 1.6, 1.4 - Math.floor(i / 3) * 0.7, 0.24);
      g.add(plaque);
    }
    return g;
  };

  M.buildSimConsole = function () {
    var g = new THREE.Group();
    var body = box(1.2, 1.4, 0.7, 0x30405a);
    body.position.y = 0.7;
    var screen = box(0.9, 0.6, 0.08, 0x60c8ff);
    screen.position.set(0, 1.1, 0.38);
    g.add(body, screen);
    g.userData.screen = screen;
    return g;
  };

  M.buildPylonPair = function (color) {
    var g = new THREE.Group();
    [-2.6, 2.6].forEach(function (x) {
      var p = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 3.4, 5), mat(0x555a62));
      p.position.set(x, 1.7, 0);
      var lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.3),
        mat(color, { emissive: color, emissiveIntensity: 0.7 }));
      lamp.position.set(x, 3.6, 0);
      g.add(p, lamp);
    });
    return g;
  };

  M.buildWreckSite = function () {
    var g = new THREE.Group();
    var hull = box(1.6, 0.7, 2.4, 0x4a4a50);
    hull.position.y = 0.35;
    hull.rotation.z = 0.3;
    var smoke = new THREE.Mesh(new THREE.SphereGeometry(0.4, 5, 4),
      GH.assets.basic(0x333333, { transparent: true, opacity: 0.5 }));
    smoke.position.y = 1.2;
    g.add(hull, smoke);
    g.userData.smoke = smoke;
    blobShadow(g, 3);
    return g;
  };

  // transformed frame: a folded speeder / skimmer form
  M.buildSpeeder = function (cfg, kind) {
    var g = new THREE.Group();
    var body = cfg.body, accent = cfg.accent, dark = cfg.dark || 0x30343a;
    if (kind === 'tank') {
      // hover-tank: wide hull, a turret, skirts
      var hullT = box(1.7, 0.5, 2.6, body); hullT.position.y = 0.7; g.add(hullT);
      var skirtL = box(0.3, 0.3, 2.4, dark); skirtL.position.set(-0.95, 0.5, 0); g.add(skirtL);
      var skirtR = box(0.3, 0.3, 2.4, dark); skirtR.position.set(0.95, 0.5, 0); g.add(skirtR);
      var turret = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.4, 8), mat(accent)); turret.position.set(0, 1.15, -0.2); g.add(turret);
      var barrel = box(0.16, 0.16, 1.6, dark); barrel.position.set(0, 1.2, 0.9); g.add(barrel);
      var canopyT = box(0.5, 0.22, 0.5, 0x202830); canopyT.position.set(0, 1.45, -0.2); g.add(canopyT);
    } else if (kind === 'disc') {
      // disc: a flat saucer with an underslung cannon
      var disc = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.1, 0.35, 10), mat(body)); disc.position.y = 0.8; g.add(disc);
      var dome = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 5), mat(0x202830)); dome.position.y = 1.05; g.add(dome);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.08, 4, 12), mat(accent)); ring.rotation.x = Math.PI / 2; ring.position.y = 0.8; g.add(ring);
      var gunD = box(0.14, 0.14, 1.2, dark); gunD.position.set(0, 0.5, 0.9); g.add(gunD);
    } else if (kind === 'bike') {
      // hover-bike: narrow, long, a fork and a spine
      var spine = box(0.5, 0.36, 2.6, body); spine.position.y = 0.8; g.add(spine);
      var fork = box(0.3, 0.3, 0.9, dark); fork.position.set(0, 0.7, 1.5); fork.rotation.x = 0.4; g.add(fork);
      var noseB = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 4), mat(accent)); noseB.rotation.x = Math.PI / 2; noseB.position.set(0, 0.8, 1.9); g.add(noseB);
      var seat = box(0.42, 0.18, 0.9, 0x202830); seat.position.set(0, 1.05, -0.2); g.add(seat);
      var barL = box(0.6, 0.06, 0.06, dark); barL.position.set(0, 1.15, 0.7); g.add(barL);
      var finB = box(0.08, 0.5, 0.7, dark); finB.position.set(0, 1.1, -1.1); g.add(finB);
    } else {
      var hull = box(0.9, 0.4, 2.4, body); hull.position.y = 0.75;
      var nose = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 4), mat(accent));
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 0.75, 1.6);
      var canopy = box(0.5, 0.28, 0.8, 0x202830); canopy.position.set(0, 1.05, 0.2);
      var finL = box(0.1, 0.5, 0.9, dark); finL.position.set(-0.55, 0.95, -0.8); finL.rotation.z = 0.5;
      var finR = box(0.1, 0.5, 0.9, dark); finR.position.set(0.55, 0.95, -0.8); finR.rotation.z = -0.5;
      g.add(hull, nose, canopy, finL, finR);
    }
    var flames = [];
    [-0.28, 0.28].forEach(function (x) {
      var flame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.9, 4),
        new THREE.MeshBasicMaterial({ color: 0x70c0ff, transparent: true, opacity: 0.85 }));
      flame.rotation.x = -Math.PI / 2;
      flame.position.set(x, 0.75, -1.5);
      g.add(flame);
      flames.push(flame);
    });
    g.userData.flames = flames;
    blobShadow(g, 2.2);
    return g;
  };

  // race item pad: a spinning question box on the line
  M.buildItemPad = function () {
    var g = new THREE.Group();
    var b = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1), mat(0xffd050, { emissive: 0x806010, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 }));
    b.rotation.set(0.6, 0.6, 0);
    g.add(b);
    g.userData.spin = b;
    return g;
  };
  // a house banner for the camp
  M.buildBanner = function (color) {
    var g = new THREE.Group();
    var pole = box(0.18, 6.5, 0.18, 0x4a4038); pole.position.y = 3.25; g.add(pole);
    var flag = box(0.08, 2.2, 3.0, color); flag.position.set(0, 5.2, 1.5); g.add(flag);
    var top = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), mat(0xe0b050)); top.position.y = 6.8; g.add(top);
    return g;
  };

  // ---------------------------------------------------------------
  // Props
  // ---------------------------------------------------------------
  M.buildPillar = function () {
    var g = new THREE.Group();
    var h = GH.rand(0.8, 2.4);
    var seg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, h, 7), mat(0x8a8a86));
    seg.position.y = h / 2;
    seg.rotation.y = Math.random();
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.5, 0.25, 7), mat(0x76766f));
    cap.position.y = h + 0.1;
    var rubble = box(GH.rand(0.3, 0.6), 0.25, GH.rand(0.3, 0.6), 0x807f78);
    rubble.position.set(GH.rand(-1, 1), 0.12, GH.rand(-1, 1));
    rubble.rotation.y = Math.random();
    g.add(seg, cap, rubble);
    return g;
  };

  M.buildTree = function () {
    var g = new THREE.Group();
    var trunk = box(0.16, 1.4, 0.16, 0x4a3828);
    trunk.position.y = 0.7;
    trunk.rotation.z = GH.rand(-0.2, 0.2);
    g.add(trunk);
    for (var i = 0; i < 5; i++) {
      var br = box(0.06, 0.8, 0.06, 0x4a3828);
      br.position.set(GH.rand(-0.25, 0.25), GH.rand(1.0, 1.5), GH.rand(-0.25, 0.25));
      br.rotation.set(GH.rand(-0.9, 0.9), 0, GH.rand(-0.9, 0.9));
      g.add(br);
    }
    return g;
  };

  M.buildCrystal = function () {
    var g = new THREE.Group();
    for (var i = 0; i < 3; i++) {
      var h = GH.rand(0.6, 1.8);
      var cry = new THREE.Mesh(new THREE.ConeGeometry(GH.rand(0.15, 0.3), h, 5),
        mat(0x70c8e8, { emissive: 0x104858, transparent: true, opacity: 0.9 }));
      cry.position.set(GH.rand(-0.4, 0.4), h / 2, GH.rand(-0.4, 0.4));
      cry.rotation.set(GH.rand(-0.25, 0.25), Math.random(), GH.rand(-0.25, 0.25));
      g.add(cry);
    }
    return g;
  };

  M.props = {
    pillar: function () { return M.buildPillar(); },
    tree: function () { return M.buildTree(); },
    crystal: function () { return M.buildCrystal(); }
  };

    // ---------------------------------------------------------------
  // Biome props — every zone gets its own vegetation and rock so the
  // ground reads as a place. All are static and get merged per material.
  // ---------------------------------------------------------------
  function R(rnd, a, b) { return a + (rnd ? rnd() : Math.random()) * (b - a); }
  function cone(r, h, c, seg, o) { return new THREE.Mesh(new THREE.ConeGeometry(r, h, seg || 5), mat(c, o)); }
  function cyl(rt, rb, h, c, seg, o) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 6), mat(c, o)); }
  function ico(r, c, o) { return new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat(c, o)); }

  M.biomeProps = {
    // ---- dune coast ----
    palm: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 2.6, 4.2), lean = R(rnd, -0.25, 0.25);
      var segs = 4;
      for (var i = 0; i < segs; i++) {
        var t = cyl(0.13, 0.17, h / segs + 0.05, 0x7a5a3a, 5);
        t.position.set(lean * i * 0.5, (i + 0.5) * h / segs, 0);
        t.rotation.z = -lean * 0.6;
        g.add(t);
      }
      var top = new THREE.Vector3(lean * (segs - 0.5) * 0.5, h, 0);
      for (var f = 0; f < 7; f++) {
        var fr = box(0.18, 0.04, 1.9, f % 2 ? 0x3a8a3a : 0x2e7030);
        var a = (f / 7) * Math.PI * 2;
        fr.position.set(top.x + Math.cos(a) * 0.8, h + 0.1 - 0.25, top.z + Math.sin(a) * 0.8);
        fr.rotation.y = -a + Math.PI / 2;
        fr.rotation.x = 0.5;
        g.add(fr);
      }
      var nut = ico(0.12, 0x6a4a2a); nut.position.set(top.x, h - 0.15, 0.2); g.add(nut);
      return g;
    },
    cactus: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 1.2, 2.4);
      var body = cyl(0.2, 0.24, h, 0x4a8a3a, 7); body.position.y = h / 2; g.add(body);
      var arms = rnd() < 0.7 ? 1 + Math.floor(rnd() * 2) : 0;
      for (var i = 0; i < arms; i++) {
        var side = i === 0 ? 1 : -1;
        var ay = h * R(rnd, 0.35, 0.65);
        var arm = cyl(0.12, 0.14, 0.6, 0x4a8a3a, 6); arm.rotation.z = Math.PI / 2; arm.position.set(side * 0.4, ay, 0); g.add(arm);
        var up = cyl(0.12, 0.14, R(rnd, 0.5, 0.9), 0x4a8a3a, 6); up.position.set(side * 0.66, ay + 0.35, 0); g.add(up);
      }
      return g;
    },
    duneRock: function (rnd) {
      var g = new THREE.Group();
      var r = R(rnd, 0.7, 1.6);
      var rock = ico(r, 0xb89468); rock.scale.set(1.2, 0.6, 1); rock.position.y = r * 0.3; rock.rotation.y = rnd() * 3; g.add(rock);
      var small = ico(r * 0.4, 0xa88458); small.position.set(r * 1.1, r * 0.15, r * 0.4); g.add(small);
      return g;
    },
    wreckRib: function (rnd) {
      var g = new THREE.Group();
      var n = 3 + Math.floor(rnd() * 3);
      var hh = R(rnd, 3, 5.5);
      for (var i = 0; i < n; i++) {
        var rib = box(0.22, hh, 0.5, 0x6a4a3a);
        rib.position.set(i * 1.4 - n * 0.7, hh * 0.4, 0);
        rib.rotation.z = R(rnd, 0.25, 0.5);
        g.add(rib);
      }
      var keel = box(n * 1.4, 0.4, 0.6, 0x5a3a2a); keel.position.y = 0.2; g.add(keel);
      return g;
    },
    bones: function (rnd) {
      var g = new THREE.Group();
      var skull = box(0.5, 0.4, 0.6, 0xe8e0d0); skull.position.y = 0.2; skull.rotation.y = rnd() * 2; g.add(skull);
      for (var i = 0; i < 4; i++) {
        var rib = box(0.08, 0.9, 0.08, 0xe0d8c8);
        rib.position.set(1 + i * 0.35, 0.3, 0); rib.rotation.z = 0.7; g.add(rib);
      }
      return g;
    },
    // ---- frost range ----
    pine: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 2.8, 5.0);
      var trunk = cyl(0.1, 0.16, h * 0.4, 0x4a3020, 5); trunk.position.y = h * 0.2; g.add(trunk);
      var tiers = 3;
      for (var i = 0; i < tiers; i++) {
        var ty = h * 0.3 + i * (h * 0.22);
        var rad = 0.9 - i * 0.22;
        var c = cone(rad, h * 0.32, i % 2 ? 0x1f4a2a : 0x25563a, 6); c.position.y = ty + h * 0.12; g.add(c);
        var snow = cone(rad * 0.75, h * 0.14, 0xf0f4f8, 6); snow.position.y = ty + h * 0.24; g.add(snow);
      }
      return g;
    },
    snowRock: function (rnd) {
      var g = new THREE.Group();
      var r = R(rnd, 0.6, 1.5);
      var rock = ico(r, 0x7a7e88); rock.position.y = r * 0.4; rock.scale.y = 0.7; g.add(rock);
      var cap = ico(r * 0.85, 0xf4f6fa); cap.position.y = r * 0.75; cap.scale.set(1, 0.3, 1); g.add(cap);
      return g;
    },
    iceSpire: function (rnd) {
      var g = new THREE.Group();
      for (var i = 0; i < 3; i++) {
        var h = R(rnd, 1.6, 4.2);
        var c = cone(R(rnd, 0.2, 0.4), h, 0xa0e0ff, 5, { transparent: true, opacity: 0.85, emissive: 0x104050 });
        c.position.set(R(rnd, -0.6, 0.6), h / 2, R(rnd, -0.6, 0.6));
        c.rotation.set(R(rnd, -0.2, 0.2), 0, R(rnd, -0.2, 0.2));
        g.add(c);
      }
      return g;
    },
    deadTree: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 2.2, 3.6);
      var trunk = box(0.22, h, 0.22, 0x3a3230); trunk.position.y = h / 2; trunk.rotation.z = R(rnd, -0.15, 0.15); g.add(trunk);
      for (var i = 0; i < 4; i++) {
        var br = box(0.08, 1.2, 0.08, 0x3a3230);
        br.position.set(R(rnd, -0.4, 0.4), h * R(rnd, 0.5, 0.95), R(rnd, -0.4, 0.4));
        br.rotation.set(R(rnd, -1, 1), 0, R(rnd, -1, 1));
        g.add(br);
      }
      return g;
    },
    // ---- rain canopy ----
    jungleTree: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 3.8, 6.2);
      var trunk = cyl(0.16, 0.3, h, 0x5a3e28, 6); trunk.position.y = h / 2; g.add(trunk);
      for (var r = 0; r < 3; r++) {
        var root = box(0.12, 0.9, 0.5, 0x4a3020);
        var ra = (r / 3) * Math.PI * 2;
        root.position.set(Math.cos(ra) * 0.35, 0.3, Math.sin(ra) * 0.35);
        root.rotation.y = -ra; root.rotation.x = 0.5; g.add(root);
      }
      for (var i = 0; i < 4; i++) {
        var cnp = ico(R(rnd, 1.0, 1.7), i % 2 ? 0x2e7a34 : 0x3a9a40);
        cnp.scale.y = 0.55;
        cnp.position.set(R(rnd, -0.9, 0.9), h - 0.4 + R(rnd, -0.3, 0.5), R(rnd, -0.9, 0.9));
        g.add(cnp);
      }
      return g;
    },
    fern: function (rnd) {
      var g = new THREE.Group();
      var n = 5 + Math.floor(rnd() * 3);
      for (var i = 0; i < n; i++) {
        var fr = box(0.14, 0.03, 1.0, i % 2 ? 0x4aa848 : 0x3a8a3a);
        var a = (i / n) * Math.PI * 2;
        fr.position.set(Math.cos(a) * 0.4, 0.35, Math.sin(a) * 0.4);
        fr.rotation.y = -a + Math.PI / 2; fr.rotation.x = -0.6;
        g.add(fr);
      }
      return g;
    },
    vineCurtain: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 3.4, 5);
      var t1 = cyl(0.14, 0.2, h, 0x5a3e28, 5); t1.position.set(-1.6, h / 2, 0); g.add(t1);
      var t2 = cyl(0.14, 0.2, h, 0x5a3e28, 5); t2.position.set(1.6, h / 2, 0); g.add(t2);
      var bar = box(3.4, 0.14, 0.14, 0x4a3020); bar.position.y = h - 0.3; g.add(bar);
      for (var i = 0; i < 7; i++) {
        var len = R(rnd, 1.2, h - 0.9);
        var v = box(0.07, len, 0.07, i % 2 ? 0x3a6a30 : 0x4a8a3a);
        v.position.set(-1.4 + i * 0.47, h - 0.3 - len / 2, R(rnd, -0.1, 0.1));
        g.add(v);
      }
      var can1 = ico(1.1, 0x2e7a34); can1.scale.y = 0.5; can1.position.set(-1.6, h, 0); g.add(can1);
      var can2 = ico(1.1, 0x3a9a40); can2.scale.y = 0.5; can2.position.set(1.6, h, 0); g.add(can2);
      return g;
    },
    mushroom: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 0.5, 1.3);
      var stem = cyl(0.1, 0.14, h, 0xe0d8c0, 6); stem.position.y = h / 2; g.add(stem);
      var cap = cone(R(rnd, 0.35, 0.6), 0.35, rnd() < 0.5 ? 0xc04a3a : 0x8a4aa0, 7, { emissive: 0x301020 }); cap.position.y = h + 0.12; g.add(cap);
      return g;
    },
    mossRock: function (rnd) {
      var g = new THREE.Group();
      var r = R(rnd, 0.6, 1.4);
      var rock = ico(r, 0x556a48); rock.position.y = r * 0.35; rock.scale.y = 0.65; g.add(rock);
      var moss = ico(r * 0.7, 0x5aa040); moss.position.set(r * 0.2, r * 0.7, 0); moss.scale.y = 0.3; g.add(moss);
      return g;
    },
    // ---- cinder wastes ----
    basalt: function (rnd) {
      var g = new THREE.Group();
      var n = 4 + Math.floor(rnd() * 4);
      for (var i = 0; i < n; i++) {
        var h = R(rnd, 0.8, 3.4);
        var col = cyl(0.36, 0.36, h, i % 3 ? 0x2a2628 : 0x3a3234, 6);
        col.position.set(R(rnd, -1, 1), h / 2, R(rnd, -1, 1));
        g.add(col);
      }
      return g;
    },
    lavaRock: function (rnd) {
      var g = new THREE.Group();
      var r = R(rnd, 0.6, 1.4);
      var rock = ico(r, 0x3a2a28); rock.position.y = r * 0.4; rock.rotation.y = rnd() * 3; g.add(rock);
      var glow = box(r * 0.9, 0.12, 0.12, 0xff6020); glow.position.y = r * 0.55; glow.rotation.y = rnd() * 3; g.add(glow);
      return g;
    },
    charTree: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 2, 3.4);
      var trunk = box(0.2, h, 0.2, 0x1a1414); trunk.position.y = h / 2; g.add(trunk);
      for (var i = 0; i < 3; i++) {
        var br = box(0.08, 1.1, 0.08, 0x1a1414);
        br.position.set(R(rnd, -0.4, 0.4), h * R(rnd, 0.55, 0.95), R(rnd, -0.4, 0.4));
        br.rotation.set(R(rnd, -0.9, 0.9), 0, R(rnd, -0.9, 0.9));
        g.add(br);
        var tip = box(0.1, 0.1, 0.1, 0xff6020); tip.position.copy(br.position); tip.position.y += 0.5; g.add(tip);
      }
      return g;
    },
    ventStack: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 1.2, 2.2);
      var stack = cyl(0.5, 0.8, h, 0x3a3234, 7); stack.position.y = h / 2; g.add(stack);
      var glow = cyl(0.3, 0.3, 0.2, 0xff7020, 7); glow.position.y = h; g.add(glow);
      return g;
    },
    // ---- thunder highlands ----
    slateSpire: function (rnd) {
      var g = new THREE.Group();
      for (var i = 0; i < 3; i++) {
        var h = R(rnd, 1.8, 5);
        var sp = box(R(rnd, 0.3, 0.6), h, R(rnd, 0.3, 0.7), i % 2 ? 0x5a5e70 : 0x4a4e60);
        sp.position.set(R(rnd, -0.8, 0.8), h / 2 - 0.2, R(rnd, -0.8, 0.8));
        sp.rotation.set(R(rnd, -0.15, 0.15), rnd() * 2, R(rnd, -0.15, 0.15));
        g.add(sp);
      }
      return g;
    },
    heather: function (rnd) {
      var g = new THREE.Group();
      var n = 5 + Math.floor(rnd() * 4);
      for (var i = 0; i < n; i++) {
        var b = box(R(rnd, 0.3, 0.6), R(rnd, 0.3, 0.6), R(rnd, 0.3, 0.6), rnd() < 0.5 ? 0x7a4a9a : 0x3a5a3a);
        b.position.set(R(rnd, -1, 1), 0.2, R(rnd, -1, 1)); b.rotation.y = rnd() * 2; g.add(b);
      }
      return g;
    },
    menhir: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 3.5, 5.5);
      var st = box(1.0, h, 0.7, 0x6a6a72); st.position.y = h / 2; st.rotation.z = R(rnd, -0.08, 0.08); g.add(st);
      var moss = box(1.02, 0.3, 0.72, 0x4a6a3a); moss.position.y = h - 0.15; g.add(moss);
      return g;
    },
    // ---- void sanctum ----
    crystal: function (rnd) {
      var g = M.buildCrystal();
      g.scale.setScalar(R(rnd, 1.2, 2.2));
      return g;
    },
    floatShard: function (rnd) {
      var g = new THREE.Group();
      var sh = new THREE.Mesh(new THREE.OctahedronGeometry(R(rnd, 0.3, 0.7)), mat(0xa070ff, { emissive: 0x402080 }));
      sh.position.y = R(rnd, 1.4, 3.0); sh.rotation.set(rnd(), rnd(), rnd()); g.add(sh);
      var base = box(0.3, 0.2, 0.3, 0x4a4060); base.position.y = 0.1; g.add(base);
      return g;
    },
    monolith: function (rnd) {
      var g = new THREE.Group();
      var h = R(rnd, 6, 9);
      var m = box(1.4, h, 0.8, 0x1a1622); m.position.y = h / 2; g.add(m);
      var stripe = box(0.2, h * 0.7, 0.85, 0x8050e0); stripe.position.y = h / 2; g.add(stripe);
      return g;
    },
    voidReed: function (rnd) {
      var g = new THREE.Group();
      var n = 3 + Math.floor(rnd() * 3);
      for (var i = 0; i < n; i++) {
        var h = R(rnd, 1, 2.2);
        var rd = box(0.08, h, 0.08, 0x8a7ab0);
        rd.position.set(R(rnd, -0.4, 0.4), h / 2, R(rnd, -0.4, 0.4)); rd.rotation.z = R(rnd, -0.2, 0.2); g.add(rd);
        var tip = box(0.16, 0.16, 0.16, 0xc090ff); tip.position.set(rd.position.x, h, rd.position.z); g.add(tip);
      }
      return g;
    }
  };

  // race-track tyre wall: three stacked drums
  M.buildTyreWall = function (red) {
    var g = new THREE.Group();
    for (var i = 0; i < 3; i++) {
      var t = cyl(0.45, 0.45, 0.36, red ? 0xa02a2a : 0x202024, 8);
      t.position.set(0, 0.2 + (i === 2 ? 0.38 : 0), i === 2 ? 0 : (i === 0 ? -0.5 : 0.5));
      g.add(t);
    }
    return g;
  };

  // ---------------------------------------------------------------
  // Zone-native hostiles
  // ---------------------------------------------------------------
  M.buildScarab = function () {
    var g = new THREE.Group();
    var shell = new THREE.Mesh(new THREE.SphereGeometry(0.62, 7, 5), mat(0x8a6a28, { emissive: 0x201808 }));
    shell.position.y = 0.55; shell.scale.set(1, 0.6, 1.25); g.add(shell);
    var stripe = box(0.1, 0.05, 1.4, 0x3a2a10); stripe.position.y = 0.92; g.add(stripe);
    var head = box(0.36, 0.3, 0.36, 0x5a4218); head.position.set(0, 0.45, 0.8); g.add(head);
    var mandL = box(0.08, 0.08, 0.5, 0x2a1a08); mandL.position.set(-0.16, 0.4, 1.1); mandL.rotation.y = 0.4; g.add(mandL);
    var mandR = box(0.08, 0.08, 0.5, 0x2a1a08); mandR.position.set(0.16, 0.4, 1.1); mandR.rotation.y = -0.4; g.add(mandR);
    var eye = box(0.3, 0.06, 0.05, 0xffb020); eye.position.set(0, 0.55, 0.98); g.add(eye);
    var legs = {};
    ['legL', 'legR', 'armL', 'armR'].forEach(function (k, i) {
      var l = box(0.1, 0.45, 0.1, 0x3a2a10);
      l.position.set(i % 2 ? 0.6 : -0.6, 0.25, i < 2 ? 0.3 : -0.3);
      l.rotation.z = i % 2 ? -0.5 : 0.5;
      g.add(l); legs[k] = l;
    });
    g.userData.limbs = legs;
    blobShadow(g, 1.5);
    return g;
  };

  M.buildBurrower = function (color) {
    var g = new THREE.Group();
    var body = new THREE.Group();
    var segs = [0.5, 0.42, 0.34];
    for (var i = 0; i < segs.length; i++) {
      var s = ico(segs[i], i % 2 ? (color || 0xb08a5a) : (color ? 0x3a3040 : 0x9a7648));
      s.position.set(0, 0.55 + i * 0.1, -i * 0.7);
      body.add(s);
    }
    var jawT = box(0.5, 0.12, 0.5, 0x6a4a3a); jawT.position.set(0, 0.85, 0.35); jawT.rotation.x = -0.4; body.add(jawT);
    var jawB = box(0.5, 0.12, 0.5, 0x6a4a3a); jawB.position.set(0, 0.35, 0.35); jawB.rotation.x = 0.4; body.add(jawB);
    for (var t = 0; t < 4; t++) {
      var tooth = cone(0.06, 0.25, 0xf0e8d0, 4);
      tooth.position.set(-0.18 + t * 0.12, 0.6, 0.55); tooth.rotation.x = Math.PI; body.add(tooth);
    }
    var eye = box(0.3, 0.05, 0.05, 0xff5020); eye.position.set(0, 0.95, 0.2); body.add(eye);
    g.add(body);
    var plume = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.16, 4, 10), mat(0xd8c090));
    plume.rotation.x = Math.PI / 2; plume.position.y = 0.12; g.add(plume);
    g.userData.body = body; g.userData.plume = plume;
    blobShadow(g, 1.4);
    return g;
  };

  M.buildStalker = function (color) {
    var g = new THREE.Group();
    var c = color || 0xe8ecf4;
    var body = box(0.5, 0.42, 1.1, c); body.position.y = 0.7; g.add(body);
    var neck = box(0.3, 0.3, 0.4, c); neck.position.set(0, 0.85, 0.65); neck.rotation.x = -0.5; g.add(neck);
    var head = box(0.3, 0.26, 0.5, 0xd0d8e8); head.position.set(0, 1.0, 0.95); g.add(head);
    var eye = box(0.24, 0.05, 0.05, 0x40c0ff); eye.position.set(0, 1.06, 1.2); g.add(eye);
    var tail = box(0.1, 0.1, 0.7, c); tail.position.set(0, 0.85, -0.85); tail.rotation.x = 0.5; g.add(tail);
    var legs = {};
    ['legL', 'legR', 'armL', 'armR'].forEach(function (k, i) {
      var l = box(0.14, 0.6, 0.14, 0x8ab0d0);
      l.position.set(i % 2 ? 0.2 : -0.2, 0.3, i < 2 ? 0.4 : -0.4);
      g.add(l); legs[k] = l;
    });
    g.userData.limbs = legs;
    blobShadow(g, 1.3);
    return g;
  };

  M.buildFrostWisp = function (color) {
    var g = new THREE.Group();
    var core = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), mat(color || 0xc0f0ff, { emissive: 0x2060a0 }));
    core.position.y = 1.0; g.add(core);
    for (var i = 0; i < 5; i++) {
      var ic = cone(0.06, 0.5, 0xa0e0ff, 4, { transparent: true, opacity: 0.85 });
      var a = (i / 5) * Math.PI * 2;
      ic.position.set(Math.cos(a) * 0.45, 0.85, Math.sin(a) * 0.45); ic.rotation.x = Math.PI; g.add(ic);
    }
    g.userData.core = core;
    blobShadow(g, 0.8);
    return g;
  };

  M.buildLurker = function () {
    var g = new THREE.Group();
    var body = new THREE.Group();
    var thorax = box(0.5, 0.35, 0.9, 0x3a6a2a); thorax.position.y = 0.55; body.add(thorax);
    var head = box(0.3, 0.26, 0.3, 0x2e5a22); head.position.set(0, 0.7, 0.55); body.add(head);
    var eye = box(0.26, 0.05, 0.04, 0xd0ff40); eye.position.set(0, 0.75, 0.71); body.add(eye);
    var sL = box(0.08, 0.9, 0.12, 0x9ad048); sL.position.set(-0.4, 0.9, 0.5); sL.rotation.x = 0.7; body.add(sL);
    var sR = box(0.08, 0.9, 0.12, 0x9ad048); sR.position.set(0.4, 0.9, 0.5); sR.rotation.x = 0.7; body.add(sR);
    for (var i = 0; i < 4; i++) {
      var leg = box(0.08, 0.4, 0.08, 0x2a4018);
      leg.position.set(i < 2 ? -0.35 : 0.35, 0.2, (i % 2) ? 0.3 : -0.3); body.add(leg);
    }
    g.add(body);
    var cover = new THREE.Group();
    for (var c = 0; c < 4; c++) {
      var bush = ico(0.45, c % 2 ? 0x2e7a34 : 0x3a9a40);
      bush.position.set((c % 2 ? 0.3 : -0.3), 0.4 + (c > 1 ? 0.35 : 0), (c > 1 ? 0.2 : -0.2)); cover.add(bush);
    }
    g.add(cover);
    g.userData.body = body; g.userData.cover = cover;
    blobShadow(g, 1.2);
    return g;
  };

  M.buildBloat = function (color) {
    var g = new THREE.Group();
    var sac = new THREE.Mesh(new THREE.SphereGeometry(0.72, 7, 6), mat(color || 0x8a9a48, { emissive: 0x2a3a10 }));
    sac.position.y = 0.9; g.add(sac);
    for (var i = 0; i < 6; i++) {
      var wart = ico(0.14, 0xc0d060);
      var a = (i / 6) * Math.PI * 2;
      wart.position.set(Math.cos(a) * 0.62, 0.9 + Math.sin(i) * 0.3, Math.sin(a) * 0.62); g.add(wart);
    }
    var eye = box(0.3, 0.06, 0.05, 0x40ff80); eye.position.set(0, 1.0, 0.7); g.add(eye);
    var legs = {};
    ['legL', 'legR'].forEach(function (k, i) {
      var l = box(0.16, 0.4, 0.16, 0x4a5a20); l.position.set(i ? 0.25 : -0.25, 0.2, 0); g.add(l); legs[k] = l;
    });
    legs.armL = box(0.01, 0.01, 0.01, 0x4a5a20); legs.armR = box(0.01, 0.01, 0.01, 0x4a5a20); g.add(legs.armL, legs.armR);
    g.userData.limbs = legs;
    blobShadow(g, 1.5);
    return g;
  };

  M.buildCrawler = function () {
    var g = new THREE.Group();
    for (var i = 0; i < 4; i++) {
      var seg = box(0.5, 0.36, 0.5, 0x2a1a18); seg.position.set(0, 0.3, 0.45 - i * 0.55); g.add(seg);
      if (i > 0) { var gap = box(0.4, 0.2, 0.12, 0xff6020); gap.position.set(0, 0.3, 0.45 - i * 0.55 + 0.3); g.add(gap); }
      for (var s = -1; s <= 1; s += 2) {
        var leg = box(0.28, 0.08, 0.08, 0x3a2a28); leg.position.set(s * 0.36, 0.14, 0.45 - i * 0.55); g.add(leg);
      }
    }
    var head = box(0.44, 0.32, 0.4, 0x3a2220); head.position.set(0, 0.34, 0.95); g.add(head);
    var eye = box(0.3, 0.06, 0.05, 0xffb020); eye.position.set(0, 0.42, 1.16); g.add(eye);
    blobShadow(g, 1.3);
    return g;
  };

  M.buildDrake = function (zone) {
    var g = new THREE.Group();
    var c = zone === 'storm' ? 0x3a3a5a : 0x8a2a1a, c2 = zone === 'storm' ? 0x6a6a9a : 0xc04a20;
    var body = ico(0.42, c); body.scale.set(0.9, 0.7, 1.5); body.position.y = 1.0; g.add(body);
    var head = box(0.3, 0.26, 0.5, c); head.position.set(0, 1.05, 0.75); g.add(head);
    var eye = box(0.22, 0.05, 0.05, 0xffd040); eye.position.set(0, 1.1, 1.0); g.add(eye);
    var tail = box(0.12, 0.12, 0.9, c); tail.position.set(0, 1.0, -0.9); g.add(tail);
    var wings = [];
    [-1, 1].forEach(function (s) {
      var w = box(1.4, 0.05, 0.7, c2); w.position.set(s * 0.85, 1.1, 0); g.add(w); wings.push(w);
    });
    g.userData.wings = wings;
    blobShadow(g, 1.6);
    return g;
  };

  M.buildSentinel = function () {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), mat(0x4a4a70, { emissive: 0x181830 }));
    body.scale.y = 1.8; body.position.y = 1.3; g.add(body);
    var core = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), mat(0x80c0ff, { emissive: 0x4080ff }));
    core.position.y = 1.3; g.add(core);
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.05, 4, 10), mat(0x9ab0ff, { emissive: 0x3050a0 }));
    ring.position.y = 1.3; ring.rotation.x = Math.PI / 2; g.add(ring);
    g.userData.core = core; g.userData.ring = ring;
    blobShadow(g, 1.1);
    return g;
  };

  M.buildPhantom = function () {
    var g = new THREE.Group();
    var robe = cone(0.45, 1.6, 0x3a2a50, 6, { transparent: true, opacity: 0.8, emissive: 0x201040 });
    robe.position.y = 0.9; g.add(robe);
    var hood = ico(0.3, 0x2a1a40); hood.position.y = 1.75; g.add(hood);
    var eyeL = box(0.08, 0.08, 0.08, 0xc080ff); eyeL.position.set(-0.1, 1.75, 0.26); g.add(eyeL);
    var eyeR = box(0.08, 0.08, 0.08, 0xc080ff); eyeR.position.set(0.1, 1.75, 0.26); g.add(eyeR);
    g.userData.core = hood;
    blobShadow(g, 1.0);
    return g;
  };

  M.buildNullShard = function () {
    var g = new THREE.Group();
    for (var i = 0; i < 3; i++) {
      var sh = new THREE.Mesh(new THREE.OctahedronGeometry(0.28 - i * 0.05), mat(0xa060ff, { emissive: 0x402080 }));
      sh.position.set(Math.cos(i * 2.1) * 0.25, 0.75 + i * 0.25, Math.sin(i * 2.1) * 0.25); g.add(sh);
      if (i === 0) g.userData.core = sh;
    }
    for (var l = 0; l < 3; l++) {
      var leg = box(0.07, 0.5, 0.07, 0x4a3a60);
      var a = (l / 3) * Math.PI * 2;
      leg.position.set(Math.cos(a) * 0.3, 0.25, Math.sin(a) * 0.3); leg.rotation.z = Math.cos(a) * 0.4; leg.rotation.x = -Math.sin(a) * 0.4; g.add(leg);
    }
    blobShadow(g, 0.9);
    return g;
  };

    // ---- props for the built territories ----
  M.biomeProps.habVent = function (rnd) {
    var g = new THREE.Group();
    var h = R(rnd, 1.2, 2.6);
    var st = cyl(0.5, 0.6, h, 0x3a3f4c, 6); st.position.y = h / 2; g.add(st);
    var cap = cyl(0.8, 0.5, 0.4, 0x2a2e38, 6); cap.position.y = h + 0.2; g.add(cap);
    var glow = box(0.3, 0.3, 0.3, 0xffb050); glow.position.y = h * 0.5; glow.position.z = 0.5; g.add(glow);
    return g;
  };
  M.biomeProps.cableMast = function (rnd) {
    var g = new THREE.Group();
    var h = R(rnd, 5, 9);
    var m = box(0.3, h, 0.3, 0x4a4f5c); m.position.y = h / 2; g.add(m);
    var arm = box(2.6, 0.2, 0.2, 0x4a4f5c); arm.position.y = h - 0.6; g.add(arm);
    var lamp = box(0.35, 0.35, 0.35, 0x60c8ff); lamp.position.set(1.2, h - 0.9, 0); g.add(lamp);
    return g;
  };
  M.biomeProps.scrapPile = function (rnd) {
    var g = new THREE.Group();
    for (var i = 0; i < 5; i++) {
      var b = box(R(rnd, 0.4, 1.2), R(rnd, 0.3, 0.9), R(rnd, 0.4, 1.2), i % 2 ? 0x5a4a3a : 0x4a4f5c);
      b.position.set(R(rnd, -1, 1), 0.3 + i * 0.15, R(rnd, -1, 1)); b.rotation.set(rnd(), rnd(), rnd() * 0.3); g.add(b);
    }
    return g;
  };
  M.biomeProps.brokenColumn = function (rnd) {
    var g = new THREE.Group();
    var h = R(rnd, 1, 4.5);
    var c = cyl(0.55, 0.65, h, 0x8a8a84, 7); c.position.y = h / 2; c.rotation.z = R(rnd, -0.08, 0.08); g.add(c);
    var drum = cyl(0.55, 0.55, 0.6, 0x7a7a74, 7); drum.position.set(R(rnd, 0.8, 1.6), 0.3, R(rnd, -0.6, 0.6)); drum.rotation.x = Math.PI / 2; g.add(drum);
    return g;
  };
  M.biomeProps.rubble = function (rnd) {
    var g = new THREE.Group();
    for (var i = 0; i < 6; i++) {
      var b = box(R(rnd, 0.4, 1.3), R(rnd, 0.3, 0.8), R(rnd, 0.4, 1.3), i % 2 ? 0x7e7e78 : 0x6a6a64);
      b.position.set(R(rnd, -1.2, 1.2), 0.25 + i * 0.1, R(rnd, -1.2, 1.2)); b.rotation.set(rnd() * 0.4, rnd() * 3, rnd() * 0.4); g.add(b);
    }
    var moss = box(1.2, 0.15, 1.2, 0x4a8a3a); moss.position.y = 0.95; g.add(moss);
    return g;
  };
  M.biomeProps.brazier = function (rnd) {
    var g = new THREE.Group();
    var st = cyl(0.25, 0.4, 1.4, 0x3a3a40, 6); st.position.y = 0.7; g.add(st);
    var bowl = cyl(0.7, 0.4, 0.5, 0x4a4a50, 8); bowl.position.y = 1.6; g.add(bowl);
    var fire = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 5), mat(0xff8030, { emissive: 0xff5010 })); fire.position.y = 2.2; g.add(fire);
    return g;
  };
  M.biomeProps.barrel = function (rnd) {
    var g = new THREE.Group();
    var n = 1 + Math.floor(rnd() * 3);
    for (var i = 0; i < n; i++) {
      var b = cyl(0.45, 0.5, 1.0, 0x6a4a2a, 8); b.position.set(i * 1.0, 0.5, (i % 2) * 0.5); g.add(b);
      var band = cyl(0.52, 0.52, 0.12, 0x3a3a40, 8); band.position.copy(b.position); g.add(band);
    }
    return g;
  };
  M.biomeProps.stalagmite = function (rnd) {
    var g = new THREE.Group();
    for (var i = 0; i < 3; i++) {
      var h = R(rnd, 0.8, 3.2);
      var c = cone(R(rnd, 0.25, 0.5), h, i % 2 ? 0x3a3040 : 0x4a3a50, 6);
      c.position.set(R(rnd, -0.7, 0.7), h / 2, R(rnd, -0.7, 0.7)); g.add(c);
    }
    return g;
  };
  M.biomeProps.glowFungus = function (rnd) {
    var g = new THREE.Group();
    var n = 3 + Math.floor(rnd() * 4);
    for (var i = 0; i < n; i++) {
      var h = R(rnd, 0.3, 1.1);
      var st = cyl(0.06, 0.08, h, 0xc0c8d0, 5); st.position.set(R(rnd, -0.6, 0.6), h / 2, R(rnd, -0.6, 0.6)); g.add(st);
      var cap = new THREE.Mesh(new THREE.SphereGeometry(R(rnd, 0.15, 0.32), 6, 4), mat(i % 2 ? 0x40e0c0 : 0x80a0ff, { emissive: 0x208070 }));
      cap.position.set(st.position.x, h, st.position.z); g.add(cap);
    }
    return g;
  };
  M.biomeProps.cloudPillar = function (rnd) {
    var g = new THREE.Group();
    var h = R(rnd, 2.5, 6);
    var p = cyl(0.5, 0.7, h, 0xf0f0f4, 8); p.position.y = h / 2; g.add(p);
    var cap = cyl(0.8, 0.6, 0.4, 0xe0b050, 8); cap.position.y = h + 0.2; g.add(cap);
    return g;
  };
  M.biomeProps.aetherTree = function (rnd) {
    var g = new THREE.Group();
    var h = R(rnd, 2.6, 4.4);
    var trunk = cyl(0.14, 0.24, h, 0xd0c8e8, 6); trunk.position.y = h / 2; g.add(trunk);
    for (var i = 0; i < 3; i++) {
      var c = ico(R(rnd, 0.7, 1.2), i % 2 ? 0xe8b0e0 : 0xf4d0f0);
      c.scale.y = 0.6; c.position.set(R(rnd, -0.6, 0.6), h - 0.2 + R(rnd, -0.2, 0.5), R(rnd, -0.6, 0.6)); g.add(c);
    }
    return g;
  };
  M.biomeProps.skyLantern = function (rnd) {
    var g = new THREE.Group();
    var h = R(rnd, 1.5, 3.2);
    var pole = box(0.12, h, 0.12, 0xe0b050); pole.position.y = h / 2; g.add(pole);
    var lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.35), mat(0xfff0a0, { emissive: 0xffd040 })); lamp.position.y = h + 0.3; g.add(lamp);
    return g;
  };

  // track furniture for elevated sections
  M.buildTrackPillar = function (h) {
    var g = new THREE.Group();
    var p = box(1.6, h, 1.6, 0x3a3f4c); p.position.y = h / 2; g.add(p);
    var foot = box(2.6, 0.6, 2.6, 0x2a2e38); foot.position.y = 0.3; g.add(foot);
    return g;
  };
  M.buildRail = function (len) {
    var g = new THREE.Group();
    var r = box(0.25, 0.25, len, 0xd0d4dc); r.position.y = 0.9; g.add(r);
    var post = box(0.25, 0.9, 0.25, 0x8a8e98); post.position.y = 0.45; g.add(post);
    return g;
  };

  // ---------------------------------------------------------------
  // More native fauna (silhouettes first: beaks, mandibles, masks, rays)
  // ---------------------------------------------------------------
  M.buildBeakStrider = function (color) {
    var g = new THREE.Group();
    var c = color || 0xb0885a;
    var body = ico(0.5, c); body.scale.set(0.8, 0.7, 1.2); body.position.y = 1.9; g.add(body);
    var neck = box(0.22, 0.7, 0.22, c); neck.position.set(0, 2.4, 0.5); neck.rotation.x = -0.6; g.add(neck);
    var head = box(0.36, 0.3, 0.4, c); head.position.set(0, 2.75, 0.85); g.add(head);
    var beak = cone(0.14, 0.8, 0x50381e, 4); beak.rotation.x = Math.PI / 2; beak.position.set(0, 2.7, 1.35); g.add(beak);
    var eye = box(0.4, 0.06, 0.05, 0xffd040); eye.position.set(0, 2.85, 1.0); g.add(eye);
    var legs = {};
    ['legL', 'legR'].forEach(function (k, i) {
      var thigh = box(0.14, 1.0, 0.14, 0x50381e); thigh.position.set(i ? 0.28 : -0.28, 1.2, 0); g.add(thigh);
      var shin = box(0.1, 0.9, 0.1, 0x50381e); shin.position.set(i ? 0.28 : -0.28, 0.45, 0.1); g.add(shin);
      legs[k] = thigh;
    });
    legs.armL = box(0.01, 0.01, 0.01, c); legs.armR = box(0.01, 0.01, 0.01, c); g.add(legs.armL, legs.armR);
    g.userData.limbs = legs;
    blobShadow(g, 1.4);
    return g;
  };
  M.buildLeech = function (color) {
    var g = new THREE.Group();
    var c = color || 0x4a6a5a;
    for (var i = 0; i < 4; i++) {
      var seg = ico(0.34 - i * 0.05, i % 2 ? c : 0x3a5a4a); seg.scale.y = 0.7; seg.position.set(0, 0.32, -i * 0.5); g.add(seg);
    }
    var mouth = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.08, 4, 8), mat(0xe04040)); mouth.position.set(0, 0.35, 0.35); g.add(mouth);
    g.userData.core = mouth;
    blobShadow(g, 1.0);
    return g;
  };
  M.buildHowler = function () {
    var g = new THREE.Group();
    var c = 0xd8dce8;
    var body = box(0.7, 0.6, 1.4, c); body.position.y = 0.95; g.add(body);
    var mane = ico(0.6, 0xb0b8c8); mane.position.set(0, 1.25, 0.6); g.add(mane);
    var head = box(0.36, 0.34, 0.6, c); head.position.set(0, 1.35, 1.05); head.rotation.x = -0.4; g.add(head);
    var eye = box(0.28, 0.06, 0.05, 0x60c0ff); eye.position.set(0, 1.45, 1.3); g.add(eye);
    var legs = {};
    ['legL', 'legR', 'armL', 'armR'].forEach(function (k, i) {
      var l = box(0.16, 0.7, 0.16, 0x9aa8c0); l.position.set(i % 2 ? 0.3 : -0.3, 0.35, i < 2 ? 0.5 : -0.5); g.add(l); legs[k] = l;
    });
    g.userData.limbs = legs;
    blobShadow(g, 1.6);
    return g;
  };
  M.buildSkitter = function () {
    var g = new THREE.Group();
    var body = ico(0.45, 0x5a3a6a); body.scale.y = 0.6; body.position.y = 0.55; g.add(body);
    var head = box(0.3, 0.26, 0.34, 0x4a2a5a); head.position.set(0, 0.55, 0.55); g.add(head);
    var mL = box(0.06, 0.06, 0.5, 0xe0d0c0); mL.position.set(-0.14, 0.5, 0.85); mL.rotation.y = 0.5; g.add(mL);
    var mR = box(0.06, 0.06, 0.5, 0xe0d0c0); mR.position.set(0.14, 0.5, 0.85); mR.rotation.y = -0.5; g.add(mR);
    var eye = box(0.24, 0.05, 0.05, 0xff8040); eye.position.set(0, 0.62, 0.72); g.add(eye);
    for (var i = 0; i < 6; i++) {
      var leg = box(0.06, 0.6, 0.06, 0x3a2a4a);
      var side = i % 2 ? 1 : -1;
      leg.position.set(side * 0.5, 0.3, (Math.floor(i / 2) - 1) * 0.35); leg.rotation.z = side * 0.9; g.add(leg);
    }
    blobShadow(g, 1.1);
    return g;
  };
  M.buildToad = function () {
    var g = new THREE.Group();
    var body = ico(0.7, 0x6a8a3a); body.scale.set(1.1, 0.7, 1.0); body.position.y = 0.6; g.add(body);
    var throat = ico(0.45, 0xc0d080); throat.scale.y = 0.6; throat.position.set(0, 0.45, 0.55); g.add(throat);
    var eyeL = ico(0.16, 0xffd040); eyeL.position.set(-0.3, 1.05, 0.4); g.add(eyeL);
    var eyeR = ico(0.16, 0xffd040); eyeR.position.set(0.3, 1.05, 0.4); g.add(eyeR);
    for (var i = 0; i < 4; i++) {
      var leg = box(0.16, 0.35, 0.3, 0x4a6a2a); leg.position.set(i % 2 ? 0.6 : -0.6, 0.18, i < 2 ? 0.4 : -0.4); g.add(leg);
    }
    g.userData.core = throat;
    blobShadow(g, 1.5);
    return g;
  };
  M.buildHound = function (color) {
    var g = new THREE.Group();
    var c = color || 0x4a2a20;
    var body = box(0.4, 0.4, 1.0, c); body.position.y = 0.6; g.add(body);
    var head = box(0.3, 0.28, 0.45, c); head.position.set(0, 0.72, 0.7); g.add(head);
    var jaw = box(0.26, 0.08, 0.4, 0xff6020); jaw.position.set(0, 0.6, 0.72); g.add(jaw);
    var eye = box(0.24, 0.05, 0.05, 0xffb020); eye.position.set(0, 0.8, 0.9); g.add(eye);
    var legs = {};
    ['legL', 'legR', 'armL', 'armR'].forEach(function (k, i) {
      var l = box(0.12, 0.5, 0.12, 0x301810); l.position.set(i % 2 ? 0.18 : -0.18, 0.25, i < 2 ? 0.35 : -0.35); g.add(l); legs[k] = l;
    });
    g.userData.limbs = legs;
    blobShadow(g, 1.1);
    return g;
  };
  M.buildGolem = function (color, glow) {
    var g = new THREE.Group();
    var c = color || 0x3a2a28;
    var torso = box(1.2, 1.1, 0.8, c); torso.position.y = 1.5; g.add(torso);
    var core = box(0.5, 0.5, 0.2, glow || 0xff6020); core.position.set(0, 1.5, 0.42); g.add(core);
    var head = box(0.5, 0.45, 0.5, c); head.position.y = 2.3; g.add(head);
    var eye = box(0.34, 0.08, 0.05, glow || 0xff6020); eye.position.set(0, 2.32, 0.27); g.add(eye);
    var legs = {};
    ['legL', 'legR'].forEach(function (k, i) { var l = box(0.4, 1.0, 0.45, c); l.position.set(i ? 0.38 : -0.38, 0.5, 0); g.add(l); legs[k] = l; });
    ['armL', 'armR'].forEach(function (k, i) { var a = box(0.4, 1.3, 0.4, c); a.position.set(i ? 0.95 : -0.95, 1.4, 0); g.add(a); legs[k] = a; });
    g.userData.limbs = legs;
    g.userData.core = core;
    blobShadow(g, 2.2);
    return g;
  };
  M.buildTurret = function (kind) {
    var g = new THREE.Group();
    if (kind === 'ballista') {
      var base = box(1.6, 0.6, 1.6, 0x5a4a3a); base.position.y = 0.3; g.add(base);
      var post = box(0.3, 1.2, 0.3, 0x4a3a2a); post.position.y = 1.2; g.add(post);
      var bow = box(2.4, 0.15, 0.15, 0x6a5a4a); bow.position.set(0, 1.7, 0.3); g.add(bow);
      var rail = box(0.2, 0.2, 1.6, 0x4a3a2a); rail.position.set(0, 1.7, 0); g.add(rail);
      g.userData.core = rail;
    } else {
      var base2 = cyl(0.9, 1.1, 0.5, 0x3a3f4c, 8); base2.position.y = 0.25; g.add(base2);
      var rod = cyl(0.18, 0.22, 2.4, 0x5a5f6c, 6); rod.position.y = 1.7; g.add(rod);
      var tip = new THREE.Mesh(new THREE.OctahedronGeometry(0.4), mat(0x80c0ff, { emissive: 0x4080ff })); tip.position.y = 3.1; g.add(tip);
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 4, 10), mat(0x9ab0ff, { emissive: 0x3050a0 })); ring.position.y = 2.2; ring.rotation.x = Math.PI / 2; g.add(ring);
      g.userData.core = tip; g.userData.ring = ring;
    }
    blobShadow(g, 1.6);
    return g;
  };
  M.buildEyeCluster = function () {
    var g = new THREE.Group();
    var core = ico(0.4, 0x3a2a50); core.position.y = 1.1; g.add(core);
    for (var i = 0; i < 5; i++) {
      var a = (i / 5) * Math.PI * 2;
      var eye = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), mat(0xe0d0ff, { emissive: 0x8060c0 }));
      eye.position.set(Math.cos(a) * 0.5, 1.1 + Math.sin(a * 2) * 0.2, Math.sin(a) * 0.5); g.add(eye);
      var pupil = box(0.08, 0.08, 0.08, 0x200030); pupil.position.set(Math.cos(a) * 0.66, eye.position.y, Math.sin(a) * 0.66); g.add(pupil);
    }
    g.userData.core = core;
    blobShadow(g, 1.0);
    return g;
  };
  M.buildSlinger = function () {
    var g = new THREE.Group();
    var body = ico(0.4, 0x5a6a4a); body.scale.y = 0.8; body.position.y = 1.5; g.add(body);
    var mask = box(0.5, 0.36, 0.2, 0x8a8a90); mask.position.set(0, 1.62, 0.36); g.add(mask);
    var lens = box(0.12, 0.12, 0.06, 0xff4040); lens.position.set(0.12, 1.66, 0.48); g.add(lens);
    var gun = box(0.14, 0.14, 0.9, 0x2a2a30); gun.position.set(0.45, 1.4, 0.4); g.add(gun);
    var legs = {};
    ['legL', 'legR'].forEach(function (k, i) {
      var l = box(0.1, 1.1, 0.1, 0x8a8a90); l.position.set(i ? 0.3 : -0.3, 0.55, 0); g.add(l); legs[k] = l;
      var foot = box(0.3, 0.1, 0.5, 0x6a6a70); foot.position.set(i ? 0.3 : -0.3, 0.05, 0.1); g.add(foot);
    });
    legs.armL = box(0.01, 0.01, 0.01, 0x5a6a4a); legs.armR = gun;
    g.userData.limbs = legs;
    blobShadow(g, 1.2);
    return g;
  };
  M.buildKnight = function () {
    var g = M.buildHusk(1.25, 0x7a7a86);
    var shield = box(0.1, 0.9, 0.7, 0x8a2a2a); shield.position.set(-0.55, 1.15, 0.2); g.add(shield);
    var plume = box(0.08, 0.4, 0.3, 0xb02a2a); plume.position.set(0, 2.05, -0.05); g.add(plume);
    var sword = box(0.08, 1.2, 0.12, 0xd0d4dc); sword.position.set(0.55, 1.4, 0.2); sword.rotation.x = -0.5; g.add(sword);
    return g;
  };
  M.buildRay = function () {
    var g = new THREE.Group();
    var body = ico(0.5, 0xe8e0f8); body.scale.set(1.1, 0.35, 1.3); body.position.y = 1.0; g.add(body);
    var wings = [];
    [-1, 1].forEach(function (s) {
      var w = box(1.8, 0.06, 1.1, 0xd0c0f0); w.position.set(s * 1.1, 1.0, -0.1); g.add(w); wings.push(w);
    });
    var tail = box(0.08, 0.08, 1.6, 0xd0c0f0); tail.position.set(0, 1.0, -1.3); g.add(tail);
    var eye = box(0.3, 0.05, 0.05, 0x60c0ff); eye.position.set(0, 1.1, 0.6); g.add(eye);
    g.userData.wings = wings;
    blobShadow(g, 1.8);
    return g;
  };

  return M;
})();
