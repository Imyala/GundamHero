// STAALREUS — the HUNT roster: fifty named bosses, four or five per
// territory, each built from a mechanics library so every one fights
// differently. One hunt roams each territory per day (a skull totem
// marks it); ARENA and CLASSIC midboss waves also draw from the pool.
//
// Mechanics (game.js huntAI implements these):
//   slam       telegraphed ring at your feet          ring     radial shot burst
//   line       telegraphed rail along its facing        charge   a dash that stuns it briefly after
//   spiral     rotating shot stream                     mines    drops burning/chilling patches
//   blink      teleports beside you                     summon:X calls X (or zone fauna)
//   shield     immune while its adds live               weak     x2.5 from behind, x0.6 from the front, turns slowly
//   enrage     below 30%: faster, meaner                regen    heals when you back off past 25 m
//   pull       drags you in before a slam               artillery mortar rain around you
//   split      on death, two halves (once)              burrow   submerges, immune, erupts under you
//   sweep      rotating laser line                      drain    its hits heal it
//   frost      chill patches                            burn     fire trail
// phases: mechanics appended at 66% and 33% hull.
GH.bosses = (function () {
  var B = {};

  // tier: 1 easy … 4 brutal. Stats scale from tier; zone danger scales again at spawn.
  var TIER = {
    1: { hp: 1100, dmg: 18, cores: 2, alloy: 40 },
    2: { hp: 1900, dmg: 24, cores: 2, alloy: 60 },
    3: { hp: 3000, dmg: 30, cores: 3, alloy: 90 },
    4: { hp: 4400, dmg: 36, cores: 4, alloy: 130 }
  };

  // model: [builder, args..., scale]  — tints keep each one recognisable
  B.LIST = [
    // ---- TIDE WRECKAGE (wreck) ----
    { id: 'h_tidewarden', name: 'BRINE WARDEN', epithet: 'the drowned sentinel', zone: 'wreck', tier: 1, speed: 2.4, radius: 1.3, mass: 10,
      model: ['warden', 1.1], color: 0x40a0b0, mech: ['slam', 'summon:tideleech'], phases: [['ring'], ['enrage']] },
    { id: 'h_dunelord', name: 'DUNE LORD', epithet: 'the sand that swallows', zone: 'wreck', tier: 2, speed: 6.0, radius: 1.5, mass: 12,
      model: ['burrower', 0xc8a860, 2.2], color: 0xd8b060, mech: ['burrow', 'slam'], phases: [['summon:burrower'], ['enrage']] },
    { id: 'h_scarabking', name: 'SCARAB KING', epithet: 'the armoured tide', zone: 'wreck', tier: 2, speed: 2.6, radius: 1.6, mass: 14, armorMult: 0.6,
      model: ['scarab', 2.4], color: 0x806040, mech: ['charge', 'weak'], phases: [['summon:scarab'], ['regen']] },
    { id: 'h_wreckace', name: 'ACE "SALTLINE"', epithet: 'a pirate frame off the drowned fleet', zone: 'wreck', tier: 3, speed: 3.4, radius: 1.15, mass: 10,
      model: ['mech', { body: 0x3a5060, accent: 0x60e0ff, dark: 0x101820, trim: 0x8098a8, prop: 'guns' }, 2.0], color: 0x60e0ff, mech: ['ring', 'line', 'blink'], phases: [['mines'], ['enrage']] },
    { id: 'h_leviathan', name: 'BEACH LEVIATHAN', epithet: 'the beast the fleet was fleeing', zone: 'wreck', tier: 4, speed: 2.2, radius: 2.2, mass: 22,
      model: ['carapace', 1.4], color: 0x2080a0, mech: ['slam', 'pull', 'summon:tideleech'], phases: [['spiral'], ['enrage', 'ring']] },

    // ---- GLACIER HOLLOW (glacier) ----
    { id: 'h_rimehowler', name: 'RIME HOWLER', epithet: 'the voice of the white-out', zone: 'glacier', tier: 1, speed: 4.6, radius: 1.2, mass: 8,
      model: ['howler', 2.0], color: 0xc0e8ff, mech: ['charge', 'summon:stalker'], phases: [['frost'], ['enrage']] },
    { id: 'h_glassgolem', name: 'GLASS GOLEM', epithet: 'ice that learned to walk', zone: 'glacier', tier: 2, speed: 2.0, radius: 1.8, mass: 16,
      model: ['golem', 0xa0d8f0, 0xe0f8ff, 2.2], color: 0xa0d8f0, mech: ['slam', 'weak'], phases: [['frost'], ['split']] },
    { id: 'h_frostmatriarch', name: 'FROST MATRIARCH', epithet: 'the pack\'s mother', zone: 'glacier', tier: 2, speed: 5.4, radius: 1.3, mass: 9,
      model: ['stalker', 0xe8f0ff, 2.3], color: 0xe8f0ff, mech: ['charge', 'summon:stalker', 'shield'], phases: [['frost'], ['enrage']] },
    { id: 'h_glacierace', name: 'ACE "WHITEOUT"', epithet: 'a hunter frame in snow camouflage', zone: 'glacier', tier: 3, speed: 3.6, radius: 1.15, mass: 10,
      model: ['mech', { body: 0xe8eef8, accent: 0x80c0ff, dark: 0x304050, trim: 0xb0c0d0, prop: 'lance' }, 2.0], color: 0x80c0ff, mech: ['line', 'blink', 'frost'], phases: [['charge'], ['enrage']] },
    { id: 'h_avalanche', name: 'THE AVALANCHE', epithet: 'a mountain with a grudge', zone: 'glacier', tier: 4, speed: 1.9, radius: 2.4, mass: 26,
      model: ['golem', 0x8090a0, 0xc0f0ff, 3.0], color: 0xc0f0ff, mech: ['slam', 'artillery', 'regen'], phases: [['split'], ['enrage', 'ring']] },

    // ---- VERDANT CLOISTER (cloister) ----
    { id: 'h_toadking', name: 'BELLOW KING', epithet: 'the swamp\'s throat', zone: 'cloister', tier: 1, speed: 2.6, radius: 1.6, mass: 12,
      model: ['toad', 2.4], color: 0x80c040, mech: ['ring', 'pull'], phases: [['summon:skitter'], ['enrage']] },
    { id: 'h_thornmother', name: 'THORN MOTHER', epithet: 'roots that reach for you', zone: 'cloister', tier: 2, speed: 2.2, radius: 1.5, mass: 12,
      model: ['bloat', 0x6a9a48, 2.4], color: 0x9ae848, mech: ['mines', 'summon:creeper', 'shield'], phases: [['slam'], ['regen']] },
    { id: 'h_lurkerprime', name: 'LURKER PRIME', epithet: 'the ambush that never ends', zone: 'cloister', tier: 2, speed: 5.2, radius: 1.3, mass: 9,
      model: ['lurker', 2.2], color: 0x407040, mech: ['blink', 'charge', 'weak'], phases: [['mines'], ['enrage']] },
    { id: 'h_cloisterace', name: 'ACE "CANOPY"', epithet: 'a sniper frame in the trees', zone: 'cloister', tier: 3, speed: 3.0, radius: 1.15, mass: 10,
      model: ['mech', { body: 0x3a5a30, accent: 0xc0ff60, dark: 0x142010, trim: 0x6a8a50, prop: 'staff' }, 2.0], color: 0xc0ff60, mech: ['line', 'artillery', 'blink'], phases: [['summon:creeper'], ['enrage']] },
    { id: 'h_wyrmroot', name: 'WYRMROOT', epithet: 'the drake beneath the pond', zone: 'cloister', tier: 4, speed: 3.4, radius: 2.0, mass: 20,
      model: ['drake', 'cloister', 2.6], color: 0x60c060, mech: ['sweep', 'burn', 'summon:skitter'], phases: [['charge'], ['enrage', 'ring']] },

    // ---- EMBER FURNACE (ember) ----
    { id: 'h_slagfather', name: 'SLAG FATHER', epithet: 'the furnace\'s first son', zone: 'ember', tier: 1, speed: 2.0, radius: 1.7, mass: 15,
      model: ['golem', 0x4a3028, 0xff7020, 2.2], color: 0xff7020, mech: ['slam', 'burn'], phases: [['split'], ['enrage']] },
    { id: 'h_cinderpack', name: 'CINDER ALPHA', epithet: 'the hound that runs on fire', zone: 'ember', tier: 2, speed: 5.6, radius: 1.3, mass: 9,
      model: ['hound', 0x8a2a10, 2.3], color: 0xff5020, mech: ['charge', 'burn', 'summon:cinderhound'], phases: [['ring'], ['enrage']] },
    { id: 'h_magmadrake', name: 'MAGMA DRAKE', epithet: 'a wing of molten rock', zone: 'ember', tier: 3, speed: 3.6, radius: 2.0, mass: 18,
      model: ['drake', 'ember', 2.5], color: 0xff8030, mech: ['sweep', 'artillery', 'burn'], phases: [['blink'], ['enrage']] },
    { id: 'h_emberace', name: 'ACE "KILN"', epithet: 'a flamethrower frame, welded and burning', zone: 'ember', tier: 3, speed: 3.2, radius: 1.15, mass: 10,
      model: ['mech', { body: 0x6a2a20, accent: 0xffa030, dark: 0x201008, trim: 0xa06040, prop: 'mortar' }, 2.0], color: 0xffa030, mech: ['artillery', 'mines', 'ring'], phases: [['charge'], ['enrage']] },
    { id: 'h_calderaheart', name: 'CALDERA HEART', epithet: 'the volcano\'s core, awake', zone: 'ember', tier: 4, speed: 1.8, radius: 2.4, mass: 28,
      model: ['carapace', 1.5], color: 0xff4010, mech: ['spiral', 'burn', 'pull', 'regen'], phases: [['artillery'], ['enrage', 'summon:cinder']] },

    // ---- STORM SPIRE (storm) ----
    { id: 'h_voltcolony', name: 'VOLT COLONY', epithet: 'a hive with one mind', zone: 'storm', tier: 1, speed: 3.0, radius: 1.4, mass: 9,
      model: ['eyecluster', 2.2], color: 0x90d0ff, mech: ['ring', 'summon:volt'], phases: [['spiral'], ['enrage']] },
    { id: 'h_rodking', name: 'ROD KING', epithet: 'the tower that shoots back', zone: 'storm', tier: 2, speed: 0.8, radius: 1.6, mass: 30,
      model: ['turret', 'rod', 2.4], color: 0x80c0ff, mech: ['line', 'artillery', 'shield'], phases: [['sweep'], ['enrage']] },
    { id: 'h_stormrider', name: 'STORM RIDER', epithet: 'a ray that surfs the lightning', zone: 'storm', tier: 2, speed: 5.0, radius: 1.6, mass: 10,
      model: ['ray', 2.4], color: 0xc0c0ff, mech: ['charge', 'spiral', 'blink'], phases: [['ring'], ['enrage']] },
    { id: 'h_stormace', name: 'ACE "FULMEN"', epithet: 'a duelist frame wrapped in arcs', zone: 'storm', tier: 3, speed: 3.8, radius: 1.15, mass: 10,
      model: ['mech', { body: 0x304060, accent: 0xa0e0ff, dark: 0x101828, trim: 0x6080b0, prop: 'daggers' }, 2.0], color: 0xa0e0ff, mech: ['blink', 'line', 'charge', 'weak'], phases: [['spiral'], ['enrage']] },
    { id: 'h_thunderhead', name: 'THE THUNDERHEAD', epithet: 'the storm itself, given a body', zone: 'storm', tier: 4, speed: 2.6, radius: 2.3, mass: 22,
      model: ['harrow', 0.9], color: 0xffffff, mech: ['sweep', 'spiral', 'artillery', 'blink'], phases: [['summon:volt'], ['enrage', 'ring']] },

    // ---- NULL FIELD (null) ----
    { id: 'h_phantomchoir', name: 'PHANTOM CHOIR', epithet: 'three voices, one shape', zone: 'null', tier: 1, speed: 3.6, radius: 1.3, mass: 8,
      model: ['phantom', 2.2], color: 0xc0a0ff, mech: ['blink', 'summon:phantom'], phases: [['ring'], ['enrage']] },
    { id: 'h_nullmonolith', name: 'NULL MONOLITH', epithet: 'the silence at the centre', zone: 'null', tier: 2, speed: 1.4, radius: 1.8, mass: 24,
      model: ['nullshard', 3.0], color: 0x9a94a8, mech: ['pull', 'slam', 'shield'], phases: [['spiral'], ['regen']] },
    { id: 'h_sentinelprime', name: 'SENTINEL PRIME', epithet: 'the last of the old guard', zone: 'null', tier: 3, speed: 2.8, radius: 1.5, mass: 14,
      model: ['sentinel', 2.4], color: 0x80ffd0, mech: ['line', 'sweep', 'weak'], phases: [['artillery'], ['enrage']] },
    { id: 'h_nullace', name: 'ACE "ZERO"', epithet: 'a frame that isn\'t quite there', zone: 'null', tier: 3, speed: 3.6, radius: 1.15, mass: 10,
      model: ['mech', { body: 0x505060, accent: 0xd0c0ff, dark: 0x181820, trim: 0x8080a0, prop: 'sword' }, 2.0], color: 0xd0c0ff, mech: ['blink', 'charge', 'ring'], phases: [['drain'], ['enrage']] },
    { id: 'h_voidmaw', name: 'THE VOID MAW', epithet: 'where the field folds in', zone: 'null', tier: 4, speed: 2.0, radius: 2.4, mass: 26,
      model: ['burrower', 0x40304a, 3.0], color: 0xc080ff, mech: ['burrow', 'pull', 'spiral'], phases: [['summon:nullshard'], ['enrage', 'slam']] },

    // ---- THE HIVE (hive) ----
    { id: 'h_broodqueen', name: 'BROOD QUEEN', epithet: 'the hive\'s beating heart', zone: 'hive', tier: 2, speed: 2.4, radius: 1.7, mass: 14,
      model: ['carapace', 1.2], color: 0xe0c040, mech: ['summon:glowmite', 'slam', 'shield'], phases: [['mines'], ['enrage']] },
    { id: 'h_habwarlord', name: 'HAB WARLORD', epithet: 'the biggest brute in the block', zone: 'hive', tier: 2, speed: 2.6, radius: 1.6, mass: 16,
      model: ['husk', 2.6, 0x4a4f5c], color: 0xffd050, mech: ['charge', 'slam', 'weak'], phases: [['summon:habbrute'], ['enrage']] },
    { id: 'h_hiveace', name: 'ACE "TENEMENT"', epithet: 'a gunner frame with a grudge', zone: 'hive', tier: 3, speed: 3.4, radius: 1.15, mass: 10,
      model: ['mech', { body: 0x6a6a30, accent: 0xffe060, dark: 0x282810, trim: 0x9a9a50, prop: 'guns' }, 2.0], color: 0xffe060, mech: ['ring', 'spiral', 'mines'], phases: [['charge'], ['enrage']] },
    { id: 'h_tunnelking', name: 'TUNNEL KING', epithet: 'the maw beneath the hab-blocks', zone: 'hive', tier: 4, speed: 6.5, radius: 2.0, mass: 20,
      model: ['burrower', 0x5a4a70, 2.8], color: 0xd0a0ff, mech: ['burrow', 'slam', 'summon:tunnelmaw'], phases: [['ring'], ['enrage']] },

    // ---- THE RUINS (ruins) ----
    { id: 'h_gravemarshal', name: 'GRAVE MARSHAL', epithet: 'the knight who never yielded', zone: 'ruins', tier: 2, speed: 2.8, radius: 1.5, mass: 14,
      model: ['knight', 2.2], color: 0xc0c0d0, mech: ['charge', 'line', 'weak'], phases: [['summon:wardenknight'], ['enrage']] },
    { id: 'h_carrionqueen', name: 'CARRION QUEEN', epithet: 'the kite that feeds on the fallen', zone: 'ruins', tier: 2, speed: 4.0, radius: 1.7, mass: 12,
      model: ['drake', 'ruins', 2.4], color: 0x9a9aa0, mech: ['sweep', 'drain', 'summon:carrionkite'], phases: [['blink'], ['enrage']] },
    { id: 'h_ruinsace', name: 'ACE "REQUIEM"', epithet: 'a reaper frame in mourning black', zone: 'ruins', tier: 3, speed: 3.2, radius: 1.15, mass: 10,
      model: ['mech', { body: 0x2a2a30, accent: 0xc04060, dark: 0x101014, trim: 0x505058, prop: 'scythe' }, 2.0], color: 0xc04060, mech: ['slam', 'drain', 'pull'], phases: [['ring'], ['enrage']] },
    { id: 'h_ballistaprime', name: 'BALLISTA PRIME', epithet: 'the wall\'s last gun', zone: 'ruins', tier: 4, speed: 1.0, radius: 1.8, mass: 30,
      model: ['turret', 'ballista', 2.6], color: 0xe0d0a0, mech: ['line', 'artillery', 'shield', 'regen'], phases: [['sweep'], ['enrage', 'ring']] },

    // ---- THE KEEP (keep) ----
    { id: 'h_keepcastellan', name: 'THE CASTELLAN', epithet: 'the keep\'s iron steward', zone: 'keep', tier: 2, speed: 2.4, radius: 1.5, mass: 16,
      model: ['knight', 2.4], color: 0xf0d080, mech: ['slam', 'shield', 'summon:wardenknight'], phases: [['charge'], ['enrage']] },
    { id: 'h_slingerlord', name: 'SLINGER LORD', epithet: 'every parapet is his', zone: 'keep', tier: 2, speed: 3.0, radius: 1.3, mass: 10,
      model: ['slinger', 2.3], color: 0xffb060, mech: ['artillery', 'ring', 'blink'], phases: [['mines'], ['enrage']] },
    { id: 'h_keepace', name: 'ACE "PORTCULLIS"', epithet: 'a paladin frame that holds the gate', zone: 'keep', tier: 3, speed: 3.0, radius: 1.15, mass: 12,
      model: ['mech', { body: 0x8a8060, accent: 0xffd050, dark: 0x302810, trim: 0xb0a070, prop: 'sword' }, 2.0], color: 0xffd050, mech: ['charge', 'slam', 'weak', 'regen'], phases: [['summon:wardenknight'], ['enrage']] },
    { id: 'h_siegeengine', name: 'THE SIEGE ENGINE', epithet: 'a fortress that walked off its walls', zone: 'keep', tier: 4, speed: 1.6, radius: 2.4, mass: 30,
      model: ['warden', 1.8], color: 0xe0a040, mech: ['artillery', 'slam', 'mines', 'shield'], phases: [['line'], ['enrage', 'ring']] },

    // ---- THE WARRENS (warrens) ----
    { id: 'h_fungallord', name: 'FUNGAL LORD', epithet: 'the bloom that thinks', zone: 'warrens', tier: 2, speed: 2.2, radius: 1.6, mass: 14,
      model: ['bloat', 0x6a5a8a, 2.6], color: 0xa080ff, mech: ['mines', 'summon:fungalshambler', 'regen'], phases: [['pull'], ['enrage']] },
    { id: 'h_glowmatriarch', name: 'GLOW MATRIARCH', epithet: 'ten thousand small lights', zone: 'warrens', tier: 2, speed: 4.4, radius: 1.3, mass: 8,
      model: ['shardling', 0x60e0c0, 3.2], color: 0x60e0c0, mech: ['summon:glowmite', 'spiral', 'shield'], phases: [['split'], ['enrage']] },
    { id: 'h_warrensace', name: 'ACE "TUNNELRAT"', epithet: 'a striker frame that lives in the dark', zone: 'warrens', tier: 3, speed: 4.0, radius: 1.15, mass: 9,
      model: ['mech', { body: 0x3a3048, accent: 0x80ffc0, dark: 0x141020, trim: 0x605078, prop: 'claws' }, 2.0], color: 0x80ffc0, mech: ['charge', 'blink', 'drain'], phases: [['mines'], ['enrage']] },
    { id: 'h_deepmaw', name: 'THE DEEP MAW', epithet: 'the warren\'s oldest tenant', zone: 'warrens', tier: 4, speed: 6.0, radius: 2.4, mass: 26,
      model: ['burrower', 0x2a2038, 3.2], color: 0xc0ffe0, mech: ['burrow', 'pull', 'slam', 'regen'], phases: [['summon:tunnelmaw'], ['enrage', 'ring']] },

    // ---- THE SKY COURT (sky) ----
    { id: 'h_cloudshepherd', name: 'CLOUD SHEPHERD', epithet: 'the wisp that herds the storm', zone: 'sky', tier: 2, speed: 3.4, radius: 1.3, mass: 8,
      model: ['frostwisp', 0xe8e0ff, 2.6], color: 0xe8e0ff, mech: ['ring', 'summon:cloudwisp', 'blink'], phases: [['spiral'], ['enrage']] },
    { id: 'h_aetherking', name: 'AETHER KING', epithet: 'a ray as wide as the sky', zone: 'sky', tier: 3, speed: 4.6, radius: 2.0, mass: 14,
      model: ['ray', 3.0], color: 0xffffff, mech: ['charge', 'sweep', 'spiral'], phases: [['blink'], ['enrage']] },
    { id: 'h_skyace', name: 'ACE "ZENITH"', epithet: 'an interceptor frame above it all', zone: 'sky', tier: 3, speed: 4.0, radius: 1.15, mass: 10,
      model: ['mech', { body: 0xf0f0f8, accent: 0xff70a0, dark: 0x404860, trim: 0xa0a8c0, prop: 'lance' }, 2.0], color: 0xff70a0, mech: ['line', 'charge', 'blink', 'weak'], phases: [['ring'], ['enrage']] },
    { id: 'h_skyfather', name: 'THE SKY FATHER', epithet: 'what the court kneels to', zone: 'sky', tier: 4, speed: 2.4, radius: 2.4, mass: 24,
      model: ['harrow', 1.0], color: 0xffe0a0, mech: ['sweep', 'artillery', 'pull', 'summon:cloudwisp'], phases: [['spiral'], ['enrage', 'ring']] }
  ];

  B.byId = function (id) { for (var i = 0; i < B.LIST.length; i++) if (B.LIST[i].id === id) return B.LIST[i]; return null; };
  B.forZone = function (zone) { return B.LIST.filter(function (b) { return b.zone === zone; }); };
  B.TIER = TIER;

  // register as enemy defs + builders
  B.LIST.forEach(function (b) {
    var t = TIER[b.tier];
    GH.enemyDefs[b.id] = {
      id: b.id, name: b.name, boss: true, hunt: true, huntTier: b.tier,
      hp: t.hp, speed: b.speed, damage: t.dmg, radius: b.radius, xp: 40 + b.tier * 25, mass: b.mass,
      behavior: 'hunt', armorMult: b.armorMult, mech: b.mech, phases: b.phases, color: b.color, epithet: b.epithet, zone: b.zone
    };
    GH.enemyBuilders[b.id] = function () {
      var m = b.model, g;
      var kind = m[0];
      if (kind === 'mech') { g = GH.models.buildMech(m[1]); g.scale.setScalar(m[2]); }
      else if (kind === 'warden') { g = GH.models.buildWarden(); g.scale.setScalar(m[1]); }
      else if (kind === 'carapace') { g = GH.models.buildCarapace(); g.scale.setScalar(m[1]); }
      else if (kind === 'harrow') { g = GH.models.buildHarrow(); g.scale.setScalar(m[1]); }
      else if (kind === 'golem') { g = GH.models.buildGolem(m[1], m[2]); g.scale.setScalar(m[3]); }
      else if (kind === 'husk') { g = GH.models.buildHusk(m[1], m[2]); }
      else if (kind === 'burrower') { g = GH.models.buildBurrower(m[1]); g.scale.setScalar(m[2]); }
      else if (kind === 'stalker') { g = GH.models.buildStalker(m[1]); g.scale.setScalar(m[2]); }
      else if (kind === 'hound') { g = GH.models.buildHound(m[1]); g.scale.setScalar(m[2]); }
      else if (kind === 'bloat') { g = GH.models.buildBloat(m[1]); g.scale.setScalar(m[2]); }
      else if (kind === 'drake') { g = GH.models.buildDrake(m[1]); g.scale.setScalar(m[2]); }
      else if (kind === 'turret') { g = GH.models.buildTurret(m[1]); g.scale.setScalar(m[2]); }
      else if (kind === 'shardling') { g = GH.models.buildShardling(m[1]); g.scale.setScalar(m[2]); }
      else if (kind === 'frostwisp') { g = GH.models.buildFrostWisp(m[1]); g.scale.setScalar(m[2]); }
      else {
        var fn = GH.models['build' + kind.charAt(0).toUpperCase() + kind.slice(1)];
        g = fn ? fn() : GH.models.buildHusk(2, 0x808080);
        g.scale.setScalar(m[1] || 2);
      }
      // a crown of light in the boss's colour, so a hunt reads at a distance
      var crown = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 4, 16),
        GH.assets.basic(b.color, { transparent: true, opacity: 0.75 }));
      crown.rotation.x = Math.PI / 2;
      crown.position.y = 2.4;
      g.add(crown);
      g.userData.crown = crown;
      return g;
    };
  });

  // today's hunt for a territory: seeded, skipping ones already slain today
  B.todayFor = function (zone, dayStamp, slainToday) {
    var list = B.forZone(zone);
    if (!list.length) return null;
    var h = 2166136261, str = 'hunt:' + dayStamp + ':' + zone;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    var start = (h >>> 0) % list.length;
    for (var k = 0; k < list.length; k++) {
      var b = list[(start + k) % list.length];
      if (!slainToday || !slainToday[b.id]) return b;
    }
    return null; // every hunt in this zone is down for today
  };

  // a random hunt for arena / classic midboss waves, capped by tier
  B.pickFor = function (zone, maxTier) {
    var pool = B.LIST.filter(function (b) { return (!zone || b.zone === zone) && b.tier <= maxTier; });
    if (!pool.length) pool = B.LIST.filter(function (b) { return b.tier <= maxTier; });
    return pool[Math.floor(Math.random() * pool.length)];
  };

  B.slainCount = function () {
    var n = 0, bs = GH.meta.data.bestiary || {};
    B.LIST.forEach(function (b) { if (bs[b.id]) n++; });
    return n;
  };

  return B;
})();
