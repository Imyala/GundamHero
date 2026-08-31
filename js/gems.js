// HERO FRAME — gem socket & resonance system
// Every weapon (primary + secondaries) has 4 sockets. Gems give per-socket
// bonuses to that weapon; filling all 4 grants a Resonance decided by the
// exact type counts: 4-of-a-kind (pure), 2+2 (hybrid of both), 4 distinct
// ("Prism"), anything else = dominant type at reduced strength.
GH.gems = (function () {
  var G = {};

  G.types = {
    sol:  { name: 'Sol',  glyph: '☀', color: 0xfff2c8, css: '#fff2c8', hex: '#f5e8c0',
            bonusText: '+4% weapon lifegain', desc: 'White gem of the sun. Hits mend the frame.' },
    pyre: { name: 'Pyre', glyph: '🔥', color: 0xff5030, css: '#ff9070', hex: '#ff5030',
            bonusText: '+10% weapon damage', desc: 'Red gem of flame. Raw damage.' },
    keen: { name: 'Keen', glyph: '👁', color: 0x50b8ff, css: '#90d0ff', hex: '#50b8ff',
            bonusText: '+6% speed, +4% crit', desc: 'Blue gem of the eye. Speed and precision.' },
    verd: { name: 'Verd', glyph: '🌿', color: 0x50e070, css: '#90f0a0', hex: '#50e070',
            bonusText: '+6% attack speed, sparks+', desc: 'Green gem of growth. Feeds on sparks.' },
    ruin: { name: 'Ruin', glyph: '☠', color: 0xc060ff, css: '#d0a0ff', hex: '#c060ff',
            bonusText: '+12% crit damage', desc: 'Purple gem of endings. Cruel criticals.' }
  };
  G.typeIds = ['sol', 'pyre', 'keen', 'verd', 'ruin'];

  // Pure (4-of-a-kind) resonances
  G.resonances = {
    sol: {
      name: 'SANCTITY', short: 'Reloads and swings smite nearby foes and mend 6 HP.',
      // handled in game.js: onReload/onVolley -> smite
    },
    pyre: {
      name: 'IMMOLATE', short: 'Hits ignite. Burn damage scales with your crit chance.'
    },
    keen: {
      name: 'FRAGMENT', short: 'This weapon fires a triple spreadshot at 65% damage.'
    },
    verd: {
      name: 'SPOREBLOOM', short: 'Kills may leave a shrub that showers sparks.'
    },
    ruin: {
      name: 'DETONATE', short: '20% chance hits explode for force damage.'
    },
    prism: {
      name: 'PRISM', short: 'Every 6s: a piercing prismatic blast knocks the swarm back.'
    }
  };

  // classify 4 socketed gem type ids -> {kind:'pure'|'hybrid'|'prism'|'mixed', types:[...]}
  G.classify = function (sockets) {
    if (sockets.length < 4) return null;
    var counts = {};
    sockets.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; });
    var keys = Object.keys(counts);
    if (keys.length === 1) return { kind: 'pure', types: [keys[0]] };
    if (keys.length === 2 && counts[keys[0]] === 2) return { kind: 'hybrid', types: keys.slice() };
    if (keys.length === 4) return { kind: 'prism', types: keys.slice() };
    // 3+1 or 2+1+1: dominant type, weaker
    keys.sort(function (a, b) { return counts[b] - counts[a]; });
    return { kind: 'mixed', types: [keys[0]] };
  };

  G.resonanceLabel = function (cls) {
    if (!cls) return '';
    if (cls.kind === 'prism') return G.resonances.prism.name;
    if (cls.kind === 'hybrid') {
      return G.resonances[cls.types[0]].name + ' + ' + G.resonances[cls.types[1]].name;
    }
    return G.resonances[cls.types[0]].name + (cls.kind === 'mixed' ? ' (minor)' : '');
  };

  // per-socket stat application onto a weapon instance's modifier block
  G.applySocketBonuses = function (inst) {
    var m = { damageMult: 1, atkSpdMult: 1, crit: 0, critMult: 0, lifegain: 0, projSpd: 1, sparkBonus: 0 };
    inst.sockets.forEach(function (t) {
      if (t === 'sol') m.lifegain += 0.04;
      else if (t === 'pyre') m.damageMult += 0.10;
      else if (t === 'keen') { m.projSpd += 0.06; m.crit += 4; }
      else if (t === 'verd') { m.atkSpdMult += 0.06; m.sparkBonus += 0.1; }
      else if (t === 'ruin') m.critMult += 0.12;
    });
    inst.mods = m;
    inst.resonance = G.classify(inst.sockets);
  };

  return G;
})();
