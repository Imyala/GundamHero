# HERO FRAME

A single-player, top-down **mech action-RPG** in the browser — low-poly PS1-style
3D, fantasy-archetype mechs, **deliberate target-based combat** (mark a hostile,
your frame fights it on its own attack cycle while you steer, ward, and spend
energy on abilities), a **persistent pilot skill tree**, gem-socketed builds,
and one persistent open continent (**THE SHATTERED REACH**) where everything you
break stays broken — plus six wave arenas, transforming skimmer frames, and two
racing disciplines.
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
| Left click / Tab | **Mark a target** — your frame auto-attacks it while it's in reach |
| 1 / 2 / 3 / 4 | Cast RUPTURE / SWEEP / SHACKLE / OVERLOAD (energy + cooldowns; 2–4 unlock in the tree) |
| Z / X / C | Raise KINETIC / BALLISTIC / ARC ward (your "protection prayers") |
| Q (or gamepad LB, touch WARD) | Cycle wards |
| K | Open the pilot skill tree (works mid-run; camp training applies live) |
| Space | Boost (dash — some frames weaponize it) |
| Shift / Right-click | Special (per frame: Block, Overdrive, Nova, Lunge, Shade, Frenzy, Blink, Bulwark) |
| E (expedition) | Interact — camp stations, relays, vaults, race starts |
| T (gamepad Y, touch TRANS) | Transform between frame and skimmer combat forms — any mode |
| 1–6 (gem screen) | Pick a socket target |
| F | Toggle CRT scanlines |
| Esc / P | Pause |
| IJKL + O + U (or gamepad stick + A + B) | Player 2 in co-op: move, boost, special |
| Gamepad (solo) | Left stick move, right stick aim, A boost, B special |
| Touch | Virtual sticks (left move, right aim) + BOOST/SPEC buttons |
| J / K / L | Player 2 votes on wave-reward cards in co-op |

Dev shortcuts: `?wave=N` starts at wave N with catch-up levels; `?unlock=all`
opens every shell and stage; `?salvage=500` grants test salvage.

## The game

### Deliberate, target-based combat
No bullet-hose, no auto-spray. In the spirit of the classic MMOs and
ARPGs: **left-click (or Tab) marks a hostile**, and your frame works that
target on its weapon's own attack cycle whenever it's in reach — melee
frames swing when you close the gap, ranged frames fire aimed single
shots. Around that auto-attack you make the real decisions:

- **Weapon reach is real**: melee frames (AEGIS greatblade, FANG claws,
  VIPER daggers, MORROW scythe) only land hits in actual melee range —
  no thrown blades, no sword-waves. Ranged frames (VULCAN, HEXEN, STRIX,
  TITAN) fire aimed shots at distance. The same is true of the enemy:
  bruisers have to reach you, only shooters shoot.
- **Abilities (1–4)** spend the blue **energy capacitor** and run
  cooldowns: RUPTURE (a 2.2× focused strike), SWEEP (radial knockback),
  SHACKLE (chain a cluster in place), OVERLOAD (detonate their footing).
  All scale off your primary weapon, so gems and resonances still shape
  every cast. Slots 2–4 are unlocked by training.
- **Wards (Z/X/C)** are the reaction layer — match the stance to the
  incoming damage type to cut it 75% and build COUNTER stacks.
- Fights are tuned for it: roughly half the bodies of the old wave game,
  each with half again the hull. Every enemy is a fight, not confetti.

### The pilot skill tree (press K)
Power-up cards are gone. Every spark you collect feeds a **persistent
pilot level** on a slowing curve; each level pays one **skill point**,
spent in a three-discipline tree: **ASSAULT** (damage, attack speed,
crit, execute damage, a wider cleave capstone), **BULWARK** (hull, armor,
ward efficiency, block, a COUNTER-cap capstone), **SYSTEMS** (energy,
regeneration, cooldowns, boost, a skimmer capstone). Deeper nodes gate on
points already spent in that discipline; ability slots 2–4 live in the
tree. Training at the camp applies to your live expedition character on
the spot, and a respec costs 200 salvage.

### THE SHATTERED REACH — a zone-streamed world
The headline mode. The Reach is built the way the classic MMOs build
their worlds: **each territory is its own huge map** (500 × 500 — Tide
Wreckage, Glacier Hollow, Verdant Cloister, Ember Core, Stormspire, Null
Sanctum), linked by **travel gates** you simply walk through. Only one
zone is ever loaded, so each can be as big and dense as it likes — and
because every map is generated in-memory, crossing a gate is a blink of
black, **never a loading screen**. Territories carry **fixed danger
ratings I–IV** — the world doesn't scale to you; you grow into it.

Every territory hides **four violet dungeon gates** — 24 dungeons
world-wide, each a separate dark map one danger rank hotter, drawn from
**eleven archetypes** so no two runs play alike:

