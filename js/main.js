// HERO FRAME — boot, renderer, input, screen wiring
(function () {
  var renderer, canvas;
  var PIXEL_SCALE = 3;   // render at 1/3 resolution for the retro look
  var input = {
    keys: {},
    mouseNDC: new THREE.Vector2(0, 0),
    special: false,
    boostPressed: false,
    specialPressed: false,
    p2x: 0, p2y: 0, p2Boost: false,
    p2Special: false, p2SpecialPressed: false,
    wardPressed: 0, wardCycle: false,
    padMoveX: 0, padMoveY: 0, padAimX: 0, padAimY: 0, padAimActive: false,
    touchMoveX: 0, touchMoveY: 0, touchAimX: 0, touchAimY: 0, touchAimActive: false
  };
  var chosenStage = 0;
  var p2keys = {};
  var p2MechIndex = -1;   // -1 = mirror P1

  function boot() {
    canvas = document.getElementById('game-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false });
    renderer.setPixelRatio(1);

    GH.game.init();
    GH.game.cacheEls();
    resize();
    window.addEventListener('resize', resize);

    bindInput();
    bindUI();
    bindTouch();
    refreshTitle();
    requestAnimationFrame(loop);
  }

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(Math.max(2, Math.floor(w / PIXEL_SCALE)), Math.max(2, Math.floor(h / PIXEL_SCALE)), false);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    var cam = GH.game.camera();
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }

  // ----------------------------------------------------------------
  var KEYMAP = {
    KeyW: 'w', ArrowUp: 'w',
    KeyA: 'a', ArrowLeft: 'a',
    KeyS: 's', ArrowDown: 's',
    KeyD: 'd', ArrowRight: 'd'
  };
  var P2KEYMAP = { KeyI: 'w', KeyJ: 'a', KeyK: 's', KeyL: 'd' };

  // Gamepad routing: with co-op ON the first pad is Player 2; solo, it
  // drives Player 1 (left stick move, right stick aim, A boost, B special).
  function pollPads() {
    var x = (p2keys.d ? 1 : 0) - (p2keys.a ? 1 : 0);
    var y = (p2keys.s ? 1 : 0) - (p2keys.w ? 1 : 0);
    input.padMoveX = 0; input.padMoveY = 0; input.padAimActive = false;
    try {
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (var i = 0; i < pads.length; i++) {
        var gp = pads[i];
        if (!gp || !gp.connected) continue;
        var ax = Math.abs(gp.axes[0]) > 0.25 ? gp.axes[0] : 0;
        var ay = Math.abs(gp.axes[1]) > 0.25 ? gp.axes[1] : 0;
        var btn = function (n) { return gp.buttons[n] && gp.buttons[n].pressed; };
        if (GH.game.coop) {
          // pad = P2
          x += ax; y += ay;
          if (btn(0) && !input._gpHeld) { input.p2Boost = true; input._gpHeld = true; }
          else if (!btn(0)) input._gpHeld = false;
          if (btn(1) || btn(2)) {
            if (!input._gpSpHeld) { input.p2SpecialPressed = true; input._gpSpHeld = true; }
            input.p2Special = true;
          } else { input._gpSpHeld = false; input.p2Special = p2keys.sp || false; }
        } else {
          // pad = P1
          input.padMoveX = ax; input.padMoveY = ay;
          var rx = Math.abs(gp.axes[2] || 0) > 0.3 ? gp.axes[2] : 0;
          var ry = Math.abs(gp.axes[3] || 0) > 0.3 ? gp.axes[3] : 0;
          if (rx || ry) { input.padAimX = rx; input.padAimY = ry; input.padAimActive = true; }
          if (btn(0) && !input._gpHeld) {
            if (GH.game.state === 'play') input.boostPressed = true;
            input._gpHeld = true;
          } else if (!btn(0)) input._gpHeld = false;
          if (btn(1) || btn(2)) {
            if (!input._gpSpHeld) {
              if (GH.game.state === 'play') input.specialPressed = true;
              input._gpSpHeld = true;
            }
            input.special = true;
          } else if (input._gpSpHeld) { input._gpSpHeld = false; input.special = false; }
          if (btn(4) || btn(5)) {
            if (!input._gpWardHeld) {
              if (GH.game.state === 'play') input.wardCycle = true;
              input._gpWardHeld = true;
            }
          } else input._gpWardHeld = false;
          if (btn(3)) { // Y: transform
            if (!input._gpTHeld) {
              if (GH.game.state === 'play') input.transformPressed = true;
              input._gpTHeld = true;
            }
          } else input._gpTHeld = false;
        }
        break;
      }
    } catch (e) { /* gamepad API unavailable */ }
    input.p2x = GH.clamp(x, -1, 1);
    input.p2y = GH.clamp(y, -1, 1);
  }

  function bindInput() {
    window.addEventListener('keydown', function (e) {
      GH.audio.unlock();
      if (!GH.music.mode()) GH.music.play('title');
      var k = KEYMAP[e.code];
      if (k) { input.keys[k] = true; e.preventDefault(); }
      var pk = P2KEYMAP[e.code];
      if (pk) p2keys[pk] = true;
      if (e.code === 'KeyO' && GH.game.state === 'play') input.p2Boost = true;
      if (e.code === 'KeyU') {
        p2keys.sp = true;
        input.p2Special = true;
        if (GH.game.state === 'play') input.p2SpecialPressed = true;
      }
      // co-op reward votes: P2 picks with J/K/L
      if (GH.game.coop && GH.game.state === 'reward') {
        var vn = { KeyJ: 0, KeyK: 1, KeyL: 2 }[e.code];
        if (vn !== undefined) GH.game.pickRewardIndex(vn);
      }
      if (e.code === 'Space' && GH.game.state === 'play') {
        input.boostPressed = true; e.preventDefault();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        input.special = true;
        if (GH.game.state === 'play') input.specialPressed = true;
      }
      if (GH.game.state === 'play') {
        // abilities on 1-4, wards (protection stances) on Z/X/C
        var an = { Digit1: 1, Digit2: 2, Digit3: 3, Digit4: 4 }[e.code];
        if (an) {
          if (!input.abilityPressed) input.abilityPressed = {};
          input.abilityPressed[an] = true;
        }
        var wn = { KeyZ: 1, KeyX: 2, KeyC: 3 }[e.code];
        if (wn) input.wardPressed = wn;
        if (e.code === 'KeyQ') input.wardCycle = true;
        if (e.code === 'KeyE') input.interactPressed = true;
        if (e.code === 'KeyT') input.transformPressed = true;
        if (e.code === 'Tab') { GH.game.tabTarget(); e.preventDefault(); }
      }
      if (e.code === 'KeyK' &&
        (GH.game.state === 'play' || GH.game.state === 'title')) {
        openSkills(GH.game.state === 'play');
      }
      if (e.code === 'Escape' || e.code === 'KeyP') togglePause();
      if (e.code === 'KeyF') {
        document.getElementById('crt-overlay').classList.toggle('off');
      }
      if (GH.game.state === 'reward') {
        var n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4, Digit6: 5 }[e.code];
        if (n !== undefined) GH.game.pickRewardIndex(n);
      }
      if (e.code === 'Enter') {
        if (GH.game.state === 'title') enterSelect('classic');
        else if (GH.game.state === 'select') openStageSelect();
        else if (GH.game.state === 'stageselect') launch(chosenStage);
      }
    });
    window.addEventListener('keyup', function (e) {
      var k = KEYMAP[e.code];
      if (k) input.keys[k] = false;
      var pk = P2KEYMAP[e.code];
      if (pk) p2keys[pk] = false;
      if (e.code === 'KeyU') { p2keys.sp = false; input.p2Special = false; }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') input.special = false;
    });
    window.addEventListener('mousemove', function (e) {
      input.mouseNDC.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    });
    window.addEventListener('mousedown', function (e) {
      GH.audio.unlock();
      if (!GH.music.mode()) GH.music.play('title');
      if (e.button === 0 && GH.game.state === 'play') {
        // left click marks a target (the OSRS way: pick your fight)
        input.mouseNDC.set(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1);
        GH.game.clickTarget(input.mouseNDC);
      }
      if (e.button === 2 && GH.game.state === 'play') {
        input.special = true;
        input.specialPressed = true;
      }
    });
    window.addEventListener('mouseup', function (e) {
      if (e.button === 2) input.special = false;
    });
    window.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('blur', function () {
      input.keys = {};
      input.special = false;
      if (GH.game.state === 'play') togglePause();
    });
  }

  // ----------------------------------------------------------------
  // Touch controls: left half = move stick, right half = aim stick,
  // plus BOOST / SPEC buttons. Shown only on coarse-pointer devices.
  var touchCapable = false;
  function bindTouch() {
    try {
      touchCapable = ('ontouchstart' in window) ||
        (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    } catch (e) { touchCapable = false; }
    if (!touchCapable) return;
    var ui = document.getElementById('touch-ui');
    ui.classList.remove('gone');

    function stick(zoneId, nubId, onMove, onEnd) {
      var zone = document.getElementById(zoneId);
      var nub = document.getElementById(nubId);
      var pid = null, ox = 0, oy = 0;
      zone.addEventListener('pointerdown', function (e) {
        pid = e.pointerId; ox = e.clientX; oy = e.clientY;
        zone.setPointerCapture(pid);
        e.preventDefault();
      });
      zone.addEventListener('pointermove', function (e) {
        if (e.pointerId !== pid) return;
        var dx = GH.clamp((e.clientX - ox) / 45, -1, 1);
        var dy = GH.clamp((e.clientY - oy) / 45, -1, 1);
        nub.style.transform = 'translate(' + dx * 22 + 'px,' + dy * 22 + 'px)';
        onMove(dx, dy);
      });
      var end = function (e) {
        if (e.pointerId !== pid) return;
        pid = null;
        nub.style.transform = '';
        onEnd();
      };
      zone.addEventListener('pointerup', end);
      zone.addEventListener('pointercancel', end);
    }

    stick('touch-move', 'touch-move-nub', function (dx, dy) {
      input.touchMoveX = dx; input.touchMoveY = dy;
    }, function () { input.touchMoveX = 0; input.touchMoveY = 0; });

    stick('touch-aim', 'touch-aim-nub', function (dx, dy) {
      if (dx * dx + dy * dy > 0.04) {
        input.touchAimX = dx; input.touchAimY = dy; input.touchAimActive = true;
      }
    }, function () { input.touchAimActive = false; });

    document.getElementById('touch-boost').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      GH.audio.unlock();
      if (GH.game.state === 'play') input.boostPressed = true;
    });
    document.getElementById('touch-ward').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (GH.game.state === 'play') input.wardCycle = true;
    });
    document.getElementById('touch-trans').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (GH.game.state === 'play') input.transformPressed = true;
    });
    var specBtn = document.getElementById('touch-special');
    specBtn.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      input.special = true;
      if (GH.game.state === 'play') input.specialPressed = true;
    });
    specBtn.addEventListener('pointerup', function () { input.special = false; });
    specBtn.addEventListener('pointercancel', function () { input.special = false; });
    // tapping the interact prompt works like pressing E
    document.getElementById('interact-line').addEventListener('pointerdown', function (e) {
      e.preventDefault();
      if (GH.game.state === 'play') input.interactPressed = true;
    });
  }

  // ----------------------------------------------------------------
  var SCREENS = ['title-screen', 'select-screen', 'stage-screen', 'hangar-screen',
    'weekly-screen', 'preset-screen', 'broker-screen', 'collection-screen',
    'trials-screen', 'season-screen', 'hub-screen', 'save-screen',
    'reward-screen', 'pause-screen', 'end-screen', 'skills-screen'];

  function show(id) {
    SCREENS.forEach(function (s) {
      document.getElementById(s).classList.toggle('hidden', s !== id);
    });
  }

  function refreshTitle() {
    var comp = GH.progress.completion();
    var s = GH.progress.seasonCheck();
    document.getElementById('title-salvage').textContent =
      'SALVAGE: ' + GH.meta.data.salvage + '  ·  SHELLS: ' +
      Object.keys(GH.meta.data.shells).length + '/' + GH.mechs.length +
      '  ·  LOG: ' + comp.pct + '%' +
      '  ·  MASTERY: ' + GH.progress.masteryTotal() +
      '  ·  SEASON: ' + s.pts + ' PTS';
    var prof = GH.meta.PROFILES[GH.meta.profile];
    document.getElementById('btn-profile').textContent = 'PILOT: ' + prof.name;
    // expedition button reflects the persistent world
    var w = GH.meta.data.world;
    var nestsDead = Object.keys(w.nests).length;
    var lairsDown = Object.keys(w.lairsDown).length;
    document.getElementById('btn-expedition').textContent =
      w.exp ? 'THE SHATTERED REACH — RESUME' :
      (nestsDead || lairsDown) ? 'THE SHATTERED REACH (' + nestsDead + ' nests · ' + lairsDown + ' lairs)' :
      'THE SHATTERED REACH';
    var memEl = document.getElementById('title-memorial');
    var mem = GH.meta.memorial();
    if (GH.meta.isHardcore() && mem.length) {
      memEl.textContent = 'MEMORIAL: ' + mem.slice(0, 3).map(function (m) {
        return m.frame + ' — ' + m.stage + ' w' + m.wave;
      }).join('  ·  ');
    } else {
      memEl.textContent = '';
    }
  }

  var PROFILE_ORDER = ['standard', 'iron', 'hardcore'];
  function cycleProfile() {
    var i = PROFILE_ORDER.indexOf(GH.meta.profile);
    var next = PROFILE_ORDER[(i + 1) % PROFILE_ORDER.length];
    GH.meta.load(next);
    GH.meta.applyDevParams(location.search);
    GH.audio.card();
    refreshTitle();
  }

  function enterSelect(mode) {
    GH.audio.card();
    GH.game.mode = mode;
    show('select-screen');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('btn-launch').textContent =
      mode === 'expedition' ? 'DEPLOY TO THE REACH' : 'SELECT STAGE';
    GH.game.onSelectChange = renderSelectExtras;
    GH.game.enterSelect();
    renderP2Row();
    renderSelectExtras();
  }

  // mastery readout + style pickers on the select screen
  function renderSelectExtras() {
    var def = GH.mechs[GH.game.getSelectedMech()];
    var mp = GH.progress.masteryProgress(def.id);
    var pips = '';
    GH.progress.masteryMilestones.forEach(function (ms) {
      pips += '<span class="' + (mp.lvl >= ms.lvl ? 'ms-on' : 'ms-off') + '" title="' +
        ms.desc + '">L' + ms.lvl + '</span>';
    });
    document.getElementById('select-mastery').innerHTML =
      'MASTERY <b>Lv ' + mp.lvl + (mp.lvl >= GH.progress.MASTERY_CAP ? ' ★ MASTER' : '') + '</b>' +
      '<span class="ms-bar"><span class="ms-fill" style="width:' + Math.round(mp.frac * 100) + '%"></span></span>' +
      pips;

    // style cyclers (owned cosmetics only)
    var style = GH.meta.data.style;
    var wrap = document.getElementById('style-row');
    var owned = function (kind) {
      return GH.progress.cosmetics.filter(function (c) { return c.kind === kind && style.owned[c.id]; });
    };
    var mkCycler = function (kind, label, current) {
      var opts = owned(kind);
      if (!opts.length) return '';
      var curName = 'Default';
      if (current) {
        var cc = GH.progress.cosmeticById(current);
        if (cc) curName = cc.name;
      }
      return '<button class="style-btn" data-kind="' + kind + '">' + label + ': ' + curName + '</button>';
    };
    wrap.innerHTML =
      mkCycler('trail', 'TRAIL', style.trail) +
      mkCycler('paint', 'PAINT', style.paint) +
      mkCycler('drone', 'DRONE', style.drone);
    wrap.querySelectorAll('.style-btn').forEach(function (btn) {
      btn.onclick = function () {
        var kind = btn.getAttribute('data-kind');
        var opts = owned(kind).map(function (c) { return c.id; });
        opts.unshift(null); // "default / none"
        var cur = opts.indexOf(style[kind]);
        style[kind] = opts[(cur + 1) % opts.length];
        GH.meta.save();
        GH.audio.card();
        renderSelectExtras();
      };
    });
  }

  // P2's own frame picker (visible when co-op is on)
  function renderP2Row() {
    var wrap = document.getElementById('p2-select-row');
    wrap.classList.toggle('hidden', !GH.game.coop);
    if (!GH.game.coop) return;
    wrap.innerHTML = '<span class="p2-row-label">P2 FRAME:</span>';
    var mirror = document.createElement('div');
    mirror.className = 'mech-icon p2-icon' + (p2MechIndex === -1 ? ' sel' : '');
    mirror.textContent = '⇔';
    mirror.title = 'Mirror P1';
    mirror.onclick = function () { p2MechIndex = -1; GH.audio.card(); renderP2Row(); };
    wrap.appendChild(mirror);
    GH.mechs.forEach(function (def, i) {
      if (!GH.meta.data.shells[def.id]) return;
      var d = document.createElement('div');
      d.className = 'mech-icon p2-icon' + (i === p2MechIndex ? ' sel' : '');
      d.textContent = def.icon;
      d.title = def.name;
      d.onclick = function () { p2MechIndex = i; GH.audio.card(); renderP2Row(); };
      wrap.appendChild(d);
    });
  }

  function openStageSelect() {
    if (!GH.game.selectedUnlocked()) return;
    if (GH.game.mode === 'expedition') {
      // no stage picker: the Reach is one place
      GH.audio.wave();
      show(null);
      GH.game.startExpedition(GH.game.getSelectedMech());
      return;
    }
    GH.audio.card();
    GH.game.state = 'stageselect';
    renderStageList();
    show('stage-screen');
  }

  function renderStageList() {
    var wrap = document.getElementById('stage-list');
    wrap.innerHTML = '';
    var arena = GH.game.mode === 'arena';
    GH.stages.forEach(function (st, i) {
      var unlocked = (i + 1) <= GH.meta.data.stages;
      var div = document.createElement('div');
      div.className = 'stage-card' + (unlocked ? '' : ' locked');
      var best = GH.meta.data.bestWave[st.id] || 0;
      var won = GH.meta.data.victories[st.id];
      var reward = GH.mechById(st.unlocks);
      var tier = GH.progress.trialTier(st.id);
      var tierBadge = tier ? '<span class="sc-trial">TRIAL ' + ['I', 'II', 'III', 'IV'][tier - 1] + '</span>' : '';
      div.innerHTML =
        '<div class="sc-band" style="background:linear-gradient(' +
        st.sky[0] + ',' + st.sky[1] + ')"></div>' +
        '<div class="sc-sub">' + st.sub.toUpperCase() + (arena ? ' · ARENA' : '') + '</div>' +
        '<div class="sc-name">' + st.name + '</div>' +
        '<div class="sc-info">' + (unlocked
          ? (arena ? 'Endless waves.<br>How deep can you go?'
            : 'Wave 20 boss:<br>CORRUPTED ' + reward.name +
            (GH.meta.data.shells[st.unlocks] ? '' : '<br>— defeat to unlock the frame'))
          : 'Clear the previous stage<br>to unlock') + '</div>' +
        '<div class="sc-best">' + (won ? '★ CLEARED · ' : '') +
        (best ? 'best wave ' + best : '') + ' ' + tierBadge + '</div>';
      if (unlocked) {
        div.onclick = function () {
          chosenStage = i;
          // loadout kits retired with the card system — deploy directly
          launch(i);
        };
      }
      wrap.appendChild(div);
    });
  }

  var lastLaunch = null;

  // Arena loadout presets: a starting kit instead of a bare frame.
  var PRESETS = [
    { id: 'bare', name: 'Standard Issue', glyph: '—', desc: 'No starting kit. The classic climb.' },
    { id: 'gunplatform', name: 'Gun Platform', glyph: '⋔',
      desc: 'Start with a Flak Fan and a Missile Rack.',
      weapons: ['flakfan', 'missiles'] },
    { id: 'stormcell', name: 'Storm Cell', glyph: '϶',
      desc: 'Start with an Arc Coil and Orbit Blades, plus a Keen gem in your primary.',
      weapons: ['tesla', 'blades'], gems: ['keen'] },
    { id: 'sapper', name: 'Sapper', glyph: '☒',
      desc: 'Start with a Mine Layer and a Mortar Pod, plus +2 armor.',
      weapons: ['mines', 'mortarpod'], traits: ['t_arm'] },
    { id: 'pyrecult', name: 'Pyre Cult', glyph: '♨',
      desc: 'Start with a Flame Projector, +25% elemental damage, and a Pyre gem.',
      weapons: ['flamer'], traits: ['t_elem'], gems: ['pyre'] }
  ];

  function openPresetPicker(stageIdx) {
    if (GH.meta.isIron()) {
      // Iron rules: no loadout kits — straight into the arena
      launch(stageIdx, PRESETS[0]);
      return;
    }
    GH.game.state = 'stageselect';
    var wrap = document.getElementById('preset-list');
    wrap.innerHTML = '';
    PRESETS.forEach(function (ps) {
      var div = document.createElement('div');
      div.className = 'reward-card';
      div.innerHTML =
        '<div class="rc-kind">LOADOUT</div>' +
        '<div class="rc-glyph">' + ps.glyph + '</div>' +
        '<div class="rc-name">' + ps.name + '</div>' +
        '<div class="rc-desc">' + ps.desc + '</div>';
      div.onclick = function () { launch(stageIdx, ps); };
      wrap.appendChild(div);
    });
    show('preset-screen');
  }

  function launch(stageIdx, preset) {
    GH.audio.wave();
    show(null);
    var devWave = 1;
    try {
      devWave = parseInt(new URLSearchParams(location.search).get('wave') || '1', 10) || 1;
    } catch (e) { /* older browsers */ }
    var doLaunch = function () {
      show(null);
      GH.game.startRun(GH.game.getSelectedMech(), stageIdx, devWave,
        { p2Mech: p2MechIndex, preset: preset });
    };
    lastLaunch = doLaunch;
    doLaunch();
  }

  // ----------------------------------------------------------------
  // Weekly challenge: everyone gets the same frame/stage/modifiers for the
  // ISO week, derived from a deterministic seed.
  function isoWeek(d) {
    d = d || new Date();
    var date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var dayNum = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - dayNum + 3);
    var firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
    var week = 1 + Math.round(((date - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
    return date.getUTCFullYear() + '-W' + ('0' + week).slice(-2);
  }

  function seededRng(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    var s = h >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5; s >>>= 0;
      return s / 4294967296;
    };
  }

  var WEEKLY_MODS = [
    { id: 'swarm', label: 'SWARM — +40% enemy spawns', apply: function (m) { m.rate *= 1.4; } },
    { id: 'ironclad', label: 'IRONCLAD — enemies +30% hull', apply: function (m) { m.ehp *= 1.3; } },
    { id: 'glass', label: 'GLASS FRAME — your hull -25%', apply: function (m) { m.php *= 0.75; } },
    { id: 'haste', label: 'HASTE — enemies +15% speed', apply: function (m) { m.espd *= 1.15; } },
    { id: 'feral', label: 'FERAL — a warden hunts every 5 waves', apply: function (m) { m.midbossEvery = 5; } }
  ];
  var WEEKLY_BOONS = [
    { id: 'bounty', label: 'BOUNTY — +50% salvage', apply: function (m) { m.salvage *= 1.5; } },
    { id: 'keeneyes', label: 'KEEN EYES — +10% crit', apply: function (m) { m.crit += 10; } }
  ];

  function buildWeekly() {
    var week = isoWeek();
    var rnd = seededRng('heroframe:' + week);
    var mechIdx = Math.floor(rnd() * GH.mechs.length);
    var stageIdx = Math.floor(rnd() * GH.stages.length);
    var mods = { rate: 1, ehp: 1, espd: 1, php: 1, salvage: 1, crit: 0, midbossEvery: 0 };
    var picks = [];
    var pool = WEEKLY_MODS.slice();
    for (var i = 0; i < 2; i++) {
      var m = pool.splice(Math.floor(rnd() * pool.length), 1)[0];
      m.apply(mods);
      picks.push(m.label);
    }
    var boon = WEEKLY_BOONS[Math.floor(rnd() * WEEKLY_BOONS.length)];
    boon.apply(mods);
    picks.push(boon.label);
    return { week: week, mechIdx: mechIdx, stageIdx: stageIdx, mods: mods, labels: picks };
  }

  function openWeekly() {
    GH.audio.card();
    var wk = buildWeekly();
    var best = (GH.meta.data.weekly && GH.meta.data.weekly.week === wk.week)
      ? GH.meta.data.weekly.best : 0;
    document.getElementById('weekly-brief').innerHTML =
      '<div class="wk-week">' + wk.week + '</div>' +
      '<div class="wk-line">Frame: <b>' + GH.mechs[wk.mechIdx].name + '</b> (issued for the week)</div>' +
      '<div class="wk-line">Stage: <b>' + GH.stages[wk.stageIdx].name + '</b> · endless</div>' +
      '<div class="wk-mods">' + wk.labels.map(function (l) { return '· ' + l; }).join('<br>') + '</div>' +
      (best ? '<div class="wk-best">Your best this week: WAVE ' + best + '</div>' : '');
    GH.game.state = 'stageselect';
    show('weekly-screen');
    document.getElementById('btn-weekly-go').onclick = function () {
      GH.audio.wave();
      GH.game.mode = 'weekly';
      lastLaunch = function () {
        show(null);
        GH.game.mode = 'weekly';
        GH.game.startRun(wk.mechIdx, wk.stageIdx, 1, { weekly: wk });
      };
      lastLaunch();
    };
  }

  // ----------------------------------------------------------------
  // HANGAR HUB — one door to every meta screen
  function openHub() {
    GH.audio.card();
    GH.game.state = 'hangar';
    var s = GH.progress.seasonCheck();
    var comp = GH.progress.completion();
    var b = GH.meta.data.broker;
    var cards = [
      { id: 'hub-skills', glyph: '❈', name: 'PILOT TRAINING',
        sub: 'Pilot Lv ' + GH.skills.pilotProgress().lvl +
          (GH.meta.data.skillPoints > 0 ? ' · ' + GH.meta.data.skillPoints + ' POINTS READY' : ' · skill tree'),
        open: function () { openSkills(false); } },
      { id: 'hub-season', glyph: '☄', name: 'RELIC SEASON',
        sub: GH.progress.seasonName(s.id) + ' · ' + s.pts + ' pts' +
          (GH.progress.relicPicksAvailable() > 0 ? ' · RELIC READY' : ''),
        open: openSeason },
      { id: 'hub-broker', glyph: '☰', name: 'THE BROKER',
        sub: b.active ? GH.progress.contractLabel(b.active) + ' (' + b.active.have + '/' + b.active.need + ')'
          : b.points + ' pts banked · no active contract',
        open: openBroker },
      { id: 'hub-trials', glyph: '⛨', name: 'STAGE TRIALS',
        sub: 'permanent stage perks', open: openTrials },
      { id: 'hub-log', glyph: '📖', name: 'COLLECTION LOG',
        sub: comp.pct + '% complete', open: openCollection },
      { id: 'hub-devotions', glyph: '☀', name: 'DEVOTIONS',
        sub: GH.meta.isIron() ? 'sealed on iron profiles' : GH.meta.data.salvage + ' salvage to spend',
        open: openHangar },
      { id: 'hub-save', glyph: '⛃', name: 'SAVE CODE',
        sub: 'back up or restore progress', open: openSave }
    ];
    var wrap = document.getElementById('hub-cards');
    wrap.innerHTML = '';
    cards.forEach(function (c) {
      var div = document.createElement('div');
      div.className = 'hub-card';
      div.innerHTML = '<div class="hc-glyph">' + c.glyph + '</div>' +
        '<div class="hc-name">' + c.name + '</div>' +
        '<div class="hc-sub">' + c.sub + '</div>';
      div.onclick = c.open;
      wrap.appendChild(div);
    });
    show('hub-screen');
  }

  // ----------------------------------------------------------------
  // SAVE CODE — export/import all profiles
  function openSave() {
    GH.audio.card();
    GH.game.state = 'hangar';
    document.getElementById('save-export').value = GH.meta.exportCode();
    document.getElementById('save-import').value = '';
    document.getElementById('save-feedback').textContent = '';
    show('save-screen');
  }

  // ----------------------------------------------------------------
  // RELIC SEASON
  function openSeason() {
    GH.audio.card();
    GH.game.state = 'hangar';
    renderSeason();
    show('season-screen');
  }

  function renderSeason() {
    var s = GH.progress.seasonCheck();
    document.getElementById('season-head').innerHTML =
      '<span class="sn-name">SEASON OF THE ' + GH.progress.seasonName(s.id) + '</span> · ' +
      s.id + ' · <b>' + s.pts + ' PTS</b>';
    // threshold meter
    var thr = GH.progress.seasonThresholds;
    var meter = 'Relic thresholds: ' + thr.map(function (t) {
      return '<span class="' + (s.pts >= t ? 'sn-hit' : 'sn-miss') + '">' + t + '</span>';
    }).join(' → ');
    document.getElementById('season-meter').innerHTML = meter;

    // relic area
    var relicWrap = document.getElementById('season-relics');
    relicWrap.innerHTML = '';
    if (s.relics.length) {
      var activeDiv = document.createElement('div');
      activeDiv.className = 'sn-active';
      activeDiv.innerHTML = 'ACTIVE RELICS: ' + s.relics.map(function (id) {
        var r = null;
        GH.progress.relics.forEach(function (x) { if (x.id === id) r = x; });
        return '<b title="' + r.desc + '">' + r.name + '</b>';
      }).join(' · ');
      relicWrap.appendChild(activeDiv);
    }
    if (GH.progress.relicPicksAvailable() > 0) {
      var offer = GH.progress.relicOffer();
      var offerWrap = document.createElement('div');
      offerWrap.className = 'sn-offer';
      offerWrap.innerHTML = '<div class="bk-label">CHOOSE A RELIC</div>';
      var row = document.createElement('div');
      row.style.display = 'flex';
      row.style.gap = '12px';
      offer.forEach(function (r) {
        var card = document.createElement('div');
        card.className = 'reward-card relic-card';
        card.innerHTML = '<div class="rc-kind">RELIC</div>' +
          '<div class="rc-name">' + r.name + '</div>' +
          '<div class="rc-desc">' + r.desc + '</div>';
        card.onclick = function () {
          if (GH.progress.claimRelic(r.id)) {
            GH.audio.levelup();
            renderSeason();
          }
        };
        row.appendChild(card);
      });
      offerWrap.appendChild(row);
      relicWrap.appendChild(offerWrap);
    }

    // task board
    var body = document.getElementById('season-tasks');
    var html = '';
    GH.progress.seasonTasks.forEach(function (t) {
      var done = !!s.done[t.id];
      html += '<div class="sn-task' + (done ? ' done' : '') + '">' +
        (done ? '☑' : '☐') + ' ' + t.desc +
        '<span class="sn-pts">+' + t.pts + '</span></div>';
    });
    body.innerHTML = html;
    var c = s.counters;
    document.getElementById('season-counters').textContent =
      'Season counters — kills: ' + c.kills + ' · sparks: ' + Math.round(c.sparks) +
      ' · resonances: ' + c.resonances + ' · contracts: ' + c.contracts;
  }

  // ----------------------------------------------------------------
  // BROKER — hunt contracts
  function openBroker() {
    GH.audio.card();
    GH.game.state = 'hangar';
    renderBroker();
    show('broker-screen');
  }

  function renderBroker() {
    var b = GH.meta.data.broker;
    document.getElementById('broker-status').innerHTML =
      'BROKER POINTS: <b>' + b.points + '</b> · CONTRACTS FILLED: <b>' + b.completed +
      '</b> · SALVAGE: <b>' + GH.meta.data.salvage + '</b>';
    var wrap = document.getElementById('broker-contract');
    if (b.active) {
      var c = b.active;
      wrap.innerHTML =
        '<div class="bk-label">ACTIVE CONTRACT</div>' +
        '<div class="bk-task">' + GH.progress.contractLabel(c) + '</div>' +
        '<div class="bk-progress">' + c.have + ' / ' + c.need +
        '  —  pays ' + c.salvage + ' salvage + ' + c.pts + ' pts</div>' +
        '<button class="dv-buy" id="bk-reroll">REROLL · ' + GH.progress.rerollCost() + '</button> ' +
        '<button class="dv-buy" id="bk-abandon">ABANDON</button>';
      document.getElementById('bk-reroll').onclick = function () {
        var cost = GH.progress.rerollCost();
        if (GH.meta.data.salvage < cost) return;
        GH.meta.data.salvage -= cost;
        GH.meta.data.broker.active = GH.progress.generateContract();
        GH.meta.save();
        GH.audio.card();
        renderBroker();
      };
      document.getElementById('bk-abandon').onclick = function () {
        GH.meta.data.broker.active = null;
        GH.meta.save();
        GH.audio.hit();
        renderBroker();
      };
    } else {
      wrap.innerHTML =
        '<div class="bk-label">NO ACTIVE CONTRACT</div>' +
        '<button class="menu-btn small" id="bk-accept">TAKE A CONTRACT</button>';
      document.getElementById('bk-accept').onclick = function () {
        GH.meta.data.broker.active = GH.progress.generateContract();
        GH.meta.save();
        GH.audio.wave();
        renderBroker();
      };
    }
    // unlock shop
    var shop = document.getElementById('broker-shop');
    shop.innerHTML = '';
    GH.progress.brokerUnlocks.forEach(function (u) {
      var owned = !!b.unlocks[u.id];
      var gated = u.requires && !b.unlocks[u.requires];
      var div = document.createElement('div');
      div.className = 'devotion-card' + (owned ? ' active' : '');
      div.innerHTML =
        '<div class="dv-name">' + u.name + '</div>' +
        '<div class="dv-desc">' + u.desc + '</div>' +
        '<button class="dv-buy" ' + (owned || gated || b.points < u.cost ? 'disabled' : '') + '>' +
        (owned ? 'OWNED' : (gated ? 'LOCKED' : u.cost + ' PTS')) + '</button>';
      div.querySelector('.dv-buy').onclick = function () {
        if (owned || gated || b.points < u.cost) return;
        b.points -= u.cost;
        b.unlocks[u.id] = true;
        GH.meta.save();
        GH.audio.levelup();
        renderBroker();
      };
      shop.appendChild(div);
    });
  }

  // ----------------------------------------------------------------
  // COLLECTION LOG
  function openCollection() {
    GH.audio.card();
    GH.game.state = 'hangar';
    var c = GH.meta.data.collection;
    var comp = GH.progress.completion();
    document.getElementById('log-head').innerHTML =
      'COMPLETION: <b>' + comp.pct + '%</b> (' + comp.have + '/' + comp.total + ')' +
      ' · RUNS: <b>' + c.totalRuns + '</b> · WINS: <b>' + c.totalWins +
      '</b> · TOTAL KILLS: <b>' + c.totalKills + '</b>';
    var body = document.getElementById('log-body');
    var html = '<div class="log-section">HOSTILES</div><div class="log-grid">';
    Object.keys(GH.enemyDefs).forEach(function (id) {
      var n = c.kills[id] || 0;
      html += '<div class="log-cell' + (n ? ' seen' : '') + '">' +
        '<div class="lc-name">' + (n ? GH.enemyDefs[id].name : '???') + '</div>' +
        '<div class="lc-count">' + (n ? '×' + n : '—') + '</div></div>';
    });
    html += '</div><div class="log-section">WEAPONS</div><div class="log-grid">';
    GH.upgrades.forEach(function (u) {
      if (u.kind !== 'weapon') return;
      var got = !!c.weapons[u.id];
      html += '<div class="log-cell' + (got ? ' seen' : '') + '">' +
        '<div class="lc-glyph">' + u.glyph + '</div>' +
        '<div class="lc-name">' + (got ? u.name : '???') + '</div></div>';
    });
    html += '</div><div class="log-section">RESONANCES</div><div class="log-grid">';
    var resNames = Object.keys(c.resonances);
    ['SANCTITY', 'IMMOLATE', 'FRAGMENT', 'SPOREBLOOM', 'DETONATE', 'PRISM'].forEach(function (r) {
      var got = false;
      for (var i = 0; i < resNames.length; i++) {
        if (resNames[i].indexOf(r) === 0 && resNames[i].indexOf('+') === -1) got = true;
      }
      html += '<div class="log-cell' + (got ? ' seen' : '') + '">' +
        '<div class="lc-name">' + (got ? r : '???') + '</div></div>';
    });
    html += '</div><div class="log-section">GEMS SOCKETED</div><div class="log-grid">';
    GH.gems.typeIds.forEach(function (t) {
      var n = c.gems[t] || 0;
      html += '<div class="log-cell' + (n ? ' seen' : '') + '">' +
        '<div class="lc-glyph">' + GH.gems.types[t].glyph + '</div>' +
        '<div class="lc-name">' + GH.gems.types[t].name + '</div>' +
        '<div class="lc-count">' + (n ? '×' + n : '—') + '</div></div>';
    });
    html += '</div><div class="log-section">CACHE FINDS (' +
      GH.meta.data.cipher.caches + ' caches opened)</div><div class="log-grid">';
    GH.progress.cosmetics.forEach(function (cs) {
      var got = !!GH.meta.data.style.owned[cs.id];
      html += '<div class="log-cell' + (got ? ' seen' : '') + '">' +
        '<div class="lc-name">' + (got ? cs.name : '???') + '</div>' +
        '<div class="lc-count">' + cs.kind.toUpperCase() + '</div></div>';
    });
    html += '</div><div class="log-section">PILOT MASTERY (total ' +
      GH.progress.masteryTotal() + ')</div><div class="log-grid">';
    GH.mechs.forEach(function (m) {
      var lvl = GH.progress.masteryLevel(m.id);
      html += '<div class="log-cell' + (lvl ? ' seen' : '') + '">' +
        '<div class="lc-glyph">' + m.icon + '</div>' +
        '<div class="lc-name">' + m.name + '</div>' +
        '<div class="lc-count">Lv ' + lvl + (lvl >= 50 ? ' ★' : '') + '</div></div>';
    });
    var wArt = GH.meta.data.world;
    var artHave = Object.keys(wArt.artifacts).length;
    html += '</div><div class="log-section">NAMED ARTIFACTS (' + artHave + '/' +
      GH.progress.artifacts.length + ' · one equipped at a time)</div><div class="log-grid">';
    GH.progress.artifacts.forEach(function (a) {
      var got = !!wArt.artifacts[a.id];
      var on = wArt.equipped === a.id;
      html += '<div class="log-cell' + (got ? ' seen art-cell' : '') + (on ? ' art-on' : '') + '"' +
        (got ? ' data-art="' + a.id + '" title="' + a.desc + '"' : '') + '>' +
        '<div class="lc-name">' + (got ? a.name : '???') + '</div>' +
        '<div class="lc-count">' + (got ? (on ? '◆ EQUIPPED' : 'equip') : a.source) + '</div></div>';
    });
    html += '</div>';
    body.innerHTML = html;
    // artifact cells equip on click (click again to unequip)
    body.querySelectorAll('[data-art]').forEach(function (cell) {
      cell.onclick = function () {
        var id = cell.getAttribute('data-art');
        wArt.equipped = wArt.equipped === id ? null : id;
        GH.meta.save();
        GH.audio.card();
        openCollection();
      };
    });
    show('collection-screen');
  }

  // ----------------------------------------------------------------
  // STAGE TRIALS
  function openTrials() {
    GH.audio.card();
    GH.game.state = 'hangar';
    var body = document.getElementById('trials-body');
    var html = '';
    GH.stages.forEach(function (st, si) {
      var unlocked = (si + 1) <= GH.meta.data.stages;
      var tier = GH.progress.trialTier(st.id);
      html += '<div class="trial-stage' + (unlocked ? '' : ' locked') + '">' +
        '<div class="ts-name">' + st.name +
        ' <span class="ts-tier">' + (tier ? 'TIER ' + ['I', 'II', 'III', 'IV'][tier - 1] : '') + '</span></div>';
      if (unlocked) {
        GH.progress.trialTiers.forEach(function (tr, ti) {
          html += '<div class="ts-row"><span class="ts-tiername">' + tr.name + '</span>';
          tr.tasks.forEach(function (task) {
            var done = GH.progress.trialDone(st.id, task.id);
            html += '<span class="ts-task' + (done ? ' done' : '') + '">' +
              (done ? '☑ ' : '☐ ') + task.desc + '</span>';
          });
          html += '<span class="ts-perk' + (tier > ti ? ' on' : '') + '">' + tr.perk + '</span></div>';
        });
      } else {
        html += '<div class="ts-row">Reach this stage to open its trials.</div>';
      }
      html += '</div>';
    });
    body.innerHTML = html;
    show('trials-screen');
  }

  // ----------------------------------------------------------------
  function openHangar() {
    GH.audio.card();
    GH.game.state = 'hangar';
    renderHangar();
    show('hangar-screen');
  }

  var DEVOTIONS = [
    { id: 'sol', glyph: '☀', name: 'Sol', css: '#fff2c8', desc: '+8 max health per rank. Rank 4: +0.5 HP/s regen.' },
    { id: 'pyre', glyph: '🔥', name: 'Pyre', css: '#ff9070', desc: '+3% damage per rank.' },
    { id: 'keen', glyph: '👁', name: 'Keen', css: '#90d0ff', desc: '+2% attack speed and +1% crit per rank.' },
    { id: 'verd', glyph: '🌿', name: 'Verd', css: '#90f0a0', desc: '+8% magnet and +4% XP per rank.' },
    { id: 'ruin', glyph: '☠', name: 'Ruin', css: '#d0a0ff', desc: '+6% crit damage per rank. Rank 3: faster boost.' }
  ];

  function renderHangar() {
    document.getElementById('hangar-salvage').innerHTML =
      'SALVAGE: <span style="color:#fff">' + GH.meta.data.salvage + '</span>' +
      (GH.meta.isIron() ? ' — <span style="color:#ff8080">IRON RULES: DEVOTIONS SEALED</span>' : '');
    var wrap = document.getElementById('devotion-list');
    wrap.innerHTML = '';
    DEVOTIONS.forEach(function (d) {
      var rank = GH.meta.data.devotion[d.id];
      var active = GH.meta.data.activeDevotion === d.id;
      var cost = GH.meta.devotionCost(d.id);
      var div = document.createElement('div');
      div.className = 'devotion-card' + (active ? ' active' : '');
      var pips = '';
      for (var i = 0; i < 5; i++) pips += '<span class="dv-pip' + (i < rank ? ' on' : '') + '"></span>';
      div.innerHTML =
        '<div class="dv-glyph">' + d.glyph + '</div>' +
        '<div class="dv-name" style="color:' + d.css + '">DEVOTION TO ' + d.name.toUpperCase() + '</div>' +
        '<div class="dv-desc">' + d.desc + '</div>' +
        '<div class="dv-pips">' + pips + '</div>' +
        '<button class="dv-buy" ' + (rank >= 5 || GH.meta.data.salvage < cost ? 'disabled' : '') + '>' +
        (rank >= 5 ? 'MAXED' : 'RANK UP · ' + cost) + '</button>' +
        '<button class="dv-activate">' + (active ? '◆ ACTIVE PATH' : 'set active') + '</button>';
      div.querySelector('.dv-buy').onclick = function () {
        if (GH.meta.buyDevotion(d.id)) { GH.audio.levelup(); renderHangar(); }
      };
      div.querySelector('.dv-activate').onclick = function () {
        GH.meta.data.activeDevotion = d.id;
        GH.meta.save();
        GH.audio.card();
        renderHangar();
      };
      wrap.appendChild(div);
    });
  }

  // ----------------------------------------------------------------
  // PILOT TRAINING — the skill tree. Reached from play (K), the hub,
  // or the title; backing out of an in-play open resumes the run.
  function openSkills(fromPlay) {
    GH.audio.card();
    if (fromPlay) expEntry = 'skills';
    if (GH.game.state !== 'play' || fromPlay) GH.game.state = 'hangar';
    renderSkills();
    show('skills-screen');
  }

  function renderSkills() {
    var pp = GH.skills.pilotProgress();
    document.getElementById('skills-head').innerHTML =
      'PILOT LEVEL <b>' + pp.lvl + '</b> · ' +
      Math.floor(pp.into) + '/' + Math.ceil(pp.need) + ' XP · ' +
      'POINTS TO SPEND: <b class="sk-pts">' + GH.meta.data.skillPoints + '</b> · ' +
      'SALVAGE: ' + GH.meta.data.salvage;
    var wrap = document.getElementById('skills-tree');
    wrap.innerHTML = '';
    GH.skills.BRANCHES.forEach(function (br) {
      var col = document.createElement('div');
      col.className = 'sk-branch';
      var spent = GH.skills.spentIn(br.id);
      col.innerHTML = '<div class="sk-branch-name" style="color:' + br.css + '">' +
        br.name + ' <span class="sk-spent">(' + spent + ' spent)</span></div>';
      GH.skills.TREE.forEach(function (node) {
        if (node.branch !== br.id) return;
        var rank = GH.skills.rank(node.id);
        var can = GH.skills.canSpend(node.id);
        var gated = spent < node.req;
        var div = document.createElement('div');
        div.className = 'sk-node' + (rank >= node.max ? ' maxed' : '') +
          (can ? ' can' : '') + (gated ? ' gated' : '');
        var pips = '';
        for (var i = 0; i < node.max; i++) {
          pips += '<span class="sk-pip' + (i < rank ? ' on' : '') + '"></span>';
        }
        div.innerHTML =
          '<div class="sk-name">' + node.name +
          (node.req > 0 ? ' <span class="sk-req">req ' + node.req + '</span>' : '') + '</div>' +
          '<div class="sk-desc">' + node.desc + '</div>' +
          '<div class="sk-pips">' + pips + '</div>';
        div.onclick = function () {
          if (GH.skills.spend(node.id)) {
            GH.audio.levelup();
            renderSkills();
          } else {
            GH.audio.hit();
          }
        };
        col.appendChild(div);
      });
      wrap.appendChild(col);
    });
  }

  // ----------------------------------------------------------------
  function togglePause() {
    if (GH.game.state === 'race') { GH.game.abortRace(); return; }
    if (GH.game.state === 'play') {
      GH.game.state = 'pause';
      document.getElementById('pause-stats').textContent = GH.game.pauseInfo();
      show('pause-screen');
    } else if (GH.game.state === 'pause') {
      GH.game.state = 'play';
      show(null);
    }
  }

  function toTitle() {
    GH.meta.save(); // abandoned runs still keep their tracking
    expEntry = null;
    GH.game.state = 'title';
    document.getElementById('hud').classList.add('hidden');
    refreshTitle();
    show('title-screen');
  }

  // ----------------------------------------------------------------
  // Expedition camp stations open the meta screens in place; backing
  // out drops you straight back into the world, not the title.
  var expEntry = null; // which screen the camp station opened

  function resumeExpedition() {
    expEntry = null;
    GH.game.state = 'play';
    show(null);
    GH.audio.card();
    // camp training/purchases land on the live character immediately
    if (GH.game.refreshPilot) GH.game.refreshPilot();
  }

  function metaBack(entryKind, fallback) {
    return function () {
      if (expEntry === entryKind) resumeExpedition();
      else fallback();
    };
  }

  function startOrResumeExpedition() {
    GH.audio.card();
    if (GH.meta.data.world.exp) {
      show(null);
      GH.game.startExpedition(0); // saved character carries its own frame
    } else {
      enterSelect('expedition');
    }
  }

  function bindUI() {
    GH.game.onInteract = function (kind) {
      if (kind === 'broker') { expEntry = 'broker'; openBroker(); }
      else if (kind === 'shrine') { expEntry = 'hangar'; openHangar(); }
      else if (kind === 'memorial') { expEntry = 'collection'; openCollection(); }
      else { expEntry = 'hub'; openHub(); }
    };
    document.getElementById('btn-expedition').onclick = startOrResumeExpedition;
    document.getElementById('btn-start').onclick = function () { enterSelect('classic'); };
    document.getElementById('btn-arena').onclick = function () { enterSelect('arena'); };
    document.getElementById('btn-weekly').onclick = openWeekly;
    document.getElementById('btn-hub').onclick = openHub;
    document.getElementById('btn-hub-back').onclick = metaBack('hub', toTitle);
    document.getElementById('btn-profile').onclick = cycleProfile;
    // meta screens live under the hub now (or under a camp station)
    document.getElementById('btn-season-back').onclick = openHub;
    document.getElementById('btn-skills-back').onclick = metaBack('skills', openHub);
    document.getElementById('btn-respec').onclick = function () {
      if (GH.skills.respec()) {
        GH.audio.win();
        renderSkills();
      } else {
        GH.audio.hit();
      }
    };
    document.getElementById('btn-broker-back').onclick = metaBack('broker', openHub);
    document.getElementById('btn-collection-back').onclick = metaBack('collection', openHub);
    document.getElementById('btn-trials-back').onclick = openHub;
    document.getElementById('btn-hangar-back').onclick = metaBack('hangar', openHub);
    document.getElementById('btn-save-back').onclick = openHub;
    document.getElementById('btn-save-copy').onclick = function () {
      var ta = document.getElementById('save-export');
      ta.select();
      var ok = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(ta.value);
          ok = true;
        } else {
          ok = document.execCommand('copy');
        }
      } catch (e) { /* fall through */ }
      document.getElementById('save-feedback').textContent =
        ok ? 'Copied — keep it somewhere safe.' : 'Select the code and copy it manually.';
      GH.audio.card();
    };
    document.getElementById('btn-save-import').onclick = function () {
      var res = GH.meta.importCode(document.getElementById('save-import').value);
      var fb = document.getElementById('save-feedback');
      if (res.ok) {
        fb.textContent = 'Restored ' + res.profiles + ' profile(s) from ' + (res.saved || 'save') + '.';
        GH.audio.win();
        refreshTitle();
        document.getElementById('save-export').value = GH.meta.exportCode();
      } else {
        fb.textContent = res.error;
        GH.audio.hit();
      }
    };
    document.getElementById('btn-weekly-back').onclick = toTitle;
    document.getElementById('btn-preset-back').onclick = function () {
      GH.game.state = 'stageselect';
      renderStageList();
      show('stage-screen');
    };
    document.getElementById('btn-coop').onclick = function () {
      GH.game.coop = !GH.game.coop;
      GH.audio.card();
      document.getElementById('btn-coop').textContent =
        'CO-OP P2: ' + (GH.game.coop ? 'ON (IJKL + O boost + U special)' : 'OFF');
      renderP2Row();
    };
    document.getElementById('btn-launch').onclick = openStageSelect;
    document.getElementById('btn-select-back').onclick = toTitle;
    document.getElementById('btn-stage-back').onclick = function () { enterSelect(GH.game.mode); };
    document.getElementById('btn-resume').onclick = togglePause;
    document.getElementById('btn-quit').onclick = toTitle;
    document.getElementById('btn-retry').onclick = function () {
      if (lastLaunch) lastLaunch();
      else { show(null); launch(chosenStage); }
    };
    document.getElementById('btn-menu').onclick = toTitle;
    var muteBtn = document.getElementById('mute-btn');
    muteBtn.onclick = function () {
      GH.audio.unlock();
      GH.audio.setMuted(!GH.audio.isMuted());
      muteBtn.classList.toggle('off', GH.audio.isMuted());
    };
  }

  // ----------------------------------------------------------------
  var last = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    pollPads();
    if (touchCapable) {
      document.getElementById('touch-ui').classList.toggle('hidden',
        GH.game.state !== 'play' && GH.game.state !== 'race');
    }
    GH.game.update(dt, input, window.innerWidth, window.innerHeight);
    renderer.render(GH.game.scene(), GH.game.camera());
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', boot);
  } else {
    boot(); // scripts injected after parse (e.g. single-file bundle hosts)
  }
})();
