// HERO FRAME — generative music loops (WebAudio step sequencer).
// All patterns are procedurally generated from per-stage seeds at runtime;
// nothing is sampled or transcribed. Layers: bass, pad, arp, drums.
GH.music = (function () {
  var M = {};
  var ctx = null, master = null, padFilter = null;
  var running = false, mode = null, cfg = null;
  var step = 0, nextTime = 0, timerId = null;
  var bossLayer = false, muted = false;
  var rngState = 1;

  // deterministic per-song randomness so a stage always plays "its" tune
  function srand(seed) { rngState = seed >>> 0 || 1; }
  function rnd() {
    rngState ^= rngState << 13; rngState >>>= 0;
    rngState ^= rngState >> 17;
    rngState ^= rngState << 5; rngState >>>= 0;
    return (rngState >>> 0) / 4294967296;
  }

  var PENT = [0, 3, 5, 7, 10, 12, 15];

  // per-context song configs (original, generated moods)
  var SONGS = {
    title:   { root: 55.0, bpm: 64, seed: 11, dense: 0.25, padGain: 0.16, drum: false },
    wreck:   { root: 110.0, bpm: 96, seed: 21, dense: 0.5, padGain: 0.10, drum: true },
    glacier: { root: 73.4, bpm: 84, seed: 31, dense: 0.42, padGain: 0.13, drum: true },
    cloister:{ root: 82.4, bpm: 100, seed: 41, dense: 0.55, padGain: 0.10, drum: true },
    ember:   { root: 65.4, bpm: 116, seed: 51, dense: 0.62, padGain: 0.08, drum: true },
    storm:   { root: 61.7, bpm: 122, seed: 61, dense: 0.6, padGain: 0.09, drum: true },
    null:    { root: 92.5, bpm: 70, seed: 71, dense: 0.32, padGain: 0.15, drum: true }
  };

  var arpPattern = [], bassPattern = [];

  function ensure() {
    if (ctx) return true;
    try {
      ctx = GH.audio.ctx ? GH.audio.ctx() : new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.12;
      master.connect(ctx.destination);
      padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 700;
      padFilter.connect(master);
      return true;
    } catch (e) { return false; }
  }

  function regenPatterns() {
    srand(cfg.seed);
    arpPattern = []; bassPattern = [];
    for (var i = 0; i < 16; i++) {
      arpPattern.push(rnd() < cfg.dense ? PENT[Math.floor(rnd() * PENT.length)] : null);
      bassPattern.push(i % 4 === 0 ? 0 : (rnd() < 0.3 ? (rnd() < 0.5 ? 7 : 5) : null));
    }
  }

  function noteFreq(root, semis) { return root * Math.pow(2, semis / 12); }

  function tone(freq, t, dur, type, gain, dest, slide) {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  function drumNoise(t, dur, gain, freq) {
    var len = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = freq || 5000;
    var g = ctx.createGain();
    g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t);
  }

  function scheduleStep(s, t) {
    var stepDur = 60 / cfg.bpm / 4;
    // bass
    var b = bassPattern[s % 16];
    if (b !== null) tone(noteFreq(cfg.root, b) / 2, t, stepDur * 1.8, 'triangle', 0.5);
    // arp
    var a = arpPattern[s % 16];
    if (a !== null) tone(noteFreq(cfg.root * 2, a), t, stepDur * 0.9, 'square', 0.09);
    // pad: hold root + fifth at bar start
    if (s % 16 === 0) {
      var padDur = stepDur * 16;
      tone(noteFreq(cfg.root, 0) * 1.002, t, padDur, 'sawtooth', cfg.padGain, padFilter);
      tone(noteFreq(cfg.root, 7) * 0.998, t, padDur, 'sawtooth', cfg.padGain * 0.8, padFilter);
      if (bossLayer) tone(noteFreq(cfg.root, 1), t, padDur, 'sawtooth', cfg.padGain * 0.5, padFilter);
      padFilter.frequency.setValueAtTime(500, t);
      padFilter.frequency.linearRampToValueAtTime(bossLayer ? 1600 : 1000, t + padDur * 0.5);
      padFilter.frequency.linearRampToValueAtTime(500, t + padDur);
    }
    // drums
    if (cfg.drum) {
      if (s % 8 === 0 || (bossLayer && s % 8 === 4)) {
        tone(120, t, 0.14, 'sine', 0.7, master, 0.3); // kick
      }
      if (s % 8 === 4) drumNoise(t, 0.12, 0.25, 1800); // snare-ish
      if (s % 2 === 1) drumNoise(t, 0.04, bossLayer ? 0.14 : 0.08); // hats
      if (bossLayer && s % 4 === 2) drumNoise(t, 0.05, 0.1, 9000);
    }
  }

  function tick() {
    if (!running || !ctx) return;
    var stepDur = 60 / cfg.bpm / 4;
    while (nextTime < ctx.currentTime + 0.25) {
      scheduleStep(step, Math.max(nextTime, ctx.currentTime + 0.01));
      nextTime += stepDur;
      step++;
    }
  }

  // mode: 'title' | stage id | null (stop). bossOn toggles the intensity layer.
  M.play = function (songId) {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    var song = SONGS[songId] || SONGS.title;
    if (mode === songId && running) return;
    mode = songId;
    cfg = song;
    regenPatterns();
    step = 0;
    nextTime = ctx.currentTime + 0.05;
    if (!running) {
      running = true;
      timerId = setInterval(tick, 100);
    }
  };

  M.stop = function () {
    running = false;
    mode = null;
    if (timerId) { clearInterval(timerId); timerId = null; }
  };

  M.setBoss = function (on) { bossLayer = !!on; };

  M.setMuted = function (m) {
    muted = m;
    if (master) master.gain.value = m ? 0 : 0.12;
  };

  M.mode = function () { return mode; };

  return M;
})();