- **DEPTHS** — the classic crawl: guardian packs, the territory's
  **sealed vault** mid-depth, and its **corrupt-frame lair** at the far
  end (beat it for the shell and its artifact).
- **HIVE** — extermination: wipe every hostile on the map; the counter
  tracks what's left.
- **BASTION** — defense: awaken the territory's ancient relic (a dormant
  titanframe, the Heartcrystal, the Seed Orb, the Ancient Forge, the
  Spire Capacitor, the Void Archive) and hold it through four waves that
  pour from the breaches and gnaw it down.
- **LABYRINTH** — a true walled maze with solid collision; find the
  heart chamber.
- **GAUNTLET** — a timed rush: ride six checkpoint rings in order, each
  buying you seconds; run out and you start over.
- **FLUXWAYS** — the floor itself shifts: diagonal safe lanes sweep
  across a scorching tile field. Read the pattern and cross.
- **RACEWAY** — a combat race: fold into skimmer form and run three laps
  against three rival racer frames, **live fire permitted** — strafe and
  ram them off the track (they regrid a few gates back), and they shoot
  back. Finish first to unseal the cache.
- **CIPHER HALLS** — a puzzle dungeon in the classic contemplative
  tradition: energy barriers seal three chambers; **pressure plates**
  open them, and **carryable power cores** (E to lift, they weigh on the
  servos) can hold a plate down while you walk through. The last door
  needs two plates at once.
- **CONVOY** — escort the six-legged hauler along its route: it only
  rolls while you ride close, ambushes trip at marked waypoints, and
  hunters converge on it, not you. Dock it to clear.
- **CRUCIBLE** — a boss rush: corrupted frames enter the arena one by
  one. Three bouts, no breather worth the name.
- **HEIST** — seize the territory's relic off its plinth deep in the
  vaults; the alarm howls, the halls flood, and the clock runs. Make the
  exit gate with the relic for the payout.

Objective dungeons pay out at a **reward cache** (banked salvage + a gem;
first clears add a bonus cache) — and every clear **ascends the dungeon
forever**: its overworld gate now leads to the next tier — compounding
garrison strength, richer loot, and from tier 2 up a stack of seeded
**modifiers** (FRENZIED, ARMORED, VOLATILE, SWIFT, REGENERATING, THORNED,
DAMPENED, GILDED — up to four at once) that you can preview on the world
map before stepping in. The climb never ends; how high you take each
dungeon is the long game. The exit gate always walks you back to the
surface.

Press **M** for the **world map**: every territory with its danger
rating, today's weather front and Harrow roost, and all 24 dungeons with
their climbed tiers and the modifiers waiting on the next one.

Hostiles are **territorial**: they idle and wander around their nests
until you come close enough to be noticed (or wound one), chase while
you're in their hunting range, and walk home when you slip away — pulling
a pack is a choice, not a default. There are no waves and no timer:

- **Husk Nests** (28 of them) spawn enemies endlessly until you crack their
  cores — and a broken nest **stays broken forever**, across sessions. The
  title screen counts your scars.
- **Corrupt-frame lairs** — one per territory, waiting at the bottom of
  its dungeon. Walk into the lair and its boss wakes; defeating it
  unlocks that shell *and* drops a **named artifact**.
- **Siege relays** — hold ground through three spawn bursts to claim a relay
  permanently for banked salvage and a gem.
- **The survivor camp** is a real place you walk around: bank salvage at the
  fire (heals you, purges pursuers), talk to the Broker at his table, pray at
  the shrine (Devotions), read the Memorial wall (Collection Log), run sim
  missions at the console — every meta screen opens in-world and drops you
  straight back in.
- **Death is an ARPG death**: you wake at camp at 60% hull, and 60% of your
  unbanked salvage stays out there in a **wreck** you can walk back to and
  recover. (IRON CORE keeps its one-death rule even here.)
- Your expedition **character persists**: level, weapons, sockets, and
  position autosave; the title button becomes RESUME. Level-ups pop
  field-upgrade card picks right where you stand.
- A **minimap** tracks territories, nests (live/broken), lairs, relays, your
  wreck, and you.

### Skimmer transform — a true combat form
Every frame can fold into an anti-grav **skimmer** (T, gamepad Y, touch
TRANS) in *any* mode, arenas included — a real mech↔vehicle combat
transform, not just traversal. Skimmer form trades armor for tempo: ~2.6×
speed, your hull becomes a ram, and twin **strafe cannons** auto-fire along
your aim — but you take **+25% damage** until you fold back. Weave through
the swarm gunning, transform back to bring the full weapon suite to bear.

### Racing
Two race sites use the skimmer form:

- **TRACE DUEL** (at the camp pit) — a hard-light trail survival duel against
  three rival riders: your thrusters cut a wall behind you, touching any wall
  derezzes you, last rider standing wins. Winning engraves the **Trace
  Emblem** artifact.
