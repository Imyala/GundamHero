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
    p2x: 0, p2y: 0, p2Boost: false
  };
  var chosenStage = 0;
  var p2keys = {};

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

  // merge IJKL + first gamepad's left stick into the P2 axis
  function pollP2() {
    var x = (p2keys.d ? 1 : 0) - (p2keys.a ? 1 : 0);
    var y = (p2keys.s ? 1 : 0) - (p2keys.w ? 1 : 0);
    try {
      var pads = navigator.getGamepads ? navigator.getGamepads() : [];
      for (var i = 0; i < pads.length; i++) {
        var gp = pads[i];
        if (!gp || !gp.connected) continue;
        if (Math.abs(gp.axes[0]) > 0.25) x += gp.axes[0];
        if (Math.abs(gp.axes[1]) > 0.25) y += gp.axes[1];
        if (gp.buttons[0] && gp.buttons[0].pressed && !input._gpHeld) {
          input.p2Boost = true;
          input._gpHeld = true;
        } else if (gp.buttons[0] && !gp.buttons[0].pressed) {
          input._gpHeld = false;
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
      if (e.code === 'Space' && GH.game.state === 'play') {
        input.boostPressed = true; e.preventDefault();
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        input.special = true;
        if (GH.game.state === 'play') input.specialPressed = true;
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
  var SCREENS = ['title-screen', 'select-screen', 'stage-screen', 'hangar-screen',
    'weekly-screen', 'reward-screen', 'pause-screen', 'end-screen'];

  function show(id) {
    SCREENS.forEach(function (s) {
      document.getElementById(s).classList.toggle('hidden', s !== id);
    });
  }

  function refreshTitle() {
    document.getElementById('title-salvage').textContent =
      'SALVAGE BANK: ' + GH.meta.data.salvage + '  ·  SHELLS: ' +
      Object.keys(GH.meta.data.shells).length + '/' + GH.mechs.length +
      (GH.meta.data.bestArena ? '  ·  ARENA BEST: WAVE ' + GH.meta.data.bestArena : '');
  }

  function enterSelect(mode) {
    GH.audio.card();
    GH.game.mode = mode;
    show('select-screen');
    document.getElementById('hud').classList.add('hidden');
    GH.game.enterSelect();
  }

  function openStageSelect() {
    if (!GH.game.selectedUnlocked()) return;
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
        (best ? 'best wave ' + best : '') + '</div>';
      if (unlocked) {
        div.onclick = function () { chosenStage = i; launch(i); };
      }
      wrap.appendChild(div);
    });
  }

  var lastLaunch = null;

  function launch(stageIdx) {
    GH.audio.wave();
    show(null);
    var devWave = 1;
    try {
      devWave = parseInt(new URLSearchParams(location.search).get('wave') || '1', 10) || 1;
    } catch (e) { /* older browsers */ }
    lastLaunch = function () {
      show(null);
      GH.game.startRun(GH.game.getSelectedMech(), stageIdx, devWave);
    };
    GH.game.startRun(GH.game.getSelectedMech(), stageIdx, devWave);
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
      'SALVAGE: <span style="color:#fff">' + GH.meta.data.salvage + '</span>';
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
  function togglePause() {
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
    GH.game.state = 'title';
    document.getElementById('hud').classList.add('hidden');
    refreshTitle();
    show('title-screen');
  }

  function bindUI() {
    document.getElementById('btn-start').onclick = function () { enterSelect('classic'); };
    document.getElementById('btn-arena').onclick = function () { enterSelect('arena'); };
    document.getElementById('btn-weekly').onclick = openWeekly;
    document.getElementById('btn-hangar').onclick = openHangar;
    document.getElementById('btn-weekly-back').onclick = toTitle;
    document.getElementById('btn-coop').onclick = function () {
      GH.game.coop = !GH.game.coop;
      GH.audio.card();
      document.getElementById('btn-coop').textContent =
        'CO-OP P2: ' + (GH.game.coop ? 'ON (IJKL + O, or gamepad)' : 'OFF');
    };
    document.getElementById('btn-launch').onclick = openStageSelect;
    document.getElementById('btn-select-back').onclick = toTitle;
    document.getElementById('btn-stage-back').onclick = function () { enterSelect(GH.game.mode); };
    document.getElementById('btn-hangar-back').onclick = toTitle;
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
    pollP2();
    GH.game.update(dt, input, window.innerWidth, window.innerHeight);
    renderer.render(GH.game.scene(), GH.game.camera());
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
