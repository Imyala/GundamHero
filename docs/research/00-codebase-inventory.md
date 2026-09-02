# GundamHero / "HERO FRAME" — Codebase Inventory (summary of Explore-agent report)

Naming: repo GundamHero, README says "Gundam Circuit", code/title/save keys say HERO FRAME — A MECH ARENA SURVIVOR. Code names are truth.
Scale: ~12.7k lines ES5 vanilla JS, 17 files, one global window.GH, vendored three.min.js, no build step (tools/build-single.js optional), GitHub Pages deploy.

## Architecture
- util.js math helpers; assets.js procedural canvas textures + PSX vertex-snap shader (PIXEL_SCALE=3, nearest filter, flat shading); models.js ~45 primitive builders (buildMech(cfg) legs/torso/head/arms + addProp weapon; buildSpeeder = transform form); mechs.js 8 frames; meta.js localStorage save (3 profiles standard/iron/hardcore, save codes HF1.<b64>); upgrades.js 13 secondary weapons + 13 traits + 5 protocols (DEAD: rollRewards never called); enemies.js; progress.js broker/trials/artifacts/collection/mastery/seasons/ciphers/cosmetics; skills.js 18-node tree (3 branches x 6), pilot XP; audio.js procedural SFX; music.js generative sequencer; dungeons.js 11 archetypes + Cipher Halls solver; world.js 6 zones 500x500 streamed; race.js 2 hub races with own rider sim; game.js 6315-line god module; main.js boot/input/menus.
- Loop: rAF, dt clamp 0.05; states title|select|stageselect|hangar|play|reward|pause|over|win|race.
- Camera: fixed top-down-ish (x, 18*zoom, z+14.5*zoom), FOV 48; blob shadows; per-stage fog.

## Mechs (speed game = speed*0.42)
aegis Paladin 125HP/16/arm5/blk14 melee Blade&Shield, special block (hold, x0.3 dmg), ram on boost.
vulcan Gunner 95/17 Twin Autocannons 6dmg 0.11s clip14 reload .85, overdrive.
fang Striker 90/19 Talon Rake, lunge, passive frenzy (+8% atkspd/stack max5).
hexen Wizard 85/16 Spellcannon 22dmg homing aoe cycle burn/shock/frost, nova.
viper Rogue 80/18 Dagger Flurry crit16, blink, passive edge (+12 crit 2s).
morrow Reaper 105/17 aura Reap Cycle, frenzy, passive wrath (+60% at low HP).
strix Duelist 80/18 Rail Lance range 4.4, blink.
titan Artillery 160/13 arm8 Siege Mortar 42dmg aoe, bulwark (+12 armor 4s).
Unlock: aegis+vulcan free; others by killing CORRUPTED mirror boss (wave 20 or zone DEPTHS lair).

## Transform ("skimmer") — toggleSpeeder() T key
Swaps mesh for buildSpeeder; uses updateDrive NFS-style model; main weapons folded, fixed STRAFE_DEF (4dmg .26s x2); +25% damage taken; ram damage (8+flat)*mult; sy_skim capstone x1.4 strafe. Races force skimmer.

## Weapons: 1 primary per frame; 13 secondaries unreachable (card draft disabled). Types: shot, boomerang, melee, aura, zap, mine, cone, mortar, ringwave, vortex, drone, orbit. Max 5/run.

## Skills: 3 branches ASSAULT/BULWARK/SYSTEMS, 6 nodes each, req = points spent in branch (0/0/2/2/4/6). Abilities hotbar: RUPTURE (free), SWEEP, SHACKLE, OVERLOAD (energy costs 20/30/25/45; cd 6/10/12/18). Pilot level = floor((xp/30)^(1/1.7)); 1 skill pt/level; respec 200 salvage.
Gems: 4 sockets/weapon, sol/pyre/keen/verd/ruin; pure/hybrid/prism/mixed classification; 6 pure resonances + 10 named hybrids.
Formulas: dmg=(w.damage+flat)*damageMult*mods; crit chance additive, critMult base 1.6; incoming: i-frames, speeder x1.25, block% roll full negate, ward x0.25, armor FLAT subtract floor 1, blocking x0.3. No caps/DR anywhere. Devotions (salvage-bought ranks 1-5), mastery per frame (cap 50), monthly relic seasons (8 relics w/ downsides).

## Racing: (A) race.js hub races: TRACE DUEL light-cycle (4 riders, trail walls every .11s cap 80, heading 2.7rad/s, speed 8-13) and SUNSPIRE CIRCUIT (3 laps 10 gates, target-speed lerp, boost meter, off-track exponential bleed, AI rubber-band 1.12/0.88). (B) game.js updateDrive: top=spd*3.3 (x1.5 nitro), drift=boostHeld, turn 3.8 drift / 2.6-speedFrac*1.1, brake 34, accel 22 (40 nitro), grip 7.5 (1.5 drift, 2.4 ice) lateral bleed, drift banks nitro .28/s + style score, nitro burn .38/s; crash rule dumps nitro. (C) RACEWAY dungeon: 8 gates 3 laps 3 shootable rivals, perfect launch, style->salvage.

## World: 6 zones (wreck hub d1, glacier d2, cloister d2, ember d3, storm d3, null d4) 500x500, travel gates, 4 dungeon gates/zone (depths + 3 of: hive,bastion,labyrinth,gauntlet,fluxways,raceway,halls,convoy,crucible,heist), nests (permanent scars), daily weather fronts, daily world boss THE HARROW 5200hp. Dungeon tiers: hp 1.55^(t-1), dmg 1.25^(t-1), up to 4 modifiers. Classic mode: 6 stages, 20 waves, midboss w10/18, OVERRUN w16, corrupt boss w20.
Enemies: Husk, Shardling, Orb Sentry, Spiker, Brute, Creeper, Cinder, Volt Wisp; midbosses Rust Warden, Grave Carapace; Rival Racer; elites (blazing/shielded/swift/volatile/vampiric). Corrupt bosses phase 2 at 50%, phase 3 at 25%.
Currencies: salvage (main), coinsRun (60% dropped as wreck on death), broker points, skill points, season pts, mastery XP, pilot XP.

## UI: 17 DOM screens; HUD hp/boost/energy/xp/hotbar/minimap/race-hud/drive-hud; CRT overlay F.
## Controls: WASD, mouse aim, LMB attack/target, RMB/Shift special/nitro, Space boost/drift, Tab target, 1-4 abilities, ZXC wards, Q cycle ward, E interact, T transform, K skills, M map, Esc pause. P2 IJKL/O/U (K double-bound). Gamepad + touch supported.

## Pain points
1. Card-draft reward economy disabled -> 13 weapons/13 traits/5 protocols unreachable; collection log can never hit 100%. Arena LOADOUT screen unreachable.
2. Two racing models (race.js vs updateDrive) feel different.
3. game.js god module; HUD innerHTML every frame.
4. Two disjoint progression structures (classic stages vs Reach).
5. No stat caps / DR; block+armor+ward stack toward invulnerability.
6. Seven parallel meta systems hidden 2 clicks deep.
7. README describes a different game.
8. buildRelay defined twice; sanctityMaybe empty; GH.rand in texture gen non-deterministic.
