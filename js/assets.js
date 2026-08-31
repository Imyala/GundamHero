// HERO FRAME — procedural textures & shared materials (no binary assets)
GH.assets = (function () {
  var A = {};

  function canvasTex(size, draw) {
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    draw(c.getContext('2d'), size);
    var t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    return t;
  }

  // chunky cobblestone tile, PS1 style
  function drawCobble(ctx, S, base, dark) {
    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, S, S);
    var cells = 4, cs = S / cells;
    for (var y = 0; y < cells; y++) {
      for (var x = 0; x < cells; x++) {
        var pad = 2 + Math.random() * 3;
        var shade = 0.75 + Math.random() * 0.45;
        ctx.fillStyle = shadeColor(base, shade);
        roundStone(ctx, x * cs + pad, y * cs + pad, cs - pad * 2, cs - pad * 2);
        // speckle
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        for (var i = 0; i < 6; i++) {
          ctx.fillRect(x * cs + Math.random() * cs, y * cs + Math.random() * cs, 2, 2);
        }
      }
    }
  }

  function roundStone(ctx, x, y, w, h) {
    var r = Math.min(w, h) * 0.25;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.fill();
  }

  function shadeColor(hex, mult) {
    var r = GH.clamp(Math.round(((hex >> 16) & 255) * mult), 0, 255);
    var g = GH.clamp(Math.round(((hex >> 8) & 255) * mult), 0, 255);
    var b = GH.clamp(Math.round((hex & 255) * mult), 0, 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  A.init = function () {
    // three floor palettes — arena re-tints as waves progress
    A.floorTex = [
      canvasTex(128, function (ctx, S) { drawCobble(ctx, S, 0x8ab0c8, '#1c3038'); }), // glacier
      canvasTex(128, function (ctx, S) { drawCobble(ctx, S, 0x9a8a70, '#2a2418'); }), // dust keep
      canvasTex(128, function (ctx, S) { drawCobble(ctx, S, 0x9a5848, '#301410'); })  // ember deep
    ];
    for (var i = 0; i < A.floorTex.length; i++) A.floorTex[i].repeat.set(24, 24);

    A.gridTex = canvasTex(64, function (ctx, S) {
      ctx.fillStyle = '#060a2a';
      ctx.fillRect(0, 0, S, S);
      ctx.strokeStyle = '#2a3c9a';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, S - 2, S - 2);
    });
    A.gridTex.repeat.set(30, 30);

    A.shadowTex = (function () {
      var c = document.createElement('canvas');
      c.width = 64; c.height = 64;
      var ctx = c.getContext('2d');
      var g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
      g.addColorStop(0, 'rgba(0,0,0,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();

    A.shadowMat = new THREE.MeshBasicMaterial({
      map: A.shadowTex, transparent: true, depthWrite: false
    });

    // shared flat-shaded material cache by color
    A._mats = {};
  };

  A.mat = function (color, opts) {
    var key = color + '|' + (opts ? JSON.stringify(opts) : '');
    if (!A._mats[key]) {
      var p = { color: color, flatShading: true };
      if (opts) for (var k in opts) p[k] = opts[k];
      A._mats[key] = new THREE.MeshLambertMaterial(p);
    }
    return A._mats[key];
  };

  A.basic = function (color, opts) {
    var key = 'b' + color + '|' + (opts ? JSON.stringify(opts) : '');
    if (!A._mats[key]) {
      var p = { color: color };
      if (opts) for (var k in opts) p[k] = opts[k];
      A._mats[key] = new THREE.MeshBasicMaterial(p);
    }
    return A._mats[key];
  };

  return A;
})();
