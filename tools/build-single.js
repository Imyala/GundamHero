#!/usr/bin/env node
// Build a single-file playable HTML bundle of HERO FRAME.
// Inlines the stylesheet and every script (vendored Three.js included) so the
// result runs anywhere a lone .html can be opened or hosted.
// Usage: node tools/build-single.js [outfile]
var fs = require('fs');
var path = require('path');

var root = path.join(__dirname, '..');
var out = process.argv[2] || path.join(root, 'dist', 'heroframe.html');

var html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

// inline the stylesheet
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, function (_, href) {
  var css = fs.readFileSync(path.join(root, href), 'utf8');
  return '<style>\n' + css + '\n</style>';
});

// inline every script, preserving order
html = html.replace(/<script src="([^"]+)"><\/script>/g, function (_, src) {
  var js = fs.readFileSync(path.join(root, src), 'utf8');
  // a lone </script> inside JS source would end the tag early
  js = js.replace(/<\/script/gi, '<\\/script');
  return '<script>\n' + js + '\n</script>';
});

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log('wrote ' + out + ' (' + Math.round(fs.statSync(out).size / 1024) + ' KB)');
