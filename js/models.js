// HERO FRAME — low-poly procedural meshes (mechs, enemies, props, pickups)
GH.models = (function () {
  var M = {};
  var mat = function (c, o) { return GH.assets.mat(c, o); };
  var box = function (w, h, d, c) {
    return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
  };

  // ---------------------------------------------------------------
  // Generic humanoid mech. Returns group with .parts for animation.
  // cfg: { body, accent, dark, prop: 'sword'|'guns'|'staff'|'scythe'|'lance' }
  // ---------------------------------------------------------------
  M.buildMech = function (cfg) {
    var g = new THREE.Group();
    var body = cfg.body, accent = cfg.accent, dark = cfg.dark || 0x30343a;
    var parts = {};

    // legs
    var legL = new THREE.Group(), legR = new THREE.Group();
    [legL, legR].forEach(function (leg, i) {
      var thigh = box(0.34, 0.55, 0.38, body); thigh.position.y = -0.28;
      var shin = box(0.28, 0.5, 0.3, dark); shin.position.y = -0.78;
      var foot = box(0.36, 0.16, 0.55, body); foot.position.set(0, -1.05, 0.08);
      leg.add(thigh, shin, foot);
      leg.position.set(i === 0 ? -0.26 : 0.26, 1.15, 0);
      g.add(leg);
    });
    parts.legL = legL; parts.legR = legR;

    // torso
    var torso = new THREE.Group();
    var chest = box(0.95, 0.7, 0.6, body); chest.position.y = 0.35;
    var belly = box(0.55, 0.3, 0.42, dark); belly.position.y = -0.05;
    var vent = box(0.5, 0.18, 0.1, accent); vent.position.set(0, 0.45, 0.32);
    torso.add(chest, belly, vent);

    // head
    var head = box(0.42, 0.36, 0.42, body); head.position.y = 0.9;
    var visor = box(0.34, 0.1, 0.06, accent); visor.position.set(0, 0.9, 0.23);
    var crest = box(0.08, 0.3, 0.3, accent); crest.position.set(0, 1.12, 0);
    torso.add(head, visor, crest);

    // shoulders + arms
    var armL = new THREE.Group(), armR = new THREE.Group();
    [armL, armR].forEach(function (arm, i) {
      var side = i === 0 ? -1 : 1;
      var pad = box(0.45, 0.32, 0.5, accent); pad.position.set(0, 0.15, 0);
      var upper = box(0.26, 0.5, 0.28, body); upper.position.y = -0.2;
      var fist = box(0.3, 0.3, 0.3, dark); fist.position.y = -0.55;
      arm.add(pad, upper, fist);
      arm.position.set(side * 0.72, 0.45, 0);
      torso.add(arm);
    });
    parts.armL = armL; parts.armR = armR;

    torso.position.y = 1.55;
    g.add(torso);
    parts.torso = torso;

    // props by archetype
    if (cfg.prop === 'sword') {
      var sword = new THREE.Group();
      var blade = box(0.1, 1.5, 0.26, 0xd8dce8); blade.position.y = 0.95;
      var guard = box(0.34, 0.09, 0.34, accent); guard.position.y = 0.16;
      var grip = box(0.09, 0.32, 0.09, 0x503820); grip.position.y = -0.05;
      sword.add(blade, guard, grip);
      sword.position.set(0, -0.55, 0.1);
      armR.add(sword);
      parts.weapon = sword;

      var shield = new THREE.Group();
      var plate = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 6), mat(0x181818));
      plate.rotation.x = Math.PI / 2;
      var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.06, 6), mat(0xd8b040));
      rim.rotation.x = Math.PI / 2; rim.position.z = -0.02;
      shield.add(rim, plate);
      shield.position.set(0, -0.35, 0.28);
      armL.add(shield);
      parts.shield = shield;
    } else if (cfg.prop === 'guns') {
      [armL, armR].forEach(function (arm) {
        var gun = new THREE.Group();
        var barrel = box(0.16, 0.16, 0.9, 0x484848); barrel.position.set(0, 0, 0.4);
        var muzzle = box(0.2, 0.2, 0.14, accent); muzzle.position.set(0, 0, 0.85);
        gun.add(barrel, muzzle);
        gun.position.set(0, -0.55, 0.1);
        arm.add(gun);
      });
      parts.weapon = armR;
    } else if (cfg.prop === 'staff') {
      var staff = new THREE.Group();
      var pole = box(0.09, 1.9, 0.09, 0x403050); pole.position.y = 0.4;
      var gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.26), mat(accent, { emissive: accent, emissiveIntensity: 0.6 }));
      gem.position.y = 1.45;
      staff.add(pole, gem);
      staff.position.set(0, -0.55, 0.1);
      armR.add(staff);
      parts.weapon = staff;
      parts.gem = gem;
    } else if (cfg.prop === 'scythe') {
      var scy = new THREE.Group();
      var pole2 = box(0.09, 2.1, 0.09, 0x282830); pole2.position.y = 0.5;
      var bladeArm = box(0.85, 0.1, 0.2, 0xc8ccd8); bladeArm.position.set(0.42, 1.5, 0);
      var tip = box(0.3, 0.08, 0.14, 0xc8ccd8); tip.position.set(0.85, 1.4, 0); tip.rotation.z = -0.7;
      scy.add(pole2, bladeArm, tip);
      scy.position.set(0, -0.55, 0.1);
      armR.add(scy);
      parts.weapon = scy;
    } else if (cfg.prop === 'lance') {
      var lance = new THREE.Group();
      var shaft = box(0.12, 0.12, 1.7, 0x505868); shaft.position.z = 0.6;
      var point = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.55, 4), mat(accent, { emissive: accent, emissiveIntensity: 0.4 }));
      point.rotation.x = Math.PI / 2; point.position.z = 1.7;
      lance.add(shaft, point);
      lance.position.set(0, -0.55, 0);
      armR.add(lance);
      parts.weapon = lance;
    }

    // blob shadow
    var sh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), GH.assets.shadowMat);
    sh.rotation.x = -Math.PI / 2;
    sh.position.y = 0.02;
    g.add(sh);

    g.userData.parts = parts;
    return g;
  };

  // ---------------------------------------------------------------
  // Enemies
  // ---------------------------------------------------------------
  M.buildHusk = function (scale, color) {
    var g = new THREE.Group();
    var c = color || 0x9a9a92;
    var torso = box(0.6, 0.7, 0.4, c); torso.position.y = 1.2;
    var head = box(0.34, 0.3, 0.34, c); head.position.y = 1.75;
    var eye = box(0.26, 0.06, 0.05, 0xff3020);
    eye.position.set(0, 1.77, 0.18);
    var legL = box(0.18, 0.85, 0.2, c); legL.position.set(-0.18, 0.45, 0);
    var legR = box(0.18, 0.85, 0.2, c); legR.position.set(0.18, 0.45, 0);
    var armL = box(0.14, 0.6, 0.16, c); armL.position.set(-0.42, 1.2, 0);
    var armR = box(0.14, 0.6, 0.16, c); armR.position.set(0.42, 1.2, 0);
    g.add(torso, head, eye, legL, legR, armL, armR);
    g.userData.limbs = { legL: legL, legR: legR, armL: armL, armR: armR };
    var sh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), GH.assets.shadowMat);
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02;
    g.add(sh);
    if (scale && scale !== 1) g.scale.setScalar(scale);
    return g;
  };

  M.buildShardling = function () {
    var g = new THREE.Group();
    var c = 0x38c8b8;
    var bodyM = mat(c, { emissive: 0x0a4038 });
    var core = new THREE.Mesh(new THREE.OctahedronGeometry(0.34), bodyM);
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
    var sh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), GH.assets.shadowMat);
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02;
    g.add(sh);
    g.userData.core = core;
    return g;
  };

  M.buildOrb = function () {
    var g = new THREE.Group();
    var body = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0),
      mat(0x2848c8, { emissive: 0x101c60 }));
    body.position.y = 0.9;
    var ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.05, 4, 10),
      mat(0x70a0ff, { emissive: 0x2040a0 }));
    ring.position.y = 0.9;
    ring.rotation.x = Math.PI / 2;
    g.add(body, ring);
    g.userData.core = body; g.userData.ring = ring;
    var sh = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), GH.assets.shadowMat);
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02;
    g.add(sh);
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
    var sh = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), GH.assets.shadowMat);
    sh.rotation.x = -Math.PI / 2; sh.position.y = 0.02;
    g.add(sh);
    g.userData.core = core;
    return g;
  };

  M.buildBoss = function (tier) {
    // tier 0: CARRION HULK (teal crystal brute) — tier 1: OMEGA HUSK (dark giant)
    var g;
    if (tier === 0) {
      g = M.buildHusk(2.6, 0x50b0a0);
      for (var i = 0; i < 5; i++) {
        var cry = new THREE.Mesh(new THREE.OctahedronGeometry(0.16),
          mat(0x38e8d0, { emissive: 0x0a5048 }));
        cry.position.set(GH.rand(-0.35, 0.35), GH.rand(1.0, 1.7), GH.rand(-0.2, 0.2));
        cry.rotation.set(Math.random(), Math.random(), Math.random());
        g.add(cry);
      }
    } else {
      g = M.buildHusk(3.4, 0x585048);
      var crown = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 0.3, 6),
        mat(0xc8a030, { emissive: 0x604010 }));
      crown.position.y = 2.05;
      g.add(crown);
    }
    return g;
  };

  // ---------------------------------------------------------------
  // Pickups
  // ---------------------------------------------------------------
  M.buildGem = function (size) {
    // size 0 small teal / 1 med green / 2 big violet
    var colors = [0x38d8c8, 0x48d048, 0xa050e8];
    var radii = [0.16, 0.22, 0.3];
    var m = new THREE.Mesh(new THREE.OctahedronGeometry(radii[size]),
      mat(colors[size], { emissive: colors[size], emissiveIntensity: 0.35 }));
    m.scale.y = 1.5;
    return m;
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

  // ---------------------------------------------------------------
  // Arena props
  // ---------------------------------------------------------------
  M.buildPillar = function () {
    var g = new THREE.Group();
    var h = GH.rand(0.8, 2.2);
    var seg = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, h, 7), mat(0x8a8a86));
    seg.position.y = h / 2;
    seg.rotation.y = Math.random();
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.5, 0.25, 7), mat(0x76766f));
    cap.position.y = h + 0.1;
    g.add(seg, cap);
    return g;
  };

  M.buildTree = function () {
    var g = new THREE.Group();
    var trunk = box(0.14, 1.2, 0.14, 0x4a3828);
    trunk.position.y = 0.6;
    trunk.rotation.z = GH.rand(-0.2, 0.2);
    g.add(trunk);
    for (var i = 0; i < 4; i++) {
      var br = box(0.06, 0.7, 0.06, 0x4a3828);
      br.position.set(GH.rand(-0.2, 0.2), GH.rand(0.9, 1.3), GH.rand(-0.2, 0.2));
      br.rotation.set(GH.rand(-0.9, 0.9), 0, GH.rand(-0.9, 0.9));
      g.add(br);
    }
    return g;
  };

  return M;
})();
