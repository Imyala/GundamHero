// HERO FRAME — core game logic
GH.game = (function () {
  var G = {};

  // ---------- scene / world ----------
  var scene, camera, hemi, sun, floor, wallRing, arenaProps;
  var ARENA_R = 33;

  // ---------- run state ----------
  G.state = 'title'; // title | select | stageselect | hangar | play | reward | pause | over | win
  G.mode = 'classic'; // classic | arena
  var player = null;
  var stage = null, stageIndex = 0;
  var enemies = [], projectiles = [], enemyShots = [], pickups = [], mines = [], effects = [];
  var orbitGroup = null, droneMesh = null, droneAngle = 0;
  var waveNum = 0, waveTimer = 0, wavePlan = null, spawnAcc = 0, bossRef = null;
  var kills = 0, coinsRun = 0, runTime = 0, hitCount = 0;
  var sparksRun = 0;
  var announceTimer = 0, shake = 0, hitStopT = 0;
  var announceQueue = [];
  var selMechIndex = 0, selPreview = null, selSpin = 0;
  var weekly = null;   // active weekly-challenge modifiers
  var mate = null;     // co-op wingmate (player 2)
  var cipherRun = null; // active signal-cipher step state
  var picoDrone = null, picoAngle = 0;
  G.coop = false;

  G.hitStop = function (t) { hitStopT = Math.max(hitStopT, t); };

  // season task announcements
  function seasonTaskNotify(taskId) {
    var t = GH.progress.seasonAward(taskId);
    if (t) queueAnnounce('SEASON — ' + t.desc.toUpperCase() + ' (+' + t.pts + ')', 18);
  }
  function seasonAwardNotify(awardedIds) {
    (awardedIds || []).forEach(function (id) {
      GH.progress.seasonTasks.forEach(function (t) {
        if (t.id === id) queueAnnounce('SEASON — ' + t.desc.toUpperCase() + ' (+' + t.pts + ')', 18);
      });
    });
  }

  // award a stage-trial task; announces the task and any newly-finished tier
  function awardTrial(taskId) {
    if (!stage) return;
    var before = GH.progress.trialTier(stage.id);
    if (!GH.progress.trialAward(stage.id, taskId)) return;
    queueAnnounce('TRIAL — ' + GH.progress.taskDesc(taskId).toUpperCase(), 20);
    GH.audio.levelup();
    var after = GH.progress.trialTier(stage.id);
    if (after > before) {
      queueAnnounce('STAGE TRIAL ' + GH.progress.trialTiers[after - 1].name +
        ' — ' + GH.progress.trialTiers[after - 1].perk.toUpperCase(), 20);
    }
  }

  var raycaster = new THREE.Raycaster();
  var groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  var tmpV3 = new THREE.Vector3();

  // =================================================================
  // INIT
  // =================================================================
  G.init = function () {
    GH.assets.init();
    GH.meta.load();
    GH.meta.applyDevParams(location.search);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x9fc8dc, 18, 52);
    camera = new THREE.PerspectiveCamera(48, 16 / 9, 0.1, 220);

    hemi = new THREE.HemisphereLight(0xbfe8ff, 0x24485a, 0.95);
    scene.add(hemi);
    sun = new THREE.DirectionalLight(0xfff4d8, 0.85);
    sun.position.set(8, 20, 6);
    scene.add(sun);

    floor = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      GH.assets.lambert({ map: GH.assets.stageTex.glacier.floor })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // encircling cliffs
    wallRing = new THREE.Mesh(
      new THREE.CylinderGeometry(ARENA_R + 14, ARENA_R + 10, 16, 24, 1, true),
      GH.assets.lambert({ map: GH.assets.stageTex.glacier.wall, side: THREE.BackSide })
    );
    wallRing.position.y = 7.5;
    scene.add(wallRing);

    arenaProps = new THREE.Group();
    scene.add(arenaProps);

    orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    G.dmg = makeDamageLayer();
  };

  function applyStageLook(st) {
    var tex = GH.assets.stageTex[st.id];
    scene.background = tex.sky;
    scene.fog.color.setHex(st.fog);
    hemi.color.setHex(st.hemiSky);
    hemi.groundColor.setHex(st.hemiGround);
    sun.color.setHex(st.sun);
    floor.material.map = tex.floor;
    floor.material.needsUpdate = true;
    wallRing.visible = true;
    wallRing.material.map = tex.wall;
    wallRing.material.needsUpdate = true;
    scatterProps(st);
  }

  function scatterProps(st) {
    while (arenaProps.children.length) arenaProps.remove(arenaProps.children[0]);
    for (var i = 0; i < 16; i++) {
      var kind = GH.pick(st.props);
      var p = GH.models.props[kind]();
      var a = Math.random() * Math.PI * 2;
      var r = GH.rand(10, ARENA_R + 6);
      p.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      arenaProps.add(p);
    }
  }

  // =================================================================
  // DAMAGE NUMBER LAYER (DOM)
  // =================================================================
  function makeDamageLayer() {
    var layer = document.getElementById('damage-layer');
    var pool = [];
    for (var i = 0; i < 56; i++) {
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
  // WEAPON INSTANCES
  // =================================================================
  function makeWeaponInst(id, def, isPrimary) {
    var w = {};
    for (var k in def) w[k] = def[k];
    var inst = {
      id: id, w: w, isPrimary: !!isPrimary,
      timer: 0, clip: w.clip || 0, reloading: 0,
      burstLeft: 0, burstTimer: 0, burstAngle: 0,
      sockets: [], mods: null, resonance: null,
      sanctityT: 8, prismT: 6, angle: 0
    };
    GH.gems.applySocketBonuses(inst);
    return inst;
  }

  function weaponDamage(inst, actor) {
    var a2 = actor || player;
    var s = player.stats;
    var d = (inst.w.damage + s.flatDamage) * s.damageMult * inst.mods.damageMult;
    if (a2 === player && player.counter.length) {
      d *= 1 + player.counter.length * 0.03; // ward COUNTER stacks
    }
    if (a2.def.passive === 'wrath') {
      var missing = 1 - a2.hp / s.maxHP;
      d *= 1 + Math.min(0.6, missing * 0.75);
    }
    if (inst.w.element || inst.w.cycle || inst.w.cls === 'HEAVY · ELEMENTAL' || inst.w.cls === 'LIGHT · ELEMENTAL') {
      d *= s.elemMult;
    }
    return d;
  }

  function resHas(inst, type) {
    // returns potency 1 (pure), 0.6 (hybrid/minor half), 0 (none)
    var r = inst.resonance;
    if (!r) return 0;
    if (r.kind === 'prism') return 0;
    if (r.types.indexOf(type) === -1) return 0;
    return r.kind === 'pure' ? 1 : 0.6;
  }

  function currentElement(inst) {
    if (inst.w.cycle) return inst.w.cycle[Math.floor(runTime / 5) % inst.w.cycle.length];
    return inst.w.element || null;
  }

  // =================================================================
  // PLAYER
  // =================================================================
  function makePlayer(mechDef) {
    var s = mechDef.stats;
    var dev = GH.meta.devotionBonus();
    var p = {
      def: mechDef,
      mesh: GH.models.buildMech(mechDef.model),
      x: 0, z: 0, facing: 0, moveX: 0, moveZ: 0,
      stats: {
        maxHP: s.maxHP + dev.maxHP, speed: s.speed * 0.42, armor: s.armor,
        block: s.block, crit: s.crit + dev.crit, critMult: 1.6 + dev.critMult,
        lifesteal: s.lifesteal,
        damageMult: 1 + dev.damageMult, atkSpdMult: 1 + dev.atkSpdMult, flatDamage: 0,
        regen: dev.regen, magnet: 3.2 * (1 + dev.magnet), xpGain: 1 + dev.xpGain,
        bonusProj: 0, boostRegen: 0.35 + dev.boostRegen, boostCost: 0.34,
        elemMult: mechDef.id === 'hexen' ? 1.15 : 1
      },
      hp: 0,
      xp: 0, level: 1, xpNeed: 6,
      weapons: [],
      weaponLevels: {},
      protocols: {},
      pendingGems: [],
      boost: 1, dashTime: 0, dashX: 0, dashZ: 0, dashId: 0, dashKind: 'boost',
      blocking: false,
      special: { cd: 0, active: 0 },
      frenzy: [], edgeT: 0,
      ward: null, wardEnergy: 1, wardCd: 0, counter: [],
      hurtCd: 0,
      heal: function (amt) {
        if (p.hp <= 0) return;
        var real = Math.min(amt, p.stats.maxHP - p.hp);
        p.hp += real;
        if (real >= 1) G.dmg.spawn(p.x, 2.4, p.z, '+' + Math.round(real), 'heal', 15);
      }
    };
    p.hp = p.stats.maxHP;
    p.weapons.push(makeWeaponInst('primary', mechDef.weapon, true));
    p.mesh.position.set(0, 0, 0);
    scene.add(p.mesh);
    return p;
  }

  function playerDamage(raw, srcE, dmgType) {
    if (!player || player.hp <= 0 || player.dashTime > 0.12 || GH.devGod) return;
    var s = player.stats;
    var block = s.block + (player.protocols.vents && player.hp < s.maxHP * 0.35 ? 10 : 0);
    if (Math.random() * 100 < block) {
      G.dmg.spawn(player.x, 2.6, player.z, 'BLOCK', 'heal', 14);
      GH.audio.block();
      if (player.def.special === 'block') player.heal(2);
      return;
    }
    // matching ward: 75% cut, small energy cost, feeds COUNTER stacks
    var warded = dmgType && player.ward === dmgType;
    if (warded) {
      raw *= 0.25;
      player.wardEnergy = Math.max(0, player.wardEnergy - 0.06);
      player.counter.push(4);
      if (player.counter.length > 5) player.counter.shift();
      G.dmg.spawn(player.x, 3.0, player.z, 'WARDED', 'elem', 13);
      GH.audio.block();
    }
    var armor = s.armor + (player.special.active > 0 && player.def.special === 'bulwark' ? 12 : 0);
    var dmg = Math.max(1, Math.round(raw - armor));
    if (player.blocking) {
      dmg = Math.max(1, Math.round(dmg * 0.3));
      player.heal(3);
      GH.audio.block();
    }
    player.hp -= dmg;
    player.hurtCd = 0.25;
    G.hitStop(0.05);
    shake = Math.min(0.5, shake + 0.18);
    if (cipherRun && cipherRun.steps[cipherRun.idx].id === 'hold') cipherRun.t = 0;
    G.dmg.spawn(player.x, 2.6, player.z, dmg, 'player', 19);
    GH.audio.hurt();
    if (player.protocols.thorns && srcE && !srcE.dead) {
      damageEnemy(srcE, s.armor * 2, { canCrit: false, noRes: true });
    }
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
    var apply = function (k, v) {
      if (k === 'maxHP') { s.maxHP += v; player.heal(v); }
      else if (k === 'armor') s.armor += v;
      else if (k === 'block') s.block += v;
      else if (k === 'damage') s.flatDamage += v;
      else if (k === 'atkSpd') s.atkSpdMult += v / 100;
      else if (k === 'crit') s.crit += v;
      else if (k === 'speed') s.speed += v * 0.42;
      else if (k === 'lifesteal') s.lifesteal += v;
      else if (k === 'magnet') s.magnet *= 1 + v / 100;
    };
    for (var k in g) apply(k, g[k]);
    // active devotion path grants a small extra each level
    var d = GH.meta.data.activeDevotion;
    if (d === 'sol') apply('maxHP', 2);
    else if (d === 'pyre') apply('damage', 0.5);
    else if (d === 'keen') apply('atkSpd', 1);
    else if (d === 'verd') apply('magnet', 1.5);
    else if (d === 'ruin') apply('crit', 0.5);
  }

  // =================================================================
  // ELEMENTS
  // =================================================================
  function applyElement(e, elem, power) {
    if (!elem || e.dead) return;
    power = (power || 1) * player.stats.elemMult;
    if (elem === 'burn') {
      e.burn = { dps: 4 * power, t: 3 };
    } else if (elem === 'shock') {
      if (Math.random() < 0.4) e.stun = Math.max(e.stun || 0, 0.5);
    } else if (elem === 'frost') {
      e.slowT = 2.2;
    }
  }

  // =================================================================
  // ENEMIES
  // =================================================================
  function spawnEnemy(typeId, atX, atZ) {
    if (enemies.length > 110) return null;
    var def = GH.enemyDefs[typeId];
    var mesh = def.corrupt ? GH.buildCorrupt(typeId) : GH.enemyBuilders[typeId]();
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
    var hpMult = def.boss ? Math.max(1, wavePlan.hpMult * 0.55) : wavePlan.hpMult;
    if (def.boss && GH.devWeakBoss) hpMult *= 0.03;
    if (def.boss && GH.devPhaseBoss) hpMult *= 0.25;
    if (weekly) hpMult *= weekly.mods.ehp;
    var e = {
      id: typeId, def: def, mesh: mesh,
      x: x, z: z, vx: 0, vz: 0,
      hp: def.hp * hpMult, maxHp: def.hp * hpMult,
      damage: def.damage * wavePlan.dmgMult,
      attackCd: GH.rand(0, 0.5),
      shootCd: def.shootInterval ? GH.rand(1, def.shootInterval) : 0,
      dashCd: def.dashInterval ? GH.rand(1, def.dashInterval) : 0,
      dashing: 0, telegraphing: 0,
      abilityT: 4, summonT: 10,
      burn: null, stun: 0, slowT: 0, burnAcc: 0, burnNumT: 0,
      popT: 0, baseScale: mesh.scale.x,
      anim: Math.random() * 10,
      lastOrbitHit: 0, lastDashId: -1,
      dead: false
    };
    enemies.push(e);
    if (def.boss) {
      bossRef = e;
      GH.audio.boss();
      GH.music.setBoss(true);
      announce(def.name, 32);
      showBossBar(def.name);
    }
    return e;
  }

  function damageEnemy(e, raw, opts) {
    if (e.dead || G.state !== 'play') return;
    opts = opts || {};
    var dmg = raw;
    var crit = false;
    var inst = opts.inst;
    if (opts.canCrit !== false) {
      var chance = player.stats.crit + (inst ? inst.mods.crit : 0) +
        (player.edgeT > 0 ? 12 : 0);
      if (Math.random() * 100 < chance) {
        dmg *= player.stats.critMult + (inst ? inst.mods.critMult : 0);
        crit = true;
      }
    }
    dmg *= GH.progress.contractDamageBonus(e.id);
    dmg = Math.max(1, Math.round(dmg));
    hitCount++;
    e.hp -= dmg;
    e.popT = 0.12;
    if (crit) G.hitStop(0.035);
    var cls = crit ? 'crit' : (opts.elem ? 'elem' : (opts.isDot ? 'dot' : ''));
    G.dmg.spawn(e.x, 2.0 + (e.def.boss ? 2 : 0), e.z,
      crit ? dmg + '!' : dmg, cls, crit ? 20 : (opts.isDot ? 12 : 15));
    if (!opts.isDot) { if (crit) GH.audio.crit(); else GH.audio.hit(); }

    // sustain: global lifesteal + weapon Sol sockets
    if (player.stats.lifesteal > 0) player.heal(dmg * player.stats.lifesteal / 100 * 0.35);
    if (inst && inst.mods.lifegain > 0) player.heal(dmg * inst.mods.lifegain * 0.5);

    // resonance on-hit effects
    if (inst && !opts.noRes) {
      var pot = resHas(inst, 'pyre');
      if (pot > 0) {
        applyElement(e, 'burn', pot * (1 + player.stats.crit * 0.02));
      }
      pot = resHas(inst, 'ruin');
      if (pot > 0 && Math.random() < 0.2 * pot) {
        explode(e.x, e.z, 1.7, dmg * 0.5, { noRes: true });
      }
    }
    if (opts.elem && !opts.isDot) applyElement(e, opts.elem, 1);

    if (e.hp <= 0) killEnemy(e, inst);
  }

  function killEnemy(e, inst) {
    if (e.dead) return;
    e.dead = true;
    kills++;
    if (e.def.boss) G.hitStop(0.14);
    else if (e.def.mass >= 3) G.hitStop(0.06);
    scene.remove(e.mesh);

    // progression hooks: collection log, contracts, trials, season, ciphers
    GH.progress.logKill(e.id);
    var cdone = GH.progress.contractKill(e.id, stage.id);
    if (cdone) {
      queueAnnounce('CONTRACT COMPLETE — +' + cdone.salvage + ' SALVAGE, +' + cdone.pts + ' PTS', 22);
      GH.audio.win();
      seasonAwardNotify(GH.progress.seasonCounter('contracts', 1));
    }
    if (e.id === 'warden') awardTrial('warden');
    if (e.id === 'carapace') { awardTrial('carapace'); seasonTaskNotify('carapace'); }
    if (e.def.corrupt && !e.phase2) awardTrial('nobound');
    if (e.def.corrupt) {
      seasonTaskNotify('corrupt');
      if (e.phase2) seasonTaskNotify('unbound');
    }
    seasonAwardNotify(GH.progress.seasonCounter('kills', 1));
    // signal cipher drop (pity-protected; never while one is running)
    if (!cipherRun && !e.def.boss && GH.progress.cipherRoll()) {
      spawnPickup('cipher', e.x, e.z);
      queueAnnounce('SIGNAL CIPHER DETECTED', 22);
    }
    spawnBurst(e.x, 1, e.z, e.def.boss ? 0xffd060 : 0xc0c0c0, e.def.boss ? 26 : 8);
    // sparks (XP)
    var xp = e.def.xp;
    while (xp > 0) {
      var size = xp >= 10 ? 2 : (xp >= 3 ? 1 : 0);
      var val = size === 2 ? 10 : (size === 1 ? 3 : 1);
      if (val > xp) { size = 0; val = 1; }
      spawnPickup('spark' + size, e.x + GH.rand(-0.6, 0.6), e.z + GH.rand(-0.6, 0.6));
      xp -= val;
    }
    if (e.def.deathBurn) {
      effects.push({ kind: 'patch', x: e.x, z: e.z, t: 3, radius: 1.3, dps: 5,
        mesh: groundDisc(e.x, e.z, 1.3, 0xff5020, 0.3) });
    }
    if (e.def.boss) {
      for (var c = 0; c < (e.def.corrupt ? 24 : 12); c++) {
        spawnPickup('coin', e.x + GH.rand(-2, 2), e.z + GH.rand(-2, 2));
      }
      var gemDrops = GH.progress.trialTier(stage.id) >= 4 ? 2 : 1;
      for (var gd = 0; gd < gemDrops; gd++) {
        spawnPickup('gem:' + GH.pick(GH.gems.typeIds), e.x + gd, e.z);
      }
      hideBossBar();
      if (bossRef === e) { bossRef = null; GH.music.setBoss(false); }
      GH.audio.explode();
    } else {
      if (Math.random() < 0.10) spawnPickup('coin', e.x, e.z);
      if (Math.random() < 0.045) spawnPickup('heart', e.x, e.z);
    }
    // protocols & resonances that trigger on kill
    if (player.protocols.reclaim && Math.random() < player.protocols.reclaim) player.heal(3);
    if (inst) {
      var pot = resHas(inst, 'verd');
      if (pot > 0 && Math.random() < 0.15 * pot) {
        effects.push({ kind: 'shrub', x: e.x, z: e.z, t: 4, emitT: 0.5,
          mesh: addAt(GH.models.buildShrub(), e.x, e.z) });
      }
    }
  }

  function addAt(mesh, x, z) {
    mesh.position.set(x, 0, z);
    scene.add(mesh);
    return mesh;
  }

  function groundDisc(x, z, r, color, opacity) {
    var m = new THREE.Mesh(new THREE.CircleGeometry(r, 16),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.04, z);
    scene.add(m);
    return m;
  }

  function updateEnemies(dt) {
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      if (e.dead) { enemies.splice(i, 1); continue; }
      var def = e.def;
      // target the nearest alive pilot
      var tgtP = player;
      if (mate && !mate.down) {
        if (GH.dist2(e.x, e.z, mate.x, mate.z) < GH.dist2(e.x, e.z, player.x, player.z)) tgtP = mate;
      }
      var dx = tgtP.x - e.x, dz = tgtP.z - e.z;
      var dist = Math.sqrt(dx * dx + dz * dz) || 0.001;
      var nx = dx / dist, nz = dz / dist;

      // status
      if (e.burn) {
        e.burn.t -= dt;
        e.burnAcc += e.burn.dps * dt;
        e.burnNumT -= dt;
        if (e.burnNumT <= 0 && e.burnAcc >= 1) {
          var bd = Math.floor(e.burnAcc);
          e.burnAcc -= bd;
          e.burnNumT = 0.5;
          e.hp -= bd;
          hitCount++;
          G.dmg.spawn(e.x, 1.8, e.z, bd, 'dot', 12);
          if (e.hp <= 0) { killEnemy(e); continue; }
        }
        if (e.burn.t <= 0) e.burn = null;
      }
      if (e.stun > 0) {
        e.stun -= dt;
        e.mesh.position.set(e.x, Math.sin(runTime * 30) * 0.03, e.z);
        continue;
      }
      var spd = def.speed * (e.slowT > 0 ? 0.6 : 1) * (weekly ? weekly.mods.espd : 1);
      if (e.slowT > 0) e.slowT -= dt;
      if (def.boss && e.hp < e.maxHp * 0.35) spd *= 1.35; // enrage

      e.anim += dt * (4 + def.speed);
      var mx = 0, mz = 0;

      if (def.behavior === 'chase') {
        mx = nx; mz = nz;
      } else if (def.behavior === 'ranged') {
        if (dist > def.keepDist + 1) { mx = nx; mz = nz; }
        else if (dist < def.keepDist - 2) { mx = -nx; mz = -nz; }
        e.shootCd -= dt;
        if (e.shootCd <= 0 && dist < 22) {
          e.shootCd = def.shootInterval;
          spawnEnemyShot(e.x, 1, e.z, nx, nz, def.shotSpeed, e.damage * 0.9, def.shotElement);
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
        e.abilityT -= dt;
        e.summonT -= dt;
        if (e.abilityT <= 0) {
          e.abilityT = def.slamInterval || 6;
          spawnTelegraph(tgtP.x, tgtP.z, 3.2, 1.0, e.damage * 1.3);
        }
        if (e.summonT <= 0) {
          // midbosses spiral up their summons below half hull
          var frantic = e.hp < e.maxHp * 0.5;
          e.summonT = (def.summonInterval || 10) * (frantic ? 0.6 : 1);
          var sid = def.summons || GH.weightedPick(wavePlan.types).id;
          for (var s2 = 0; s2 < (def.summonCount || 3) + (frantic ? 1 : 0); s2++) {
            spawnEnemy(sid, e.x + GH.rand(-2.5, 2.5), e.z + GH.rand(-2.5, 2.5));
          }
        }
      } else if (def.behavior === 'corrupt') {
        var r = corruptAI(e, dt, dist, nx, nz);
        mx = r.mx; mz = r.mz;
        if (r.spd !== undefined) spd = r.spd;
      }

      // separation
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
      e.vx *= Math.pow(0.02, dt);
      e.vz *= Math.pow(0.02, dt);
      e.x = GH.clamp(e.x, -ARENA_R - 3, ARENA_R + 3);
      e.z = GH.clamp(e.z, -ARENA_R - 3, ARENA_R + 3);

      // never overlap a pilot: hold attackers on a contact ring
      var ringTargets = mate && !mate.down ? [player, mate] : [player];
      for (var rt = 0; rt < ringTargets.length; rt++) {
        var rp = ringTargets[rt];
        var pdx = e.x - rp.x, pdz = e.z - rp.z;
        var pd = Math.sqrt(pdx * pdx + pdz * pdz) || 0.001;
        var minPD = def.radius + 0.65;
        if (pd < minPD) {
          e.x = rp.x + (pdx / pd) * minPD;
          e.z = rp.z + (pdz / pd) * minPD;
        }
      }

      e.mesh.position.set(e.x, 0, e.z);
      e.mesh.rotation.y = Math.atan2(nx, nz);

      // animation
      var limbs = e.mesh.userData.limbs;
      if (limbs) {
        var sw = Math.sin(e.anim) * 0.5;
        limbs.legL.rotation.x = sw;
        limbs.legR.rotation.x = -sw;
        limbs.armL.rotation.x = -sw * 0.7;
        limbs.armR.rotation.x = sw * 0.7;
      }
      var parts = e.mesh.userData.parts; // corrupt mechs
      if (parts) {
        var sw2 = Math.sin(e.anim) * 0.5;
        parts.legL.rotation.x = sw2;
        parts.legR.rotation.x = -sw2;
      }
      if (e.mesh.userData.core) {
        e.mesh.userData.core.rotation.y += dt * 3;
        if (e.telegraphing > 0) e.mesh.userData.core.scale.setScalar(1 + Math.sin(e.anim * 6) * 0.25);
      }
      if (e.mesh.userData.ring) e.mesh.userData.ring.rotation.z += dt * 2;

      // burn tint flicker
      if (e.burn && Math.floor(runTime * 20) % 2 === 0) {
        e.mesh.position.y += 0.02;
      }
      // hit pop
      if (e.popT > 0) {
        e.popT -= dt;
        e.mesh.scale.setScalar(e.baseScale * (1 + Math.max(0, e.popT) * 1.4));
      }

      // contact damage (whichever pilot is in reach)
      e.attackCd -= dt;
      if (e.attackCd <= 0) {
        if (GH.dist2(e.x, e.z, player.x, player.z) < Math.pow(def.radius + 0.8, 2)) {
          e.attackCd = 1.1;
          playerDamage(e.damage, e, 'kinetic');
        } else if (mate && !mate.down &&
          GH.dist2(e.x, e.z, mate.x, mate.z) < Math.pow(def.radius + 0.8, 2)) {
          e.attackCd = 1.1;
          wingmateDamage(e.damage);
        }
      }
    }
  }

  // ---- corrupt shell boss AI: archetype attacks every few seconds ----
  function corruptAI(e, dt, dist, nx, nz) {
    var out = { mx: nx, mz: nz };
    // phase 2 at half hull: UNBOUND — faster cycle + radial bursts
    if (!e.phase2 && e.hp < e.maxHp * 0.5) {
      e.phase2 = true;
      announce(e.def.name + ' — UNBOUND', 30);
      GH.audio.boss();
      G.hitStop(0.1);
      spawnBurst(e.x, 2, e.z, 0xff2838, 30);
      var aura = new THREE.Mesh(new THREE.TorusGeometry(e.def.radius + 0.6, 0.08, 4, 16),
        GH.assets.basic(0xff2838, { transparent: true, opacity: 0.7 }));
      aura.rotation.x = Math.PI / 2;
      aura.position.y = 0.4;
      e.mesh.add(aura);
      e.abilityT = Math.min(e.abilityT, 1.2);
    }
    e.abilityT -= dt;
    e.summonT -= dt;
    if (e.summonT <= 0) {
      e.summonT = e.phase2 ? 9 : 12;
      for (var s = 0; s < (e.phase2 ? 5 : 4); s++) {
        spawnEnemy(GH.weightedPick(wavePlan.types).id,
          e.x + GH.rand(-3, 3), e.z + GH.rand(-3, 3));
      }
    }
    if (e.dashing > 0) {
      e.dashing -= dt;
      out.spd = 18;
      out.mx = e.dashDirX; out.mz = e.dashDirZ;
      // dash contact
      if (dist < e.def.radius + 1.0 && e.attackCd <= 0) {
        e.attackCd = 0.8;
        playerDamage(e.damage * 0.8, e, 'kinetic');
      }
      return out;
    }
    if (e.abilityT <= 0) {
      e.abilityT = e.phase2 ? 3.2 : 5;
      var id = e.id;
      // UNBOUND: every cycle also throws a radial burst
      if (e.phase2) {
        for (var rb = 0; rb < 8; rb++) {
          var ra = (rb / 8) * Math.PI * 2 + runTime;
          spawnEnemyShot(e.x, 1.4, e.z, Math.sin(ra), Math.cos(ra), 9, e.damage * 0.5);
        }
      }
      if (id === 'fang' || id === 'viper' && Math.random() < 0.4) {
        // predatory dash (fang always; viper sometimes)
        e.dashing = 0.5;
        e.dashDirX = nx; e.dashDirZ = nz;
      } else if (id === 'viper') {
        // dagger fan
        var base = Math.atan2(nx, nz);
        for (var i = -4; i <= 4; i++) {
          var a = base + i * 0.12;
          spawnEnemyShot(e.x, 1.3, e.z, Math.sin(a), Math.cos(a), 14, e.damage * 0.55);
        }
      } else if (id === 'hexen') {
        // element bombs at/near the player
        for (var b = 0; b < 4; b++) {
          spawnTelegraph(player.x + GH.rand(-3.5, 3.5), player.z + GH.rand(-3.5, 3.5),
            2.0, 0.9, e.damage);
        }
      } else if (id === 'morrow') {
        // reap ring around itself
        spawnTelegraph(e.x, e.z, 5.2, 0.9, e.damage * 1.2);
      } else if (id === 'strix') {
        // rail snipe along a telegraphed line
        var la = Math.atan2(nx, nz);
        spawnLineTelegraph(e.x, e.z, la, 26, 1.0, 0.9, e.damage * 1.4);
      } else if (id === 'titan') {
        for (var t2 = 0; t2 < 4; t2++) {
          spawnTelegraph(player.x + GH.rand(-4, 4), player.z + GH.rand(-4, 4), 2.6, 1.1, e.damage);
        }
      } else {
        spawnTelegraph(player.x, player.z, 3.0, 0.9, e.damage * 1.2);
      }
    }
    return out;
  }

  // ---------- telegraphs ----------
  function spawnTelegraph(x, z, radius, delay, dmg) {
    var m = groundDisc(x, z, radius, 0xff2020, 0.35);
    effects.push({ kind: 'telegraph', mesh: m, t: delay, radius: radius, damage: dmg, x: x, z: z });
  }

  function spawnLineTelegraph(x, z, angle, len, width, delay, dmg) {
    var geo = new THREE.PlaneGeometry(width, len);
    var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0xff2020, transparent: true, opacity: 0.4, depthWrite: false
    }));
    m.rotation.x = -Math.PI / 2;
    m.rotation.z = -angle;
    m.position.set(x + Math.sin(angle) * len / 2, 0.05, z + Math.cos(angle) * len / 2);
    scene.add(m);
    effects.push({ kind: 'lineTele', mesh: m, t: delay, x: x, z: z, angle: angle, len: len, width: width, damage: dmg });
  }

  // =================================================================
  // FIRING
  // =================================================================
  function projMesh(size, color) {
    var m = new THREE.Mesh(new THREE.ConeGeometry(size, size * 3.2, 5), GH.assets.basic(color));
    m.rotation.order = 'YXZ';
    return m;
  }

  function fireShot(inst, originX, originZ, aimAngle, actor) {
    var w = inst.w;
    // soft aim assist
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

    var elem = currentElement(inst);
    var color = w.color;
    if (elem && GH.elements[elem] && w.cycle) color = GH.elements[elem].color;

    var count = w.count + (inst.isPrimary ? player.stats.bonusProj : 0);
    var dmgMult = 1;
    var frag = resHas(inst, 'keen');
    if (frag > 0) {
      count += frag >= 1 ? 2 : 1;
      dmgMult = frag >= 1 ? 0.65 : 0.75;
    }
    var dmg = weaponDamage(inst, actor) * dmgMult;
    for (var i = 0; i < count; i++) {
      var off = count > 1
        ? (i - (count - 1) / 2) * (Math.max(w.spread, frag > 0 ? 0.3 : w.spread) / Math.max(1, count - 1) * 2)
        : GH.rand(-w.spread, w.spread) * 0.5;
      var a = aimAngle + off;
      var m = projMesh(w.size, color);
      m.position.set(originX, 1.2, originZ);
      scene.add(m);
      projectiles.push({
        mesh: m, x: originX, z: originZ,
        dirX: Math.sin(a), dirZ: Math.cos(a),
        speed: w.speed * inst.mods.projSpd, life: w.life,
        damage: dmg, inst: inst, elem: elem,
        pierce: w.pierce || 0, homing: w.homing || 0, aoe: w.aoe || 0,
        hitSet: []
      });
    }
    spawnFlash(originX, 1.2, originZ);
    GH.audio.shoot();
  }

  function spawnFlash(x, y, z) {
    var s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: GH.assets.flashTex, transparent: true, depthWrite: false
    }));
    s.position.set(x, y, z);
    s.scale.setScalar(GH.rand(0.7, 1.1));
    scene.add(s);
    effects.push({ kind: 'sprite', mesh: s, t: 0.07, total: 0.07 });
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

  function frenzyMult(actor) {
    var a2 = actor || player;
    if (a2.def.passive !== 'frenzy') return 1;
    return 1 + a2.frenzy.length * 0.08;
  }

  function fireWeaponOnce(inst, aim) {
    var w = inst.w;
    if (w.type === 'shot') {
      var a = inst.isPrimary ? aim
        : (function () {
          var t = nearestEnemy(player.x, player.z, 26);
          return t ? GH.angleTo(player.x, player.z, t.x, t.z) : aim;
        })();
      if (w.burst) {
        inst.burstLeft = w.burst - 1;
        inst.burstTimer = 0.05;
        inst.burstAngle = a;
      }
      fireShot(inst, player.x + Math.sin(a) * 0.8, player.z + Math.cos(a) * 0.8, a);
    } else if (w.type === 'melee') {
      meleeSwing(inst, aim);
    } else if (w.type === 'aura') {
      auraTick(inst);
    } else if (w.type === 'zap') {
      zapChain(inst);
    } else if (w.type === 'mine') {
      dropMine(inst);
    } else if (w.type === 'cone') {
      coneTick(inst, aim);
    } else if (w.type === 'mortar') {
      fireMortar(inst, aim);
    } else if (w.type === 'drone') {
      var t2 = nearestEnemy(droneMesh ? droneMesh.position.x : player.x,
        droneMesh ? droneMesh.position.z : player.z, 24);
      if (t2 && droneMesh) {
        var a3 = GH.angleTo(droneMesh.position.x, droneMesh.position.z, t2.x, t2.z);
        var tmp = makeWeaponInst('dronefire', {
          type: 'shot', damage: w.damage, speed: w.speed, life: w.life,
          size: w.size, color: w.color, spread: 0, count: 1
        });
        tmp.sockets = inst.sockets; tmp.mods = inst.mods; tmp.resonance = inst.resonance;
        fireShot(tmp, droneMesh.position.x, droneMesh.position.z, a3);
      }
    }
  }

  function updateWeapons(dt, input) {
    var aim = player.facing;
    var spdBase = player.stats.atkSpdMult * frenzyMult() *
      (player.special.active > 0 && player.def.special === 'overdrive' ? 2 : 1);

    for (var i = 0; i < player.weapons.length; i++) {
      var inst = player.weapons[i];
      var w = inst.w;
      var spdMult = spdBase * inst.mods.atkSpdMult;

      // burst continuation
      if (inst.burstLeft > 0) {
        inst.burstTimer -= dt;
        if (inst.burstTimer <= 0) {
          inst.burstLeft--;
          inst.burstTimer = 0.05;
          fireShot(inst, player.x + Math.sin(inst.burstAngle) * 0.8,
            player.z + Math.cos(inst.burstAngle) * 0.8, inst.burstAngle);
        }
      }

      // reload
      if (inst.reloading > 0) {
        inst.reloading -= dt * spdMult;
        if (inst.reloading <= 0) {
          inst.clip = w.clip;
          onReload(inst);
        }
        continue;
      }

      // sanctity pulse for clipless weapons
      if (resHas(inst, 'sol') > 0 && !w.clip) {
        inst.sanctityT -= dt;
        if (inst.sanctityT <= 0) { inst.sanctityT = 8; sanctitySmite(inst); }
      }
      // prism resonance
      if (inst.resonance && inst.resonance.kind === 'prism') {
        inst.prismT -= dt;
        if (inst.prismT <= 0) { inst.prismT = 6; prismBlast(inst); }
      }
      if (w.type === 'orbit') continue; // continuous, handled below

      inst.timer -= dt * spdMult;
      if (inst.timer <= 0) {
        inst.timer = w.interval;
        fireWeaponOnce(inst, aim);
        if (w.clip) {
          inst.clip--;
          if (inst.clip <= 0) inst.reloading = w.reload;
        }
      }
    }
  }

  function onReload(inst) {
    GH.audio.card();
    var pot = resHas(inst, 'sol');
    if (pot > 0) sanctitySmite(inst, pot);
  }

  function sanctitySmite(inst, pot) {
    pot = pot || 1;
    var hit = 0;
    var dmg = weaponDamage(inst) * 1.2 * pot;
    for (var i = 0; i < enemies.length && hit < 3; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      if (GH.dist2(player.x, player.z, e.x, e.z) < 49) {
        damageEnemy(e, dmg, { inst: inst, noRes: true });
        var m = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 6, 6),
          GH.assets.basic(0xfff2c0, { transparent: true, opacity: 0.7 }));
        m.position.set(e.x, 3, e.z);
        scene.add(m);
        effects.push({ kind: 'fade', mesh: m, t: 0.25, total: 0.25 });
        hit++;
      }
    }
    if (hit > 0) {
      player.heal(6 * pot);
      GH.audio.heart();
    }
  }

  function prismBlast(inst) {
    GH.audio.zap();
    var m = new THREE.Mesh(new THREE.RingGeometry(0.4, 1.0, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(player.x, 0.3, player.z);
    scene.add(m);
    effects.push({ kind: 'boom', mesh: m, t: 0.35, total: 0.35, grow: 8 });
    var dmg = weaponDamage(inst) * 1.5;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      if (GH.dist2(player.x, player.z, e.x, e.z) < 64) {
        damageEnemy(e, dmg, { inst: inst, noRes: true });
        var a = GH.angleTo(player.x, player.z, e.x, e.z);
        e.vx += Math.sin(a) * 14 / e.def.mass;
        e.vz += Math.cos(a) * 14 / e.def.mass;
      }
    }
  }

  function meleeSwing(inst, aim, actor) {
    var a2 = actor || player;
    var w = inst.w;
    GH.audio.melee();
    var geo = new THREE.CircleGeometry(w.range, 12, aim - w.arc / 2 + Math.PI / 2, w.arc);
    var m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: 0xfff0c0, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide
    }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(a2.x, 0.35, a2.z);
    scene.add(m);
    effects.push({ kind: 'fade', mesh: m, t: 0.18, total: 0.18 });
    var parts = a2.mesh.userData.parts;
    if (parts && parts.armR) parts.armR.rotation.x = -2.2;

    var dmg = weaponDamage(inst, a2);
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      var rr = w.range + e.def.radius;
      if (GH.dist2(a2.x, a2.z, e.x, e.z) > rr * rr) continue;
      var angTo = GH.angleTo(a2.x, a2.z, e.x, e.z);
      var diff = Math.abs(((angTo - aim + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (diff <= w.arc / 2 + 0.25) {
        damageEnemy(e, dmg, { inst: inst });
        var kb = w.knockback / e.def.mass;
        e.vx += Math.sin(angTo) * kb;
        e.vz += Math.cos(angTo) * kb;
      }
    }
    // cutting wave projectile
    if (w.wave) {
      var wm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.16),
        GH.assets.basic(w.wave.color, { transparent: true, opacity: 0.85 }));
      wm.position.set(a2.x, 1.2, a2.z);
      wm.rotation.y = aim;
      scene.add(wm);
      projectiles.push({
        mesh: wm, x: a2.x, z: a2.z,
        dirX: Math.sin(aim), dirZ: Math.cos(aim),
        speed: w.wave.speed, life: w.wave.life,
        damage: weaponDamage(inst, a2) * (w.wave.damage / w.damage),
        inst: inst, elem: null, pierce: 99, homing: 0, aoe: 0,
        hitSet: [], flat: true
      });
    }
    if (w.clip) { /* melee has no clip */ }
    sanctityMaybe(inst);
  }

  function sanctityMaybe() { /* handled by timers */ }

  function auraTick(inst, actor) {
    var a2 = actor || player;
    var w = inst.w;
    var range = w.range *
      (a2.special && a2.special.active > 0 && a2.def.special === 'frenzy' ? 1.9 : 1);
    var dmg = weaponDamage(inst, a2);
    var hitAny = false;
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      var rr = range + e.def.radius;
      if (GH.dist2(a2.x, a2.z, e.x, e.z) <= rr * rr) {
        damageEnemy(e, dmg, { inst: inst });
        hitAny = true;
      }
    }
    if (hitAny) GH.audio.melee();
    var m = new THREE.Mesh(new THREE.RingGeometry(range - 0.25, range, 22),
      new THREE.MeshBasicMaterial({ color: 0xc04060, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.set(a2.x, 0.3, a2.z);
    scene.add(m);
    effects.push({ kind: 'fade', mesh: m, t: 0.22, total: 0.22 });
  }

  function coneTick(inst, aim) {
    var w = inst.w;
    var dmg = weaponDamage(inst);
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      var rr = w.range + e.def.radius;
      if (GH.dist2(player.x, player.z, e.x, e.z) > rr * rr) continue;
      var angTo = GH.angleTo(player.x, player.z, e.x, e.z);
      var diff = Math.abs(((angTo - aim + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (diff <= w.arc / 2) {
        damageEnemy(e, dmg, { inst: inst, elem: w.element });
      }
    }
    // flame puffs
    for (var f = 0; f < 2; f++) {
      var d = GH.rand(1.5, w.range);
      var a = aim + GH.rand(-w.arc / 2, w.arc / 2) * 0.8;
      var s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: GH.assets.flashTex, color: 0xff7030, transparent: true, depthWrite: false
      }));
      s.position.set(player.x + Math.sin(a) * d, GH.rand(0.6, 1.6), player.z + Math.cos(a) * d);
      s.scale.setScalar(GH.rand(0.8, 1.6));
      scene.add(s);
      effects.push({ kind: 'sprite', mesh: s, t: 0.2, total: 0.2 });
    }
  }

  function fireMortar(inst, aim, actor) {
    var a2 = actor || player;
    var w = inst.w;
    var count = w.count || 1;
    for (var i = 0; i < count; i++) {
      var tgt = nearestEnemy(a2.x, a2.z, 20);
      var tx, tz;
      if (tgt && (!inst.isPrimary || a2 !== player)) {
        tx = tgt.x + GH.rand(-1.5, 1.5); tz = tgt.z + GH.rand(-1.5, 1.5);
      }
      else {
        // primary mortar drops at the aim point (snapping to a nearby enemy)
        raycaster.setFromCamera(G._mouseNDC || new THREE.Vector2(), camera);
        if (raycaster.ray.intersectPlane(groundPlane, tmpV3)) {
          tx = GH.clamp(tmpV3.x, -ARENA_R, ARENA_R);
          tz = GH.clamp(tmpV3.z, -ARENA_R, ARENA_R);
        } else { tx = a2.x + Math.sin(aim) * 8; tz = a2.z + Math.cos(aim) * 8; }
        var near = nearestEnemy(tx, tz, 6);
        if (near) { tx = near.x; tz = near.z; }
        tx += GH.rand(-0.8, 0.8);
        tz += GH.rand(-0.8, 0.8);
      }
      var shell = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), GH.assets.basic(w.color));
      scene.add(shell);
      var disc = groundDisc(tx, tz, w.aoe * 0.8, 0xffa040, 0.18);
      effects.push({
        kind: 'pshell', mesh: shell, disc: disc, t: w.arcTime, total: w.arcTime,
        x0: a2.x, z0: a2.z, x1: tx, z1: tz,
        damage: weaponDamage(inst, a2), aoe: w.aoe, inst: inst
      });
    }
    GH.audio.shoot();
  }

  function zapChain(inst) {
    var w = inst.w;
    var hit = [];
    var fromX = player.x, fromZ = player.z, fromY = 1.6;
    var dmg = weaponDamage(inst);
    for (var t = 0; t < w.targets; t++) {
      var e = nearestEnemy(fromX, fromZ, w.range, hit);
      if (!e) break;
      hit.push(e);
      drawLightning(fromX, fromY, fromZ, e.x, 1.2, e.z);
      damageEnemy(e, dmg, { inst: inst, elem: w.element });
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

  function dropMine(inst) {
    var w = inst.w;
    var m = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 0.18, 8),
      GH.assets.mat(0xc8b040, { emissive: 0x604010 }));
    m.position.set(player.x, 0.1, player.z);
    scene.add(m);
    mines.push({ mesh: m, x: player.x, z: player.z, life: w.life, damage: weaponDamage(inst), aoe: w.aoe, inst: inst });
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
        explode(mn.x, mn.z, mn.aoe, mn.damage, { inst: mn.inst });
        scene.remove(mn.mesh);
        mines.splice(i, 1);
      }
    }
  }

  function explode(x, z, radius, dmg, opts) {
    GH.audio.explode();
    spawnBurst(x, 0.8, z, 0xffa040, 14);
    shake = Math.min(0.5, shake + 0.12);
    if (dmg > 0) G.hitStop(0.03);
    var m = new THREE.Mesh(new THREE.SphereGeometry(radius * 0.6, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffc060, transparent: true, opacity: 0.7 }));
    m.position.set(x, 0.8, z);
    scene.add(m);
    effects.push({ kind: 'boom', mesh: m, t: 0.25, total: 0.25, grow: radius });
    var scorch = groundDisc(x, z, radius * 0.7, 0x181410, 0.35);
    effects.push({ kind: 'fadeSlow', mesh: scorch, t: 2.5, total: 2.5 });
    if (dmg <= 0) return;
    opts = opts || {};
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      var rr = radius + e.def.radius;
      if (GH.dist2(x, z, e.x, e.z) <= rr * rr) {
        damageEnemy(e, dmg, { inst: opts.inst, noRes: opts.noRes });
      }
    }
  }

  function updateOrbit(dt) {
    var inst = null;
    for (var i = 0; i < player.weapons.length; i++) {
      if (player.weapons[i].w.type === 'orbit') { inst = player.weapons[i]; break; }
    }
    if (!inst) { orbitGroup.visible = false; return; }
    var w = inst.w;
    orbitGroup.visible = true;
    while (orbitGroup.children.length < w.count) {
      var b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.5, 0.9),
        GH.assets.mat(0xd0d8e8, { emissive: 0x304050 }));
      orbitGroup.add(b);
    }
    while (orbitGroup.children.length > w.count) orbitGroup.remove(orbitGroup.children[orbitGroup.children.length - 1]);
    inst.angle += dt * w.spin;
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
          damageEnemy(e, weaponDamage(inst), { inst: inst });
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
      if (!p2.flat) p2.mesh.rotation.x = Math.PI / 2;

      var kill = p2.life <= 0 || Math.abs(p2.x) > ARENA_R + 10 || Math.abs(p2.z) > ARENA_R + 10;
      if (!kill) {
        for (var j = 0; j < enemies.length; j++) {
          var e = enemies[j];
          if (e.dead || p2.hitSet.indexOf(e) !== -1) continue;
          var rr = 0.55 + e.def.radius;
          if (GH.dist2(p2.x, p2.z, e.x, e.z) <= rr * rr) {
            if (p2.aoe > 0) {
              explode(p2.x, p2.z, p2.aoe, p2.damage, { inst: p2.inst });
              if (p2.elem) applyElement(e, p2.elem, 1);
              kill = true;
              break;
            }
            damageEnemy(e, p2.damage, { inst: p2.inst, elem: p2.elem });
            p2.hitSet.push(e);
            if (p2.pierce > 0) p2.pierce--;
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
        playerDamage(p2.damage, null, 'ballistic');
        dead = true;
      }
      if (!dead && mate && !mate.down &&
        GH.dist2(p2.x, p2.z, mate.x, mate.z) < 0.8 * 0.8) {
        wingmateDamage(p2.damage);
        dead = true;
      }
      if (dead) {
        scene.remove(p2.mesh);
        enemyShots.splice(i, 1);
      }
    }
  }

  function spawnEnemyShot(x, y, z, dirX, dirZ, speed, dmg, elem) {
    var color = elem === 'shock' ? 0x90d0ff : 0xff4060;
    var m = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 5), GH.assets.basic(color));
    m.position.set(x, y, z);
    scene.add(m);
    enemyShots.push({ mesh: m, x: x, y: y, z: z, dirX: dirX, dirZ: dirZ, speed: speed, damage: dmg, life: 4.5 });
  }

  // =================================================================
  // PICKUPS
  // =================================================================
  function spawnPickup(type, x, z) {
    if (pickups.length > 160) {
      var old = pickups.shift();
      collectPickup(old, true);
    }
    var mesh;
    if (type === 'spark0') mesh = GH.models.buildSpark(0);
    else if (type === 'spark1') mesh = GH.models.buildSpark(1);
    else if (type === 'spark2') mesh = GH.models.buildSpark(2);
    else if (type === 'heart') mesh = GH.models.buildHeart();
    else if (type.indexOf('gem:') === 0) mesh = GH.models.buildGemDrop(type.slice(4));
    else if (type === 'cipher') mesh = GH.models.buildCipher();
    else if (type === 'cache') mesh = GH.models.buildCache();
    else mesh = GH.models.buildCoin();
    mesh.position.set(x, 0.5, z);
    scene.add(mesh);
    pickups.push({ type: type, mesh: mesh, x: x, z: z, vx: GH.rand(-2, 2), vz: GH.rand(-2, 2), t: Math.random() * 10 });
  }

  function collectPickup(pk, silent) {
    scene.remove(pk.mesh);
    if (pk.type === 'spark0') sparkGain(1, silent);
    else if (pk.type === 'spark1') sparkGain(3, silent);
    else if (pk.type === 'spark2') sparkGain(10, silent);
    else if (pk.type === 'heart') { player.heal(20); if (!silent) GH.audio.heart(); }
    else if (pk.type.indexOf('gem:') === 0) {
      player.pendingGems.push(pk.type.slice(4));
      announce(GH.gems.types[pk.type.slice(4)].name.toUpperCase() + ' GEM', 20);
      if (!silent) GH.audio.levelup();
    }
    else if (pk.type === 'cipher') {
      startCipher();
      if (!silent) GH.audio.levelup();
    }
    else if (pk.type === 'cache') {
      var loot = GH.progress.openCache();
      coinsRun += loot.salvage;
      if (loot.unique) {
        queueAnnounce('CACHE — ' + loot.unique.name.toUpperCase() + ' UNLOCKED', 24);
      } else if (loot.gem) {
        player.pendingGems.push(loot.gem);
        queueAnnounce('CACHE — ' + loot.salvage + ' SALVAGE + A GEM', 22);
      }
      if (!silent) GH.audio.win();
    }
    else { coinsRun++; if (!silent) GH.audio.coin(); }
  }

  function sparkGain(v, silent) {
    if (G.mode !== 'weekly' && GH.progress.hasRelic('gravity')) v *= 1.15;
    gainXP(v);
    sparksRun += v;
    if (sparksRun >= 40) awardTrial('sparks40');
    seasonAwardNotify(GH.progress.seasonCounter('sparks', v));
    if (!silent) GH.audio.gem();
    // Spark Reactor protocol
    if (player.protocols.reactor && Math.random() < player.protocols.reactor) {
      var t = nearestEnemy(player.x, player.z, 20);
      if (t) {
        var tmp = makeWeaponInst('reactor', {
          type: 'shot', damage: 10, speed: 30, life: 1.0, size: 0.18, color: 0xfff060, spread: 0, count: 1
        });
        fireShot(tmp, player.x, player.z, GH.angleTo(player.x, player.z, t.x, t.z));
      }
    }
  }

  function updatePickups(dt) {
    for (var i = pickups.length - 1; i >= 0; i--) {
      var pk = pickups[i];
      pk.t += dt;
      pk.x += pk.vx * dt; pk.z += pk.vz * dt;
      pk.vx *= Math.pow(0.05, dt); pk.vz *= Math.pow(0.05, dt);
      // magnet toward the nearest pilot; either can collect
      var px2 = player.x, pz2 = player.z;
      var d2 = GH.dist2(pk.x, pk.z, px2, pz2);
      if (mate && !mate.down) {
        var dm = GH.dist2(pk.x, pk.z, mate.x, mate.z);
        if (dm < d2) { d2 = dm; px2 = mate.x; pz2 = mate.z; }
      }
      var mag = player.stats.magnet;
      if (d2 < mag * mag) {
        var d = Math.sqrt(d2) || 0.01;
        var pull = (1 - d / mag) * 26 + 6;
        pk.x += ((px2 - pk.x) / d) * pull * dt;
        pk.z += ((pz2 - pk.z) / d) * pull * dt;
      }
      pk.mesh.position.set(pk.x, 0.5 + Math.sin(pk.t * 3) * 0.12, pk.z);
      pk.mesh.rotation.y += dt * 2.5;
      if (pk.mesh.userData.spin) pk.mesh.userData.spin.rotation.y += dt * 3;
      if (d2 < 0.75 * 0.75) {
        collectPickup(pk);
        pickups.splice(i, 1);
      }
    }
  }

  // =================================================================
  // EFFECTS
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
        fx.mesh.material.opacity = Math.max(0, fx.t / fx.total) * 0.6;
      } else if (fx.kind === 'fadeSlow') {
        fx.mesh.material.opacity = Math.max(0, fx.t / fx.total) * 0.35;
      } else if (fx.kind === 'sprite') {
        fx.mesh.material.opacity = Math.max(0, fx.t / fx.total);
      } else if (fx.kind === 'boom') {
        var k = 1 - fx.t / fx.total;
        fx.mesh.scale.setScalar(0.4 + k * 2.2);
        fx.mesh.material.opacity = 0.7 * (1 - k);
      } else if (fx.kind === 'telegraph') {
        fx.mesh.material.opacity = 0.25 + Math.sin(runTime * 20) * 0.12;
        if (fx.t <= 0) {
          if (GH.dist2(fx.x, fx.z, player.x, player.z) < fx.radius * fx.radius) {
            playerDamage(fx.damage, null, 'arc');
          }
          if (mate && !mate.down && GH.dist2(fx.x, fx.z, mate.x, mate.z) < fx.radius * fx.radius) {
            wingmateDamage(fx.damage);
          }
          explode(fx.x, fx.z, fx.radius * 0.8, 0);
        }
      } else if (fx.kind === 'lineTele') {
        fx.mesh.material.opacity = 0.3 + Math.sin(runTime * 24) * 0.14;
        if (fx.t <= 0) {
          // beam strike: perpendicular distance from segment
          var relX = player.x - fx.x, relZ = player.z - fx.z;
          var along = relX * Math.sin(fx.angle) + relZ * Math.cos(fx.angle);
          var across = Math.abs(relX * Math.cos(fx.angle) - relZ * Math.sin(fx.angle));
          if (along > 0 && along < fx.len && across < fx.width + 0.5) {
            playerDamage(fx.damage, null, 'arc');
          }
          var beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, fx.len),
            GH.assets.basic(0xff8090, { transparent: true, opacity: 0.9 }));
          beam.position.set(fx.x + Math.sin(fx.angle) * fx.len / 2, 1.2,
            fx.z + Math.cos(fx.angle) * fx.len / 2);
          beam.rotation.y = fx.angle;
          scene.add(beam);
          effects.push({ kind: 'fade', mesh: beam, t: 0.2, total: 0.2 });
          GH.audio.zap();
        }
      } else if (fx.kind === 'pshell') {
        var tt = 1 - fx.t / fx.total;
        var px = GH.lerp(fx.x0, fx.x1, tt);
        var pz = GH.lerp(fx.z0, fx.z1, tt);
        fx.mesh.position.set(px, 1 + Math.sin(tt * Math.PI) * 7, pz);
        if (fx.t <= 0) {
          scene.remove(fx.disc);
          explode(fx.x1, fx.z1, fx.aoe, fx.damage, { inst: fx.inst });
        }
      } else if (fx.kind === 'patch') {
        fx.mesh.material.opacity = 0.15 + Math.sin(runTime * 10) * 0.08;
        if (GH.dist2(fx.x, fx.z, player.x, player.z) < fx.radius * fx.radius) {
          fx.tick = (fx.tick || 0) - dt;
          if (fx.tick <= 0) { fx.tick = 0.5; playerDamage(fx.dps * 0.5 + player.stats.armor, null, 'arc'); }
        }
      } else if (fx.kind === 'shrub') {
        fx.emitT -= dt;
        if (fx.emitT <= 0) {
          fx.emitT = 0.7;
          spawnPickup('spark0', fx.x + GH.rand(-0.5, 0.5), fx.z + GH.rand(-0.5, 0.5));
        }
      }
      if (fx.t <= 0) {
        scene.remove(fx.mesh);
        if (fx.disc) scene.remove(fx.disc);
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
    wavePlan = GH.wavePlan(stage, n, G.mode !== 'classic');
    if (weekly) {
      wavePlan.rate *= weekly.mods.rate;
      if (weekly.mods.midbossEvery && n % weekly.mods.midbossEvery === 0 && !wavePlan.midboss) {
        wavePlan.midboss = 'warden';
      }
    }
    waveTimer = wavePlan.duration;
    spawnAcc = 0;
    if (n >= 5) awardTrial('wave5');
    if (n >= 10) awardTrial('wave10');
    if (mate && mate.down) reviveWingmate(0.5);
    if (wavePlan.overrun) {
      announce('OVERRUN', 44);
    } else {
      announce('WAVE ' + n, 40);
    }
    GH.audio.wave();
    if (wavePlan.boss) spawnEnemy(wavePlan.boss);
    if (wavePlan.midboss) spawnEnemy(wavePlan.midboss);
    updateHUDStatic();
  }

  function updateWave(dt) {
    if (!(bossRef && wavePlan.boss)) {
      spawnAcc += wavePlan.rate * dt;
      while (spawnAcc >= 1) {
        spawnAcc -= 1;
        spawnEnemy(GH.weightedPick(wavePlan.types).id);
      }
    }
    waveTimer -= dt;
    if (waveTimer <= 0) {
      if (bossRef && !bossRef.dead) { waveTimer = 0; return; }
      endWave();
    }
  }

  function endWave() {
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      scene.remove(e.mesh);
      if (Math.random() < 0.35) spawnPickup('spark0', e.x, e.z);
    }
    enemies.length = 0;
    bossRef = null;
    GH.music.setBoss(false);
    hideBossBar();
    for (i = enemyShots.length - 1; i >= 0; i--) scene.remove(enemyShots[i].mesh);
    enemyShots.length = 0;

    if (G.mode === 'classic' && waveNum >= 20) {
      gameOver(true);
      return;
    }
    showRewards();
  }

  // =================================================================
  // REWARD SCREEN (cards + gem socketing)
  // =================================================================
  var rewardQueue = [];

  function showRewards() {
    G.state = 'reward';
    rewardQueue = [];
    // pending boss gems first, then the card pick
    player.pendingGems.forEach(function (t) { rewardQueue.push({ gemType: t }); });
    player.pendingGems = [];
    rewardQueue.push({ cards: GH.rollRewards(player, waveNum, player.fourthCard ? 4 : 3) });
    document.getElementById('reward-screen').classList.remove('hidden');
    nextRewardStep();
  }

  function nextRewardStep() {
    var step = rewardQueue.shift();
    if (!step) {
      document.getElementById('reward-screen').classList.add('hidden');
      G.state = 'play';
      startWave(waveNum + 1);
      updateHUDStatic();
      return;
    }
    if (step.gemType) renderSocketPicker(step.gemType, true);
    else renderCards(step.cards);
  }

  function renderCards(cards) {
    var wrap = document.getElementById('reward-cards');
    var sub = document.getElementById('reward-sub');
    sub.textContent = 'Choose one upgrade';
    wrap.innerHTML = '';
    cards.forEach(function (card, i) {
      var lvl = player.weaponLevels[card.id] || 0;
      var kindLabel =
        card.kind === 'weapon' ? ((card.cls || 'WEAPON') + (lvl ? ' · LVL ' + (lvl + 1) : '')) :
        card.kind === 'gem' ? 'GEM' :
        card.kind === 'protocol' ? 'PROTOCOL' : 'TRAIT';
      var div = document.createElement('div');
      div.className = 'reward-card ' + (card.rarity || '');
      div.innerHTML =
        '<div class="rc-kind">' + kindLabel + '</div>' +
        '<div class="rc-glyph">' + card.glyph + '</div>' +
        '<div class="rc-name">' + card.name + '</div>' +
        '<div class="rc-desc">' + card.desc.replace(/\n/g, '<br>') + '</div>' +
        '<div class="rc-key">[' + (i + 1) + ']</div>';
      div.onclick = function () { pickReward(card); };
      wrap.appendChild(div);
    });
    G._rewardCards = cards;
  }

  function pickReward(card) {
    GH.audio.card();
    G._rewardCards = null;
    if (card.kind === 'trait' || card.kind === 'protocol') {
      card.apply(player);
    } else if (card.kind === 'gem') {
      renderSocketPicker(card.gemType, false);
      return; // socketing continues this step
    } else {
      var lvl = player.weaponLevels[card.id] || 0;
      if (lvl === 0) {
        player.weapons.push(makeWeaponInst(card.id, card.weapon));
        if (GH.progress.logWeapon(card.id)) GH.meta.save();
      } else {
        for (var i = 0; i < player.weapons.length; i++) {
          if (player.weapons[i].id === card.id) {
            card.perLevel(player.weapons[i].w);
            GH.gems.applySocketBonuses(player.weapons[i]);
          }
        }
      }
      player.weaponLevels[card.id] = lvl + 1;
    }
    nextRewardStep();
  }

  function weaponDisplayName(inst) {
    if (inst.isPrimary) return inst.w.name || 'Primary';
    for (var j = 0; j < GH.upgrades.length; j++) {
      if (GH.upgrades[j].id === inst.id) return GH.upgrades[j].name;
    }
    return inst.id;
  }

  function renderSocketPicker(gemType, fromDrop) {
    var t = GH.gems.types[gemType];
    var wrap = document.getElementById('reward-cards');
    var sub = document.getElementById('reward-sub');
    sub.innerHTML = 'Socket the <span style="color:' + t.css + '">' + t.name.toUpperCase() +
      ' GEM</span> (' + t.bonusText + ') into a weapon' + (fromDrop ? ' — boss trophy' : '');
    wrap.innerHTML = '';
    var any = false;
    player.weapons.forEach(function (inst, i) {
      if (inst.sockets.length >= 4) return;
      any = true;
      var div = document.createElement('div');
      div.className = 'reward-card socket-card';
      var dots = '';
      for (var d = 0; d < 4; d++) {
        var g = inst.sockets[d];
        dots += '<span class="socket-dot" style="' +
          (g ? 'background:' + GH.gems.types[g].css + ';border-color:#fff' : '') + '"></span>';
      }
      var resPreview = '';
      if (inst.sockets.length === 3) {
        var cls = GH.gems.classify(inst.sockets.concat([gemType]));
        resPreview = '<div class="rc-res">→ ' + GH.gems.resonanceLabel(cls) + '</div>';
      } else if (inst.resonance) {
        resPreview = '<div class="rc-res">' + GH.gems.resonanceLabel(inst.resonance) + '</div>';
      }
      div.innerHTML =
        '<div class="rc-kind">' + (inst.w.cls || 'WEAPON') + '</div>' +
        '<div class="rc-glyph">' + (inst.isPrimary ? '★' : '⬦') + '</div>' +
        '<div class="rc-name">' + weaponDisplayName(inst) + '</div>' +
        '<div class="rc-sockets">' + dots + '</div>' +
        resPreview +
        '<div class="rc-key">[' + (i + 1) + ']</div>';
      div.onclick = function () { socketGem(inst, gemType); };
      wrap.appendChild(div);
    });
    if (!any) {
      var skip = document.createElement('div');
      skip.className = 'reward-card';
      skip.innerHTML = '<div class="rc-kind">ALL SOCKETS FULL</div><div class="rc-glyph">✕</div>' +
        '<div class="rc-name">Scrap the gem</div><div class="rc-desc">+15 salvage</div>';
      skip.onclick = function () { coinsRun += 15; GH.audio.coin(); nextRewardStep(); };
      wrap.appendChild(skip);
    }
    G._socketChoices = { gemType: gemType };
  }

  function socketGem(inst, gemType) {
    inst.sockets.push(gemType);
    GH.gems.applySocketBonuses(inst);
    GH.progress.logGem(gemType);
    GH.audio.levelup();
    if (inst.sockets.length === 4 && inst.resonance) {
      announce(GH.gems.resonanceLabel(inst.resonance) + ' RESONANCE', 26);
      GH.progress.logResonance(GH.gems.resonanceLabel(inst.resonance));
      awardTrial('resonance');
      seasonAwardNotify(GH.progress.seasonCounter('resonances', 1));
    }
    GH.meta.save();
    G._socketChoices = null;
    nextRewardStep();
  }

  G.pickRewardIndex = function (i) {
    if (G.state !== 'reward') return;
    if (G._rewardCards && G._rewardCards[i]) { pickReward(G._rewardCards[i]); return; }
    if (G._socketChoices) {
      var open = player.weapons.filter(function (w2) { return w2.sockets.length < 4; });
      if (open[i]) socketGem(open[i], G._socketChoices.gemType);
    }
  };

  // =================================================================
  // SPECIALS / BOOST
  // =================================================================
  function tryBoost() {
    var cost = player.stats.boostCost;
    if (player.boost < cost) return;
    player.boost -= cost;
    var mx = player.moveX, mz = player.moveZ;
    if (mx === 0 && mz === 0) { mx = Math.sin(player.facing); mz = Math.cos(player.facing); }
    var len = Math.sqrt(mx * mx + mz * mz);
    player.dashX = mx / len; player.dashZ = mz / len;
    player.dashTime = 0.22;
    player.dashId++;
    player.dashKind = 'boost';
    GH.audio.dash();
    spawnBurst(player.x, 0.6, player.z, player.trailColor || 0xa0c8ff, 6);
    if (cipherRun) cipherRun.boosts++;
    // FANG frenzy stacks / VIPER edge
    if (player.def.passive === 'frenzy') {
      player.frenzy.push(4);
      if (player.frenzy.length > 5) player.frenzy.shift();
    }
    if (player.def.passive === 'edge') player.edgeT = 2;
  }

  function trySpecial() {
    var sp = player.special;
    var kind = player.def.special;
    if (kind === 'block') return;
    if (sp.cd > 0) return;
    if (kind === 'overdrive') { sp.cd = 9; sp.active = 3; announce('OVERDRIVE', 20); }
    else if (kind === 'nova') {
      sp.cd = 7;
      var elem = currentElement(player.weapons[0]);
      var color = elem && GH.elements[elem] ? GH.elements[elem].color : 0x50e8d8;
      GH.audio.explode();
      spawnBurst(player.x, 1, player.z, color, 16);
      var m = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.9, 24),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }));
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
          damageEnemy(e, 10 * player.stats.damageMult, { canCrit: false, elem: elem });
        }
      }
    }
    else if (kind === 'frenzy') { sp.cd = 9; sp.active = 4; announce('FRENZY', 20); }
    else if (kind === 'lunge') {
      sp.cd = 3.5;
      var mx = player.moveX, mz = player.moveZ;
      if (mx === 0 && mz === 0) { mx = Math.sin(player.facing); mz = Math.cos(player.facing); }
      var len = Math.sqrt(mx * mx + mz * mz);
      player.dashX = mx / len; player.dashZ = mz / len;
      player.dashTime = 0.2;
      player.dashId++;
      player.dashKind = 'lunge';
      GH.audio.dash();
      if (player.def.passive === 'frenzy') {
        player.frenzy.push(4);
        if (player.frenzy.length > 5) player.frenzy.shift();
      }
    }
    else if (kind === 'blink') {
      sp.cd = 4;
      var mx2 = player.moveX, mz2 = player.moveZ;
      if (mx2 === 0 && mz2 === 0) { mx2 = Math.sin(player.facing); mz2 = Math.cos(player.facing); }
      var len2 = Math.sqrt(mx2 * mx2 + mz2 * mz2);
      spawnBurst(player.x, 1, player.z, 0xf05060, 8);
      player.x = GH.clamp(player.x + mx2 / len2 * 6.5, -ARENA_R, ARENA_R);
      player.z = GH.clamp(player.z + mz2 / len2 * 6.5, -ARENA_R, ARENA_R);
      player.dashTime = 0.15; // brief i-frames on arrival
      spawnBurst(player.x, 1, player.z, 0xf05060, 8);
      GH.audio.dash();
      if (player.def.passive === 'edge') player.edgeT = 2;
    }
    else if (kind === 'bulwark') {
      sp.cd = 10; sp.active = 4;
      announce('BULWARK', 20);
      GH.audio.block();
    }
  }

  // =================================================================
  // PLAYER UPDATE
  // =================================================================
  function updatePlayer(dt, input) {
    var s = player.stats;
    G._mouseNDC = input.mouseNDC;

    // aim priority: right stick / touch aim > mouse
    if (input.padAimActive) {
      player.facing = Math.atan2(input.padAimX, input.padAimY);
    } else if (input.touchAimActive) {
      player.facing = Math.atan2(input.touchAimX, input.touchAimY);
    } else {
      raycaster.setFromCamera(input.mouseNDC, camera);
      if (raycaster.ray.intersectPlane(groundPlane, tmpV3)) {
        player.facing = GH.angleTo(player.x, player.z, tmpV3.x, tmpV3.z);
      }
    }

    var mx = (input.keys.d ? 1 : 0) - (input.keys.a ? 1 : 0) + input.padMoveX + input.touchMoveX;
    var mz = (input.keys.s ? 1 : 0) - (input.keys.w ? 1 : 0) + input.padMoveY + input.touchMoveY;
    var len = Math.sqrt(mx * mx + mz * mz);
    if (len > 0.001) {
      var nlen = Math.max(1, len);
      player.moveX = mx / nlen; player.moveZ = mz / nlen;
    } else { player.moveX = 0; player.moveZ = 0; }

    player.blocking = player.def.special === 'block' && input.special;

    var spd = s.speed * (player.blocking ? 0.55 : 1);
    if (player.protocols.vents && player.hp < s.maxHP * 0.35) spd *= 1.2;

    if (player.dashTime > 0) {
      player.dashTime -= dt;
      player.x += player.dashX * 26 * dt;
      player.z += player.dashZ * 26 * dt;
      // ramming boost (AEGIS) / lunge slash (FANG)
      if (player.def.special === 'block' || player.dashKind === 'lunge') {
        for (var i = 0; i < enemies.length; i++) {
          var e = enemies[i];
          if (e.dead || e.lastDashId === player.dashId) continue;
          var rr = 1.3 + e.def.radius;
          if (GH.dist2(player.x, player.z, e.x, e.z) <= rr * rr) {
            e.lastDashId = player.dashId;
            var dmg = player.dashKind === 'lunge'
              ? (12 + s.flatDamage * 2) * s.damageMult
              : (10 + s.armor + s.block) * s.damageMult;
            damageEnemy(e, dmg, {});
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
    player.edgeT = Math.max(0, player.edgeT - dt);
    updateWard(dt, input);
    for (var f = player.frenzy.length - 1; f >= 0; f--) {
      player.frenzy[f] -= dt;
      if (player.frenzy[f] <= 0) player.frenzy.splice(f, 1);
    }

    if (s.regen > 0) player.heal(s.regen * dt);

    // pose
    player.mesh.position.set(player.x, 0, player.z);
    player.mesh.rotation.y = player.facing;
    var parts = player.mesh.userData.parts;
    var moving = player.moveX !== 0 || player.moveZ !== 0;
    var t = runTime * (moving ? 9 : 2);
    var sw = moving ? Math.sin(t) * 0.55 : 0;
    parts.legL.rotation.x = sw;
    parts.legR.rotation.x = -sw;
    parts.torso.position.y = 1.72 + Math.abs(Math.sin(t)) * (moving ? 0.06 : 0.02);
    if (parts.armR && player.def.weapon.type !== 'melee') parts.armR.rotation.x = -1.35;
    else if (parts.armR) parts.armR.rotation.x = GH.lerp(parts.armR.rotation.x, -0.2, dt * 6);
    if (parts.armL && (player.def.model.prop === 'guns' || player.def.model.prop === 'claws' ||
      player.def.model.prop === 'daggers')) parts.armL.rotation.x = -1.35;
    if (player.blocking && parts.armL) parts.armL.rotation.x = -1.5;
    if (player.def.weapon.type === 'aura' && parts.weapon) parts.weapon.rotation.y += dt * 10;
    if (parts.gem) parts.gem.rotation.y += dt * 3;
    // thruster flames while dashing/moving fast
    if (parts.flames) {
      var thrust = player.dashTime > 0;
      parts.flames.forEach(function (fl) {
        fl.visible = thrust || (moving && Math.floor(runTime * 20) % 3 !== 0);
        fl.scale.y = thrust ? 1.6 : 0.8;
      });
    }
    player.mesh.visible = !(player.hurtCd > 0 && Math.floor(runTime * 24) % 2 === 0);
  }

  // =================================================================
  // WARD STANCES — typed defensive shells. The right ward cuts its
  // damage type by 75% and feeds COUNTER damage stacks; the wrong ward
  // does nothing. Running a ward drains energy; empty = collapse.
  // =================================================================
  var WARDS = {
    kinetic: { name: 'KINETIC', color: 0xf0a030, desc: 'contact & rams' },
    ballistic: { name: 'BALLISTIC', color: 0x50c8f0, desc: 'enemy projectiles' },
    arc: { name: 'ARC', color: 0xb060f0, desc: 'blasts, beams & burning ground' }
  };
  var WARD_ORDER = ['kinetic', 'ballistic', 'arc'];
  var wardDome = null;

  function setWard(kind) {
    if (!player || player.wardCd > 0) return;
    if (player.ward === kind || kind === null) {
      player.ward = null;
    } else {
      player.ward = kind;
      GH.audio.block();
    }
    updateWardDome();
  }

  function cycleWard() {
    if (!player || player.wardCd > 0) return;
    var i = player.ward ? WARD_ORDER.indexOf(player.ward) : -1;
    player.ward = i >= WARD_ORDER.length - 1 ? null : WARD_ORDER[i + 1];
    if (player.ward) GH.audio.block();
    updateWardDome();
  }

  function updateWardDome() {
    if (!wardDome) {
      wardDome = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.55, 1),
        new THREE.MeshBasicMaterial({
          color: 0xffffff, transparent: true, opacity: 0.16,
          wireframe: true, depthWrite: false
        })
      );
      wardDome.position.y = 1.3;
    }
    if (player && player.ward) {
      wardDome.material.color.setHex(WARDS[player.ward].color);
      if (wardDome.parent !== player.mesh) player.mesh.add(wardDome);
      wardDome.visible = true;
    } else if (wardDome.parent) {
      wardDome.visible = false;
    }
  }

  function updateWard(dt, input) {
    if (input.wardPressed) {
      setWard(input.wardPressed === 1 ? 'kinetic' : input.wardPressed === 2 ? 'ballistic' : 'arc');
      input.wardPressed = 0;
    }
    if (input.wardCycle) {
      cycleWard();
      input.wardCycle = false;
    }
    player.wardCd = Math.max(0, player.wardCd - dt);
    if (player.ward) {
      player.wardEnergy -= dt * 0.2;
      if (player.wardEnergy <= 0) {
        player.wardEnergy = 0;
        player.ward = null;
        player.wardCd = 2;
        announce('WARD COLLAPSE', 20);
        GH.audio.hit();
        updateWardDome();
      }
    } else {
      player.wardEnergy = Math.min(1, player.wardEnergy + dt * 0.16);
    }
    for (var i = player.counter.length - 1; i >= 0; i--) {
      player.counter[i] -= dt;
      if (player.counter[i] <= 0) player.counter.splice(i, 1);
    }
    if (wardDome && wardDome.visible) {
      wardDome.material.opacity = 0.12 + Math.sin(runTime * 5) * 0.05;
      wardDome.rotation.y += dt * 0.8;
    }
  }

  // =================================================================
  // COSMETICS — repaint accents / recolor thruster flames on a mech
  // =================================================================
  function repaintMech(mesh, color) {
    var parts = mesh.userData.parts;
    if (!parts) return;
    // repaint the accent material instances on this mech only
    var accentHex = null;
    if (parts.visor && parts.visor.material) accentHex = parts.visor.material.color.getHex();
    if (accentHex === null) return;
    var repainted = GH.assets.lambert({ color: color, flatShading: true });
    mesh.traverse(function (m) {
      if (m.isMesh && m.material && m.material.color &&
        m.material.color.getHex() === accentHex && !m.material.map) {
        m.material = repainted;
      }
    });
  }

  function setFlameColor(mesh, color) {
    var parts = mesh.userData.parts;
    if (parts && parts.flames) {
      parts.flames.forEach(function (fl) {
        fl.material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.85 });
      });
    }
  }

  // =================================================================
  // SIGNAL CIPHERS — mid-run field riddles ending in a loot cache
  // =================================================================
  function startCipher() {
    if (cipherRun) return;
    cipherRun = { steps: GH.progress.makeCipher(), idx: 0, t: 0, prog: 0, marker: null, killsAt: kills, boosts: 0 };
    announce('SIGNAL CIPHER INTERCEPTED', 26);
    beginCipherStep();
  }

  function beginCipherStep() {
    var step = cipherRun.steps[cipherRun.idx];
    cipherRun.t = 0;
    cipherRun.prog = 0;
    cipherRun.killsAt = kills;
    cipherRun.boosts = 0;
    if (cipherRun.marker) { scene.remove(cipherRun.marker); cipherRun.marker = null; }
    if (step.id === 'stand') {
      var a = Math.random() * Math.PI * 2;
      var r = GH.rand(7, 13);
      var mx = GH.clamp(player.x + Math.cos(a) * r, -ARENA_R + 3, ARENA_R - 3);
      var mz = GH.clamp(player.z + Math.sin(a) * r, -ARENA_R + 3, ARENA_R - 3);
      cipherRun.marker = groundDisc(mx, mz, 2.0, 0x60e8ff, 0.3);
      cipherRun.mx = mx; cipherRun.mz = mz;
    }
  }

  function cipherStepDone() {
    GH.audio.levelup();
    cipherRun.idx++;
    if (cipherRun.idx >= cipherRun.steps.length) {
      if (cipherRun.marker) scene.remove(cipherRun.marker);
      cipherRun = null;
      queueAnnounce('CIPHER SOLVED — CACHE INBOUND', 26);
      spawnPickup('cache', player.x + GH.rand(-1, 1), player.z + GH.rand(-1, 1));
    } else {
      queueAnnounce('CIPHER ' + (cipherRun.idx + 1) + '/' + cipherRun.steps.length, 20);
      beginCipherStep();
    }
  }

  function updateCipher(dt) {
    if (!cipherRun) return;
    var step = cipherRun.steps[cipherRun.idx];
    cipherRun.t += dt;
    if (step.id === 'stand') {
      cipherRun.marker.material.opacity = 0.25 + Math.sin(runTime * 6) * 0.1;
      if (GH.dist2(player.x, player.z, cipherRun.mx, cipherRun.mz) < 4) {
        cipherRun.prog += dt;
        if (cipherRun.prog >= 2.5) cipherStepDone();
      } else {
        cipherRun.prog = Math.max(0, cipherRun.prog - dt * 0.5);
      }
    } else if (step.id === 'burst') {
      if (kills - cipherRun.killsAt >= 5) cipherStepDone();
      else if (cipherRun.t > 8) { cipherRun.t = 0; cipherRun.killsAt = kills; } // retry window
    } else if (step.id === 'sprint') {
      if (cipherRun.boosts >= 3) cipherStepDone();
      else if (cipherRun.t > 10) { cipherRun.t = 0; cipherRun.boosts = 0; }
    } else if (step.id === 'hold') {
      if (cipherRun.t >= 10) cipherStepDone();
    }
  }

  function cipherHudText() {
    if (!cipherRun) return '';
    var step = cipherRun.steps[cipherRun.idx];
    var extra = '';
    if (step.id === 'stand') extra = ' (' + GH.fmt1(Math.max(0, 2.5 - cipherRun.prog)) + 's)';
    else if (step.id === 'burst') extra = ' (' + (kills - cipherRun.killsAt) + '/5, ' + GH.fmt1(Math.max(0, 8 - cipherRun.t)) + 's)';
    else if (step.id === 'sprint') extra = ' (' + cipherRun.boosts + '/3)';
    else if (step.id === 'hold') extra = ' (' + GH.fmt1(Math.max(0, 10 - cipherRun.t)) + 's)';
    return 'CIPHER: ' + step.desc + extra;
  }

  // =================================================================
  // CO-OP WINGMATE (player 2 — mirror frame, IJKL or gamepad)
  // =================================================================
  function spawnWingmate(mechIndex) {
    var def = GH.mechs[mechIndex];
    var cfg = {};
    for (var k in def.model) cfg[k] = def.model[k];
    cfg.accent = 0x60c8ff; // P2 tell: cool-blue accents
    mate = {
      def: def,
      mesh: GH.models.buildMech(cfg),
      x: 2.2, z: 1.5, facing: 0, moveX: 0, moveZ: 0,
      hp: 0, boost: 1, dashTime: 0, dashX: 0, dashZ: 0, dashKind: 'boost', dashId: 0,
      down: false, reviveT: 0, hurtCd: 0,
      blocking: false,
      special: { cd: 0, active: 0 },
      frenzy: [], edgeT: 0,
      weapons: [makeWeaponInst('primary', def.weapon, false)]
    };
    mate.hp = player.stats.maxHP;
    mate.mesh.position.set(mate.x, 0, mate.z);
    scene.add(mate.mesh);
  }

  function wingmateDamage(raw) {
    if (!mate || mate.down || mate.dashTime > 0.12 || GH.devGod) return;
    var dmg = Math.max(1, Math.round(raw - player.stats.armor -
      (mate.special.active > 0 && mate.def.special === 'bulwark' ? 12 : 0)));
    if (mate.blocking) {
      dmg = Math.max(1, Math.round(dmg * 0.3));
      mate.hp = Math.min(player.stats.maxHP, mate.hp + 3);
      GH.audio.block();
    }
    mate.hp -= dmg;
    mate.hurtCd = 0.25;
    G.dmg.spawn(mate.x, 2.6, mate.z, dmg, 'player', 17);
    GH.audio.hurt();
    if (mate.hp <= 0) {
      mate.hp = 0;
      mate.down = true;
      mate.reviveT = 0;
      spawnBurst(mate.x, 1, mate.z, 0x60c8ff, 18);
      announce('WINGMATE DOWN', 26);
    }
  }

  function mateSpecial() {
    var sp = mate.special;
    var kind = mate.def.special;
    if (kind === 'block') return; // handled as a hold
    if (sp.cd > 0) return;
    if (kind === 'overdrive') { sp.cd = 9; sp.active = 3; announce('P2 OVERDRIVE', 18); }
    else if (kind === 'frenzy') { sp.cd = 9; sp.active = 4; announce('P2 FRENZY', 18); }
    else if (kind === 'bulwark') { sp.cd = 10; sp.active = 4; announce('P2 BULWARK', 18); GH.audio.block(); }
    else if (kind === 'nova') {
      sp.cd = 7;
      var elem = currentElement(mate.weapons[0]);
      var color = elem && GH.elements[elem] ? GH.elements[elem].color : 0x50e8d8;
      GH.audio.explode();
      spawnBurst(mate.x, 1, mate.z, color, 16);
      var m = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.9, 24),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.7, depthWrite: false, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2;
      m.position.set(mate.x, 0.3, mate.z);
      scene.add(m);
      effects.push({ kind: 'boom', mesh: m, t: 0.3, total: 0.3, grow: 6 });
      for (var i = 0; i < enemies.length; i++) {
        var e = enemies[i];
        if (e.dead) continue;
        if (GH.dist2(mate.x, mate.z, e.x, e.z) < 49) {
          var a = GH.angleTo(mate.x, mate.z, e.x, e.z);
          e.vx += Math.sin(a) * 16 / e.def.mass;
          e.vz += Math.cos(a) * 16 / e.def.mass;
          damageEnemy(e, 10 * player.stats.damageMult, { canCrit: false, elem: elem });
        }
      }
    }
    else if (kind === 'lunge' || kind === 'blink') {
      sp.cd = kind === 'lunge' ? 3.5 : 4;
      var mx = mate.moveX, mz = mate.moveZ;
      if (mx === 0 && mz === 0) { mx = Math.sin(mate.facing); mz = Math.cos(mate.facing); }
      var len = Math.sqrt(mx * mx + mz * mz);
      if (kind === 'blink') {
        spawnBurst(mate.x, 1, mate.z, 0xf05060, 8);
        mate.x = GH.clamp(mate.x + mx / len * 6.5, -ARENA_R, ARENA_R);
        mate.z = GH.clamp(mate.z + mz / len * 6.5, -ARENA_R, ARENA_R);
        mate.dashTime = 0.15;
        spawnBurst(mate.x, 1, mate.z, 0xf05060, 8);
        if (mate.def.passive === 'edge') mate.edgeT = 2;
      } else {
        mate.dashX = mx / len; mate.dashZ = mz / len;
        mate.dashTime = 0.2;
        mate.dashId++;
        mate.dashKind = 'lunge';
        if (mate.def.passive === 'frenzy') {
          mate.frenzy.push(4);
          if (mate.frenzy.length > 5) mate.frenzy.shift();
        }
      }
      GH.audio.dash();
    }
  }

  function reviveWingmate(frac) {
    mate.down = false;
    mate.hp = Math.max(1, Math.round(player.stats.maxHP * frac));
    spawnBurst(mate.x, 1, mate.z, 0x80ffb0, 12);
    announce('WINGMATE UP', 20);
    GH.audio.levelup();
  }

  function updateWingmate(dt, input) {
    if (!mate) return;
    var s = player.stats;

    if (mate.down) {
      mate.mesh.rotation.z = GH.lerp(mate.mesh.rotation.z, 1.35, dt * 4);
      // P1 revives by standing close
      if (GH.dist2(player.x, player.z, mate.x, mate.z) < 6.25) {
        mate.reviveT += dt;
        if (mate.reviveT >= 2.5) reviveWingmate(0.4);
      } else {
        mate.reviveT = Math.max(0, mate.reviveT - dt);
      }
      return;
    }
    mate.mesh.rotation.z = 0;

    // movement (IJKL or gamepad stick)
    var mx = input.p2x || 0, mz = input.p2y || 0;
    var len = Math.sqrt(mx * mx + mz * mz);
    if (len > 1) { mx /= len; mz /= len; }
    mate.moveX = mx; mate.moveZ = mz;

    if (mate.dashTime > 0) {
      mate.dashTime -= dt;
      mate.x += mate.dashX * 26 * dt;
      mate.z += mate.dashZ * 26 * dt;
    } else {
      var mspd = s.speed * (mate.blocking ? 0.55 : 1);
      mate.x += mx * mspd * dt;
      mate.z += mz * mspd * dt;
    }
    mate.x = GH.clamp(mate.x, -ARENA_R, ARENA_R);
    mate.z = GH.clamp(mate.z, -ARENA_R, ARENA_R);

    // shared-screen tether: P2 can't wander further than the camera can show
    var sepX = mate.x - player.x, sepZ = mate.z - player.z;
    var sep = Math.sqrt(sepX * sepX + sepZ * sepZ);
    var MAX_SEP = 19;
    if (sep > MAX_SEP) {
      mate.x = player.x + (sepX / sep) * MAX_SEP;
      mate.z = player.z + (sepZ / sep) * MAX_SEP;
    }

    mate.boost = Math.min(1, mate.boost + s.boostRegen * dt);
    if (input.p2Boost) {
      input.p2Boost = false;
      if (mate.boost >= s.boostCost) {
        mate.boost -= s.boostCost;
        var bx = mx, bz = mz;
        if (bx === 0 && bz === 0) { bx = Math.sin(mate.facing); bz = Math.cos(mate.facing); }
        var bl = Math.sqrt(bx * bx + bz * bz);
        mate.dashX = bx / bl; mate.dashZ = bz / bl;
        mate.dashTime = 0.22;
        mate.dashId++;
        mate.dashKind = 'boost';
        GH.audio.dash();
        spawnBurst(mate.x, 0.6, mate.z, 0x60c8ff, 6);
        if (mate.def.passive === 'frenzy') {
          mate.frenzy.push(4);
          if (mate.frenzy.length > 5) mate.frenzy.shift();
        }
        if (mate.def.passive === 'edge') mate.edgeT = 2;
      }
    }
    // special (press for actives, hold for AEGIS block)
    mate.blocking = mate.def.special === 'block' && input.p2Special;
    if (input.p2SpecialPressed) {
      input.p2SpecialPressed = false;
      mateSpecial();
    }
    mate.special.cd = Math.max(0, mate.special.cd - dt);
    mate.special.active = Math.max(0, mate.special.active - dt);
    mate.edgeT = Math.max(0, mate.edgeT - dt);
    for (var fz = mate.frenzy.length - 1; fz >= 0; fz--) {
      mate.frenzy[fz] -= dt;
      if (mate.frenzy[fz] <= 0) mate.frenzy.splice(fz, 1);
    }
    mate.hurtCd = Math.max(0, mate.hurtCd - dt);

    // ram/lunge damage during dash (AEGIS boost-ram and FANG lunge parity)
    if (mate.dashTime > 0 && (mate.def.special === 'block' || mate.dashKind === 'lunge')) {
      for (var di = 0; di < enemies.length; di++) {
        var de = enemies[di];
        if (de.dead || de.lastDashId === 1000 + mate.dashId) continue;
        var drr = 1.3 + de.def.radius;
        if (GH.dist2(mate.x, mate.z, de.x, de.z) <= drr * drr) {
          de.lastDashId = 1000 + mate.dashId;
          var ddmg = mate.dashKind === 'lunge'
            ? (12 + s.flatDamage * 2) * s.damageMult
            : (10 + s.armor + s.block) * s.damageMult;
          damageEnemy(de, ddmg, {});
          var da = GH.angleTo(mate.x, mate.z, de.x, de.z);
          de.vx += Math.sin(da) * 14 / de.def.mass;
          de.vz += Math.cos(da) * 14 / de.def.mass;
        }
      }
    }

    // auto-aim at the nearest enemy
    var tgt = nearestEnemy(mate.x, mate.z, 26);
    if (tgt) mate.facing = GH.angleTo(mate.x, mate.z, tgt.x, tgt.z);

    // fire primary (shares P1's stat pool; own clip/reload and passives)
    var inst = mate.weapons[0];
    var w = inst.w;
    var spdMult = s.atkSpdMult * inst.mods.atkSpdMult * frenzyMult(mate) *
      (mate.special.active > 0 && mate.def.special === 'overdrive' ? 2 : 1);
    if (inst.reloading > 0) {
      inst.reloading -= dt * spdMult;
      if (inst.reloading <= 0) { inst.clip = w.clip; onReload(inst); }
    } else if (tgt) {
      inst.timer -= dt * spdMult;
      if (inst.timer <= 0) {
        inst.timer = w.interval;
        var aim = mate.facing;
        if (w.type === 'shot') {
          fireShot(inst, mate.x + Math.sin(aim) * 0.8, mate.z + Math.cos(aim) * 0.8, aim, mate);
        } else if (w.type === 'melee') {
          meleeSwing(inst, aim, mate);
        } else if (w.type === 'aura') {
          auraTick(inst, mate);
        } else if (w.type === 'mortar') {
          fireMortar(inst, aim, mate);
        }
        if (w.clip) {
          inst.clip--;
          if (inst.clip <= 0) inst.reloading = w.reload;
        }
      }
    }

    // pose
    mate.mesh.position.set(mate.x, 0, mate.z);
    mate.mesh.rotation.y = mate.facing;
    var parts = mate.mesh.userData.parts;
    var moving = mx !== 0 || mz !== 0;
    var t = runTime * (moving ? 9 : 2);
    var sw = moving ? Math.sin(t) * 0.55 : 0;
    parts.legL.rotation.x = sw;
    parts.legR.rotation.x = -sw;
    if (parts.armR && mate.def.weapon.type !== 'melee') parts.armR.rotation.x = -1.35;
    if (parts.flames) {
      parts.flames.forEach(function (fl) { fl.visible = mate.dashTime > 0; });
    }
    if (mate.def.weapon.type === 'aura' && parts.weapon) parts.weapon.rotation.y += dt * 10;
    mate.mesh.visible = !(mate.hurtCd > 0 && Math.floor(runTime * 24) % 2 === 0);
  }

  // =================================================================
  // CAMERA
  // =================================================================
  var camZoom = 1;
  function updateCamera(dt) {
    var tx = player ? player.x : 0;
    var tz = player ? player.z : 0;
    var zoomTarget = 1;
    if (mate && !mate.down) {
      tx = (tx + mate.x) / 2;
      tz = (tz + mate.z) / 2;
      // pull back as the pilots spread out
      var sep = Math.sqrt(GH.dist2(player.x, player.z, mate.x, mate.z));
      zoomTarget = 1 + GH.clamp((sep - 6) / 14, 0, 0.65);
    }
    camZoom = GH.lerp(camZoom, zoomTarget, dt * 3);
    var sx = (Math.random() - 0.5) * shake;
    var sz = (Math.random() - 0.5) * shake;
    shake = Math.max(0, shake - dt * 1.4);
    camera.position.set(tx + sx, 13.5 * camZoom, tz + 11.5 * camZoom + sz);
    camera.lookAt(tx + sx, 0, tz + 2.0 + sz);
  }

  // =================================================================
  // HUD
  // =================================================================
  var el = {};
  function cacheEls() {
    ['hp-fill', 'hp-text', 'xp-fill', 'lvl-text', 'wave-label', 'wave-timer',
      'coin-count', 'boost-fill', 'stat-icons', 'boss-bar-wrap', 'boss-name',
      'boss-fill', 'announce', 'buff-line', 'reload-line'].forEach(function (id) {
        el[id] = document.getElementById(id);
      });
  }

  function updateHUDStatic() {
    el['wave-label'].textContent = G.mode === 'arena'
      ? 'Wave ' + waveNum : 'Wave ' + waveNum + '/20';
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
    // buff line: element / frenzy / wrath / special state
    // ward row: three stances + energy
    var wardEl = document.getElementById('ward-row');
    var wh = '';
    WARD_ORDER.forEach(function (w, i) {
      var on = player.ward === w;
      wh += '<span class="ward-chip' + (on ? ' on' : '') + '" style="' +
        (on ? 'border-color:#' + WARDS[w].color.toString(16) + ';color:#fff' : '') + '">' +
        (i + 1) + ' ' + WARDS[w].name + '</span>';
    });
    wh += '<span class="ward-energy"><span class="ward-energy-fill" style="width:' +
      Math.round(player.wardEnergy * 100) + '%"></span></span>';
    if (player.counter.length) wh += '<span class="ward-counter">COUNTER ×' + player.counter.length + '</span>';
    if (player.wardCd > 0) wh += '<span class="ward-counter" style="color:#ff8080">COLLAPSED</span>';
    wardEl.innerHTML = wh;

    var buffs = [];
    var prim = player.weapons[0];
    if (prim.w.cycle) {
      var elx = currentElement(prim);
      buffs.push('<span style="color:' + GH.elements[elx].css + '">' + GH.elements[elx].name.toUpperCase() + '</span>');
    }
    if (player.frenzy.length) buffs.push('FRENZY ×' + player.frenzy.length);
    if (player.def.passive === 'wrath') {
      var wr = Math.round(Math.min(0.6, (1 - player.hp / s.maxHP) * 0.75) * 100);
      if (wr > 0) buffs.push('WRATH +' + wr + '%');
    }
    if (player.edgeT > 0) buffs.push('EDGE');
    if (player.special.active > 0) buffs.push(player.def.special.toUpperCase());
    el['buff-line'].innerHTML = buffs.join(' · ');
    el['reload-line'].textContent = prim.reloading > 0 ? 'RELOADING' :
      (prim.w.clip ? prim.clip + '/' + prim.w.clip : '');
    var p2wrap = document.getElementById('p2-row');
    if (mate) {
      p2wrap.classList.remove('hidden');
      document.getElementById('p2-fill').style.width =
        GH.clamp(mate.hp / s.maxHP * 100, 0, 100) + '%';
      document.getElementById('p2-text').textContent =
        mate.down ? 'DOWN — stand close to revive' : 'P2 ' + Math.ceil(mate.hp);
    } else {
      p2wrap.classList.add('hidden');
    }
    if (announceTimer > 0) {
      announceTimer -= 1 / 60;
      if (announceTimer <= 0) el['announce'].classList.add('hidden');
    }
    pumpAnnounceQueue();
    // active contract progress
    var contractEl = document.getElementById('contract-line');
    if (cipherRun) {
      contractEl.textContent = cipherHudText();
    } else {
      var ac = GH.meta.data.broker.active;
      if (ac && (!ac.stage || ac.stage === stage.id)) {
        contractEl.textContent = 'CONTRACT: ' + GH.enemyDefs[ac.target].name +
          ' ' + ac.have + '/' + ac.need;
      } else if (ac) {
        contractEl.textContent = 'CONTRACT: ' + GH.progress.stageName(ac.stage) + ' only';
      } else {
        contractEl.textContent = '';
      }
    }
  }

  function announce(text, size) {
    el['announce'].textContent = text;
    el['announce'].style.fontSize = (size || 40) + 'px';
    el['announce'].classList.remove('hidden');
    el['announce'].style.animation = 'none';
    void el['announce'].offsetWidth;
    el['announce'].style.animation = '';
    announceTimer = 1.4;
  }

  // queued announcements wait for the current one to fade
  function queueAnnounce(text, size) {
    announceQueue.push([text, size]);
  }
  function pumpAnnounceQueue() {
    if (announceTimer <= 0 && announceQueue.length) {
      var a = announceQueue.shift();
      announce(a[0], a[1]);
    }
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
    [enemies, projectiles, enemyShots, pickups, mines].forEach(function (list) {
      for (var i = 0; i < list.length; i++) scene.remove(list[i].mesh);
      list.length = 0;
    });
    for (var i = 0; i < effects.length; i++) {
      scene.remove(effects[i].mesh);
      if (effects[i].disc) scene.remove(effects[i].disc);
    }
    effects.length = 0;
    while (orbitGroup.children.length) orbitGroup.remove(orbitGroup.children[0]);
    if (droneMesh) { scene.remove(droneMesh); droneMesh = null; }
    if (picoDrone) { scene.remove(picoDrone); picoDrone = null; }
    if (cipherRun) {
      if (cipherRun.marker) scene.remove(cipherRun.marker);
      cipherRun = null;
    }
    if (player) {
      if (wardDome && wardDome.parent === player.mesh) player.mesh.remove(wardDome);
      scene.remove(player.mesh);
      player = null;
    }
    if (mate) { scene.remove(mate.mesh); mate = null; }
    if (selPreview) { scene.remove(selPreview); selPreview = null; }
    bossRef = null;
    hideBossBar();
  }

  G.startRun = function (mechIndex, stageIdx, startAt, opts) {
    clearWorld();
    opts = opts || {};
    weekly = opts.weekly || null;
    stageIndex = GH.clamp(stageIdx || 0, 0, GH.stages.length - 1);
    stage = GH.stages[stageIndex];
    applyStageLook(stage);
    player = makePlayer(GH.mechs[mechIndex]);

    // pilot mastery bonuses for this frame
    var mb = GH.progress.masteryBonus(player.def.id);
    player.stats.damageMult += mb.damageMult;
    player.stats.maxHP += mb.maxHP;
    player.hp = player.stats.maxHP;
    player.stats.boostRegen += mb.boostRegen;
    player.fourthCard = mb.fourthCard;

    // chase cosmetics: paint, trail, pico-drone
    var style = GH.meta.data.style;
    if (style.paint) {
      var pc = GH.progress.cosmeticById(style.paint);
      if (pc) repaintMech(player.mesh, pc.color);
    }
    if (style.trail) {
      var tc = GH.progress.cosmeticById(style.trail);
      if (tc) {
        player.trailColor = tc.color;
        setFlameColor(player.mesh, tc.color);
      }
    }
    if (picoDrone) { scene.remove(picoDrone); picoDrone = null; }
    if (style.drone) {
      var dc = GH.progress.cosmeticById(style.drone);
      if (dc) {
        picoDrone = GH.models.buildPico(dc.shape);
        scene.add(picoDrone);
      }
    }

    // season relics warp every non-weekly run
    var relicOn = function (id) {
      return G.mode !== 'weekly' && GH.progress.hasRelic(id);
    };
    var st2 = player.stats;
    if (relicOn('vamp')) { st2.lifesteal += 8; st2.maxHP = Math.round(st2.maxHP * 0.85); }
    if (relicOn('overclock')) { st2.atkSpdMult += 0.2; st2.armor -= 2; }
    if (relicOn('gravity')) { st2.magnet *= 2; }
    if (relicOn('juggernaut')) { st2.armor += 4; st2.speed *= 0.9; }
    if (relicOn('glass')) { st2.damageMult += 0.3; st2.maxHP = Math.round(st2.maxHP * 0.75); }
    if (relicOn('phase')) { st2.boostCost = 0; st2.boostRegen *= 0.65; }
    if (relicOn('salvager')) { st2.xpGain = Math.max(0.5, st2.xpGain - 0.1); }
    if (relicOn('twin')) { st2.bonusProj += 1; st2.damageMult -= 0.15; }
    player.hp = Math.min(player.hp, st2.maxHP);
    cipherRun = null;
    if (weekly && weekly.mods.php !== 1) {
      player.stats.maxHP = Math.round(player.stats.maxHP * weekly.mods.php);
      player.hp = player.stats.maxHP;
    }
    if (weekly && weekly.mods.crit) player.stats.crit += weekly.mods.crit;
    mate = null;
    if (G.coop) {
      var p2Idx = (opts.p2Mech !== undefined && opts.p2Mech >= 0) ? opts.p2Mech : mechIndex;
      spawnWingmate(p2Idx);
    }
    if (opts.preset && !GH.meta.isIron()) applyPreset(opts.preset);
    // stage-trial perks (permanent, stage-scoped)
    var trialTier = GH.progress.trialTier(stage.id);
    if (trialTier >= 2) player.stats.xpGain += 0.10;
    if (trialTier >= 3) player.stats.damageMult += 0.05;
    kills = 0; coinsRun = 0; runTime = 0; hitCount = 0; sparksRun = 0;
    announceQueue.length = 0;
    G.state = 'play';
    GH.music.play(stage.id);
    GH.music.setBoss(false);
    startAt = GH.clamp(startAt || 1, 1, 20);
    if (startAt > 1) devCatchUp(startAt);
    startWave(startAt);
    updateHUDStatic();
    document.getElementById('hud').classList.remove('hidden');
  };

  // Arena loadout preset: grant starting weapons/traits/gems by card id
  function applyPreset(ps) {
    var findCard = function (id) {
      for (var i = 0; i < GH.upgrades.length; i++) {
        if (GH.upgrades[i].id === id) return GH.upgrades[i];
      }
      return null;
    };
    (ps.weapons || []).forEach(function (wid) {
      var card = findCard(wid);
      if (card && !player.weaponLevels[wid]) {
        player.weapons.push(makeWeaponInst(wid, card.weapon));
        player.weaponLevels[wid] = 1;
      }
    });
    (ps.traits || []).forEach(function (tid) {
      var card = findCard(tid);
      if (card) card.apply(player);
    });
    (ps.gems || []).forEach(function (g) {
      var prim = player.weapons[0];
      if (prim.sockets.length < 4) {
        prim.sockets.push(g);
        GH.gems.applySocketBonuses(prim);
      }
    });
  }

  function devCatchUp(startAt) {
    // dev skip (?wave=N): rough catch-up levels + auto-picked cards
    wavePlan = GH.wavePlan(stage, 1, false);
    for (var i = 1; i < startAt; i++) {
      gainXP(6 + player.level * 3);
      var cards = GH.rollRewards(player, i);
      var c = cards[0];
      if (c.kind === 'trait' || c.kind === 'protocol') c.apply(player);
      else if (c.kind === 'gem') {
        for (var wi = 0; wi < player.weapons.length; wi++) {
          if (player.weapons[wi].sockets.length < 4) {
            player.weapons[wi].sockets.push(c.gemType);
            GH.gems.applySocketBonuses(player.weapons[wi]);
            break;
          }
        }
      } else {
        var lvl0 = player.weaponLevels[c.id] || 0;
        if (lvl0 === 0) player.weapons.push(makeWeaponInst(c.id, c.weapon));
        else {
          for (var j = 0; j < player.weapons.length; j++) {
            if (player.weapons[j].id === c.id) c.perLevel(player.weapons[j].w);
          }
        }
        player.weaponLevels[c.id] = lvl0 + 1;
      }
    }
  }

  function gameOver(won) {
    G.state = won ? 'win' : 'over';
    if (won) GH.audio.win(); else GH.audio.die();
    if (!won) spawnBurst(player.x, 1.2, player.z, 0xff6030, 30);
    GH.music.play('title');
    GH.music.setBoss(false);

    var meta = GH.meta;
    var banked = weekly ? Math.round(coinsRun * weekly.mods.salvage) : coinsRun;
    if (GH.progress.trialTier(stage.id) >= 1) banked = Math.round(banked * 1.15);
    if (G.mode !== 'weekly' && GH.progress.hasRelic('salvager')) banked = Math.round(banked * 1.4);
    var unlockMsg = '';

    // IRON CORE: a death erases the profile and engraves the pilot
    if (!won && meta.isHardcore()) {
      var mem = meta.hardcoreWipe(player.def.name, stage.name, waveNum);
      document.getElementById('end-title').innerHTML = 'CORE&nbsp;EXTINGUISHED';
      document.getElementById('end-stats').innerHTML =
        '<b>IRON CORE — progression erased.</b>\n' +
        mem.frame + ' fell on ' + mem.stage + ', wave ' + mem.wave + '.\n' +
        'The pilot is engraved on the memorial.';
      document.getElementById('hud').classList.add('hidden');
      document.getElementById('end-screen').classList.remove('hidden');
      return;
    }

    meta.data.salvage += banked;
    meta.data.collection.totalRuns++;
    if (won) meta.data.collection.totalWins++;
    if (won && G.mode === 'classic') awardTrial('clear');

    // pilot mastery XP: kills + depth, with a victory bonus
    var mXP = kills + waveNum * 5 + (won ? 120 : 0);
    var mUps = GH.progress.masteryGain(player.def.id, mXP);
    var mLvl = GH.progress.masteryLevel(player.def.id);
    var masteryMsg = 'Mastery <b>+' + mXP + ' XP</b>' +
      (mUps > 0 ? ' → <b>' + player.def.name + ' Lv ' + mLvl + '</b>' : ' (Lv ' + mLvl + ')') + '\n';

    // season task evaluation from this run
    var s6 = GH.progress.seasonCheck();
    if (waveNum >= 10) seasonTaskNotify('w10');
    if (waveNum >= 15) seasonTaskNotify('w15');
    if (G.mode === 'arena' && waveNum >= 25) seasonTaskNotify('arena25');
    if (won && G.mode === 'classic') {
      seasonTaskNotify('clear1');
      s6.stagesCleared[stage.id] = true;
      if (Object.keys(s6.stagesCleared).length >= 3) seasonTaskNotify('clear3');
      s6.framesWon[player.def.id] = true;
      if (Object.keys(s6.framesWon).length >= 3) seasonTaskNotify('frames3');
      if (mate) seasonTaskNotify('coopwin');
    }
    if (G.mode === 'weekly') {
      var wk = meta.data.weekly || {};
      if (wk.week !== weekly.week || waveNum > (wk.best || 0)) {
        if (wk.week !== weekly.week) wk = { week: weekly.week, best: 0 };
        if (waveNum > wk.best) wk.best = waveNum;
        meta.data.weekly = wk;
      }
      unlockMsg = 'WEEKLY ' + weekly.week + ' — best wave ' + meta.data.weekly.best + '\n';
    } else if (G.mode === 'classic') {
      var best = meta.data.bestWave[stage.id] || 0;
      if (waveNum > best) meta.data.bestWave[stage.id] = waveNum;
      if (won) {
        meta.data.victories[stage.id] = true;
        var shellId = stage.unlocks;
        if (meta.unlockShell(shellId)) {
          unlockMsg = '<b>' + GH.mechById(shellId).name + ' FRAME RECOVERED</b> — new shell unlocked!\n';
        }
        meta.unlockStage(stageIndex + 2);
      }
    } else {
      if (waveNum > meta.data.bestArena) meta.data.bestArena = waveNum;
    }
    meta.save();

    document.getElementById('end-title').innerHTML = won ? 'ARENA&nbsp;CLEARED' : 'FRAME&nbsp;DESTROYED';
    document.getElementById('end-stats').innerHTML = unlockMsg + masteryMsg +
      stage.name + (G.mode === 'arena' ? ' · ARENA' : (G.mode === 'weekly' ? ' · WEEKLY' : '')) +
      ' — reached <b>Wave ' + waveNum + '</b> as <b>' + player.def.name + '</b>' +
      (mate ? ' <i>(co-op)</i>' : '') + '\n' +
      'Level <b>' + player.level + '</b> · Kills <b>' + kills + '</b> · Salvage <b>+' + banked + '</b>\n' +
      'Time <b>' + Math.floor(runTime / 60) + ':' + ('0' + Math.floor(runTime % 60)).slice(-2) + '</b>';
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
  }

  G.pauseInfo = function () {
    if (!player) return '';
    var txt = player.def.name + ' · ' + stage.name + ' · Wave ' + waveNum + ' · LVL ' + player.level + '\n\nWeapons:';
    player.weapons.forEach(function (inst) {
      var res = inst.resonance ? '  [' + GH.gems.resonanceLabel(inst.resonance) + ']' : '';
      var gems = inst.sockets.length ? ' ◆' + inst.sockets.length : '';
      txt += '\n· ' + weaponDisplayName(inst) +
        (player.weaponLevels[inst.id] > 1 ? ' LVL ' + player.weaponLevels[inst.id] : '') + gems + res;
    });
    return txt;
  };

  // =================================================================
  // SELECT SCREEN
  // =================================================================
  G.enterSelect = function () {
    clearWorld();
    G.state = 'select';
    GH.music.play('title');
    scene.background = GH.assets.selectSky;
    scene.fog.color.setHex(0x060a2a);
    floor.material.map = GH.assets.gridTex;
    floor.material.needsUpdate = true;
    wallRing.visible = false;
    while (arenaProps.children.length) arenaProps.remove(arenaProps.children[0]);
    if (!GH.meta.data.shells[GH.mechs[selMechIndex].id]) selMechIndex = 0;
    G.selectMech(selMechIndex);
    buildSelectIcons();
  };

  G.selectMech = function (i) {
    selMechIndex = i;
    var def = GH.mechs[i];
    var unlocked = !!GH.meta.data.shells[def.id];
    if (selPreview) scene.remove(selPreview);
    var cfg = {};
    for (var k in def.model) cfg[k] = def.model[k];
    if (!unlocked) cfg.corrupt = true;
    selPreview = GH.models.buildMech(cfg);
    selPreview.position.set(0, 0.4, 0);
    selPreview.scale.setScalar(1.6);
    scene.add(selPreview);
    document.getElementById('select-name').textContent = def.name + (unlocked ? '' : ' — LOCKED');
    document.getElementById('select-role').textContent = def.role;
    if (unlocked) {
      document.getElementById('select-desc').textContent = def.desc;
      document.getElementById('select-stats').innerHTML =
        '<b>Base Stats</b>\n' + def.baseText +
        '\n\n<b>On Level Up</b>\n' + def.levelText +
        '\n\n<b>Primary</b>\n' + def.weapon.name + ' (' + (def.weapon.cls || '') + ')' +
        '\n\n<b>Special</b>\n' + def.specialText;
    } else {
      var stIdx = -1;
      GH.stages.forEach(function (st, si) { if (st.unlocks === def.id) stIdx = si; });
      document.getElementById('select-desc').textContent =
        'A corrupted signal wears this frame. Bring it down to claim the shell.';
      document.getElementById('select-stats').innerHTML =
        '<b>To unlock</b>\nDefeat ' + def.name + '\'s corrupted double on wave 20 of ' +
        (stIdx >= 0 ? GH.stages[stIdx].name : '???') + '.';
    }
    var icons = document.querySelectorAll('#select-icons .mech-icon');
    for (var n = 0; n < icons.length; n++) {
      icons[n].className = 'mech-icon' + (n === i ? ' sel' : '') +
        (GH.meta.data.shells[GH.mechs[n].id] ? '' : ' locked');
    }
    document.getElementById('btn-launch').textContent = unlocked ? 'SELECT STAGE' : 'LOCKED';
    if (G.onSelectChange) G.onSelectChange();
  };

  function buildSelectIcons() {
    var wrap = document.getElementById('select-icons');
    wrap.innerHTML = '';
    GH.mechs.forEach(function (def, i) {
      var d = document.createElement('div');
      d.className = 'mech-icon' + (i === selMechIndex ? ' sel' : '') +
        (GH.meta.data.shells[def.id] ? '' : ' locked');
      d.textContent = def.icon;
      d.onclick = function () { GH.audio.card(); G.selectMech(i); };
      wrap.appendChild(d);
    });
  }

  G.getSelectedMech = function () { return selMechIndex; };
  G.selectedUnlocked = function () { return !!GH.meta.data.shells[GH.mechs[selMechIndex].id]; };

  // =================================================================
  // MAIN UPDATE
  // =================================================================
  G.update = function (dt, input, viewW, viewH) {
    if (G.state === 'select' || G.state === 'stageselect' || G.state === 'hangar' || G.state === 'title') {
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
    if (hitStopT > 0) {   // frame-freeze for impact
      hitStopT -= dt;
      G.dmg.update(dt, viewW, viewH);
      return;
    }
    runTime += dt;
    updatePlayer(dt, input);
    updateWingmate(dt, input);
    updateWave(dt);
    updateEnemies(dt);
    updateWeapons(dt, input);
    updateOrbit(dt);
    updateDrone(dt);
    updateProjectiles(dt);
    updateMines(dt);
    updatePickups(dt);
    updateEffects(dt);
    updateCipher(dt);
    if (picoDrone) {
      picoAngle += dt * 2.2;
      picoDrone.position.set(
        player.x + Math.sin(picoAngle) * 1.7,
        2.4 + Math.sin(runTime * 3) * 0.15,
        player.z + Math.cos(picoAngle) * 1.7);
      picoDrone.rotation.y += dt * 4;
    }
    updateCamera(dt);
    updateHUD();
    G.dmg.update(dt, viewW, viewH);
  };

  G.debugInfo = function () {
    return {
      state: G.state, mode: G.mode, stage: stage ? stage.id : null,
      wave: waveNum, kills: kills, hits: hitCount,
      enemies: enemies.length, projectiles: projectiles.length, pickups: pickups.length,
      hp: player ? Math.round(player.hp) : 0,
      level: player ? player.level : 0,
      weapons: player ? player.weapons.map(function (w2) {
        return w2.id + ':' + w2.sockets.join('');
      }) : [],
      boss: bossRef ? bossRef.def.name + ' ' + Math.round(bossRef.hp) +
        (bossRef.phase2 ? ' [UNBOUND]' : '') : null,
      salvage: GH.meta.data.salvage,
      shells: Object.keys(GH.meta.data.shells).length,
      music: GH.music.mode(),
      weekly: weekly ? weekly.week : null,
      profile: GH.meta.profile,
      broker: GH.meta.data.broker.active
        ? GH.meta.data.broker.active.target + ' ' + GH.meta.data.broker.active.have + '/' + GH.meta.data.broker.active.need
        : 'none',
      brokerPts: GH.meta.data.broker.points,
      trialTier: stage ? GH.progress.trialTier(stage.id) : 0,
      collection: GH.progress.completion(),
      sparksRun: sparksRun,
      mastery: player ? GH.progress.masteryLevel(player.def.id) : 0,
      masteryTotal: GH.progress.masteryTotal(),
      seasonPts: GH.meta.data.season.pts,
      seasonRelics: GH.meta.data.season.relics.slice(),
      cipher: cipherRun ? cipherRun.steps[cipherRun.idx].id + ' ' + cipherRun.idx + '/' + cipherRun.steps.length : null,
      ward: player ? player.ward : null,
      wardEnergy: player ? Math.round(player.wardEnergy * 100) / 100 : 0,
      counterStacks: player ? player.counter.length : 0,
      cipherDry: GH.meta.data.cipher.dry,
      caches: GH.meta.data.cipher.caches,
      cosmetics: Object.keys(GH.meta.data.style.owned).length,
      mate: mate ? { hp: Math.round(mate.hp), down: mate.down, x: Math.round(mate.x * 10) / 10, z: Math.round(mate.z * 10) / 10 } : null
    };
  };

  G.scene = function () { return scene; };
  G.camera = function () { return camera; };
  G.cacheEls = cacheEls;

  return G;
})();
