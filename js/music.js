// STAALREUS — generative music (WebAudio step sequencer).
// Every track is original and written here as data: a chord progression,
// a bass figure, a composed lead motif, and a drum feel. Nothing is
// sampled or transcribed. The moods take their cues from mecha anime
// scoring — the relentless minor-key march ostinato of a decisive-battle
// cue, the bright major-key drive of an opening theme, the brass fanfare
// of a sortie, the lonely piano-and-strings of a hangar at night — but
// the notes are ours. Layers: bass, pad/brass, lead, arp, drums.
GH.music = (function () {
  var M = {};
  var ctx = null, master = null, padFilter = null, comp = null;
  var running = false, mode = null, cfg = null;
  var step = 0, nextTime = 0, timerId = null;
  var bossLayer = false, muted = false, volume = 0.12;
  var rngState = 1;

  function srand(seed) { rngState = seed >>> 0 || 1; }
  function rnd() {
    rngState ^= rngState << 13; rngState >>>= 0;
    rngState ^= rngState >> 17;
    rngState ^= rngState << 5; rngState >>>= 0;
    return (rngState >>> 0) / 4294967296;
  }

  // scale degrees → semitones
  var MINOR = [0, 2, 3, 5, 7, 8, 10, 12, 14, 15];
  var MAJOR = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16];
  var DORIAN = [0, 2, 3, 5, 7, 9, 10, 12, 14, 15];
  var PENT = [0, 3, 5, 7, 10, 12, 15];

  // A motif is 16 steps of [scaleDegreeIndex | null, lengthInSteps]. Chords
  // are semitone offsets of the root per bar (each bar = 16 steps).
  // 'feel' picks the drum pattern. 'lead' picks the lead voice.
  var SONGS = {
    // title: slow, wide, a lone lead over a two-chord swell — the hangar at night
    title: { root: 55.0, bpm: 66, scale: MINOR, chords: [0, 8, 3, 7], feel: 'none', lead: 'sine', padGain: 0.16, arp: 0.2, seed: 11,
      motif: [[4, 4], null, null, null, [3, 2], null, [2, 2], null, [0, 6], null, null, null, null, null, [1, 2], null] },
    // hangar / menus: calm arpeggio, no drums
    hangar: { root: 65.4, bpm: 80, scale: DORIAN, chords: [0, 5, 10, 3], feel: 'none', lead: 'triangle', padGain: 0.12, arp: 0.5, seed: 17,
      motif: [[0, 2], null, [2, 2], null, [4, 4], null, null, null, [3, 2], null, [2, 2], null, [1, 4], null, null, null] },
    // the decisive-battle cue: relentless staccato brass ostinato in minor, snare on every beat
    battle: { root: 73.4, bpm: 128, scale: MINOR, chords: [0, 0, 8, 7], feel: 'march', lead: 'sawtooth', padGain: 0.07, arp: 0.0, seed: 23, staccato: true,
      motif: [[0, 1], [0, 1], null, [0, 1], [3, 1], null, [0, 1], null, [4, 1], [4, 1], null, [3, 1], [2, 1], null, [0, 1], null],
      ostinato: [0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 5, 7] },
    // sortie: bright major fanfare, driving eighths — an opening theme
    sortie: { root: 82.4, bpm: 138, scale: MAJOR, chords: [0, 9, 5, 7], feel: 'rock', lead: 'square', padGain: 0.09, arp: 0.35, seed: 29,
      motif: [[0, 2], null, [2, 2], null, [4, 3], null, null, [5, 1], [4, 2], null, [2, 2], null, [1, 2], null, [0, 2], null] },
    // race: fast synth pulse, offbeat hats
    race: { root: 98.0, bpm: 150, scale: DORIAN, chords: [0, 0, 3, 5], feel: 'pulse', lead: 'square', padGain: 0.06, arp: 0.7, seed: 37,
      motif: [[0, 1], null, [0, 1], [2, 1], null, [4, 1], null, [2, 1], [0, 1], null, [0, 1], [3, 1], null, [4, 1], [3, 1], null] },
    // victory: a rising brass cadence
    victory: { root: 110.0, bpm: 110, scale: MAJOR, chords: [0, 5, 7, 0], feel: 'march', lead: 'sawtooth', padGain: 0.1, arp: 0.0, seed: 41,
      motif: [[0, 2], [2, 2], [4, 4], null, null, null, [5, 2], [4, 2], [7, 6], null, null, null, null, null, null, null] },
    // zones: each territory keeps a signature, drawn per seed over its own progression
    wreck:   { root: 110.0, bpm: 96, scale: DORIAN, chords: [0, 5, 3, 10], feel: 'beat', lead: 'triangle', padGain: 0.10, arp: 0.5, seed: 21 },
    glacier: { root: 73.4, bpm: 84, scale: MINOR, chords: [0, 3, 8, 7], feel: 'beat', lead: 'sine', padGain: 0.13, arp: 0.42, seed: 31 },
    cloister:{ root: 82.4, bpm: 100, scale: DORIAN, chords: [0, 7, 5, 3], feel: 'beat', lead: 'triangle', padGain: 0.10, arp: 0.55, seed: 41 },
    ember:   { root: 65.4, bpm: 116, scale: MINOR, chords: [0, 1, 0, 7], feel: 'rock', lead: 'sawtooth', padGain: 0.08, arp: 0.62, seed: 51 },
    storm:   { root: 61.7, bpm: 122, scale: MINOR, chords: [0, 5, 6, 7], feel: 'rock', lead: 'square', padGain: 0.09, arp: 0.6, seed: 61 },
    null:    { root: 92.5, bpm: 70, scale: MINOR, chords: [0, 1, 0, 6], feel: 'beat', lead: 'sine', padGain: 0.15, arp: 0.32, seed: 71 },
    hive:    { root: 58.3, bpm: 128, scale: MINOR, chords: [0, 3, 5, 7], feel: 'pulse', lead: 'square', padGain: 0.07, arp: 0.66, seed: 81 },
    ruins:   { root: 77.8, bpm: 78, scale: DORIAN, chords: [0, 10, 8, 7], feel: 'beat', lead: 'triangle', padGain: 0.16, arp: 0.36, seed: 91 },
    keep:    { root: 69.3, bpm: 104, scale: MINOR, chords: [0, 7, 3, 8], feel: 'march', lead: 'sawtooth', padGain: 0.11, arp: 0.5, seed: 101 },
    warrens: { root: 49.0, bpm: 88, scale: MINOR, chords: [0, 1, 3, 0], feel: 'beat', lead: 'sine', padGain: 0.14, arp: 0.3, seed: 111 },
    sky:     { root: 98.0, bpm: 92, scale: MAJOR, chords: [0, 5, 9, 7], feel: 'beat', lead: 'triangle', padGain: 0.18, arp: 0.45, seed: 121 }
  };

  var arpPattern = [], motif = [];

  function ensure() {
    if (ctx) return true;
    try {
      ctx = GH.audio.ctx ? GH.audio.ctx() : new (window.AudioContext || window.webkitAudioContext)();
      comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18; comp.ratio.value = 4;
      master = ctx.createGain();
      master.gain.value = muted ? 0 : volume;
      master.connect(comp); comp.connect(ctx.destination);
      padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 700;
      padFilter.connect(master);
      return true;
    } catch (e) { return false; }
  }

  // zones without a written motif get one drawn from their seed, in their
  // scale, so a territory always plays "its" tune
  function regenPatterns() {
    srand(cfg.seed);
    arpPattern = [];
    for (var i = 0; i < 16; i++) arpPattern.push(rnd() < cfg.arp ? PENT[Math.floor(rnd() * PENT.length)] : null);
    if (cfg.motif) { motif = cfg.motif; return; }
    motif = [];
    var last = 0;
    for (var j = 0; j < 16; j++) {
      if (j % 2 === 0 && rnd() < 0.55) {
        last = Math.max(0, Math.min(7, last + Math.round((rnd() - 0.5) * 4)));
        motif.push([last, rnd() < 0.3 ? 4 : 2]);
      } else motif.push(null);
    }
  }

  function noteFreq(root, semis) { return root * Math.pow(2, semis / 12); }

  function tone(freq, t, dur, type, gain, dest, slide, attack) {
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + (attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  // a brass-ish voice: two detuned saws through the pad filter
  function brass(freq, t, dur, gain) {
    tone(freq * 1.003, t, dur, 'sawtooth', gain, padFilter, 0, 0.04);
    tone(freq * 0.997, t, dur, 'sawtooth', gain * 0.8, padFilter, 0, 0.04);
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
  function kick(t, gain) { tone(120, t, 0.14, 'sine', gain || 0.7, master, 0.3); }
  function snare(t, gain) { drumNoise(t, 0.12, gain || 0.25, 1800); tone(180, t, 0.08, 'triangle', 0.25, master, 0.5); }

  function scheduleStep(s, t) {
    var stepDur = 60 / cfg.bpm / 4;
    var bar = Math.floor(s / 16) % cfg.chords.length;
    var chord = cfg.chords[bar];
    var root = cfg.root;
    var sc = cfg.scale;
    var inBar = s % 16;
    // bass: root on the beat, fifth on the and, an ostinato when written
    if (cfg.ostinato) {
      var ob = cfg.ostinato[inBar];
      tone(noteFreq(root, chord + ob) / 2, t, stepDur * 0.9, 'sawtooth', 0.4);
    } else if (inBar % 4 === 0) {
      tone(noteFreq(root, chord) / 2, t, stepDur * 1.8, 'triangle', 0.5);
    } else if (inBar % 8 === 6 && cfg.feel !== 'none') {
      tone(noteFreq(root, chord + 7) / 2, t, stepDur * 0.9, 'triangle', 0.35);
    }
    // pad / brass: the chord, held for the bar
    if (inBar === 0) {
      var padDur = stepDur * 16;
      var third = sc === MAJOR ? 4 : 3;
      if (cfg.feel === 'march' || bossLayer) {
        brass(noteFreq(root, chord), t, padDur, cfg.padGain);
        brass(noteFreq(root, chord + third), t, padDur, cfg.padGain * 0.7);
        brass(noteFreq(root, chord + 7), t, padDur, cfg.padGain * 0.8);
      } else {
        tone(noteFreq(root, chord) * 1.002, t, padDur, 'sawtooth', cfg.padGain, padFilter);
        tone(noteFreq(root, chord + 7) * 0.998, t, padDur, 'sawtooth', cfg.padGain * 0.8, padFilter);
        tone(noteFreq(root, chord + third), t, padDur, 'triangle', cfg.padGain * 0.6, padFilter);
      }
      if (bossLayer) tone(noteFreq(root, chord + 1), t, padDur, 'sawtooth', cfg.padGain * 0.5, padFilter);
      padFilter.frequency.setValueAtTime(500, t);
      padFilter.frequency.linearRampToValueAtTime(bossLayer || cfg.feel === 'march' ? 1800 : 1000, t + padDur * 0.5);
      padFilter.frequency.linearRampToValueAtTime(500, t + padDur);
    }
    // lead: the motif, transposed onto the bar's chord; every other pass an octave up
    var mn = motif[inBar];
    if (mn) {
      var oct = (Math.floor(s / 64) % 2 === 1 && cfg.feel !== 'none') ? 2 : 1;
      var deg = sc[Math.min(sc.length - 1, mn[0])];
      var ldur = stepDur * mn[1] * (cfg.staccato ? 0.55 : 0.95);
      tone(noteFreq(root * 2 * oct, chord + deg), t, ldur, cfg.lead, cfg.lead === 'sine' ? 0.22 : 0.11, master, 0, cfg.lead === 'sine' ? 0.05 : 0.01);
      if (cfg.feel === 'march') tone(noteFreq(root * 2 * oct, chord + deg) * 0.5, t, ldur, 'triangle', 0.08);
    }
    // arp: colour in the gaps
    var a = arpPattern[inBar];
    if (a !== null && !mn) tone(noteFreq(root * 2, chord + a), t, stepDur * 0.9, 'square', 0.06);
    // drums
    var F = cfg.feel;
    if (F === 'none') return;
    if (F === 'beat') {
      if (inBar % 8 === 0 || (bossLayer && inBar % 8 === 4)) kick(t);
      if (inBar % 8 === 4) snare(t);
      if (inBar % 2 === 1) drumNoise(t, 0.04, bossLayer ? 0.14 : 0.08);
    } else if (F === 'rock') {
      if (inBar % 8 === 0 || inBar % 8 === 5) kick(t);
      if (inBar % 8 === 4) snare(t);
      if (inBar % 2 === 0) drumNoise(t, 0.04, 0.1);
    } else if (F === 'march') {
      if (inBar % 4 === 0) kick(t, 0.6);
      if (inBar % 4 === 2) snare(t, 0.22);
      if (inBar % 16 === 14 || inBar % 16 === 15) snare(t, 0.3); // the roll into the bar
      if (inBar % 2 === 1) drumNoise(t, 0.03, 0.06);
    } else if (F === 'pulse') {
      if (inBar % 4 === 0) kick(t, 0.8);
      if (inBar % 4 === 2) drumNoise(t, 0.06, 0.16, 7000); // offbeat open hat
      if (inBar % 8 === 4) snare(t, 0.2);
      if (inBar % 2 === 1) drumNoise(t, 0.03, 0.08);
    }
    if (bossLayer && inBar % 4 === 2) drumNoise(t, 0.05, 0.1, 9000);
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

  // songId: 'title' | 'hangar' | 'battle' | 'sortie' | 'race' | 'victory' | a zone id
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

  // a short cue that returns to the previous track (victory / sting)
  M.sting = function (songId, seconds) {
    var back = mode;
    M.play(songId);
    setTimeout(function () { if (mode === songId) M.play(back); }, (seconds || 6) * 1000);
  };

  M.stop = function () {
    running = false;
    mode = null;
    if (timerId) { clearInterval(timerId); timerId = null; }
  };

  M.setBoss = function (on) { bossLayer = !!on; };

  M.setMuted = function (m) {
    muted = m;
    if (master) master.gain.value = m ? 0 : volume;
  };
  M.setVolume = function (v) {
    volume = Math.max(0, Math.min(0.4, v));
    if (master && !muted) master.gain.value = volume;
  };
  M.volume = function () { return volume; };

  M.mode = function () { return mode; };
  M.songs = function () { return Object.keys(SONGS); };

  return M;
})();
