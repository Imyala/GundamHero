# HERO FRAME

A single-player, top-down **mech arena survivor** in the browser — low-poly PS1-style
3D, fantasy-archetype mechs, auto-firing weapons, gem-socketed builds, and six
stages of escalating waves guarded by corrupted rival frames.
Built from scratch with Three.js and zero build tooling: clone it, open it, play it.

Inspired by the wave-survivor / action-roguelite genre; all names, art, code, and
audio here are original and generated procedurally at runtime (no binary assets).

## Play

**Live build:** https://imyala.github.io/GundamHero/ (redeploys automatically
from `main`).

Or open `index.html` locally in any modern browser — no server or install
needed. (If your browser blocks local files, run `python3 -m http.server` in
this folder and visit `http://localhost:8000`.) `node tools/build-single.js`
produces a single-file bundle in `dist/`.

First runs teach the basics with one-time on-screen hints; every meta system
(Relic Season, the Broker, Stage Trials, Collection Log, Devotions, and Save
Codes) lives under the **HANGAR** button. Progress saves per browser —
**HANGAR → SAVE CODE** exports everything as a portable string you can back up
or move between browsers.

### Controls

| Input | Action |
|---|---|
| WASD / arrows | Move |
| Mouse | Aim (weapons fire automatically) |
| Space | Boost (dash — some frames weaponize it) |
| Shift / Right-click | Special (per frame: Block, Overdrive, Nova, Lunge, Shade, Frenzy, Blink, Bulwark) |
| 1 / 2 / 3 (in combat) | Toggle KINETIC / BALLISTIC / ARC ward |
| Q (or gamepad LB, touch WARD) | Cycle wards |
| 1–6 | Pick a wave-reward card / socket target |
| F | Toggle CRT scanlines |
| Esc / P | Pause |
| IJKL + O + U (or gamepad stick + A + B) | Player 2 in co-op: move, boost, special |
| Gamepad (solo) | Left stick move, right stick aim, A boost, B special |
| Touch | Virtual sticks (left move, right aim) + BOOST/SPEC buttons |
| J / K / L | Player 2 votes on wave-reward cards in co-op |

Dev shortcuts: `?wave=N` starts at wave N with catch-up levels; `?unlock=all`
opens every shell and stage; `?salvage=500` grants test salvage.

## The game

### Eight playable frames
Fantasy archetypes as war machines, each with its own primary, special, passive,
and per-level growth:

- **AEGIS** — paladin starter. Greatblade arcs that also throw cutting waves; blocking
  restores HP; boosting rams for force damage scaling with Armor + Block.
- **VULCAN** — gunner starter. Twin autocannons with drum clips and snap reloads;
  Overdrive doubles fire rate.
- **FANG** — light striker. Claw bursts up close; every boost stacks FRENZY attack speed.
- **HEXEN** — wizard. A spellcannon that cycles element every 5 s (burn / shock / frost);
  Nova bursts with the current element.
- **VIPER** — rogue. Three-round dagger flurries, boost-sharpened crits, Shade teleport.
- **MORROW** — reaper. A whirling lifesteal scythe; WRATH converts missing hull into damage.
- **STRIX** — duelist. Column-piercing rail lances and heavy crits; Blink.
- **TITAN** — artillery. Aim-point mortar barrages, massive armor; Bulwark overplating.

