// STAALREUS — transformed-frame racing in THE SHATTERED REACH
// Two disciplines for frames folded into skimmer form:
//   TRACE DUEL — light-trail survival in the camp pit. Your thrusters
//     cut a hard-light wall behind you; touch any wall and you're out.
//     Last rider alive takes it. (An original take on the classic
//     light-cycle duel.)
//   SUNSPIRE CIRCUIT — a 3-lap anti-grav gate race around the Sunspire
//     ring in the cloister, against three rival riders.
// The module drives the shared `player` position object handed over by
// game.js, so the camera and HUD keep working untouched.
GH.race = (function () {
  var R = {};

  var ctx = null;       // {scene, player, speeder, model, onDone}
  var mode = null;      // 'duel' | 'circuit'
  var riders = [];      // [0] is always the player
  var walls = [];       // duel: {x1,z1,x2,z2,mesh,owner}
  var extras = [];      // meshes to sweep at the end (floor, markers)
  var raceT = 0;
  var countdown = 0;
  var finished = false;
  var dnfT = 25;
  var path = null;      // circuit centerline
  var gatePts = [];     // circuit gate positions
  var el = {};

  var AI_STYLES = [
    { body: 0xb03838, accent: 0xffd050, dark: 0x381414, name: 'VEX' },
    { body: 0x3870b0, accent: 0x80ffd0, dark: 0x142038, name: 'HALO-9' },
    { body: 0x50a048, accent: 0xf0f0f0, dark: 0x1a3018, name: 'JURO' }
  ];
  var TRAIL_COLORS = [0x70e0ff, 0xff7060, 0x60a0ff, 0x80e070];

  function hudEls() {
    el.hud = document.getElementById('race-hud');
    el.lap = document.getElementById('race-lap');
    el.time = document.getElementById('race-time');
    el.place = document.getElementById('race-place');
  }

  function fmtTime(t) {
    var m = Math.floor(t / 60);
    var s = t - m * 60;
    return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1);
  }

  function makeRiderMesh(styleIdx) {
    var cfg = styleIdx === 0 ? ctx.model : AI_STYLES[styleIdx - 1];
    var m = GH.models.buildSpeeder(cfg);
    ctx.scene.add(m);
    extras.push(m);
    return m;
  }

  // ---------------------------------------------------------------
  // TRACE DUEL
  // ---------------------------------------------------------------
  var PIT = { half: 15 };

  function startDuel() {
    var C = GH.world.DUEL_PIT;
    PIT.cx = C.x; PIT.cz = C.z;
    PIT.y = GH.terrain.h(C.x, C.z);
    // pit floor + boundary glow
    var floor = new THREE.Mesh(
      new THREE.PlaneGeometry(PIT.half * 2 + 1, PIT.half * 2 + 1),
      new THREE.MeshBasicMaterial({ color: 0x101820, transparent: true, opacity: 0.85 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(PIT.cx, PIT.y + 0.05, PIT.cz);
    ctx.scene.add(floor);
    extras.push(floor);
    for (var s = 0; s < 4; s++) {
      var edge = new THREE.Mesh(new THREE.BoxGeometry(
        s < 2 ? PIT.half * 2 : 0.2, 1.1, s < 2 ? 0.2 : PIT.half * 2),
        new THREE.MeshBasicMaterial({ color: 0x60c8ff, transparent: true, opacity: 0.5 }));
      edge.position.set(
        PIT.cx + (s === 2 ? -PIT.half : s === 3 ? PIT.half : 0), PIT.y + 0.55,
        PIT.cz + (s === 0 ? -PIT.half : s === 1 ? PIT.half : 0));
      ctx.scene.add(edge);
      extras.push(edge);
    }
    // four riders on four sides, riding counter-clockwise
    riders = [];
    var starts = [
      { x: 0, z: PIT.half - 3, h: Math.PI / 2 },    // player: south edge, heading +x
      { x: 0, z: -PIT.half + 3, h: -Math.PI / 2 },
      { x: -PIT.half + 3, z: 0, h: 0 },
      { x: PIT.half - 3, z: 0, h: Math.PI }
    ];
    for (var i = 0; i < 4; i++) {
      riders.push({
        idx: i, alive: true,
        x: PIT.cx + starts[i].x, z: PIT.cz + starts[i].z,
        heading: starts[i].h, speed: 9.5,
        trail: [], lastDrop: null, dropAcc: 0,
        turnBias: Math.random() < 0.5 ? 1 : -1,
        mesh: i === 0 ? ctx.speeder : makeRiderMesh(i)
      });
      riders[i].mesh.visible = true;
      riders[i].mesh.position.set(riders[i].x, GH.terrain.h(riders[i].x, riders[i].z) + 0.1, riders[i].z);
    }
  }

  function dropWall(r) {
    if (r.lastDrop) {
      var x1 = r.lastDrop.x, z1 = r.lastDrop.z;
      var dx = r.x - x1, dz = r.z - z1;
      var len = Math.sqrt(dx * dx + dz * dz);
      if (len < 0.2) return;
      var mesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, len),
        new THREE.MeshBasicMaterial({
          color: TRAIL_COLORS[r.idx], transparent: true, opacity: 0.65
        }));
      mesh.position.set((x1 + r.x) / 2, GH.terrain.h((x1 + r.x) / 2, (z1 + r.z) / 2) + 0.5, (z1 + r.z) / 2);
      mesh.rotation.y = Math.atan2(dx, dz);
      ctx.scene.add(mesh);
      var wall = { x1: x1, z1: z1, x2: r.x, z2: r.z, mesh: mesh, owner: r.idx };
      walls.push(wall);
      r.trail.push(wall);
      // finite trails keep the pit readable and the mesh count bounded
      if (r.trail.length > 80) {
        var old = r.trail.shift();
        ctx.scene.remove(old.mesh);
        walls.splice(walls.indexOf(old), 1);
      }
    }
    r.lastDrop = { x: r.x, z: r.z };
  }

  function segDist2(px, pz, w) {
    var vx = w.x2 - w.x1, vz = w.z2 - w.z1;
    var wx = px - w.x1, wz = pz - w.z1;
    var c1 = vx * wx + vz * wz;
    if (c1 <= 0) return GH.dist2(px, pz, w.x1, w.z1);
    var c2 = vx * vx + vz * vz;
    if (c2 <= c1) return GH.dist2(px, pz, w.x2, w.z2);
    var t = c1 / c2;
    return GH.dist2(px, pz, w.x1 + vx * t, w.z1 + vz * t);
  }

  function duelHits(x, z, selfIdx, skipRecent) {
    if (Math.abs(x - PIT.cx) > PIT.half - 0.3 || Math.abs(z - PIT.cz) > PIT.half - 0.3) return true;
    for (var i = 0; i < walls.length; i++) {
      var w = walls[i];
      // a rider can't clip the wall it is still extruding
      if (skipRecent && w.owner === selfIdx) {
        var r = riders[selfIdx];
        if (r.trail.length && (w === r.trail[r.trail.length - 1] || w === r.trail[r.trail.length - 2])) continue;
      }
      if (segDist2(x, z, w) < 0.45 * 0.45) return true;
    }
    return false;
  }

  function eliminate(r) {
    r.alive = false;
    r.mesh.visible = false;
    if (GH.game && GH.game.raceBurst) GH.game.raceBurst(r.x, r.z, TRAIL_COLORS[r.idx]);
    GH.audio.explode();
    // the fallen rider's wall decays
    r.trail.forEach(function (w) {
      w.mesh.material.opacity = 0.18;
    });
  }

  function updateDuel(dt, input) {
    var alive = 0, aiAlive = 0;
    for (var i = 0; i < riders.length; i++) {
      var r = riders[i];
      if (!r.alive) continue;
      alive++;
      if (i > 0) aiAlive++;

      if (i === 0) {
        // player steering: A/D (or pad X) carve the heading
        var steer = (input.keys.d ? 1 : 0) - (input.keys.a ? 1 : 0) + input.padMoveX + input.touchMoveX;
        r.heading += GH.clamp(steer, -1, 1) * 2.7 * dt;
        r.speed = GH.clamp(r.speed + ((input.keys.w ? 1 : 0) - (input.keys.s ? 1 : 0) + (input.padMoveY + input.touchMoveY < -0.3 ? 1 : 0)) * 6 * dt, 8, 13);
      } else {
        // AI: probe ahead; carve away from anything solid
        var probe = 3.2 + r.speed * 0.22;
        var ax = r.x + Math.sin(r.heading) * probe;
        var az = r.z + Math.cos(r.heading) * probe;
        if (duelHits(ax, az, i, true)) {
          var lh = r.heading + 0.9, rh = r.heading - 0.9;
          var lOK = !duelHits(r.x + Math.sin(lh) * probe, r.z + Math.cos(lh) * probe, i, true);
          var rOK = !duelHits(r.x + Math.sin(rh) * probe, r.z + Math.cos(rh) * probe, i, true);
          if (lOK && (!rOK || r.turnBias > 0)) r.heading += 3.4 * dt * 1.6;
          else if (rOK) r.heading -= 3.4 * dt * 1.6;
          else r.heading += r.turnBias * 5 * dt; // boxed in: pray
        } else if (Math.random() < dt * 0.4) {
          r.turnBias = -r.turnBias;
          r.heading += r.turnBias * 0.25;
        }
      }

      r.x += Math.sin(r.heading) * r.speed * dt;
      r.z += Math.cos(r.heading) * r.speed * dt;
      r.dropAcc -= dt;
      if (r.dropAcc <= 0) { r.dropAcc = 0.11; dropWall(r); }

      if (duelHits(r.x, r.z, i, true)) { eliminate(r); continue; }

      r.mesh.position.set(r.x, GH.terrain.h(r.x, r.z) + 0.12 + Math.sin(raceT * 6 + i) * 0.05, r.z);
      r.mesh.rotation.y = r.heading;
      if (r.mesh.userData.flames) {
        r.mesh.userData.flames.forEach(function (fl) { fl.visible = true; fl.scale.y = 1.4; });
      }
    }

    el.lap.textContent = 'TRACE DUEL';
    el.time.textContent = fmtTime(raceT);
    el.place.textContent = riders[0].alive ? (aiAlive + ' RIVALS LEFT') : 'DEREZZED';

    if (!riders[0].alive) return { win: false, label: 'DEREZZED' };
    if (aiAlive === 0) return { win: true, label: 'LAST RIDER STANDING' };
    return null;
  }

  // ---------------------------------------------------------------
  // SUNSPIRE CIRCUIT
  // ---------------------------------------------------------------
  var LAPS = 3;

  function startCircuit() {
    path = GH.world.circuitPath();
    gatePts = [];
    var C = GH.world.CIRCUIT;
    for (var g = 0; g < C.gates; g++) {
      gatePts.push(path[Math.floor(g * path.length / C.gates)]);
    }
    riders = [];
    for (var i = 0; i < 4; i++) {
      var start = gatePts[0];
      riders.push({
        idx: i, lap: 1, gate: 1, finT: 0, done: false,
        x: start.x - Math.sin(start.a) * (i * 1.6), z: start.z + Math.cos(start.a) * (i * 1.6),
        heading: start.a + Math.PI / 2, speed: 0,
        // AI pathing state
        pi: 2 + i, aiSpeed: 8.0 + i * 0.5,
        boostT: 0, boostMeter: 1,
        mesh: i === 0 ? ctx.speeder : makeRiderMesh(i)
      });
      riders[i].mesh.visible = true;
    }
    // player faces along the track
    riders[0].heading = Math.atan2(
      path[2].x - path[0].x, path[2].z - path[0].z);
  }

  function circuitProgress(r) {
    return (r.lap - 1) * gatePts.length + r.gate +
      (r.done ? 999 : 0);
  }

  function updateCircuit(dt, input) {
    var C = GH.world.CIRCUIT;
    for (var i = 0; i < riders.length; i++) {
      var r = riders[i];
      if (r.done) continue;

      if (i === 0) {
        var steer = (input.keys.d ? 1 : 0) - (input.keys.a ? 1 : 0) + input.padMoveX + input.touchMoveX;
        r.heading += GH.clamp(steer, -1, 1) * (2.9 - r.speed * 0.045) * dt;
        var throttle = (input.keys.w ? 1 : 0) + (input.padMoveY + input.touchMoveY < -0.3 ? 1 : 0);
        var brake = input.keys.s ? 1 : 0;
        r.boostMeter = Math.min(1, r.boostMeter + dt * 0.25);
        if (input.boostPressed) {
          input.boostPressed = false;
          if (r.boostMeter >= 0.35) { r.boostMeter -= 0.35; r.boostT = 1.0; GH.audio.dash(); }
        }
        r.boostT = Math.max(0, r.boostT - dt);
        var target = throttle ? (r.boostT > 0 ? 24 : 16.5) : 6;
        if (brake) target = 3;
        r.speed = GH.lerp(r.speed, target, dt * (throttle ? 1.8 : 2.6));
        r.x += Math.sin(r.heading) * r.speed * dt;
        r.z += Math.cos(r.heading) * r.speed * dt;
        // drifting wide of the ring costs speed (magnetized track lip)
        var dc = Math.sqrt(GH.dist2(r.x, r.z, C.x, C.z));
        if (dc > C.r + 9 || dc < C.r - 9) r.speed *= Math.pow(0.25, dt);
      } else {
        // AI: chase a point sliding along the centerline
        var tp = path[r.pi % path.length];
        var d2t = GH.dist2(r.x, r.z, tp.x, tp.z);
        if (d2t < 9) r.pi++;
        var want = Math.atan2(tp.x - r.x, tp.z - r.z);
        var diff = want - r.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        r.heading += GH.clamp(diff, -2.4 * dt, 2.4 * dt);
        // rubber-band: trailing riders push, leaders coast
        var band = circuitProgress(riders[0]) - circuitProgress(r);
        var spd = r.aiSpeed * (band > 2 ? 1.12 : band < -2 ? 0.88 : 1);
        r.speed = GH.lerp(r.speed, spd, dt * 2);
        r.x += Math.sin(r.heading) * r.speed * dt;
        r.z += Math.cos(r.heading) * r.speed * dt;
      }

      // gate checks (in order)
      var gp = gatePts[r.gate % gatePts.length];
      if (GH.dist2(r.x, r.z, gp.x, gp.z) < 6 * 6) {
        r.gate++;
        if (i === 0) GH.audio.coin();
        if (r.gate > gatePts.length) {
          r.gate = 1;
          r.lap++;
          if (i === 0 && r.lap <= LAPS) GH.audio.win();
          if (r.lap > LAPS) { r.done = true; r.finT = raceT; }
        }
      }

      r.mesh.position.set(r.x, GH.terrain.h(r.x, r.z) + 0.14 + Math.sin(raceT * 5 + i) * 0.06, r.z);
      r.mesh.rotation.y = r.heading;
      r.mesh.rotation.z = 0;
      if (r.mesh.userData.flames) {
        var hot = i === 0 && r.boostT > 0;
        r.mesh.userData.flames.forEach(function (fl) {
          fl.visible = true;
          fl.scale.y = hot ? 2.2 : 1.2;
        });
      }
    }

    // place = riders ahead of you + 1
    var place = 1;
    for (var p = 1; p < riders.length; p++) {
      if (circuitProgress(riders[p]) > circuitProgress(riders[0])) place++;
    }
    var pl = riders[0];
    el.lap.textContent = 'LAP ' + Math.min(pl.lap, LAPS) + '/' + LAPS +
      ' · GATE ' + pl.gate + '/' + gatePts.length;
    el.time.textContent = fmtTime(raceT) +
      (pl.boostMeter !== undefined ? '  BOOST ' + Math.round(pl.boostMeter * 100) + '%' : '');
    el.place.textContent = ['1ST', '2ND', '3RD', '4TH'][place - 1];

    if (pl.done) {
      return { win: place === 1, label: ['1ST', '2ND', '3RD', '4TH'][place - 1] + ' — ' + fmtTime(pl.finT), time: pl.finT, place: place };
    }
    // every rival home and the player dawdling: call it a DNF
    if (riders[1].done && riders[2].done && riders[3].done) {
      dnfT -= dt;
      el.place.textContent = 'FINISH IN ' + Math.ceil(dnfT) + 's';
      if (dnfT <= 0) return { win: false, label: 'DNF', place: 4 };
    }
    return null;
  }

  // ---------------------------------------------------------------
  // shared lifecycle
  // ---------------------------------------------------------------
  R.start = function (kind, context) {
    ctx = context;
    mode = kind;
    riders = [];
    walls = [];
    extras = [];
    raceT = 0;
    countdown = 3.4;
    finished = false;
    dnfT = 25;
    hudEls();
    el.hud.classList.remove('hidden');
    if (kind === 'duel') startDuel(); else startCircuit();
    // hand the player rider position to the shared player object so the
    // camera keeps following
    ctx.player.x = riders[0].x;
    ctx.player.z = riders[0].z;
    GH.audio.boss();
  };

  R.update = function (dt, input) {
    if (finished) return;
    if (countdown > 0) {
      countdown -= dt;
      el.lap.textContent = mode === 'duel' ? 'TRACE DUEL' : 'SUNSPIRE CIRCUIT';
      el.time.textContent = countdown > 0.4 ? Math.ceil(countdown - 0.4) + '…' : 'GO!';
      el.place.textContent = '';
      // consume stray inputs during the count
      input.boostPressed = false;
      return;
    }
    raceT += dt;
    var result = mode === 'duel' ? updateDuel(dt, input) : updateCircuit(dt, input);
    // mirror the player rider into the shared position for the camera
    ctx.player.x = riders[0].x;
    ctx.player.z = riders[0].z;
    if (result) {
      finished = true;
      R.teardownDelay = 1.4;
      R.pendingResult = result;
      R.pendingDone = ctx.onDone;
    }
  };

  // after a short beat showing the outcome, tear down and report
  R.tick = function (dt) {
    if (!finished || !R.pendingDone) return;
    R.teardownDelay -= dt;
    if (R.teardownDelay <= 0) {
      var done = R.pendingDone, res = R.pendingResult;
      R.pendingDone = null;
      R.cleanup();
      done(res);
    }
  };

  R.cleanup = function () {
    walls.forEach(function (w) { ctx.scene.remove(w.mesh); });
    walls = [];
    extras.forEach(function (m) { ctx.scene.remove(m); });
    extras = [];
    riders = [];
    finished = false;
    if (el.hud) el.hud.classList.add('hidden');
  };

  R.mode = function () { return mode; };
  R.time = function () { return raceT; };
  R.debug = function () {
    return riders.map(function (r) {
      return { alive: r.alive !== false, done: !!r.done, lap: r.lap || 0, gate: r.gate || 0,
        x: Math.round(r.x), z: Math.round(r.z) };
    });
  };

  return R;
})();
