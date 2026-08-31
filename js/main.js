// HERO FRAME — boot, renderer, input, screen wiring
(function () {
  var renderer, canvas;
  var PIXEL_SCALE = 3;   // render at 1/3 resolution for the retro look
  var input = {
    keys: {},
    mouseNDC: new THREE.Vector2(0, 0),
    special: false,
    boostPressed: false,
    specialPressed: false
  };
  var chosenStage = 0;

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

  function bindInput() {
    window.addEventListener('keydown', function (e) {
      GH.audio.unlock();
      var k = KEYMAP[e.code];
      if (k) { input.keys[k] = true; e.preventDefault(); }
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
    'reward-screen', 'pause-screen', 'end-screen'];

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

  function launch(stageIdx) {
    GH.audio.wave();
    show(null);
    var devWave = 1;
    try {
      devWave = parseInt(new URLSearchParams(location.search).get('wave') || '1', 10) || 1;
    } catch (e) { /* older browsers */ }
    GH.game.startRun(GH.game.getSelectedMech(), stageIdx, devWave);
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
    document.getElementById('btn-hangar').onclick = openHangar;
    document.getElementById('btn-launch').onclick = openStageSelect;
    document.getElementById('btn-select-back').onclick = toTitle;
    document.getElementById('btn-stage-back').onclick = function () { enterSelect(GH.game.mode); };
    document.getElementById('btn-hangar-back').onclick = toTitle;
    document.getElementById('btn-resume').onclick = togglePause;
    document.getElementById('btn-quit').onclick = toTitle;
    document.getElementById('btn-retry').onclick = function () {
      show(null);
      launch(chosenStage);
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
    GH.game.update(dt, input, window.innerWidth, window.innerHeight);
    renderer.render(GH.game.scene(), GH.game.camera());
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
