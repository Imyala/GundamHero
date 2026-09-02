#!/usr/bin/env node
// Frame balance audit: relative power of every frame vs its lineage base.
// power = geometric mean of DPS and effective HP, nudged by speed.
// Usage: node tools/balance.js [--csv]
var fs = require('fs'), path = require('path');
var root = path.join(__dirname, '..');
global.GH = { clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); } };
GH.meta = { data: { shells: {}, mats: { alloy: 0, cores: 0 }, salvage: 0, victories: {}, world: {}, feats: {}, collection: {} } };
GH.skills = { pilotProgress: function () { return { lvl: 0 }; } };
GH.progress = { masteryTotal: function () { return 0; } };
['mechs.js', 'roster.js'].forEach(function (f) { eval(fs.readFileSync(path.join(root, 'js', f), 'utf8')); });

function dps(def) {
  var w = def.weapon;
  var per = w.damage * (w.count || 1);
  var interval = w.interval;
  if (w.type === 'shot' && w.clip) interval = interval + (w.reload || 0) / w.clip; // reloads amortised
  if (w.aoe) per *= 1 + Math.min(1.2, w.aoe * 0.25);           // splash hits more than one
  if (w.type === 'melee') per *= 1 + Math.min(1, (w.arc || 1) * 0.25) + (w.range - 2.2) * 0.08;
  if (w.type === 'aura') per *= 1.6;                            // hits everything in reach
  var crit = def.stats.crit / 100;
  return per / interval * (1 + crit * 0.6) * (1 + ((def.elemMult || 1) - 1) * 0.4);
}
function ehp(def) {
  var s = def.stats;
  var armorK = 1 + s.armor * 0.06;
  var blockK = 1 / (1 - Math.min(0.6, s.block / 100));
  var steal = 1 + s.lifesteal * 0.012;
  return s.maxHP * armorK * blockK * steal;
}
function power(def) { return Math.sqrt(dps(def) * ehp(def)) * Math.pow(def.stats.speed / 17, 0.35); }

var rows = [];
GH.mechs.forEach(function (m) {
  var base = GH.mechById(m.lineage === 'relic' ? (GH.roster.recipes[m.id] && m.model && m.id) : m.lineage) ;
  rows.push({ id: m.id, name: m.name, lineage: m.lineage, pack: m.pack || (m.kind === 'relic' ? 'relic' : 'base'), mark: m.mark || '-', dps: dps(m), ehp: ehp(m), spd: m.stats.speed, pow: power(m) });
});
var basePow = {};
rows.forEach(function (r) { if (r.pack === 'base') basePow[r.lineage] = r.pow; });
var avgBase = Object.keys(basePow).reduce(function (a, k) { return a + basePow[k]; }, 0) / Object.keys(basePow).length;
rows.forEach(function (r) {
  var m = GH.mechById(r.id);
  r.rel = r.pow / (basePow[m.relicBase || r.lineage] || avgBase); r.relAll = r.pow / avgBase;
});

if (process.argv.indexOf('--csv') !== -1) {
  console.log('id,name,lineage,pack,mark,dps,ehp,speed,power,rel_to_base,rel_to_avg');
  rows.forEach(function (r) { console.log([r.id, r.name, r.lineage, r.pack, r.mark, r.dps.toFixed(1), r.ehp.toFixed(0), r.spd, r.pow.toFixed(1), r.rel.toFixed(3), r.relAll.toFixed(3)].join(',')); });
  process.exit(0);
}
// summary: per pack+mark, min / mean / max of rel_to_base
var groups = {};
rows.forEach(function (r) {
  var k = r.pack + '/' + r.mark;
  (groups[k] = groups[k] || []).push(r.rel);
});
console.log('BASE frames (power, rel to average base):');
rows.filter(function (r) { return r.pack === 'base'; }).forEach(function (r) {
  console.log('  ' + r.name.padEnd(8) + ' dps ' + r.dps.toFixed(1).padStart(6) + '  ehp ' + r.ehp.toFixed(0).padStart(5) + '  pow ' + r.pow.toFixed(1).padStart(6) + '  rel ' + r.relAll.toFixed(2));
});
console.log('\nVARIANTS (power relative to own lineage base):');
Object.keys(groups).sort().forEach(function (k) {
  var g = groups[k]; var mn = Math.min.apply(null, g), mx = Math.max.apply(null, g), mean = g.reduce(function (a, b) { return a + b; }, 0) / g.length;
  console.log('  ' + k.padEnd(16) + ' n=' + String(g.length).padStart(2) + '  min ' + mn.toFixed(2) + '  mean ' + mean.toFixed(2) + '  max ' + mx.toFixed(2));
});
var out = rows.filter(function (r) { return r.pack !== 'base'; }).sort(function (a, b) { return b.rel - a.rel; });
console.log('\nTop 5 / bottom 5 (rel to base):');
out.slice(0, 5).concat(out.slice(-5)).forEach(function (r) { console.log('  ' + r.rel.toFixed(2) + '  ' + r.name + ' (' + r.pack + '/' + r.mark + ')'); });
