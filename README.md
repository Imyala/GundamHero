# HERO FRAME

A single-player, top-down **mech arena survivor** in the browser — low-poly PS1-style
3D, fantasy-archetype mechs, auto-firing weapons, gem-socketed builds, and six
stages of escalating waves guarded by corrupted rival frames.
Built from scratch with Three.js and zero build tooling: clone it, open it, play it.

Inspired by the wave-survivor / action-roguelite genre; all names, art, code, and
audio here are original and generated procedurally at runtime (no binary assets).

## Play

Open `index.html` in any modern browser — no server or install needed.
(If your browser blocks local files, run `python3 -m http.server` in this folder
and visit `http://localhost:8000`.)

### Controls

| Input | Action |
|---|---|
| WASD / arrows | Move |
| Mouse | Aim (weapons fire automatically) |
| Space | Boost (dash — some frames weaponize it) |
| Shift / Right-click | Special (per frame: Block, Overdrive, Nova, Lunge, Shade, Frenzy, Blink, Bulwark) |
| 1–6 | Pick a wave-reward card / socket target |
| F | Toggle CRT scanlines |
| Esc / P | Pause |

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
matches (fighting your own frame's double) welcome.

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

### Devotions (meta progression)
Salvage banked from runs is spent in the **HANGAR** on five permanent paths
matching the gem affinities; the *active* path also grows a little on every
level-up during a run.

### Modes
- **Classic** — pick a frame and stage, survive 20 waves, claim the corrupted frame.
- **Arena** — endless, infinitely scaling waves on any unlocked stage; best wave saved.

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
js/meta.js        persistence: unlocks, salvage, devotions, records
js/upgrades.js    reward card pool (weapons/traits/protocols/gems)
js/enemies.js     enemy + midboss + corrupted boss definitions
js/audio.js       WebAudio procedural SFX
js/game.js        core loop: combat, waves, resonances, screens
js/main.js        renderer, input, screen wiring
```

## Roadmap ideas

- Weekly challenge seeds and loadout presets for Arena
- Shared/split-screen co-op
- Gamepad + touch controls
- Music loops, hit-stop, more resonance hybrids
