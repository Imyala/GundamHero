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
      if (e.code === 'Space') {
        if (GH.game.state === 'play') { input.boostPressed = true; e.preventDefault(); }
      }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        input.special = true;
        if (GH.game.state === 'play') input.specialPressed = true;
      }
      if (e.code === 'Escape' || e.code === 'KeyP') togglePause();
      if (GH.game.state === 'reward') {
        if (e.code === 'Digit1') GH.game.pickRewardIndex(0);
        if (e.code === 'Digit2') GH.game.pickRewardIndex(1);
        if (e.code === 'Digit3') GH.game.pickRewardIndex(2);
      }
      if (e.code === 'Enter') {
        if (GH.game.state === 'title') enterSelect();
        else if (GH.game.state === 'select') launch();
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
  function show(id) {
    ['title-screen', 'select-screen', 'reward-screen', 'pause-screen', 'end-screen'].forEach(function (s) {
      document.getElementById(s).classList.toggle('hidden', s !== id);
    });
  }

  function enterSelect() {
    GH.audio.card();
    show('select-screen');
    document.getElementById('hud').classList.add('hidden');
    GH.game.enterSelect();
  }

  function launch() {
    GH.audio.wave();
    show(null);
    var devWave = 1;
    try {
      devWave = parseInt(new URLSearchParams(location.search).get('wave') || '1', 10) || 1;
    } catch (e) { /* older browsers */ }
    GH.game.startRun(GH.game.getSelectedMech(), devWave);
  }

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

  function bindUI() {
    document.getElementById('btn-start').onclick = enterSelect;
    document.getElementById('btn-launch').onclick = launch;
    document.getElementById('btn-resume').onclick = togglePause;
    document.getElementById('btn-quit').onclick = function () {
      GH.game.state = 'title';
      document.getElementById('hud').classList.add('hidden');
      show('title-screen');
    };
    document.getElementById('btn-retry').onclick = function () {
      show(null);
      GH.game.startRun(GH.game.getSelectedMech());
    };
    document.getElementById('btn-menu').onclick = function () {
      GH.game.state = 'title';
      show('title-screen');
    };
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