### Six stages, corrupted bosses, unlocks
Tide Wreckage → Glacier Hollow → Verdant Cloister → Ember Core → Stormspire →
Null Sanctum, each with its own sky, floor, cliffs, props, and enemy roster
(husks, shardlings, orb sentries, spikers, brutes, creepers, cinders, volt wisps).
Every stage runs 20 timed waves with set-pieces: a **RUST WARDEN** midboss at
wave 10, an **OVERRUN** spawn-rate spike at wave 16, the **GRAVE CARAPACE**
broodmother at wave 18, and at wave 20 a **CORRUPTED** dark-mirror of the next
playable frame — beat it to *unlock that frame* and the next stage. Mirror
matches (fighting your own frame's double) welcome. At half hull every corrupt
boss goes **UNBOUND**: a second phase with a red aura, faster ability cycles,
radial bullet bursts, and heavier summons — and midbosses spiral up their own
summons when wounded.

### Gems & Resonance
Midbosses and bosses drop gems of five affinities — **Sol** ☀, **Pyre** 🔥,
**Keen** 👁, **Verd** 🌿, **Ruin** ☠ — and gem cards appear in wave rewards.
Every weapon (primary included) has **4 sockets**; each gem adds a per-socket
bonus to that weapon. Fill all four and the *type counts* grant a **Resonance**:

- 4-of-a-kind → **SANCTITY** (smite + heal on reload), **IMMOLATE** (burns scale
  with crit), **FRAGMENT** (triple spreadshot), **SPOREBLOOM** (kills sprout
  spark-shrubs), or **DETONATE** (hits explode)
- 2 + 2 → both resonances at reduced strength
- 4 distinct → **PRISM**, a periodic piercing knockback blast

### Wave rewards
After every wave, pick 1 of 3 cards: secondary weapons in four classes
(LIGHT/HEAVY × PHYSICAL/ELEMENTAL — Flak Fan, Missile Rack, Orbit Blades,
Arc Coil, Mine Layer, Gun Drone, Flame Projector, Mortar Pod, Frost Repeater),
stat **traits**, passive **Protocols** (Afterburner Cell, Reclaimer, Spark
Reactor, Thorn Plating, Emergency Vents), or gems to socket.

### Elements
Burn (stacking DoT), Shock (chance to stun), Frost (slow) — boosted by
elemental-damage traits and HEXEN's passive.

### Ward stances
Every frame carries three toggleable defensive shells, one active at a time:
**KINETIC** (amber — contact hits and boss rams), **BALLISTIC** (cyan — enemy
projectiles), **ARC** (violet — telegraphed blasts, rail beams, burning
ground). The matching ward cuts that damage by 75% and feeds **COUNTER**
stacks (+3% damage each, up to 5) — the wrong ward does nothing. Wards drain
energy while raised and collapse when it empties, so reading the incoming
attack and flicking the right stance at the right moment is the skill
ceiling: hold ARC through a boss slam, swap to BALLISTIC for the radial
burst, drop the ward to recharge between waves.

### The Broker (hunt contracts)
A hangar contact assigns directed missions — "destroy 32 Shardlings in Glacier
Hollow" — that persist across runs, tick up live on the HUD, and pay salvage
plus broker points on completion. Points buy permanent perks: Field Bounty
(+damage vs your contract target), Deep Pockets (+25% contract salvage),
Broker's Favor (free rerolls), and the Boss Ledger (midboss hunt contracts
with bigger payouts). Contracts scale up as you fill more of them.

### Collection Log
A hangar codex tracking everything you've ever destroyed or discovered:
per-enemy kill counts (entries stay ??? until first blood), every secondary
weapon found, every pure Resonance completed, gems socketed by affinity, and
lifetime run/win/kill totals — with an overall completion percentage on the
title screen.

### Stage Trials
Each stage carries four tiers of two tasks (reach wave 5, gather 40 sparks in
a run, kill the Warden, complete a Resonance, slay the corrupt frame before it
goes UNBOUND, …). Completing a tier pays a **permanent stage-scoped perk**:
+15% salvage there, +10% spark XP, +5% damage, and finally double gem drops
from that stage's bosses. Progress shows as TRIAL badges on the stage cards.

### Pilot profiles — Iron Frame & Iron Core
Cycle PILOT on the title screen between three fully separate save profiles:
**STANDARD** (everything available), **IRON FRAME** (devotions sealed and no
arena loadout kits — self-reliant progression), and **IRON CORE** (iron rules,
and a single death *erases the profile* — the fallen pilot is engraved on a
memorial shown on the title screen).

### Pilot Mastery
Every run — win or lose — pays mastery XP into the frame you flew (kills +
depth + a victory bonus). Each of the 50 levels adds a sliver of permanent
damage and hull for that frame, with milestones at 10 (cosmetics), 25 (+15%
boost recharge), 40 (**wave rewards offer a 4th card**), and 50 (MASTER
insignia). Per-frame progress shows on the select screen; total mastery on the
title screen and in the Collection Log.

### Relic Seasons
Each calendar month is a named season (deterministically generated — e.g.
SEASON OF THE UMBRAL RELAY) with a 16-task board spanning every mode: reach
waves, clear stages, win with different frames, season-long kill/spark/
resonance/contract counters, co-op and Arena goals. Crossing point thresholds
(30/80/150/250) grants a seeded 1-of-3 **relic** choice — run-warping
trade-offs like GLASS CANNON (+30% damage, -25% hull), PHASE DRIVE (free
boost, slower recharge), or TWIN FEED (+1 projectile, -15% damage) — active
in every non-Weekly run until the season rolls over.

