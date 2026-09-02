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

## Play Locally

No complex setup required.

- Open `index.html` in a modern browser, or
- Run a local server:

```bash
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Design Bible

The target design (a Gun Metal style transforming mech game with NFS Underground handling in vehicle
form and Sacred/WoW build depth) lives in [`docs/design/`](docs/design/00-overview.md). The research
it is distilled from (Gun Metal, Granvir, Vital Shell, NFS Underground, Armagetron, Sacred Gold, WoW,
Mobile Suit Gundam, Evangelion, Gurren Lagann) is in [`docs/research/`](docs/research/README.md).
Note: the code currently calls the game **HERO FRAME**; the design docs explain the gap and the roadmap.

## Project Structure

- `/js` — game logic and systems
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