- **SUNSPIRE CIRCUIT** (east of camp) — a 3-lap anti-grav gate race against
  three rivals with throttle, brake, and a boost meter; best time is recorded
  and first place earns the **Circuit Laurel** artifact. ESC abandons a race.

### The living Reach — daily world state
The continent shifts once a real day, the same way for everyone:

- **THE HARROW** — a slab-iron colossus shot through with molten fissures —
  roosts in a different territory each day (a warning totem marks it on the
  ground and the minimap). Approach and it wakes. Fell it for a heavy
  salvage purse and the **Harrow Brand** artifact; it re-roosts elsewhere
  tomorrow.
- **Weather fronts** blanket two territories a day: WHITEOUT (fog closes
  in, everything slows), KING TIDE (kills wash up bonus salvage),
  SPOREBLOOM (kills shed extra sparks), ASHFALL (burning cinders rain on
  telegraphs), STORM SURGE (the sky hunts you), NULL WIND (drifting eddies
  ground your weapons).
- **Hidden vaults** — one sealed door per territory, guarded inside its
  dungeon. Breaching one means passing a 3-step field trial while its
  guardians wake; a breached vault stays open forever and pays banked
  salvage, a gem, and a cache.

### Named artifacts
Nine handcrafted relics from specific places — one equipped at a time (from
the Collection Log): Bulwark Fragment (ward collapses detonate), Glacier Core
(attackers are flash-chilled), Harvest Coil (kill salvage), Cinder Heart
(+50% burns, boosting leaves fire), Stormcap (boosts chain lightning), Null
Lens (shielded elites take full damage, +10% crit), Circuit Laurel (+8%
speed), Trace Emblem (boosts leave a cutting light-wall), Harrow Brand
(+1 projectile while above 70% hull).

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
- 2 + 2 → one of ten **named hybrids** with its own identity: PHOENIX (cheat
  death once per run), LUCENT EDGE (crits heal), VERDANT GRACE (heart drops),
  MARTYR (low-hull kills mend), WILDFIRE (crits ignite), ASHBLOOM (burning
  kills shed sparks), CATACLYSM (hits detonate and ignite), QUICKSILVER
  (attack speed + sparks feed boost), EXECUTIONER (double damage below 20%),
  ROTBURST (kills burst in spores)
- 4 distinct → **PRISM**, a periodic piercing knockback blast

### Progression between fights
Levels inside a run still grow your frame's own stats (each frame has its
own per-level growth, boosted by your active Devotion), while the
persistent layers — the skill tree, Devotions, Mastery, Trials, gems —
carry between every run. Boss-dropped gems open a socketing screen; the
old pick-a-card wave rewards are retired.

### Elements
Burn (stacking DoT), Shock (chance to stun), Frost (slow) — boosted by
elemental-damage traits and HEXEN's passive.

### Stage hazards
Every arena past the first fights back: **Glacier Hollow** has ice sheets that
steal your traction, **Verdant Cloister** grows snare vines that slow both
sides, **Ember Core**'s vents erupt on a telegraph and scald everything,
**Stormspire** calls down sky lightning (bias: toward you), and **Null
Sanctum**'s drifting rifts suppress your weapons while you stand inside.

### Elites
From wave 6, one spawn in ten arrives as an elite — bigger, tougher, ringed by
a colored aura naming its modifier: BLAZING (burning ground on death),
SHIELDED (half damage), SWIFT, VOLATILE (death blast — raise your ARC ward),
or VAMPIRIC (regenerates). Elites pay triple XP plus bonus salvage.

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
- **The Shattered Reach** — the persistent open-world expedition (see above).
- **Classic** — pick a frame and stage, survive 20 waves, claim the corrupted frame.
- **Arena** — endless, infinitely scaling waves on any unlocked stage; best wave
  saved. Your build is the one you trained: tree, gems, devotions, mastery.
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
js/meta.js        persistence: pilot profiles, unlocks, salvage, world scars
js/progress.js    hunt contracts, stage trials, collection log, artifacts
js/skills.js      pilot skill tree, pilot level, ability definitions
js/upgrades.js    reward card pool (weapons/traits/protocols/gems)
js/enemies.js     enemy + midboss + corrupted boss definitions
js/audio.js       WebAudio procedural SFX
js/dungeons.js    dungeon archetypes: maze/flux/gauntlet generators, tiers
js/world.js       THE SHATTERED REACH: zone graph, layouts, camp, circuit
js/race.js        TRACE DUEL + SUNSPIRE CIRCUIT
js/game.js        core loop: combat, waves, expedition, resonances, screens
js/main.js        renderer, input, screen wiring
```

## Roadmap ideas

- Seeded custom runs (share a seed string with a friend)
- More daily events: convoy escorts, territory invasions, migrating herds
- Online leaderboards for Weekly, Arena, and the Sunspire Circuit
- Co-op expeditions and split-screen racing
