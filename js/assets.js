// STAALREUS — procedural textures, PSX material patch, shared materials.
// Everything is generated at runtime on canvases; no binary assets.
GH.assets = (function () {
  var A = {};
  A.PSX_SNAP = 1; // 1 = snap verts to the real render pixel grid; 0 disables.
  // the snap grid tracks the render target: snapping to a coarser grid than
  // the framebuffer made every mesh lurch several pixels as the camera moved
  A.snap = { value: new THREE.Vector2(320, 180) };
  A.setSnap = function (w, h) { A.snap.value.set(Math.max(1, w / 2), Math.max(1, h / 2)); };

  function makeCanvas(size) {
    var c = document.createElement('canvas');
    c.width = size; c.height = size;
    return c;
  }

  function texFromCanvas(c, repeat, mip) {
    var t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter;
    // mipmapped minification (POT canvases only): distant ground stops
    // shimmering and crawling as the camera tracks forward/back
    t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.NearestFilter;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    if (repeat) t.repeat.set(repeat, repeat);
    return t;
  }

  function shadeColor(hex, mult) {
    var r = GH.clamp(Math.round(((hex >> 16) & 255) * mult), 0, 255);
    var g = GH.clamp(Math.round(((hex >> 8) & 255) * mult), 0, 255);
    var b = GH.clamp(Math.round((hex & 255) * mult), 0, 255);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // ---- chunky cobblestone with mortar gaps + baked edge shading ----
  function cobbleCanvas(S, base, mortar, dark) {
    var c = makeCanvas(S), ctx = c.getContext('2d');
    ctx.fillStyle = mortar;
    ctx.fillRect(0, 0, S, S);
    var rows = 4;
    var rh = S / rows;
    for (var y = 0; y < rows; y++) {
      var offset = (y % 2) * (rh * 0.5);
      var x = -offset;
      while (x < S) {
        var w = rh * GH.rand(0.85, 1.35);
        drawStone(ctx, x, y * rh, w, rh, base, dark);
        // wrap-around piece for seamless tiling
        if (x + w > S) drawStone(ctx, x - S, y * rh, w, rh, base, dark);
        x += w;
      }
    }
    // dither noise
    var img = ctx.getImageData(0, 0, S, S), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var n = (Math.random() - 0.5) * 18;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  function drawStone(ctx, x, y, w, h, base, dark) {
    var pad = 2.5;
    var shade = 0.72 + Math.random() * 0.5;
    var sx = x + pad, sy = y + pad, sw = w - pad * 2, sh = h - pad * 2;
    // dark under-edge (fake depth, light from top-left)
    ctx.fillStyle = dark;
    roundRect(ctx, sx + 1.5, sy + 1.5, sw, sh, Math.min(sw, sh) * 0.28);
    ctx.fill();
    // face
    ctx.fillStyle = shadeColor(base, shade);
    roundRect(ctx, sx, sy, sw, sh, Math.min(sw, sh) * 0.28);
    ctx.fill();
    // top-left highlight sliver
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    roundRect(ctx, sx, sy, sw, sh * 0.28, Math.min(sw, sh) * 0.28);
    ctx.fill();
    // cracks/speckle
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    for (var i = 0; i < 5; i++) {
      ctx.fillRect(sx + Math.random() * sw, sy + Math.random() * sh, 2, 2);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w <= 0 || h <= 0) return;
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---- cliff/wall strata texture ----
  function wallCanvas(S, base, top) {
    var c = makeCanvas(S), ctx = c.getContext('2d');
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, S, S);
    // horizontal strata bands
    for (var y = 0; y < S;) {
      var h = GH.rand(6, 16);
      ctx.fillStyle = 'rgba(0,0,0,' + GH.rand(0.05, 0.3) + ')';
      ctx.fillRect(0, y, S, h);
      // band cracks
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      for (var i = 0; i < 5; i++) {
        ctx.fillRect(Math.random() * S, y + h - 2, GH.rand(4, 20), 2);
      }
      y += h + GH.rand(2, 5);
    }
    // dark gradient toward top (reads as depth/overhang)
    var g = ctx.createLinearGradient(0, 0, 0, S);
    g.addColorStop(0, top);
    g.addColorStop(0.45, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return c;
  }

  // ---- vertical sky gradient ----
  function skyCanvas(colors) {
    var c = document.createElement('canvas');
    c.width = 4; c.height = 128;
    var ctx = c.getContext('2d');
    var g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, colors[0]);
    g.addColorStop(0.55, colors[1]);
    g.addColorStop(1, colors[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 128);
    var t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.LinearFilter;
    t.minFilter = THREE.LinearFilter;
    return t;
  }

  // ---- biome ground detail: tiling noise sheets, one per surface ----
  function groundCanvas(kind) {
    var S = 128;
    var c = makeCanvas(S), ctx = c.getContext('2d');
    var base = { sand: '#d8c08a', snow: '#f0f4fa', moss: '#5a7a3a', basalt: '#3a3234', slate: '#6a6e80', void: '#9a92aa' }[kind] || '#888';
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, S, S);
    var img = ctx.getImageData(0, 0, S, S), d = img.data;
    for (var y = 0; y < S; y++) {
      for (var x = 0; x < S; x++) {
        var i = (y * S + x) * 4;
        var n = (Math.random() - 0.5) * 22;
        if (kind === 'sand') {
          // wind ripples: soft diagonal bands
          n += Math.sin((x * 0.7 + y * 0.35) * 0.55) * 14;
        } else if (kind === 'snow') {
          n *= 0.5;
          n += Math.sin(x * 0.4) * Math.sin(y * 0.37) * 5;
        } else if (kind === 'moss') {
          n += (Math.random() < 0.08 ? 26 : 0) - 6;
        } else if (kind === 'basalt') {
          // cracked plates: dark seams on a grid, warm speckle
          if ((x % 32) < 2 || (y % 32) < 2) n -= 30;
          if (Math.random() < 0.03) { d[i] += 40; }
        } else if (kind === 'slate') {
          n += ((y % 16) < 2 ? -22 : 0) + Math.sin(x * 0.9) * 4;
        } else if (kind === 'void') {
          if ((x % 16) === 0 || (y % 16) === 0) n -= 26;
          if (Math.random() < 0.02) { d[i + 2] += 60; }
        }
        d[i] += n; d[i + 1] += n; d[i + 2] += n;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  A.init = function () {
    A._mats = {};
    A.stageTex = {};
    A.groundTex = {};
    ['sand', 'snow', 'moss', 'basalt', 'slate', 'void'].forEach(function (k) {
      A.groundTex[k] = texFromCanvas(groundCanvas(k), 1, true);
    });
    GH.stages.concat(GH.extraZones || []).forEach(function (st) {
      A.stageTex[st.id] = {
        floor: texFromCanvas(cobbleCanvas(128, st.floor.base, st.floor.mortar, st.floor.dark), 20, true),
        wall: texFromCanvas(wallCanvas(128, st.wall.base, st.wall.top)),
        sky: skyCanvas(st.sky)
      };
      A.stageTex[st.id].wall.repeat.set(16, 1);
    });

    A.gridTex = texFromCanvas((function () {
      var c = makeCanvas(64), ctx = c.getContext('2d');
      ctx.fillStyle = '#060a2a';
      ctx.fillRect(0, 0, 64, 64);
      ctx.strokeStyle = '#2a3c9a';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 62, 62);
      return c;
    })(), 30);

    A.selectSky = skyCanvas(['#101a4a', '#050818', '#000002']);

    A.shadowTex = (function () {
      var c = makeCanvas(64), ctx = c.getContext('2d');
      var g = ctx.createRadialGradient(32, 32, 4, 32, 32, 30);
      g.addColorStop(0, 'rgba(0,0,0,0.5)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    A.shadowMat = new THREE.MeshBasicMaterial({ map: A.shadowTex, transparent: true, depthWrite: false });

    A.flashTex = (function () {
      var c = makeCanvas(32), ctx = c.getContext('2d');
      var g = ctx.createRadialGradient(16, 16, 1, 16, 16, 15);
      g.addColorStop(0, 'rgba(255,255,230,1)');
      g.addColorStop(0.4, 'rgba(255,210,90,0.9)');
      g.addColorStop(1, 'rgba(255,120,20,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 32, 32);
      return new THREE.CanvasTexture(c);
    })();
  };

  // PSX vertex-snap injection: quantize clip-space verts for that r-era jitter
  function psxPatch(mat) {
    if (!A.PSX_SNAP) return mat;
    mat.onBeforeCompile = function (shader) {
      shader.uniforms.uSnap = A.snap;
      shader.vertexShader = 'uniform vec2 uSnap;\n' + shader.vertexShader.replace(
        '#include <project_vertex>',
        '#include <project_vertex>\n' +
        'gl_Position.xy = floor(gl_Position.xy / gl_Position.w * uSnap) / uSnap * gl_Position.w;'
      );
    };
    return mat;
  }

  A.mat = function (color, opts) {
    var key = color + '|' + (opts ? JSON.stringify(opts) : '');
    if (!A._mats[key]) {
      var p = { color: color, flatShading: true };
      if (opts) for (var k in opts) p[k] = opts[k];
      A._mats[key] = psxPatch(new THREE.MeshLambertMaterial(p));
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

  // opts.nosnap skips the PSX vertex quantizer — required for huge
  // surfaces like the ground plane, where snapping the few far-flung
  // corners makes the whole world lurch in steps whenever the camera
  // tracks toward or away from them (vertical movement judder)
  A.lambert = function (params, opts) {
    var m = new THREE.MeshLambertMaterial(params);
    return (opts && opts.nosnap) ? m : psxPatch(m);
  };

  // shared unit geometries for pooled short-lived meshes (scaled per use)
  A.geo = {
    cone: new THREE.ConeGeometry(1, 3.2, 5),
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(1, 6, 5)
  };

  return A;
})();
