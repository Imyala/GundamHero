// HERO FRAME — world life: the loops that make the Reach worth living in.
// Borrowed shapes, not content:
//   RuneScape  — Achievement Diaries (per-area task ladders paying area
//                perks), daily challenges, slayer-style hunt tasks.
//   Albion     — zone tiers as risk/reward (higher danger = richer
//                resources), gathering nodes in the open world, random
//                treasure sites worth a detour.
// Everything here is state in GH.meta.data plus pure functions; game.js
// reports events, main.js renders the boards.
GH.worldlife = (function () {
  var L = {};

  function day() { return GH.world && GH.world.dayStamp ? GH.world.dayStamp() : new Date().toISOString().slice(0, 10); }
  function seeded(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    var s = h >>> 0 || 1;
    return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function zoneName(id) { return GH.world && GH.world.stageFor ? GH.world.stageFor(id).name : id; }
  function zoneDanger(id) {
    if (!GH.world) return 1;
    for (var i = 0; i < GH.world.ZONES.length; i++) if (GH.world.ZONES[i].id === id) return GH.world.ZONES[i].danger;
    return 1;
  }
  // dungeons report to their parent territory
  L.rootZone = function (zoneId) {
    if (!zoneId) return 'wreck';
    var dg = GH.dungeons && GH.dungeons.parseId ? GH.dungeons.parseId(zoneId) : null;
    return dg ? dg.zone : zoneId;
  };

  // =================================================================
  // ZONE DIARIES — four tiers per territory
  // =================================================================
  L.TIERS = [
    { id: 'easy', name: 'EASY', reward: { alloy: 40, cores: 0, salvage: 60 }, perk: null,
      tasks: [['kills', 25, 'Destroy 25 hostiles here'], ['nodes', 3, 'Mine 3 alloy veins here'], ['driveT', 45, 'Drive 45 s in vehicle form here']] },
    { id: 'medium', name: 'MEDIUM', reward: { alloy: 100, cores: 1, salvage: 150 }, perk: null,
      tasks: [['kills', 120, 'Destroy 120 hostiles here'], ['elites', 5, 'Destroy 5 elites here'], ['nests', 1, 'Break a nest here'], ['caches', 1, 'Open a dungeon reward cache here']] },
    { id: 'hard', name: 'HARD', reward: { alloy: 220, cores: 3, salvage: 300 }, perk: { salvage: 1.1, label: '+10% salvage here' },
      tasks: [['kills', 350, 'Destroy 350 hostiles here'], ['nests', 3, 'Break 3 nests here'], ['tier', 2, 'Ascend a dungeon here to tier 2'], ['signals', 3, 'Recover 3 cache signals here']] },
    { id: 'elite', name: 'ELITE', reward: { alloy: 420, cores: 6, salvage: 600 }, perk: { alloy: 1.25, label: '+25% alloy here' },
      tasks: [['kills', 900, 'Destroy 900 hostiles here'], ['elites', 30, 'Destroy 30 elites here'], ['tier', 3, 'Ascend a dungeon here to tier 3'], ['caches', 4, 'Open 4 dungeon reward caches here']] }
  ];

  function diary(zone) {
    var d = GH.meta.data;
    d.diary = d.diary || {};
    if (!d.diary[zone]) d.diary[zone] = { kills: 0, elites: 0, nests: 0, caches: 0, nodes: 0, driveT: 0, tier: 0, signals: 0, done: {} };
    return d.diary[zone];
  }
  L.diary = diary;

  L.diaryProgress = function (zone) {
    var st = diary(zone);
    var tiers = L.TIERS.map(function (t) {
      var tasks = t.tasks.map(function (tk) {
        var have = st[tk[0]] || 0;
        return { kind: tk[0], need: tk[1], desc: tk[2], have: Math.min(have, tk[1]), done: have >= tk[1] };
      });
      return { id: t.id, name: t.name, tasks: tasks, done: !!st.done[t.id], reward: t.reward, perk: t.perk,
        complete: tasks.every(function (x) { return x.done; }) };
    });
    var n = 0; tiers.forEach(function (t) { if (t.done) n++; });
    return { tiers: tiers, doneTiers: n, total: L.TIERS.length };
  };

  // report a thing that happened in a zone; pays out any tier just finished
  L.zoneEvent = function (zoneId, kind, n) {
    var zone = L.rootZone(zoneId);
    var st = diary(zone);
    if (kind === 'tier') st.tier = Math.max(st.tier, n);
    else st[kind] = (st[kind] || 0) + (n === undefined ? 1 : n);
    var paid = [];
    L.TIERS.forEach(function (t) {
      if (st.done[t.id]) return;
      var ok = t.tasks.every(function (tk) { return (st[tk[0]] || 0) >= tk[1]; });
      if (!ok) return;
      st.done[t.id] = true;
      GH.meta.data.mats.alloy += t.reward.alloy;
      GH.meta.data.mats.cores += t.reward.cores;
      GH.meta.data.salvage += t.reward.salvage;
      paid.push({ zone: zone, name: zoneName(zone), tier: t });
    });
    if (paid.length || kind !== 'driveT') GH.meta.save();
    return paid;
  };

  L.zonePerk = function (zoneId) {
    var st = diary(L.rootZone(zoneId));
    var out = { salvage: 1, alloy: 1, labels: [] };
    L.TIERS.forEach(function (t) {
      if (!st.done[t.id] || !t.perk) return;
      if (t.perk.salvage) out.salvage *= t.perk.salvage;
      if (t.perk.alloy) out.alloy *= t.perk.alloy;
      out.labels.push(t.perk.label);
    });
    return out;
  };

  L.diaryTotal = function () {
    var done = 0, total = 0;
    (GH.world ? GH.world.ZONES : []).forEach(function (z) { var p = L.diaryProgress(z.id); done += p.doneTiers; total += p.total; });
    return { done: done, total: total };
  };

  // =================================================================
  // DAILY TASK BOARD — three a day, a streak for the sweep
  // =================================================================
  var DAILY_POOL = [
    { id: 'kills', need: 150, desc: 'Destroy 150 hostiles (anywhere)', reward: { alloy: 30 } },
    { id: 'elites', need: 6, desc: 'Destroy 6 elites', reward: { alloy: 40, cores: 1 } },
    { id: 'nodes', need: 5, desc: 'Mine 5 alloy veins in the Reach', reward: { alloy: 40 } },
    { id: 'driveT', need: 120, desc: 'Drive 120 s in vehicle form', reward: { alloy: 30 } },
    { id: 'drift', need: 12, desc: 'Pay out 12 drift turbos', reward: { alloy: 35 } },
    { id: 'nests', need: 1, desc: 'Break a nest', reward: { alloy: 40, cores: 1 } },
    { id: 'caches', need: 1, desc: 'Open a dungeon reward cache', reward: { cores: 1 } },
    { id: 'races', need: 1, desc: 'Finish a race or duel', reward: { alloy: 50 } },
    { id: 'wave10', need: 1, desc: 'Reach wave 10 in CLASSIC or ARENA', reward: { alloy: 40 } },
    { id: 'build', need: 1, desc: 'Build a frame or a vehicle in the workshop', reward: { cores: 1 } },
    { id: 'alloy', need: 60, desc: 'Pick up 60 alloy', reward: { salvage: 150 } },
    { id: 'signals', need: 2, desc: 'Recover 2 cache signals', reward: { alloy: 45 } },
    { id: 'contract', need: 1, desc: "Fill a Broker contract", reward: { alloy: 45, cores: 1 } }
  ];
  L.SWEEP_BONUS = { cores: 1, alloyPerStreakDay: 10, streakCap: 10 };

  function dailyState() {
    var d = GH.meta.data;
    var today = day();
    if (!d.daily || d.daily.day !== today) {
      var rnd = seeded('daily:' + today);
      var pool = DAILY_POOL.slice(), picks = [];
      for (var i = 0; i < 3; i++) picks.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0].id);
      var prev = d.daily;
      // a streak survives one missed day, no more
      var streak = prev && prev.sweptDay ? (dayDiff(prev.sweptDay, today) <= 2 ? prev.streak || 0 : 0) : 0;
      d.daily = { day: today, picks: picks, have: {}, claimed: {}, streak: streak, sweptDay: prev ? prev.sweptDay : null };
      GH.meta.save();
    }
    return d.daily;
  }
  function dayDiff(a, b) { return Math.round((new Date(b) - new Date(a)) / 86400000); }

  L.daily = function () {
    var st = dailyState();
    var tasks = st.picks.map(function (id) {
      var t = null; DAILY_POOL.forEach(function (x) { if (x.id === id) t = x; });
      var have = st.have[id] || 0;
      return { id: id, desc: t.desc, need: t.need, have: Math.min(have, t.need), done: have >= t.need, claimed: !!st.claimed[id], reward: t.reward };
    });
    var swept = tasks.every(function (t) { return t.claimed; });
    return { day: st.day, tasks: tasks, streak: st.streak || 0, swept: swept, sweptToday: st.sweptDay === st.day };
  };

  // report progress toward today's board; returns tasks that just completed
  L.dailyEvent = function (kind, n) {
    var st = dailyState();
    if (st.picks.indexOf(kind) === -1) return [];
    var before = st.have[kind] || 0;
    st.have[kind] = before + (n === undefined ? 1 : n);
    var t = null; DAILY_POOL.forEach(function (x) { if (x.id === kind) t = x; });
    if (kind !== 'driveT') GH.meta.save();
    return (before < t.need && st.have[kind] >= t.need) ? [t] : [];
  };

  L.claimDaily = function (id) {
    var st = dailyState();
    var t = null; DAILY_POOL.forEach(function (x) { if (x.id === id) t = x; });
    if (!t || st.claimed[id] || (st.have[id] || 0) < t.need) return null;
    st.claimed[id] = true;
    var m = GH.meta.data.mats;
    m.alloy += t.reward.alloy || 0; m.cores += t.reward.cores || 0; GH.meta.data.salvage += t.reward.salvage || 0;
    var out = { reward: t.reward, sweep: null };
    var all = st.picks.every(function (pid) { return st.claimed[pid]; });
    if (all && st.sweptDay !== st.day) {
      st.streak = (st.streak || 0) + 1;
      st.sweptDay = st.day;
      var bonusAlloy = Math.min(L.SWEEP_BONUS.streakCap, st.streak) * L.SWEEP_BONUS.alloyPerStreakDay;
      m.cores += L.SWEEP_BONUS.cores; m.alloy += bonusAlloy;
      out.sweep = { streak: st.streak, cores: L.SWEEP_BONUS.cores, alloy: bonusAlloy };
    }
    GH.meta.save();
    return out;
  };

  L.dailyUnclaimed = function () {
    var n = 0; L.daily().tasks.forEach(function (t) { if (t.done && !t.claimed) n++; });
    return n;
  };

  // =================================================================
  // ALLOY VEINS — gathering nodes, richer in dangerous zones
  // =================================================================
  L.nodesFor = function (zoneId, bounds) {
    var zone = L.rootZone(zoneId);
    if (zone !== zoneId) return []; // dungeons: no veins
    var danger = zoneDanger(zone);
    var rnd = seeded('veins:' + day() + ':' + zone);
    var n = 5 + danger * 2;
    var out = [];
    var mined = (GH.meta.data.nodesMined || {})[day() + ':' + zone] || {};
    for (var i = 0; i < n; i++) {
      var x = (rnd() * 2 - 1) * bounds.x * 0.82, z = (rnd() * 2 - 1) * bounds.z * 0.82;
      if (zone === 'wreck' && GH.world && GH.dist2(x, z, GH.world.CAMP.x, GH.world.CAMP.z) < 30 * 30) z -= 70;
      var rich = rnd() < 0.2 + danger * 0.05;
      out.push({ idx: i, x: x, z: z, rich: rich, danger: danger, mined: !!mined[i],
        alloy: 3 + danger * 2 + Math.floor(rnd() * 4) + (rich ? 6 : 0),
        core: danger >= 3 && rnd() < (rich ? 0.35 : 0.12) });
    }
    return out;
  };
  L.mineNode = function (zoneId, idx) {
    var d = GH.meta.data;
    d.nodesMined = d.nodesMined || {};
    var key = day() + ':' + zoneId;
    // forget other days
    for (var k in d.nodesMined) if (k.indexOf(day() + ':') !== 0) delete d.nodesMined[k];
    d.nodesMined[key] = d.nodesMined[key] || {};
    d.nodesMined[key][idx] = true;
    GH.meta.save();
  };

  // =================================================================
  // CACHE SIGNALS — a treasure site pings every few minutes
  // =================================================================
  L.signalInterval = function (danger) { return 110 - danger * 10; };

  return L;
})();
