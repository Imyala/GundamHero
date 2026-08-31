// HERO FRAME — tiny procedural WebAudio SFX
GH.audio = (function () {
  var ctx = null, master = null, muted = false;

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain();
        master.gain.value = 0.25;
        master.connect(ctx.destination);
      } catch (e) { /* audio unavailable */ }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  function tone(freq, dur, type, vol, slide) {
    if (!ctx || muted) return;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(vol || 0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.connect(g); g.connect(master);
    o.start();
    o.stop(ctx.currentTime + dur + 0.02);
  }

  function noise(dur, vol, low) {
    if (!ctx || muted) return;
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var g = ctx.createGain();
    g.gain.value = vol || 0.2;
    var f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = low || 2400;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }

  var S = {
    unlock: ensure,
    shoot: function () { tone(GH.rand(700, 850), 0.07, 'square', 0.10, -400); },
    melee: function () { noise(0.09, 0.14, 3000); },
    hit: function () { tone(GH.rand(180, 240), 0.06, 'square', 0.12, -80); },
    crit: function () { tone(520, 0.09, 'square', 0.16, -300); },
    hurt: function () { tone(140, 0.22, 'sawtooth', 0.24, -70); noise(0.15, 0.2, 900); },
    gem: function () { tone(GH.rand(900, 1100), 0.08, 'sine', 0.14, 300); },
    coin: function () { tone(1200, 0.06, 'square', 0.10, 200); tone(1600, 0.09, 'square', 0.08, 100); },
    heart: function () { tone(600, 0.12, 'sine', 0.16, 250); },
    levelup: function () { tone(500, 0.1, 'square', 0.16, 200); setTimeout(function () { tone(750, 0.14, 'square', 0.16, 250); }, 90); },
    dash: function () { noise(0.18, 0.16, 1400); },
    block: function () { tone(300, 0.05, 'square', 0.16, -100); noise(0.05, 0.12, 4000); },
    explode: function () { noise(0.4, 0.3, 700); tone(90, 0.35, 'sawtooth', 0.2, -40); },
    zap: function () { tone(1400, 0.1, 'sawtooth', 0.08, -900); },
    card: function () { tone(880, 0.1, 'triangle', 0.16, 120); },
    wave: function () { tone(330, 0.16, 'square', 0.14, 60); setTimeout(function () { tone(440, 0.2, 'square', 0.14, 60); }, 140); },
    boss: function () { tone(70, 0.8, 'sawtooth', 0.3, 25); noise(0.6, 0.22, 500); },
    die: function () { tone(220, 0.6, 'sawtooth', 0.28, -160); noise(0.6, 0.3, 800); },
    win: function () { [392, 494, 587, 784].forEach(function (f, i) { setTimeout(function () { tone(f, 0.25, 'triangle', 0.18, 15); }, i * 160); }); }
  };

  S.setMuted = function (m) { muted = m; };
  S.isMuted = function () { return muted; };
  return S;
})();
