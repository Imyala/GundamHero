// HERO FRAME — core game logic
GH.game = (function () {
  var G = {};

  // ---------- scene / world ----------
  var scene, camera, hemi, sun, floor, arenaProps;
  var ARENA_R = 33;

  // ---------- run state ----------
  G.state = 'title'; // title | select | play | reward | pause | over | win
  var player = null;
  var enemies = [], projectiles = [], enemyShots = [], pickups = [], mines = [], effects = [];
  var orbitGroup = null, droneMesh = null, droneAngle = 0;
  var waveNum = 0, waveTimer = 0, wavePlan = null, spawnAcc = 0, bossRef = null;
  var kills = 0, coinsRun = 0, runTime = 0, hitCount = 0;
  var announceTimer = 0;
  var shake = 0;
  var selMechIndex = 0, selPreview = null, selSpin = 0;

  var raycaster = new THREE.Raycaster();
  var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  var tmpV3 = new THREE.Vector3();

  var palettes = [
    { fog: 0x9fc8dc, hemiSky: 0xbfe8ff, hemiGround: 0x24485a, sun: 0xfff4d8 },
    { fog: 0x9a8a6a, hemiSky: 0xffe8c0, hemiGround: 0x3a3020, sun: 0xffe8c0 },
    { fog: 0x6a3028, hemiSky: 0xff9060, hemiGround: 0x2a0e0a, sun: 0xffb080 }
  ];

  // =================================================================
  // INIT
  // =================================================================
  G.init = function () {
    GH.assets.init();

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x9fc8dc, 20, 55);

    camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 200);

    hemi = new THREE.HemisphereLight(0xbfe8ff, 0x24485a, 0.9);
    scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff4d8, 0.9);
    sun.position.set(8, 20, 6);
    scene.add(sun);

    floor = new THREE.Mesh(
      new THREE.PlaneGeometry(110, 110),
      new THREE.MeshLambertMaterial({ map: GH.assets.floorTex[0] })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    arenaProps = new THREE.Group();
    scene.add(arenaProps);
    scatterProps();

    orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    G.dmg = makeDamageLayer();
  };

  function scatterProps() {
    while (arenaProps.children.length) arenaProps.remove(arenaProps.children[0]);
    for (var i = 0; i < 14; i++) {
      var p = Math.random() < 0.5 ? GH.models.buildPillar() : GH.models.buildTree();
      var a = Math.random() * Math.PI * 2;
      var r = GH.rand(10, ARENA_R + 4);
      p.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      arenaProps.add(p);
    }
  }

  function applyPalette(idx) {
    var pal = palettes[idx];
    scene.fog.color.setHex(pal.fog);
    hemi.color.setHex(pal.hemiSky);
    hemi.groundColor.setHex(pal.hemiGround);
    sun.color.setHex(pal.sun);
    floor.material.map = GH.assets.floorTex[idx];
    floor.material.needsUpdate = true;
  }

  // =================================================================
  // DAMAGE NUMBER LAYER (DOM)
  // =================================================================
  function makeDamageLayer() {
    var layer = document.getElementById('damage-layer');
    var pool = [];
    for (var i = 0; i < 50; i++) {
      var d = document.createElement('div');
      d.className = 'dmg-num';
      d.style.display = 'none';
      layer.appendChild(d);
      pool.push({ el: d, life: 0, wx: 0, wy: 0, wz: 0, vy: 0 });
    }
    var idx = 0;
    return {
      spawn: function (x, y, z, text, cls, size) {
        var n = pool[idx]; idx = (idx + 1) % pool.length;
        n.life = 0.75;
        n.wx = x + GH.rand(-0.4, 0.4); n.wy = y; n.wz = z;
        n.vy = 2.6;
        n.el.textContent = text;
        n.el.className = 'dmg-num' + (cls ? ' ' + cls : '');
        n.el.style.fontSize = (size || 17) + 'px';
        n.el.style.display = 'block';
      },
      update: function (dt, w, h) {
        for (var i = 0; i < pool.length; i++) {
          var n = pool[i];
          if (n.life <= 0) continue;
          n.life -= dt;
          if (n.life <= 0) { n.el.style.display = 'none'; continue; }
          n.wy += n.vy * dt;
          n.vy -= 5 * dt;
          tmpV3.set(n.wx, n.wy, n.wz).project(camera);
          n.el.style.left = ((tmpV3.x * 0.5 + 0.5) * w) + 'px';
          n.el.style.top = ((-tmpV3.y * 0.5 + 0.5) * h) + 'px';
          n.el.style.opacity = Math.min(1, n.life * 3);
        }
      }
    };
  }

  // =================================================================
  // PLAYER
  // =================================================================
  function makePlayer(mechDef) {
    var s = mechDef.stats;
    var p = {
      def: mechDef,
      mesh: GH.models.buildMech(mechDef.model),
      x: 0, z: 0, facing: 0, moveX: 0, moveZ: 0,
      stats: {
        maxHP: s.maxHP, speed: s.speed * 0.42, armor: s.armor,
        block: s.block, crit: s.crit, critMult: 1.6, lifesteal: s.lifesteal,
        damageMult: 1, atkSpdMult: 1, flatDamage: 0,
        regen: 0, magnet: 3.2, xpGain: 1, bonusProj: 0, boostRegen: 0.35
      },
      hp: s.maxHP,
      xp: 0, level: 1, xpNeed: 6,
      weapons: [],           // secondary weapon instances
      weaponLevels: {},      // card id -> level
      primaryTimer: 0,
      boost: 1, dashTime: 0, dashX: 0, dashZ: 0, dashId: 0,
      blocking: false,
      special: { cd: 0, active: 0 },
      hurtCd: 0,
      heal: function (amt) {
        if (p.hp <= 0) return;
        var real = Math.min(amt, p.stats.maxHP - p.hp);
        p.hp += real;
        if (real >= 1) G.dmg.spawn(p.x, 2.4, p.z, '+' + Math.round(real), 'heal', 15);
      }
    };
    p.mesh.position.set(0, 0, 0);
    scene.add(p.mesh);
    return p;
  }

  function playerDamage(raw, srcX, srcZ) {
    if (!player || player.hp <= 0 || player.dashTime > 0.12) return; // brief i-frames while dashing
    // block stat: full negate
    if (Math.random() * 100 < player.stats.block) {
      G.dmg.spawn(player.x, 2.6, player.z, 'BLOCK', 'heal', 14);
      GH.audio.block();
      if (player.def.special === 'block') player.heal(2);
      return;
    }
    var dmg = Math.max(1, Math.round(raw - player.stats.armor));
    if (player.blocking) {
      dmg = Math.max(1, Math.round(dmg * 0.3));
      player.heal(3);
      GH.audio.block();
    }
    player.hp -= dmg;
    player.hurtCd = 0.25;
    shake = Math.min(0.5, shake + 0.18);
    G.dmg.spawn(player.x, 2.6, player.z, dmg, 'player', 19);
    GH.audio.hurt();
    if (player.hp <= 0) {
      player.hp = 0;
      gameOver(false);
    }
  }

  function gainXP(amount) {
    player.xp += amount * player.stats.xpGain;
    while (player.xp >= player.xpNeed) {
      player.xp -= player.xpNeed;
      player.level++;
      player.xpNeed = 6 + player.level * 3;
      applyLevelUp();
      GH.audio.levelup();
      announce('LVL ' + player.level, 22);
    }
  }

  function applyLevelUp() {
    var g = player.def.levelUp, s = player.stats;
    for (var k in g) {
      var v = g[k];
      if (k === 'maxHP') { s.maxHP += v; player.heal(v); }
      else if (k === 'armor') s.armor += v;
      else if (k === 'block') s.block += v;
      else if (k === 'damage') s.flatDamage += v;
      else if (k === 'atkSpd') s.atkSpdMult += v / 100;
      else if (k === 'crit') s.crit += v;
      else if (k === 'speed') s.speed += v * 0.42;
      else if (k === 'lifesteal') s.lifesteal += v;
      else if (k === 'magnet') s.magnet *= 1 + v / 100;
    }
  }

  // =================================================================
  // ENEMIES
  // =================================================================
  function spawnEnemy(typeId, atX, atZ) {
    if (enemies.length > 110) return null;
    var def = GH.enemyDefs[typeId];
    var mesh = GH.enemyBuilders[typeId]();
    var x, z;
    if (atX !== undefined) { x = atX; z = atZ; }
    else {
      var a = Math.random() * Math.PI * 2;
      var r = GH.rand(18, 24);
      x = GH.clamp(player.x + Math.cos(a) * r, -ARENA_R, ARENA_R);
      z = GH.clamp(player.z + Math.sin(a) * r, -ARENA_R, ARENA_R);
    }
    mesh.position.set(x, 0, z);
    scene.add(mesh);
    var e = {
      id: typeId, def: def, mesh: mesh,
      x: x, z: z, vx: 0, vz: 0,
      hp: def.hp * wavePlan.hpMult * (def.boss ? 1 : 1),
      maxHp: def.hp * wavePlan.hpMult,
      damage: def.damage * wavePlan.dmgMult,
      attackCd: GH.rand(0, 0.5),
      shootCd: def.shootInterval ? GH.rand(1, def.shootInterval) : 0,
      dashCd: def.dashInterval ? GH.rand(1, def.dashInterval) : 0,
      dashing: 0, telegraphing: 0,
      bossTimer1: 4, bossTimer2: 8,
      anim: Math.random() * 10,
      lastOrbitHit: 0, lastDashId: -1, lastAuraTick: 0,
      dead: false
    };
    enemies.push(e);
    if (def.boss) {
      bossRef = e;
      GH.audio.boss();
      announce(def.name, 34);
      showBossBar(def.name);
    }
    return e;
  }

  function damageEnemy(e, raw, canCrit, srcTag) {
    if (e.dead || G.state !== 'play') return;
    var dmg = raw;
    var crit = false;
    if (canCrit !== false && Math.random() * 100 < player.stats.crit) {
      dmg *= player.stats.critMult;
      crit = true;
    }
    dmg = Math.max(1, Math.round(dmg));
    hitCount++;
    e.hp -= dmg;
    G.dmg.spawn(e.x, 2.0 + (e.def.boss ? 2 : 0), e.z, crit ? dmg + '!' : dmg, crit ? 'crit' : '', crit ? 20 : 15);
    if (crit) GH.audio.crit(); else GH.audio.hit();
    if (player.stats.lifesteal > 0) {
      player.heal(dmg * player.stats.lifesteal / 100 * 0.35);
    }
    // hit flash
    e.mesh.traverse(function (m) {
      if (m.material && m.material.emissive) {
        m.userData._e = m.userData._e || m.material.emissive.getHex();
      }
    });
    if (e.hp <= 0) killEnemy(e);
  }

  function killEnemy(e) {
    if (e.dead) return;
    e.dead = true;
    kills++;
    scene.remove(e.mesh);
    spawnBurst(e.x, 1, e.z, e.def.boss ? 0xffd060 : 0xc0c0c0, e.def.boss ? 26 : 8);
    // drops
    var xp = e.def.xp;
    while (xp > 0) {
      var size = xp >= 10 ? 2 : (xp >= 3 ? 1 : 0);
      var val = size === 2 ? 10 : (size === 1 ? 3 : 1);
      if (val > xp) { size = 0; val = 1; }
      spawnPickup('gem' + size, e.x + GH.rand(-0.6, 0.6), e.z + GH.rand(-0.6, 0.6));
      xp -= val;
    }
    if (e.def.boss) {
      for (var c = 0; c < 20; c++) spawnPickup('coin', e.x + GH.rand(-2, 2), e.z + GH.rand(-2, 2));
      hideBossBar();
      if (bossRef === e) bossRef = null;
      GH.audio.explode();
    } else {
      if (Math.random() < 0.10) spawnPickup('coin', e.x, e.z);
      if (Math.random() < 0.045) spawnPickup('heart', e.x, e.z);
    }
  }

  function updateEnemies(dt) {
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      if (e.dead) { enemies.splice(i, 1); continue; }
      var def = e.def;
      var dx = player.x - e.x, dz = player.z - e.z;
      var dist = Math.sqrt(dx * dx + dz * dz) || 0.001;
      var nx = dx / dist, nz = dz / dist;
      var spd = def.speed;

      e.anim += dt * (4 + def.speed);

      // behavior
      var mx = 0, mz = 0;
      if (def.behavior === 'chase') {
        mx = nx; mz = nz;
      } else if (def.behavior === 'ranged') {
        if (dist > def.keepDist + 1) { mx = nx; mz = nz; }
        else if (dist < def.keepDist - 2) { mx = -nx; mz = -nz; }
        e.shootCd -= dt;
        if (e.shootCd <= 0 && dist < 22) {
          e.shootCd = def.shootInterval;
          spawnEnemyShot(e.x, 1, e.z, nx, nz, def.shotSpeed, e.damage * 0.9);
        }
      } else if (def.behavior === 'dasher') {
        if (e.dashing > 0) {
          e.dashing -= dt;
          spd = def.dashSpeed;
          mx = e.dashDirX; mz = e.dashDirZ;
        } else if (e.telegraphing > 0) {
          e.telegraphing -= dt;
          spd = 0;
          if (e.telegraphing <= 0) {
            e.dashing = def.dashTime;
            e.dashDirX = nx; e.dashDirZ = nz;
          }
        } else {
          mx = nx; mz = nz;
          e.dashCd -= dt;
          if (e.dashCd <= 0 && dist < 12) {
            e.dashCd = def.dashInterval;
            e.telegraphing = 0.5;
          }
        }
      } else if (def.behavior === 'boss') {
        mx = nx; mz = nz;
        e.bossTimer1 -= dt;
        e.bossTimer2 -= dt;
        if (e.bossTimer1 <= 0) {           // slam telegraph at player position
          e.bossTimer1 = 6;
          spawnTelegraph(player.x, player.z, 3.4, 1.0, e.damage * 1.4);
        }
        if (e.bossTimer2 <= 0) {           // summon adds / radial shots
          e.bossTimer2 = 9;
          if (def.tier === 0) {
            for (var s2 = 0; s2 < 4; s2++) {
              spawnEnemy('shardling', e.x + GH.rand(-2, 2), e.z + GH.rand(-2, 2));
            }
          } else {
            for (var s3 = 0; s3 < 10; s3++) {
              var ang = (s3 / 10) * Math.PI * 2;
              spawnEnemyShot(e.x, 1.4, e.z, Math.sin(ang), Math.cos(ang), 8, e.damage * 0.7);
            }
            for (var s4 = 0; s4 < 2; s4++) {
              spawnEnemy('husk', e.x + GH.rand(-3, 3), e.z + GH.rand(-3, 3));
            }
          }
        }
      }

      // separation (cheap, only vs nearby)
      var sepX = 0, sepZ = 0;
      for (var j = 0; j < enemies.length; j++) {
        if (j === i) continue;
        var o = enemies[j];
        var ox = e.x - o.x, oz = e.z - o.z;
        var d2 = ox * ox + oz * oz;
        var minD = e.def.radius + o.def.radius;
        if (d2 < minD * minD && d2 > 0.0001) {
          var d = Math.sqrt(d2);
          sepX += (ox / d) * (minD - d);
          sepZ += (oz / d) * (minD - d);
        }
      }

      e.x += (mx * spd + sepX * 4 + e.vx) * dt;
      e.z += (mz * spd + sepZ * 4 + e.vz) * dt;
      e.vx *= Math.pow(0.02, dt);  // knockback decay
      e.vz *= Math.pow(0.02, dt);
      e.x = GH.clamp(e.x, -ARENA_R - 3, ARENA_R + 3);
      e.z = GH.clamp(e.z, -ARENA_R - 3, ARENA_R + 3);

      // never overlap the player: hold attackers on a contact ring
      var pdx = e.x - player.x, pdz = e.z - player.z;
      var pd = Math.sqrt(pdx * pdx + pdz * pdz) || 0.001;
      var minPD = def.radius + 0.65;
      if (pd < minPD) {
        e.x = player.x + (pdx / pd) * minPD;
        e.z = player.z + (pdz / pd) * minPD;
      }

      e.mesh.position.set(e.x, 0, e.z);
      e.mesh.rotation.y = Math.atan2(nx, nz);

      // walk animation
      var limbs = e.mesh.userData.limbs;
      if (limbs) {
        var sw = Math.sin(e.anim) * 0.5;
        limbs.legL.rotation.x = sw;
        limbs.legR.rotation.x = -sw;
        limbs.armL.rotation.x = -sw * 0.7;
        limbs.armR.rotation.x = sw * 0.7;
      }
      if (e.mesh.userData.core) {
        e.mesh.userData.core.rotation.y += dt * 3;
        if (e.telegraphing > 0) {
          e.mesh.userData.core.scale.setScalar(1 + Math.sin(e.anim * 6) * 0.25);
        }
      }
      if (e.mesh.userData.ring) e.mesh.userData.ring.rotation.z += dt * 2;

      // contact damage
      e.attackCd -= dt;
      if (dist < def.radius + 0.8 && e.attackCd <= 0) {
        e.attackCd = 1.1;
        playerDamage(e.damage, e.x, e.z);
      }
    }
  }

  // ---------- boss telegraph (red zone -> slam) ----------
  function spawnTelegraph(x, z, radius, delay, dmg) {
    var m = new THREE.Mesh(
      new THREE.CircleGeometry(radius, 20),
      new THREE.MeshBasicMaterial({ color: 0xff2020, transparent: true, opacity: 0.35, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.04, z);
    scene.add(m);
    effects.push({
      kind: 'telegraph', mesh: m, t: delay, radius: radius, damage: dmg, x: x, z: z
    });
  }

  // =================================================================
  // PROJECTILES / WEAPON FIRE
  // =================================================================
  function projMesh(size, color) {
    var m = new THREE.Mesh(
      new THREE.ConeGeometry(size, size * 3.2, 5),
      GH.assets.basic(color)
    );
    m.rotation.order = 'YXZ';
    return m;
  }

  function fireShot(w, originX, originZ, aimAngle) {
    // soft aim assist: snap the volley to an enemy near the aim line
    var bestE = null, bestDiff = 0.35;
    for (var ai = 0; ai < enemies.length; ai++) {
      var ae = enemies[ai];
      if (ae.dead) continue;
      if (GH.dist2(originX, originZ, ae.x, ae.z) > 28 * 28) continue;
      var aa = GH.angleTo(originX, originZ, ae.x, ae.z);
      var ad = Math.abs(((aa - aimAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (ad < bestDiff) { bestDiff = ad; bestE = ae; }
    }
    if (bestE) aimAngle = GH.angleTo(originX, originZ, bestE.x, bestE.z);

    var count = w.count + (w === player.primaryRef ? player.stats.bonusProj : 0);
    for (var i = 0; i < count; i++) {
      var off = count > 1 ? (i - (count - 1) / 2) * (w.spread / Math.max(1, count - 1) * 2) : GH.rand(-w.spread, w.spread) * 0.5;
      var a = aimAngle + off;
      var m = projMesh(w.size, w.color);
      m.position.set(originX, 1.2, originZ);
      scene.add(m);
      projectiles.push({
        mesh: m, x: originX, z: originZ,
        dirX: Math.sin(a), dirZ: Math.cos(a),
        speed: w.speed, life: w.life,
        damage: (w.damage + player.stats.flatDamage) * player.stats.damageMult,
        pierce: w.pierce || 0, homing: w.homing || 0, aoe: w.aoe || 0,
        hitSet: []
      });
    }
    GH.audio.shoot();
  }

  function nearestEnemy(x, z, maxDist, exclude) {
    var best = null, bestD = (maxDist || 999) * (maxDist || 999);
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead || (exclude && exclude.indexOf(e) !== -1)) continue;
      var d2 = GH.dist2(x, z, e.x, e.z);
      if (d2 < bestD) { bestD = d2; best = e; }
    }
    return best;
  }

  function updateWeapons(dt) {
    var aim = player.facing;
    var spdMult = player.stats.atkSpdMult * (player.special.active > 0 && player.def.special === 'overdrive' ? 2 : 1);

    // primary
    var pw = player.def.weapon;
    player.primaryRef = pw;
    player.primaryTimer -= dt * spdMult;
    if (player.primaryTimer <= 0) {
      player.primaryTimer = pw.interval;
      if (pw.type === 'shot') {
        fireShot(pw, player.x + Math.sin(aim) * 0.8, player.z + Math.cos(aim) * 0.8, aim);
      } else if (pw.type === 'melee') {
        meleeSwing(pw, aim);
      } else if (pw.type === 'aura') {
        auraTick(pw);
      }
    }

    // secondaries
    for (var i = 0; i < player.weapons.length; i++) {
      var inst = player.weapons[i];
      var w = inst.w;
      inst.timer -= dt * spdMult;
      if (inst.timer > 0) continue;
      inst.timer = w.interval;

      if (w.type === 'shot') {
        // aim at nearest enemy if homing-ish, else player aim
        var tgt = nearestEnemy(player.x, player.z, 26);
        var a2 = tgt ? GH.angleTo(player.x, player.z, tgt.x, tgt.z) : aim;
        fireShot(w, player.x, player.z, a2);
      } else if (w.type === 'zap') {
        zapChain(w);
      } else if (w.type === 'mine') {
        dropMine(w);
      } else if (w.type === 'drone') {
        var t2 = nearestEnemy(droneMesh ? droneMesh.position.x : player.x, droneMesh ? droneMesh.position.z : player.z, 24);
        if (t2 && droneMesh) {
          var a3 = GH.angleTo(droneMesh.position.x, droneMesh.position.z, t2.x, t2.z);
          var saveDX = { type: 'shot', damage: w.damage, speed: w.speed, life: w.life, size: w.size, color: w.color, spread: 0, count: 1 };
          fireShot(saveDX, droneMesh.position.x, droneMesh.position.z, a3);
        }
      }
      // orbit blades handled continuously below
    }
  }

  function meleeSwing(w, aim) {
    GH.audio.melee();
    // visual arc
    var geo = new THREE.CircleGeometry(w.range, 12, aim - w.arc / 2 + Math.PI / 2, w.arc);
    var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0xfff0c0, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide
    }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(player.x, 0.35, player.z);
    scene.add(m);
    effects.push({ kind: 'fade', mesh: m, t: 0.18, total: 0.18 });
    // arm animation
    var parts = player.mesh.userData.parts;
    if (parts && parts.armR) { parts.armR.rotation.x = -2.2; }

    var dmg = (w.damage + player.stats.flatDamage) * player.stats.damageMult;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      var d2 = GH.dist2(player.x, player.z, e.x, e.z);
      var rr = w.range + e.def.radius;
      if (d2 > rr * rr) continue;
      var angTo = GH.angleTo(player.x, player.z, e.x, e.z);
      var diff = Math.abs(((angTo - aim + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (diff <= w.arc / 2 + 0.25) {
        damageEnemy(e, dmg);
        var kb = w.knockback / e.def.mass;
        e.vx += Math.sin(angTo) * kb;
        e.vz += Math.cos(angTo) * kb;
      }
    }
  }

  function auraTick(w) {
    var range = w.range * (player.special.active > 0 && player.def.special === 'frenzy' ? 1.9 : 1);
    var dmg = (w.damage + player.stats.flatDamage) * player.stats.damageMult;
    var hitAny = false;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      var rr = range + e.def.radius;
      if (GH.dist2(player.x, player.z, e.x, e.z) <= rr * rr) {
        damageEnemy(e, dmg);
        hitAny = true;
      }
    }
    if (hitAny) GH.audio.melee();
    // ring flash
    var m = new THREE.Mesh(
      new THREE.RingGeometry(range - 0.25, range, 22),
      new THREE.MeshBasicMaterial({ color: 0xc04060, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(player.x, 0.3, player.z);
    scene.add(m);
    effects.push({ kind: 'fade', mesh: m, t: 0.22, total: 0.22 });
  }

  function zapChain(w) {
    var hit = [];
    var fromX = player.x, fromZ = player.z, fromY = 1.6;
    var dmg = (w.damage + player.stats.flatDamage) * player.stats.damageMult;
    for (var t = 0; t < w.targets; t++) {
      var e = nearestEnemy(fromX, fromZ, w.range, hit);
      if (!e) break;
      hit.push(e);
      drawLightning(fromX, fromY, fromZ, e.x, 1.2, e.z);
      damageEnemy(e, dmg);
      fromX = e.x; fromZ = e.z; fromY = 1.2;
    }
    if (hit.length) GH.audio.zap();
  }

  function drawLightning(x1, y1, z1, x2, y2, z2) {
    var pts = [];
    var segs = 6;
    for (var i = 0; i <= segs; i++) {
      var t = i / segs;
      var jit = (i > 0 && i < segs) ? 0.4 : 0;
      pts.push(new THREE.Vector3(
        GH.lerp(x1, x2, t) + GH.rand(-jit, jit),
        GH.lerp(y1, y2, t) + GH.rand(-jit, jit),
        GH.lerp(z1, z2, t) + GH.rand(-jit, jit)
      ));
    }
    var line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x80e8ff, transparent: true, opacity: 0.9 })
    );
    scene.add(line);
    effects.push({ kind: 'fade', mesh: line, t: 0.15, total: 0.15 });
  }

  function dropMine(w) {
    var m = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 0.18, 8),
      GH.assets.mat(0xc8b040, { emissive: 0x604010 })
    );
    m.position.set(player.x, 0.1, player.z);
    scene.add(m);
    mines.push({
      mesh: m, x: player.x, z: player.z, life: w.life,
      damage: (w.damage + player.stats.flatDamage) * player.stats.damageMult,
      aoe: w.aoe
    });
  }

  function updateMines(dt) {
    for (var i = mines.length - 1; i >= 0; i--) {
      var mn = mines[i];
      mn.life -= dt;
      mn.mesh.rotation.y += dt * 2;
      var boom = mn.life <= 0;
      if (!boom) {
        for (var j = 0; j < enemies.length; j++) {
          var e = enemies[j];
          if (!e.dead && GH.dist2(mn.x, mn.z, e.x, e.z) < 1.4 * 1.4) { boom = true; break; }
        }
      }
      if (boom) {
        explode(mn.x, mn.z, mn.aoe, mn.damage);
        scene.remove(mn.mesh);
        mines.splice(i, 1);
      }
    }
  }

  function explode(x, z, radius, dmg) {
    GH.audio.explode();
    spawnBurst(x, 0.8, z, 0xffa040, 14);
    shake = Math.min(0.5, shake + 0.12);
    var m = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.6, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffc060, transparent: true, opacity: 0.7 })
    );
    m.position.set(x, 0.8, z);
    scene.add(m);
    effects.push({ kind: 'boom', mesh: m, t: 0.25, total: 0.25, grow: radius });
    if (dmg <= 0) return; // visual-only blast
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      var rr = radius + e.def.radius;
      if (GH.dist2(x, z, e.x, e.z) <= rr * rr) damageEnemy(e, dmg);
    }
  }

  // orbit blades continuous
  function updateOrbit(dt) {
    var inst = null;
    for (var i = 0; i < player.weapons.length; i++) {
      if (player.weapons[i].w.type === 'orbit') { inst = player.weapons[i]; break; }
    }
    if (!inst) { orbitGroup.visible = false; return; }
    var w = inst.w;
    orbitGroup.visible = true;
    // sync blade count
    while (orbitGroup.children.length < w.count) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.9), GH.assets.mat(0xd0d8e8, { emissive: 0x304050 }));
      orbitGroup.add(b);
    }
    while (orbitGroup.children.length > w.count) orbitGroup.remove(orbitGroup.children[orbitGroup.children.length - 1]);
    inst.angle = (inst.angle || 0) + dt * w.spin;
    var now = runTime;
    for (var k = 0; k < orbitGroup.children.length; k++) {
      var blade = orbitGroup.children[k];
      var a = inst.angle + (k / w.count) * Math.PI * 2;
      var bx = player.x + Math.sin(a) * w.radius;
      var bz = player.z + Math.cos(a) * w.radius;
      blade.position.set(bx, 1.0, bz);
      blade.rotation.y = a + Math.PI / 2;
      for (var j = 0; j < enemies.length; j++) {
        var e = enemies[j];
        if (e.dead) continue;
        var rr = 0.7 + e.def.radius;
        if (GH.dist2(bx, bz, e.x, e.z) <= rr * rr && now - e.lastOrbitHit > w.interval) {
          e.lastOrbitHit = now;
          damageEnemy(e, (w.damage + player.stats.flatDamage) * player.stats.damageMult);
          var ang = GH.angleTo(player.x, player.z, e.x, e.z);
          e.vx += Math.sin(ang) * 3 / e.def.mass;
          e.vz += Math.cos(ang) * 3 / e.def.mass;
        }
      }
    }
  }

  function updateDrone(dt) {
    var has = false;
    for (var i = 0; i < player.weapons.length; i++) {
      if (player.weapons[i].w.type === 'drone') { has = true; break; }
    }
    if (!has) { if (droneMesh) droneMesh.visible = false; return; }
    if (!droneMesh) {
      droneMesh = new THREE.Group();
      var body = new THREE.Mesh(new THREE.OctahedronGeometry(0.3), GH.assets.mat(0x60c0e0, { emissive: 0x104050 }));
      var fin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.2), GH.assets.mat(0x385868));
      droneMesh.add(body, fin);
      scene.add(droneMesh);
    }
    droneMesh.visible = true;
    droneAngle += dt * 1.6;
    droneMesh.position.set(
      player.x + Math.sin(droneAngle) * 3.2,
      3.0 + Math.sin(runTime * 2) * 0.2,
      player.z + Math.cos(droneAngle) * 3.2
    );
    droneMesh.rotation.y += dt * 3;
  }

  // ---------- projectile updates ----------
  function updateProjectiles(dt) {
    var i, p2;
    for (i = projectiles.length - 1; i >= 0; i--) {
      p2 = projectiles[i];
      p2.life -= dt;
      if (p2.homing > 0) {
        var tgt = nearestEnemy(p2.x, p2.z, 14, p2.hitSet);
        if (tgt) {
          var want = GH.angleTo(p2.x, p2.z, tgt.x, tgt.z);
          var cur = Math.atan2(p2.dirX, p2.dirZ);
          var na = GH.lerpAngle(cur, want, Math.min(1, p2.homing * dt));
          p2.dirX = Math.sin(na); p2.dirZ = Math.cos(na);
        }
      }
      p2.x += p2.dirX * p2.speed * dt;
      p2.z += p2.dirZ * p2.speed * dt;
      p2.mesh.position.set(p2.x, 1.2, p2.z);
      p2.mesh.rotation.y = Math.atan2(p2.dirX, p2.dirZ);
      p2.mesh.rotation.x = Math.PI / 2;

      var kill = p2.life <= 0 || Math.abs(p2.x) > ARENA_R + 8 || Math.abs(p2.z) > ARENA_R + 8;
      if (!kill) {
        for (var j = 0; j < enemies.length; j++) {
          var e = enemies[j];
          if (e.dead || p2.hitSet.indexOf(e) !== -1) continue;
          var rr = 0.55 + e.def.radius;
          if (GH.dist2(p2.x, p2.z, e.x, e.z) <= rr * rr) {
            if (p2.aoe > 0) {
              explode(p2.x, p2.z, p2.aoe, p2.damage);
              kill = true;
              break;
            }
            damageEnemy(e, p2.damage);
            p2.hitSet.push(e);
            if (p2.pierce > 0) { p2.pierce--; }
            else { kill = true; break; }
          }
        }
      }
      if (kill) {
        scene.remove(p2.mesh);
        projectiles.splice(i, 1);
      }
    }

    for (i = enemyShots.length - 1; i >= 0; i--) {
      p2 = enemyShots[i];
      p2.life -= dt;
      p2.x += p2.dirX * p2.speed * dt;
      p2.z += p2.dirZ * p2.speed * dt;
      p2.mesh.position.set(p2.x, p2.y, p2.z);
      var dead = p2.life <= 0;
      if (!dead && GH.dist2(p2.x, p2.z, player.x, player.z) < 0.8 * 0.8) {
        playerDamage(p2.damage, p2.x, p2.z);
        dead = true;
      }
      if (dead) {
        scene.remove(p2.mesh);
        enemyShots.splice(i, 1);
      }
    }
  }

  function spawnEnemyShot(x, y, z, dirX, dirZ, speed, dmg) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5),
      GH.assets.basic(0xff4060));
    m.position.set(x, y, z);
    scene.add(m);
    enemyShots.push({ mesh: m, x: x, y: y, z: z, dirX: dirX, dirZ: dirZ, speed: speed, damage: dmg, life: 4.5 });
  }

  // =================================================================
  // PICKUPS
  // =================================================================
  function spawnPickup(type, x, z) {
    if (pickups.length > 160) {
      // auto-collect the oldest gem so value is never lost
      var old = pickups.shift();
      collectPickup(old, true);
    }
    var mesh;
    if (type === 'gem0') mesh = GH.models.buildGem(0);
    else if (type === 'gem1') mesh = GH.models.buildGem(1);
    else if (type === 'gem2') mesh = GH.models.buildGem(2);
    else if (type === 'heart') mesh = GH.models.buildHeart();
    else mesh = GH.models.buildCoin();
    mesh.position.set(x, 0.5, z);
    scene.add(mesh);
    pickups.push({ type: type, mesh: mesh, x: x, z: z, vx: GH.rand(-2, 2), vz: GH.rand(-2, 2), t: Math.random() * 10 });
  }

  function collectPickup(pk, silent) {
    scene.remove(pk.mesh);
    if (pk.type === 'gem0') { gainXP(1); if (!silent) GH.audio.gem(); }
    else if (pk.type === 'gem1') { gainXP(3); if (!silent) GH.audio.gem(); }
    else if (pk.type === 'gem2') { gainXP(10); if (!silent) GH.audio.gem(); }
    else if (pk.type === 'heart') { player.heal(20); if (!silent) GH.audio.heart(); }
    else if (pk.type === 'coin') { coinsRun++; if (!silent) GH.audio.coin(); }
  }

  function updatePickups(dt) {
    for (var i = pickups.length - 1; i >= 0; i--) {
      var pk = pickups[i];
      pk.t += dt;
      pk.x += pk.vx * dt; pk.z += pk.vz * dt;
      pk.vx *= Math.pow(0.05, dt); pk.vz *= Math.pow(0.05, dt);
      var d2 = GH.dist2(pk.x, pk.z, player.x, player.z);
      var mag = player.stats.magnet;
      if (d2 < mag * mag) {
        var d = Math.sqrt(d2) || 0.01;
        var pull = (1 - d / mag) * 26 + 6;
        pk.x += ((player.x - pk.x) / d) * pull * dt;
        pk.z += ((player.z - pk.z) / d) * pull * dt;
      }
      pk.mesh.position.set(pk.x, 0.5 + Math.sin(pk.t * 3) * 0.12, pk.z);
      pk.mesh.rotation.y += dt * 2.5;
      if (d2 < 0.75 * 0.75) {
        collectPickup(pk);
        pickups.splice(i, 1);
      }
    }
  }

  // =================================================================
  // EFFECTS (particles, fades, telegraphs)
  // =================================================================
  function spawnBurst(x, y, z, color, n) {
    for (var i = 0; i < n; i++) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), GH.assets.basic(color));
      m.position.set(x, y, z);
      scene.add(m);
      effects.push({
        kind: 'shard', mesh: m, t: GH.rand(0.3, 0.6),
        vx: GH.rand(-5, 5), vy: GH.rand(2, 7), vz: GH.rand(-5, 5)
      });
    }
  }

  function updateEffects(dt) {
    for (var i = effects.length - 1; i >= 0; i--) {
      var fx = effects[i];
      fx.t -= dt;
      if (fx.kind === 'shard') {
        fx.vy -= 18 * dt;
        fx.mesh.position.x += fx.vx * dt;
        fx.mesh.position.y = Math.max(0.05, fx.mesh.position.y + fx.vy * dt);
        fx.mesh.position.z += fx.vz * dt;
        fx.mesh.rotation.x += dt * 8;
        fx.mesh.rotation.y += dt * 8;
      } else if (fx.kind === 'fade') {
        fx.mesh.material.opacity = Math.max(0, (fx.t / fx.total)) * 0.6;
      } else if (fx.kind === 'boom') {
        var k = 1 - fx.t / fx.total;
        fx.mesh.scale.setScalar(0.4 + k * (fx.grow / (fx.grow * 0.6)) * 1.4);
        fx.mesh.material.opacity = 0.7 * (1 - k);
      } else if (fx.kind === 'telegraph') {
        fx.mesh.material.opacity = 0.25 + Math.sin(runTime * 20) * 0.12;
        if (fx.t <= 0) {
          // slam
          if (GH.dist2(fx.x, fx.z, player.x, player.z) < fx.radius * fx.radius) {
            playerDamage(fx.damage, fx.x, fx.z);
          }
          explode(fx.x, fx.z, fx.radius * 0.8, 0); // visual only (0 dmg to enemies handled below)
        }
      }
      if (fx.t <= 0) {
        scene.remove(fx.mesh);
        if (fx.mesh.geometry) fx.mesh.geometry.dispose();
        effects.splice(i, 1);
      }
    }
  }

  // =================================================================
  // WAVES
  // =================================================================
  function startWave(n) {
    waveNum = n;
    wavePlan = GH.wavePlan(n);
    waveTimer = wavePlan.duration;
    spawnAcc = 0;
    applyPalette(n <= 7 ? 0 : (n <= 14 ? 1 : 2));
    announce('WAVE ' + n, 40);
    GH.audio.wave();
    if (wavePlan.boss) {
      spawnEnemy(wavePlan.boss);
    }
    updateHUDStatic();
  }

  function updateWave(dt) {
    // spawn stream
    if (!bossRef || waveNum !== 20) {
      spawnAcc += wavePlan.rate * dt;
      while (spawnAcc >= 1) {
        spawnAcc -= 1;
        var t = GH.weightedPick(wavePlan.types);
        spawnEnemy(t.id);
      }
    }
    waveTimer -= dt;
    if (waveTimer <= 0) {
      if (bossRef && !bossRef.dead) {
        waveTimer = 0; // hold at 0 until the boss falls
        return;
      }
      endWave();
    }
  }

  function endWave() {
    // clear stragglers into a burst of gems (no lost value, keeps pace up)
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      scene.remove(e.mesh);
      if (Math.random() < 0.35) spawnPickup('gem0', e.x, e.z);
    }
    enemies.length = 0;
    bossRef = null;
    hideBossBar();
    for (i = enemyShots.length - 1; i >= 0; i--) scene.remove(enemyShots[i].mesh);
    enemyShots.length = 0;

    if (waveNum >= 20) {
      gameOver(true);
      return;
    }
    showRewards();
  }

  // =================================================================
  // REWARD SCREEN
  // =================================================================
  function showRewards() {
    G.state = 'reward';
    var cards = GH.rollRewards(player);
    var wrap = document.getElementById('reward-cards');
    wrap.innerHTML = '';
    cards.forEach(function (card, i) {
      var lvl = player.weaponLevels[card.id] || 0;
      var div = document.createElement('div');
      div.className = 'reward-card ' + (card.rarity || '');
      div.innerHTML =
        '<div class="rc-kind">' + (card.kind === 'weapon' ? (lvl ? 'WEAPON · LVL ' + (lvl + 1) : 'NEW WEAPON') : 'TRAIT') + '</div>' +
        '<div class="rc-glyph">' + card.glyph + '</div>' +
        '<div class="rc-name">' + card.name + '</div>' +
        '<div class="rc-desc">' + card.desc + '</div>' +
        '<div class="rc-key">[' + (i + 1) + ']</div>';
      div.onclick = function () { pickReward(card); };
      wrap.appendChild(div);
    });
    G._rewardCards = cards;
    document.getElementById('reward-screen').classList.remove('hidden');
  }

  function pickReward(card) {
    GH.audio.card();
    if (card.kind === 'trait') {
      card.apply(player);
    } else {
      var lvl = player.weaponLevels[card.id] || 0;
      if (lvl === 0) {
        // deep-ish copy of weapon def so levels don't mutate the pool
        var w = {};
        for (var k in card.weapon) w[k] = card.weapon[k];
        player.weapons.push({ id: card.id, w: w, timer: 0 });
      } else {
        for (var i = 0; i < player.weapons.length; i++) {
          if (player.weapons[i].id === card.id) card.perLevel(player.weapons[i].w);
        }
      }
      player.weaponLevels[card.id] = lvl + 1;
    }
    document.getElementById('reward-screen').classList.add('hidden');
    G.state = 'play';
    startWave(waveNum + 1);
    updateHUDStatic();
  }

  G.pickRewardIndex = function (i) {
    if (G.state === 'reward' && G._rewardCards && G._rewardCards[i]) pickReward(G._rewardCards[i]);
  };

  // =================================================================
  // SPECIALS / BOOST
  // =================================================================
  function tryBoost() {
    if (player.boost < 0.34) return;
    player.boost -= 0.34;
    var mx = player.moveX, mz = player.moveZ;
    if (mx === 0 && mz === 0) { mx = Math.sin(player.facing); mz = Math.cos(player.facing); }
    var len = Math.sqrt(mx * mx + mz * mz);
    player.dashX = mx / len; player.dashZ = mz / len;
    player.dashTime = 0.22;
    player.dashId++;
    GH.audio.dash();
    spawnBurst(player.x, 0.6, player.z, 0xa0c8ff, 6);
  }

  function trySpecial() {
    var sp = player.special;
    var kind = player.def.special;
    if (kind === 'block') return; // handled as hold
    if (sp.cd > 0) return;
    if (kind === 'overdrive') { sp.cd = 9; sp.active = 3; announce('OVERDRIVE', 20); }
    else if (kind === 'nova') {
      sp.cd = 7;
      GH.audio.explode();
      spawnBurst(player.x, 1, player.z, 0x50e8d8, 16);
      var m = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.9, 24),
        new THREE.MeshBasicMaterial({ color: 0x50e8d8, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(player.x, 0.3, player.z);
      scene.add(m);
      effects.push({ kind: 'boom', mesh: m, t: 0.3, total: 0.3, grow: 6 });
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (e.dead) continue;
        if (GH.dist2(player.x, player.z, e.x, e.z) < 49) {
          var a = GH.angleTo(player.x, player.z, e.x, e.z);
          e.vx += Math.sin(a) * 16 / e.def.mass;
          e.vz += Math.cos(a) * 16 / e.def.mass;
          damageEnemy(e, 10 * player.stats.damageMult, false);
        }
      }
    }
    else if (kind === 'frenzy') { sp.cd = 9; sp.active = 4; announce('FRENZY', 20); }
    else if (kind === 'blink') {
      sp.cd = 4;
      var mx = player.moveX, mz = player.moveZ;
      if (mx === 0 && mz === 0) { mx = Math.sin(player.facing); mz = Math.cos(player.facing); }
      var len = Math.sqrt(mx * mx + mz * mz);
      spawnBurst(player.x, 1, player.z, 0xf05060, 8);
      player.x = GH.clamp(player.x + mx / len * 6.5, -ARENA_R, ARENA_R);
      player.z = GH.clamp(player.z + mz / len * 6.5, -ARENA_R, ARENA_R);
      spawnBurst(player.x, 1, player.z, 0xf05060, 8);
      GH.audio.dash();
    }
  }

  // =================================================================
  // PLAYER UPDATE
  // =================================================================
  function updatePlayer(dt, input) {
    var s = player.stats;

    // aim from mouse
    raycaster.setFromCamera(input.mouseNDC, camera);
    if (raycaster.ray.intersectPlane(groundPlane, tmpV3)) {
      player.facing = GH.angleTo(player.x, player.z, tmpV3.x, tmpV3.z);
    }

    // movement
    var mx = (input.keys.d ? 1 : 0) - (input.keys.a ? 1 : 0);
    var mz = (input.keys.s ? 1 : 0) - (input.keys.w ? 1 : 0);
    var len = Math.sqrt(mx * mx + mz * mz) || 1;
    player.moveX = mx / len; player.moveZ = mz / len;
    if (mx === 0 && mz === 0) { player.moveX = 0; player.moveZ = 0; }

    player.blocking = player.def.special === 'block' && input.special;

    var spd = s.speed * (player.blocking ? 0.55 : 1);
    if (player.dashTime > 0) {
      player.dashTime -= dt;
      player.x += player.dashX * 26 * dt;
      player.z += player.dashZ * 26 * dt;
      // AEGIS: boost is a weapon
      if (player.def.special === 'block') {
        for (var i = 0; i < enemies.length; i++) {
          var e = enemies[i];
          if (e.dead || e.lastDashId === player.dashId) continue;
          var rr = 1.3 + e.def.radius;
          if (GH.dist2(player.x, player.z, e.x, e.z) <= rr * rr) {
            e.lastDashId = player.dashId;
            damageEnemy(e, (10 + s.armor + s.block) * s.damageMult);
            var a = GH.angleTo(player.x, player.z, e.x, e.z);
            e.vx += Math.sin(a) * 14 / e.def.mass;
            e.vz += Math.cos(a) * 14 / e.def.mass;
          }
        }
      }
    } else {
      player.x += player.moveX * spd * dt;
      player.z += player.moveZ * spd * dt;
    }
    player.x = GH.clamp(player.x, -ARENA_R, ARENA_R);
    player.z = GH.clamp(player.z, -ARENA_R, ARENA_R);

    player.boost = Math.min(1, player.boost + s.boostRegen * dt);
    if (input.boostPressed) { tryBoost(); input.boostPressed = false; }
    if (input.specialPressed) { trySpecial(); input.specialPressed = false; }

    player.special.cd = Math.max(0, player.special.cd - dt);
    player.special.active = Math.max(0, player.special.active - dt);
    player.hurtCd = Math.max(0, player.hurtCd - dt);

    // regen
    if (s.regen > 0) player.heal(s.regen * dt);

    // mesh pose
    player.mesh.position.set(player.x, 0, player.z);
    player.mesh.rotation.y = player.facing;
    var parts = player.mesh.userData.parts;
    var moving = player.moveX !== 0 || player.moveZ !== 0;
    var t = runTime * (moving ? 9 : 2);
    var sw = moving ? Math.sin(t) * 0.55 : 0;
    parts.legL.rotation.x = sw;
    parts.legR.rotation.x = -sw;
    parts.torso.position.y = 1.55 + Math.abs(Math.sin(t)) * (moving ? 0.06 : 0.02);
    if (parts.armR && player.def.weapon.type !== 'melee') parts.armR.rotation.x = -1.35; // weapons leveled forward
    else if (parts.armR) parts.armR.rotation.x = GH.lerp(parts.armR.rotation.x, -0.2, dt * 6);
    if (parts.armL && player.def.model.prop === 'guns') parts.armL.rotation.x = -1.35;
    if (player.blocking && parts.armL) parts.armL.rotation.x = -1.5;
    if (player.def.weapon.type === 'aura' && parts.weapon) {
      parts.weapon.rotation.y += dt * 10; // spinning scythe
    }
    if (parts.gem) parts.gem.rotation.y += dt * 3;

    // hurt flash
    player.mesh.visible = !(player.hurtCd > 0 && Math.floor(runTime * 24) % 2 === 0);
  }

  // =================================================================
  // CAMERA
  // =================================================================
  function updateCamera(dt) {
    var tx = player ? player.x : 0;
    var tz = player ? player.z : 0;
    var sx = (Math.random() - 0.5) * shake;
    var sz = (Math.random() - 0.5) * shake;
    shake = Math.max(0, shake - dt * 1.4);
    camera.position.set(tx + sx, 13.5, tz + 11.5 + sz);
    camera.lookAt(tx + sx, 0, tz + 2.0 + sz);
  }

  // =================================================================
  // HUD
  // =================================================================
  var el = {};
  function cacheEls() {
    ['hp-fill', 'hp-text', 'xp-fill', 'lvl-text', 'wave-label', 'wave-timer',
      'coin-count', 'boost-fill', 'stat-icons', 'boss-bar-wrap', 'boss-name',
      'boss-fill', 'announce'].forEach(function (id) {
        el[id] = document.getElementById(id);
      });
  }

  function updateHUDStatic() {
    el['wave-label'].textContent = 'Wave ' + waveNum + '/20';
    // stat icons
    var s = player.stats;
    var vals = {
      block: Math.round(s.block) + '%', armor: Math.round(s.armor),
      crit: Math.round(s.crit) + '%', atkSpd: Math.round(s.atkSpdMult * 100) + '%',
      damage: '+' + Math.round(s.flatDamage), magnet: GH.fmt1(s.magnet),
      lifesteal: Math.round(s.lifesteal) + '%', speed: GH.fmt1(s.speed / 0.42)
    };
    var html = '';
    player.def.hudStats.forEach(function (k) {
      html += '<div class="stat-icon" title="' + GH.statLabel[k] + '"><div class="si-g">' +
        GH.statGlyphs[k] + '</div><div class="si-v">' + vals[k] + '</div></div>';
    });
    el['stat-icons'].innerHTML = html;
  }

  function updateHUD() {
    var s = player.stats;
    el['hp-fill'].style.width = GH.clamp(player.hp / s.maxHP * 100, 0, 100) + '%';
    el['hp-text'].textContent = Math.ceil(player.hp) + '/' + Math.round(s.maxHP);
    el['xp-fill'].style.width = GH.clamp(player.xp / player.xpNeed * 100, 0, 100) + '%';
    el['lvl-text'].textContent = 'LVL ' + player.level;
    el['wave-timer'].textContent = GH.fmt1(Math.max(0, waveTimer));
    el['coin-count'].textContent = '×' + coinsRun;
    el['boost-fill'].style.width = (player.boost * 100) + '%';
    if (bossRef && !bossRef.dead) {
      el['boss-fill'].style.width = GH.clamp(bossRef.hp / bossRef.maxHp * 100, 0, 100) + '%';
    }
    if (announceTimer > 0) {
      announceTimer -= 1 / 60;
      if (announceTimer <= 0) el['announce'].classList.add('hidden');
    }
  }

  function announce(text, size) {
    el['announce'].textContent = text;
    el['announce'].style.fontSize = (size || 40) + 'px';
    el['announce'].classList.remove('hidden');
    // retrigger CSS animation
    el['announce'].style.animation = 'none';
    void el['announce'].offsetWidth;
    el['announce'].style.animation = '';
    announceTimer = 1.4;
  }

  function showBossBar(name) {
    el['boss-name'].textContent = name;
    el['boss-bar-wrap'].classList.remove('hidden');
  }
  function hideBossBar() { el['boss-bar-wrap'].classList.add('hidden'); }

  // =================================================================
  // RUN LIFECYCLE
  // =================================================================
  function clearWorld() {
    var lists = [enemies, projectiles, enemyShots, pickups, mines, effects];
    lists.forEach(function (list) {
      for (var i = 0; i < list.length; i++) scene.remove(list[i].mesh);
      list.length = 0;
    });
    while (orbitGroup.children.length) orbitGroup.remove(orbitGroup.children[0]);
    if (droneMesh) { scene.remove(droneMesh); droneMesh = null; }
    if (player) { scene.remove(player.mesh); player = null; }
    if (selPreview) { scene.remove(selPreview); selPreview = null; }
    bossRef = null;
    hideBossBar();
  }

  G.startRun = function (mechIndex, startAt) {
    clearWorld();
    scatterProps();
    player = makePlayer(GH.mechs[mechIndex]);
    kills = 0; coinsRun = 0; runTime = 0;
    G.state = 'play';
    // dev skip (?wave=N): grant rough catch-up levels for the skipped waves
    startAt = GH.clamp(startAt || 1, 1, 20);
    if (startAt > 1) {
      for (var i = 1; i < startAt; i++) {
        gainXP(6 + player.level * 3);
        var cards = GH.rollRewards(player);
        // auto-pick like a player would
        var c = cards[0];
        if (c.kind === 'trait') c.apply(player);
        else {
          var lvl0 = player.weaponLevels[c.id] || 0;
          if (lvl0 === 0) {
            var w = {}; for (var k in c.weapon) w[k] = c.weapon[k];
            player.weapons.push({ id: c.id, w: w, timer: 0 });
          } else {
            for (var j = 0; j < player.weapons.length; j++) {
              if (player.weapons[j].id === c.id) c.perLevel(player.weapons[j].w);
            }
          }
          player.weaponLevels[c.id] = lvl0 + 1;
        }
      }
    }
    startWave(startAt);
    updateHUDStatic();
    document.getElementById('hud').classList.remove('hidden');
  };

  function gameOver(won) {
    G.state = won ? 'win' : 'over';
    if (won) GH.audio.win(); else GH.audio.die();
    if (!won) spawnBurst(player.x, 1.2, player.z, 0xff6030, 30);
    // bank coins
    try {
      var total = parseInt(localStorage.getItem('hf_coins') || '0', 10) + coinsRun;
      localStorage.setItem('hf_coins', String(total));
      var best = parseInt(localStorage.getItem('hf_best_wave') || '0', 10);
      if (waveNum > best) localStorage.setItem('hf_best_wave', String(waveNum));
    } catch (e) { /* storage unavailable */ }
    document.getElementById('end-title').innerHTML = won ? 'ARENA&nbsp;CLEARED' : 'FRAME&nbsp;DESTROYED';
    document.getElementById('end-stats').innerHTML =
      'Reached <b>Wave ' + waveNum + '</b> as <b>' + player.def.name + '</b>\n' +
      'Level <b>' + player.level + '</b> · Kills <b>' + kills + '</b> · Salvage <b>' + coinsRun + '</b>\n' +
      'Time <b>' + Math.floor(runTime / 60) + ':' + ('0' + Math.floor(runTime % 60)).slice(-2) + '</b>';
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
  }

  G.pauseInfo = function () {
    if (!player) return '';
    var txt = player.def.name + ' · Wave ' + waveNum + ' · LVL ' + player.level + '\n\nWeapons:\n· ' + player.def.weapon.name;
    for (var i = 0; i < player.weapons.length; i++) {
      var id = player.weapons[i].id;
      var card = null;
      for (var j = 0; j < GH.upgrades.length; j++) if (GH.upgrades[j].id === id) card = GH.upgrades[j];
      txt += '\n· ' + (card ? card.name : id) + ' LVL ' + player.weaponLevels[id];
    }
    return txt;
  };

  // =================================================================
  // SELECT SCREEN (3D preview lives in the main scene)
  // =================================================================
  G.enterSelect = function () {
    clearWorld();
    G.state = 'select';
    applyPalette(0);
    scene.fog.color.setHex(0x060a2a);
    floor.material.map = GH.assets.gridTex;
    floor.material.needsUpdate = true;
    G.selectMech(selMechIndex);
    buildSelectIcons();
  };

  G.selectMech = function (i) {
    selMechIndex = i;
    var def = GH.mechs[i];
    if (selPreview) scene.remove(selPreview);
    selPreview = GH.models.buildMech(def.model);
    selPreview.position.set(0, 0.4, 0);
    selPreview.scale.setScalar(1.6);
    scene.add(selPreview);
    document.getElementById('select-name').textContent = def.name;
    document.getElementById('select-desc').textContent = def.desc;
    document.getElementById('select-stats').innerHTML =
      '<b>Base Stats</b>\n' + def.baseText + '\n\n<b>On Level Up</b>\n' + def.levelText +
      '\n\n<b>Primary</b>\n' + def.weapon.name;
    var icons = document.querySelectorAll('.mech-icon');
    for (var k = 0; k < icons.length; k++) {
      icons[k].className = 'mech-icon' + (k === i ? ' sel' : '');
    }
  };

  function buildSelectIcons() {
    var wrap = document.getElementById('select-icons');
    if (wrap.childNodes.length) return;
    GH.mechs.forEach(function (def, i) {
      var d = document.createElement('div');
      d.className = 'mech-icon' + (i === selMechIndex ? ' sel' : '');
      d.textContent = def.icon;
      d.onclick = function () { GH.audio.card(); G.selectMech(i); };
      wrap.appendChild(d);
    });
  }

  G.getSelectedMech = function () { return selMechIndex; };

  // =================================================================
  // MAIN UPDATE
  // =================================================================
  G.update = function (dt, input, viewW, viewH) {
    if (G.state === 'select') {
      selSpin += dt;
      if (selPreview) selPreview.rotation.y = selSpin * 0.8;
      camera.position.set(Math.sin(selSpin * 0.1) * 1.5, 3.4, 7.5);
      camera.lookAt(0, 1.8, 0);
      return;
    }
    if (G.state !== 'play') {
      G.dmg.update(dt, viewW, viewH);
      return;
    }
    runTime += dt;
    updatePlayer(dt, input);
    updateWave(dt);
    updateEnemies(dt);
    updateWeapons(dt);
    updateOrbit(dt);
    updateDrone(dt);
    updateProjectiles(dt);
    updateMines(dt);
    updatePickups(dt);
    updateEffects(dt);
    updateCamera(dt);
    updateHUD();
    G.dmg.update(dt, viewW, viewH);
  };

  G.debugInfo = function () {
    return {
      state: G.state, wave: waveNum, kills: kills, hits: hitCount,
      enemies: enemies.length, projectiles: projectiles.length,
      pickups: pickups.length,
      hp: player ? Math.round(player.hp) : 0,
      level: player ? player.level : 0,
      xp: player ? player.xp : 0,
      facing: player ? Math.round(player.facing * 100) / 100 : 0,
      px: player ? Math.round(player.x * 10) / 10 : 0,
      pz: player ? Math.round(player.z * 10) / 10 : 0,
      near: enemies.slice(0, 4).map(function (e) {
        return [Math.round(e.x * 10) / 10, Math.round(e.z * 10) / 10, Math.round(e.hp)];
      }),
      projs: projectiles.slice(0, 4).map(function (p) {
        return [Math.round(p.x * 10) / 10, Math.round(p.z * 10) / 10,
        Math.round(p.dirX * 100) / 100, Math.round(p.dirZ * 100) / 100];
      })
    };
  };

  G.scene = function () { return scene; };
  G.camera = function () { return camera; };
  G.cacheEls = cacheEls;

  return G;
})();