### Signal Ciphers & chase loot
Enemies occasionally drop an intercepted **cipher** (with rising bad-luck
protection, so dry streaks self-correct). Picking it up starts a 2–3 step
field riddle — stand in the marked circle, destroy 5 hostiles in 8 seconds,
boost three times, take no damage for 10 seconds — tracked live on the HUD.
Solving it drops a cache: salvage plus a **guaranteed-new** chase cosmetic
while any remain (5 thruster-trail colors, 5 accent paint schemes, 4 cosmetic
pico-drones that orbit your mech), all equipable from the select screen and
tracked in the Collection Log's CACHE FINDS page.

### Devotions (meta progression)
Salvage banked from runs is spent in the **HANGAR** on five permanent paths
matching the gem affinities; the *active* path also grows a little on every
level-up during a run.

### Modes
- **Classic** — pick a frame and stage, survive 20 waves, claim the corrupted frame.
- **Arena** — endless, infinitely scaling waves on any unlocked stage; best wave
  saved. Before deploying, pick a **loadout preset**: Standard Issue, Gun
  Platform, Storm Cell, Sapper, or Pyre Cult — starting weapon/trait/gem kits
  that seed different builds.
- **Weekly Challenge** — a deterministic ISO-week seed issues everyone the same
  frame, stage, and modifier trio (two hazards like SWARM / IRONCLAD / GLASS
  FRAME / HASTE / FERAL plus one boon like BOUNTY or KEEN EYES); endless
  scoring, best wave recorded per week.
- **Shared-screen co-op** — toggle CO-OP on the player-select screen: Player 2
  now picks their *own* frame (any unlocked shell, or a mirror of P1) with a
  blue-accent livery, and gets full parity — their frame's special on U /
  gamepad B (block hold, Overdrive, Nova, Lunge, Shade, Frenzy, Blink,
  Bulwark), boost-fed passives (FRENZY stacks, EDGE crits, WRATH scaling on
  their own hull), and J/K/L votes on wave-reward cards. Enemies target the
  nearest pilot, the camera pulls back as you spread out (with a shared-screen
  tether), and a downed wingmate revives at the next wave or when P1 stands
  close.

### Music & feel
Every stage has its own generative soundtrack — bass, pad, arp, and drum
patterns produced at runtime by a WebAudio step sequencer from per-stage seeds,
with an intensity layer that kicks in during boss fights and a separate title
theme. Impact is sold with hit-stop frame-freezes on crits, heavy kills, and
explosions, plus scale-pops on every hit.

### Presentation
1/3-resolution pixelated renderer with PSX vertex-snap jitter, per-stage sky
gradients + strata cliffs + hand-shaded cobblestone (all canvas-generated),
chunky flat-shaded mechs with thruster flames and muzzle flashes, serif floating
damage numbers (gold crits, orange burns, blue elemental), screenshake, scorch
decals, CRT scanline overlay, and procedural WebAudio SFX.

## Code layout

```
index.html        page + HUD/menus markup
css/style.css     retro UI styling
lib/three.min.js  Three.js r150 (vendored, MIT)
js/util.js        math helpers
js/assets.js      procedural textures, PSX shader patch, materials
js/gems.js        gem affinities, sockets, resonance rules
js/stages.js      six stage defs + wave plans
js/models.js      low-poly mesh builders (mechs, enemies, pickups, props)
js/mechs.js       eight frame definitions
js/meta.js        persistence: pilot profiles, unlocks, salvage, devotions
js/progress.js    hunt contracts, stage trials, collection log
js/upgrades.js    reward card pool (weapons/traits/protocols/gems)
js/enemies.js     enemy + midboss + corrupted boss definitions
js/audio.js       WebAudio procedural SFX
js/game.js        core loop: combat, waves, resonances, screens
js/main.js        renderer, input, screen wiring
```

## Roadmap ideas

- Seeded custom runs (share a seed string with a friend)
- More resonance hybrids and stage hazards
- Online leaderboards for Weekly and Arena
- A third playable pilot slot
