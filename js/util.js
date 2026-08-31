// HERO FRAME — small helpers, shared namespace
window.GH = {};

GH.clamp = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
GH.lerp = function (a, b, t) { return a + (b - a) * t; };
GH.rand = function (a, b) { return a + Math.random() * (b - a); };
GH.randInt = function (a, b) { return Math.floor(GH.rand(a, b + 1)); };
GH.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };

GH.angleTo = function (fromX, fromZ, toX, toZ) {
  return Math.atan2(toX - fromX, toZ - fromZ);
};

GH.dist2 = function (ax, az, bx, bz) {
  var dx = ax - bx, dz = az - bz;
  return dx * dx + dz * dz;
};

// shortest-path angle interpolation
GH.lerpAngle = function (a, b, t) {
  var d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
};

GH.fmt1 = function (n) { return (Math.round(n * 10) / 10).toFixed(1); };

// weighted pick: array of {w: weight, ...}
GH.weightedPick = function (arr) {
  var total = 0, i;
  for (i = 0; i < arr.length; i++) total += arr[i].w;
  var r = Math.random() * total;
  for (i = 0; i < arr.length; i++) {
    r -= arr[i].w;
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
};
