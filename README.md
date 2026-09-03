# Gundam Circuit

Build your Gundam. Enter the Circuit. Become a legend.

**Gundam Circuit** is a browser-based mech action game focused on developing custom Gundams through dangerous quests, high-speed races, and escalating combat challenges.

## Overview

In Gundam Circuit, you pilot an evolving machine through a world of missions and arenas where performance, upgrades, and strategy all matter. Every run helps you gather resources, unlock new parts, and shape a Gundam built for your playstyle.

## Core Gameplay

- **Develop Your Gundam**  
  Upgrade frame stats, tune loadouts, and refine your build for different mission types.
- **Take On Quests**  
  Complete objectives across hostile zones to earn progression rewards and unlock tougher operations.
- **Dominate Races**  
  Push your machine to its limits in speed-focused Circuit events where handling and timing decide winners.
- **Conquer Challenges**  
  Battle through skill checks, elite encounters, and high-risk stages designed to test advanced builds.

## Progression Loop

1. Accept missions and challenges.
2. Earn parts, currency, and upgrade materials.
3. Improve your Gundam with better systems and weapons.
4. Re-enter harder quests and races for greater rewards.

## Key Features

- Single-player mech action in the browser
- Build-focused Gundam development system
- Quest, race, and challenge pillars for varied progression
- Fast restart loops designed for repeated improvement

## Controls (rebindable under CONTROLS)

MMO-style: **W/S** walk, **A/D** turn, **Q/E** strafe, **hold RIGHT MOUSE** to look around, **WHEEL** zooms.
**LEFT CLICK** attacks and marks a target, **TAB** cycles targets, **1–4** abilities, **Z/X/C** wards,
**SPACE** boost / drift, **SHIFT** special / nitro, **T** transform (W throttle, S brake, A/D steer),
**F** interact, **V** tactical camera, **K** training, **M** map, **P** pilot sheet, **ESC** pause / close any menu.

## The 135 frames

- **2 starters** (AEGIS, VULCAN) are yours from the first sortie.
- **4 feat frames** (FANG, HEXEN, VIPER, MORROW) are earned by clearing a CLASSIC stage (or its lair in the Reach).
- **129 built frames** are assembled in the HANGAR → FRAME WORKSHOP from ⬡ ALLOY (drops from hostiles and
  elites), ◈ FRAME CORES (bosses, wardens, stage clears, dungeon caches) and $ SALVAGE. Each of the 8 lineages
  has 5 packs (AILE, SWORD, LAUNCHER, STORM, PHANTOM) in 3 marks (MK.II → CUSTOM → PROTOTYPE), plus 7 RELIC
  frames gated behind feats.

## First sortie, saves, sound

A fresh profile's first PLAY is **ZERO HOUR**, a ten-minute guided sortie (replay or skip from the pause
menu). Saves live in the browser: HANGAR → SAVE CODE offers a copyable code, a downloadable save file, and
four automatic backups with one-click restore. Music is composed procedurally per zone and situation
(battle, sortie, race, victory, hangar); CONTROLS has separate music and effects volumes.

## Reach bands

The open world runs at BRONZE, SILVER, GOLD or PLATINUM (title screen or PILOT sheet). Higher bands scale
enemies up and pay more alloy, salvage and cores; they unlock through hunts, diaries, pilot level and stage clears.

## Signatures, hunts, the hangar viewer

Every lineage has a signature ability on key 5. Fifty named HUNT bosses roam the Reach (one per territory
per day, at a skull totem) and stand in for arena midbosses; each fights with its own mechanics and fills the
BESTIARY. The workshop shows the frame you're building and its vehicle turning on a plinth.

## Vehicles, drifting, and living in the Reach

Every lineage folds into two vehicles (23 designs: tanks, crawlers, bikes, beasts, discs, waveriders);
pick one on the frame select screen and build the second in the WORKSHOP → VECTORS tab. Drifting charges a
turbo through three tiers and pays it on release; a slide cooks the skids after 3.4 s. Nitro launches you
higher off crests and keeps burning in the air. The Reach has zone diaries (WORLD MAP), a daily task board
(BROKER), alloy veins to mine, and cache signals to chase. Details: `docs/design/13-world-life-vehicles-balance.md`.
`node tools/balance.js` audits frame power; `tools/gallery.html` renders every frame and vehicle.

## Runs

From the pause menu: **EXIT RUN** saves (the Reach keeps your pilot; an arena climb is parked at its current
wave and offered as CONTINUE RUN on the title), **NEW RUN** or **ABANDON RUN** delete it after a confirm.

## Play Locally

No complex setup required.

- Open `index.html` in a modern browser, or
- Run a local server:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`. `node tools/build-single.js` rebuilds `dist/heroframe.html`, a single-file build.
Dev URL flags: `?unlock=all`, `?salvage=N`, `?mats=N`, `?wave=N`.

## Design Bible

The target design (a Gun Metal style transforming mech game with NFS Underground handling in vehicle
form and Sacred/WoW build depth) lives in [`docs/design/`](docs/design/00-overview.md). The research
it is distilled from (Gun Metal, Granvir, Vital Shell, NFS Underground, Armagetron, Sacred Gold, WoW,
Mobile Suit Gundam, Evangelion, Gurren Lagann) is in [`docs/research/`](docs/research/README.md).
Note: the code currently calls the game **HERO FRAME**; the design docs explain the gap and the roadmap.

## Project Structure

- `/js` — game logic and systems (`controls.js` key bindings, `roster.js` the 135-frame roster and workshop)
- `/css` — UI and presentation styles
- `/lib` — third-party runtime libraries
- `/dist` — bundled output
- `/docs/design` — design bible (10 documents)
- `/docs/research` — raw research reports

## Roadmap Ideas

- Expanded Gundam part families and specialization paths
- Additional Circuit race tracks and modifiers
- New quest biomes and boss challenge tiers
- Seasonal challenge ladders and rewards

## License

See [LICENSE](LICENSE).
