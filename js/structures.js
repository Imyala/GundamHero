// HERO FRAME — built territories: the big shapes a zone is made of.
// layout() runs before the ground mesh exists (it appends flat pads and
// records footprints); build() runs after, dropping merged meshes onto
// the field and registering colliders so nothing walks through a wall.
GH.structures = (function () {
  var S = {};
  var T = function () { return GH.terrain; };
  var mat = function (c, o) { return GH.assets.mat(c, o); };
  function box(w, h, d, c) { return new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c)); }
  function cyl(rt, rb, h, c, seg) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 8), mat(c)); }

  // ---------------- layouts ----------------
  S.layout = function (field, lay, rnd) {
    var st = field.biome;
    var out = { zone: field.id, items: [] };
    if (!field.macro) return out; // dungeons of built zones stay plain
    var half = field.half;
    var avoid = function (x, z, r) {
      for (var i = 0; i < field.pads.length; i++) {
        var p = field.pads[i];
        if (p.w !== undefined) continue;
        if (GH.dist2(x, z, p.x, p.z) < (p.r + r + 2) * (p.r + r + 2)) return true;
      }
      return false;
    };
    var pad = function (x, z, r, y) { field.pads.push({ x: x, z: z, r: r, fade: 8, y: y }); };

    if (field.id === 'hive') {
      // a street grid of stacked hab-blocks; the spire at the heart
      var cell = 34, street = 8, bw = cell - street;
      var sp = field.macro.spire;
      for (var gx = -half + 30; gx < half - 30; gx += cell) {
        for (var gz = -half + 30; gz < half - 30; gz += cell) {
          var cx = gx + cell / 2, cz = gz + cell / 2;
          if (GH.dist2(cx, cz, sp.x, sp.z) < (sp.r + 12) * (sp.r + 12)) continue;
          if (avoid(cx, cz, bw / 2)) continue;
          if (rnd() < 0.12) continue; // a plaza now and then
          var tiers = 1 + Math.floor(rnd() * 3);
          var hgt = 6 + rnd() * 16 + (sstep(200, 70, Math.sqrt(cx * cx + cz * cz)) * 18);
          out.items.push({ kind: 'hab', x: cx, z: cz, w: bw * (0.6 + rnd() * 0.4), d: bw * (0.6 + rnd() * 0.4), h: hgt, tiers: tiers, seed: rnd() });
        }
      }
      out.items.push({ kind: 'spire', x: sp.x, z: sp.z, r: sp.r });
      pad(sp.x, sp.z, sp.r + 8, field.raw(sp.x, sp.z));
    } else if (field.id === 'keep') {
      var m = field.macro;
      var sides = 8;
      // curtain wall with towers; gaps where the roads cross (gates lie N and E)
      var gateAngles = lay.gates.filter(function (g) { return !g.arch; }).map(function (g) { return Math.atan2(g.x, g.z); });
      for (var i = 0; i < sides; i++) {
        var a0 = (i / sides) * Math.PI * 2, a1 = ((i + 1) / sides) * Math.PI * 2;
        var segs = 6;
        for (var sIdx = 0; sIdx < segs; sIdx++) {
          var ta = a0 + (a1 - a0) * (sIdx + 0.5) / segs;
          var blocked = gateAngles.some(function (ga) { return Math.abs(((ta - ga + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < 0.09; });
          if (blocked) continue;
          var wx = Math.sin(ta) * m.wallR, wz = Math.cos(ta) * m.wallR;
          out.items.push({ kind: 'wall', x: wx, z: wz, len: (a1 - a0) * m.wallR / segs + 0.4, ang: ta, h: 9 });
        }
        var tx = Math.sin(a0) * m.wallR, tz = Math.cos(a0) * m.wallR;
        out.items.push({ kind: 'tower', x: tx, z: tz, r: 4.5, h: 15 });
        pad(tx, tz, 7, field.raw(tx, tz));
      }
      gateAngles.forEach(function (ga) {
        var bx = Math.sin(ga) * m.moatR, bz = Math.cos(ga) * m.moatR;
        out.items.push({ kind: 'bridge', x: bx, z: bz, ang: ga, len: m.moatW * 2 + 6 });
        field.pads.push({ x: bx, z: bz, r: 6, fade: 4, y: 1.0 });
        var gx2 = Math.sin(ga) * m.wallR, gz2 = Math.cos(ga) * m.wallR;
        out.items.push({ kind: 'gatehouse', x: gx2, z: gz2, ang: ga });
      });
      out.items.push({ kind: 'donjon', x: 0, z: 0 });
      pad(0, 0, 34, field.raw(0, 0) + 0.5);
      for (var b = 0; b < 14; b++) {
        var ba = rnd() * Math.PI * 2, br = 45 + rnd() * 55;
        var bx2 = Math.sin(ba) * br, bz2 = Math.cos(ba) * br;
        if (avoid(bx2, bz2, 8)) continue;
        out.items.push({ kind: 'barracks', x: bx2, z: bz2, ang: rnd() * Math.PI, w: 10 + rnd() * 8, d: 6 + rnd() * 4, h: 4 + rnd() * 3 });
      }
    } else if (field.id === 'ruins') {
      for (var r = 0; r < 26; r++) {
        var rx = (rnd() - 0.5) * (field.size - 90), rz = (rnd() - 0.5) * (field.size - 90);
        if (avoid(rx, rz, 16)) continue;
        var kind = ['colonnade', 'arch', 'wallfrag', 'dome', 'plaza'][Math.floor(rnd() * 5)];
        out.items.push({ kind: kind, x: rx, z: rz, ang: rnd() * Math.PI, seed: rnd() });
        pad(rx, rz, 14, field.raw(rx, rz));
      }
    } else if (field.id === 'warrens') {
      field.macro.caverns.forEach(function (c, ci) {
        if (c.r < 24 || ci === 0 && false) return;
        var n = Math.floor(c.r / 7);
        for (var k = 0; k < n; k++) {
          var ka = rnd() * Math.PI * 2, kr = rnd() * (c.r - 10);
          var kx = c.x + Math.sin(ka) * kr, kz = c.z + Math.cos(ka) * kr;
          if (avoid(kx, kz, 5) || field.solid(kx, kz)) continue;
          out.items.push({ kind: 'habcave', x: kx, z: kz, ang: rnd() * Math.PI, w: 4 + rnd() * 4, d: 4 + rnd() * 3, h: 2.5 + rnd() * 2 });
        }
      });
    } else if (field.id === 'sky') {
      field.macro.islands.forEach(function (isl, ii) {
        if (isl.r < 24) return;
        var n = 1 + Math.floor(isl.r / 18);
        for (var k = 0; k < n; k++) {
          var ka = rnd() * Math.PI * 2, kr = rnd() * (isl.r - 14);
          var kx = isl.x + Math.sin(ka) * kr, kz = isl.z + Math.cos(ka) * kr;
          if (avoid(kx, kz, 6)) continue;
          out.items.push({ kind: ii === 0 && k === 0 ? 'court' : (rnd() < 0.5 ? 'skytower' : 'skyarch'), x: kx, z: kz, ang: rnd() * Math.PI * 2, seed: rnd() });
        }
      });
    }
    return out;
  };
  function sstep(a, b, t) { t = GH.clamp((t - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  // ---------------- meshes + colliders ----------------
  S.build = function (parent, layout) {
    if (!layout || !layout.items.length) return;
    var Tn = T();
    var gy = function (x, z) { return Tn.h(x, z); };
    var buckets = Tn.makeBuckets();
    var add = function (g) { Tn.mergeInto(buckets, g); };
    layout.items.forEach(function (it) {
      var g = new THREE.Group();
      var y = gy(it.x, it.z);
      g.position.set(it.x, y, it.z);
      g.rotation.y = it.ang || 0;
      if (it.kind === 'hab') {
        var w = it.w, d = it.d, hh = it.h / it.tiers;
        for (var t = 0; t < it.tiers; t++) {
          var tw = w * (1 - t * 0.18), td = d * (1 - t * 0.18);
          var block = box(tw, hh, td, t % 2 ? 0x3a3f4c : 0x454a58);
          block.position.y = hh * (t + 0.5);
          g.add(block);
          // window bands
          for (var wb = 0; wb < 2; wb++) {
            var band = box(tw + 0.1, 0.35, td + 0.1, it.seed > 0.5 ? 0xffb050 : 0x60c8ff);
            band.position.y = hh * t + hh * (0.3 + wb * 0.4);
            g.add(band);
          }
        }
        var vent = cyl(1.0, 1.2, 2.2, 0x2a2e38, 6); vent.position.set(w * 0.3, it.h + 1, d * 0.2); g.add(vent);
        Tn.addCollider({ x: it.x, z: it.z, hw: w / 2, hd: d / 2 });
      } else if (it.kind === 'spire') {
        var tiers = 6;
        for (var st = 0; st < tiers; st++) {
          var rr = it.r * (1 - st * 0.14);
          var th = 12 + st * 2;
          var tier = cyl(rr * 0.92, rr, th, st % 2 ? 0x353a48 : 0x424858, 10);
          tier.position.y = st * 12 + th / 2;
          g.add(tier);
          var glow = cyl(rr * 0.93, rr * 0.93, 0.5, 0xffb050, 10); glow.position.y = st * 12 + th * 0.5; g.add(glow);
        }
        var needle = cyl(0.5, 3, 30, 0x555a68, 6); needle.position.y = tiers * 12 + 15; g.add(needle);
        var beacon = new THREE.Mesh(new THREE.OctahedronGeometry(2.5), mat(0xff5030, { emissive: 0xff3020 })); beacon.position.y = tiers * 12 + 31; g.add(beacon);
        Tn.addCollider({ x: it.x, z: it.z, r: it.r });
      } else if (it.kind === 'wall') {
        var wall = box(it.len, it.h, 3, 0x6a6a72); wall.position.y = it.h / 2; g.add(wall);
        for (var m = -1; m <= 1; m += 2) {
          var merl = box(it.len, 1.2, 0.8, 0x5a5a62); merl.position.set(0, it.h + 0.6, m * 1.1); g.add(merl);
        }
        // the collider follows the wall as a chain of discs
        var steps = Math.ceil(it.len / 3);
        for (var cs = 0; cs < steps; cs++) {
          var along = (cs + 0.5) / steps * it.len - it.len / 2;
          Tn.addCollider({ x: it.x + Math.cos(it.ang) * along, z: it.z - Math.sin(it.ang) * along, r: 2.2 });
        }
      } else if (it.kind === 'tower') {
        var tw2 = cyl(it.r, it.r + 0.6, it.h, 0x62626a, 8); tw2.position.y = it.h / 2; g.add(tw2);
        var cap = cyl(it.r + 1.2, it.r + 1.2, 1.4, 0x52525a, 8); cap.position.y = it.h + 0.7; g.add(cap);
        var roof = new THREE.Mesh(new THREE.ConeGeometry(it.r + 0.8, 5, 8), mat(0x7a2a2a)); roof.position.y = it.h + 3.8; g.add(roof);
        Tn.addCollider({ x: it.x, z: it.z, r: it.r + 0.6 });
      } else if (it.kind === 'gatehouse') {
        for (var gs = -1; gs <= 1; gs += 2) {
          var gt = cyl(3.2, 3.6, 13, 0x62626a, 8); gt.position.set(gs * 6.5, 6.5, 0); g.add(gt);
          Tn.addCollider({ x: it.x + Math.cos(it.ang) * gs * 6.5, z: it.z - Math.sin(it.ang) * gs * 6.5, r: 3.6 });
        }
        var lintel = box(13, 3, 3, 0x5a5a62); lintel.position.y = 11; g.add(lintel);
      } else if (it.kind === 'bridge') {
        var deck = box(6, 0.8, it.len, 0x5a5044); deck.position.y = 0.4; g.add(deck);
        for (var rs = -1; rs <= 1; rs += 2) {
          var rail = box(0.4, 1.2, it.len, 0x4a4038); rail.position.set(rs * 2.9, 1.2, 0); g.add(rail);
        }
      } else if (it.kind === 'donjon') {
        var main = box(26, 22, 26, 0x6c6c74); main.position.y = 11; g.add(main);
        var upper = box(14, 12, 14, 0x63636b); upper.position.y = 28; g.add(upper);
        var roof2 = new THREE.Mesh(new THREE.ConeGeometry(11, 9, 4), mat(0x7a2a2a)); roof2.position.y = 38; roof2.rotation.y = Math.PI / 4; g.add(roof2);
        [[-13, -13], [13, -13], [-13, 13], [13, 13]].forEach(function (c) {
          var ct = cyl(3.2, 3.6, 28, 0x62626a, 8); ct.position.set(c[0], 14, c[1]); g.add(ct);
          var cr = new THREE.Mesh(new THREE.ConeGeometry(3.8, 4.5, 8), mat(0x7a2a2a)); cr.position.set(c[0], 30, c[1]); g.add(cr);
        });
        var banner = box(0.3, 8, 4, 0xb02a2a); banner.position.set(0, 26, 8); g.add(banner);
        Tn.addCollider({ x: it.x, z: it.z, hw: 16.5, hd: 16.5 });
      } else if (it.kind === 'barracks') {
        var bb = box(it.w, it.h, it.d, 0x6a5a48); bb.position.y = it.h / 2; g.add(bb);
        var br = new THREE.Mesh(new THREE.ConeGeometry(it.d * 0.75, 2.6, 4), mat(0x4a3a30)); br.position.y = it.h + 1.3; br.rotation.y = Math.PI / 4; br.scale.x = it.w / it.d; g.add(br);
        var ca = Math.cos(it.ang), sa = Math.sin(it.ang);
        var hw = Math.abs(ca) * it.w / 2 + Math.abs(sa) * it.d / 2, hd = Math.abs(sa) * it.w / 2 + Math.abs(ca) * it.d / 2;
        Tn.addCollider({ x: it.x, z: it.z, hw: hw, hd: hd });
      } else if (it.kind === 'colonnade') {
        for (var ci = -3; ci <= 3; ci++) {
          var stand = it.seed * 7 + ci * 3.1;
          var hgt2 = (Math.sin(stand) > -0.3) ? 6 : 1.5 + Math.abs(Math.sin(stand * 2)) * 2;
          var col = cyl(0.7, 0.85, hgt2, 0x8a8a84, 7); col.position.set(ci * 4.5, hgt2 / 2, 0); g.add(col);
          var cx2 = it.x + Math.cos(it.ang) * ci * 4.5, cz2 = it.z - Math.sin(it.ang) * ci * 4.5;
          Tn.addCollider({ x: cx2, z: cz2, r: 0.9 });
        }
        var lint = box(20, 0.9, 1.6, 0x7a7a74); lint.position.set(-2, 6.4, 0); g.add(lint);
      } else if (it.kind === 'arch') {
        for (var ai = -1; ai <= 1; ai += 2) {
          var leg = box(2.2, 8, 2.2, 0x848480); leg.position.set(ai * 5, 4, 0); g.add(leg);
          Tn.addCollider({ x: it.x + Math.cos(it.ang) * ai * 5, z: it.z - Math.sin(it.ang) * ai * 5, r: 1.5 });
        }
        var top = box(12.4, 2.4, 2.2, 0x7a7a74); top.position.y = 9.2; g.add(top);
        var key = box(2, 3.2, 2.4, 0x8a8a84); key.position.y = 9.6; g.add(key);
      } else if (it.kind === 'wallfrag') {
        var len2 = 10 + it.seed * 10, hh2 = 3 + it.seed * 4;
        var frag = box(len2, hh2, 2.4, 0x7e7e78); frag.position.y = hh2 / 2; frag.rotation.z = (it.seed - 0.5) * 0.25; g.add(frag);
        var stub = box(4, hh2 * 0.5, 2.4, 0x7e7e78); stub.position.set(len2 / 2 + 3, hh2 * 0.25, 0); g.add(stub);
        var steps2 = Math.ceil(len2 / 3);
        for (var fs = 0; fs < steps2; fs++) {
          var al2 = (fs + 0.5) / steps2 * len2 - len2 / 2;
          Tn.addCollider({ x: it.x + Math.cos(it.ang) * al2, z: it.z - Math.sin(it.ang) * al2, r: 1.7 });
        }
      } else if (it.kind === 'dome') {
        var dome = new THREE.Mesh(new THREE.SphereGeometry(9, 10, 6, 0, Math.PI * 1.4, 0, Math.PI / 2), mat(0x7a7a74, { side: THREE.DoubleSide }));
        dome.position.y = 1; g.add(dome);
        var ring = cyl(9.5, 10, 2, 0x848480, 10); ring.position.y = 1; g.add(ring);
        Tn.addCollider({ x: it.x, z: it.z, r: 9.5 });
      } else if (it.kind === 'plaza') {
        var slab = cyl(11, 11, 0.5, 0x8a8a84, 12); slab.position.y = 0.2; g.add(slab);
        var stat = box(1.4, 6, 1.4, 0x6a6a64); stat.position.y = 3.2; g.add(stat);
        var figure = GH.models.buildMech({ body: 0x7a7a74, accent: 0x7a7a74, dark: 0x5a5a54, trim: 0x6a6a64, prop: 'lance' });
        figure.scale.setScalar(1.6); figure.position.y = 6.2; g.add(figure);
        Tn.addCollider({ x: it.x, z: it.z, r: 1.6 });
      } else if (it.kind === 'habcave') {
        var hc = box(it.w, it.h, it.d, 0x4a4050); hc.position.y = it.h / 2; g.add(hc);
        var lamp = box(it.w * 0.6, 0.3, 0.3, 0x60e0c0); lamp.position.set(0, it.h * 0.6, it.d / 2 + 0.05); g.add(lamp);
        var ca2 = Math.cos(it.ang), sa2 = Math.sin(it.ang);
        Tn.addCollider({ x: it.x, z: it.z, hw: Math.abs(ca2) * it.w / 2 + Math.abs(sa2) * it.d / 2, hd: Math.abs(sa2) * it.w / 2 + Math.abs(ca2) * it.d / 2 });
      } else if (it.kind === 'skytower') {
        var sh = 10 + it.seed * 14;
        var st2 = cyl(2.2, 2.8, sh, 0xf0f0f4, 8); st2.position.y = sh / 2; g.add(st2);
        var ring2 = cyl(3.2, 3.2, 0.6, 0xe0b050, 8); ring2.position.y = sh * 0.7; g.add(ring2);
        var cap2 = new THREE.Mesh(new THREE.ConeGeometry(3, 4.5, 8), mat(0x60a0e0)); cap2.position.y = sh + 2.2; g.add(cap2);
        Tn.addCollider({ x: it.x, z: it.z, r: 2.9 });
      } else if (it.kind === 'skyarch') {
        for (var sa3 = -1; sa3 <= 1; sa3 += 2) {
          var pl = cyl(1, 1.2, 9, 0xf0f0f4, 8); pl.position.set(sa3 * 4.5, 4.5, 0); g.add(pl);
          Tn.addCollider({ x: it.x + Math.cos(it.ang) * sa3 * 4.5, z: it.z - Math.sin(it.ang) * sa3 * 4.5, r: 1.3 });
        }
        var tp = box(11, 1.4, 1.6, 0xe0b050); tp.position.y = 9.5; g.add(tp);
      } else if (it.kind === 'court') {
        var floor2 = cyl(16, 16, 0.6, 0xf4f4f8, 12); floor2.position.y = 0.25; g.add(floor2);
        for (var cc = 0; cc < 8; cc++) {
          var caa = (cc / 8) * Math.PI * 2;
          var cp = cyl(0.9, 1.1, 11, 0xf0f0f4, 8); cp.position.set(Math.sin(caa) * 13, 5.5, Math.cos(caa) * 13); g.add(cp);
          Tn.addCollider({ x: it.x + Math.sin(caa + it.ang) * 13, z: it.z + Math.cos(caa + it.ang) * 13, r: 1.2 });
        }
        var crown = new THREE.Mesh(new THREE.TorusGeometry(13, 0.8, 6, 16), mat(0xe0b050)); crown.rotation.x = Math.PI / 2; crown.position.y = 11.5; g.add(crown);
        var throne = box(3, 5, 2, 0xe0b050); throne.position.y = 2.8; g.add(throne);
        Tn.addCollider({ x: it.x, z: it.z, r: 1.8 });
      }
      add(g);
    });
    Tn.flushBuckets(buckets, parent);
  };

  return S;
})();
