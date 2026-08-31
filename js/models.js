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
  M.buildSpeeder = function (cfg) {
    var g = new THREE.Group();
    var body = cfg.body, accent = cfg.accent, dark = cfg.dark || 0x30343a;
    var hull = box(0.9, 0.4, 2.4, body); hull.position.y = 0.75;
    var nose = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.1, 4), mat(accent));
    nose.rotation.x = Math.PI / 2;
    nose.position.set(0, 0.75, 1.6);
    var canopy = box(0.5, 0.28, 0.8, 0x202830); canopy.position.set(0, 1.05, 0.2);
    var finL = box(0.1, 0.5, 0.9, dark); finL.position.set(-0.55, 0.95, -0.8); finL.rotation.z = 0.5;
    var finR = box(0.1, 0.5, 0.9, dark); finR.position.set(0.55, 0.95, -0.8); finR.rotation.z = -0.5;
    g.add(hull, nose, canopy, finL, finR);
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

  return M;
})();
