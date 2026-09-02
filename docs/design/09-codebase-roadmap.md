# 09 — Codebase gap analysis and roadmap

The codebase (HERO FRAME, ~12.7k lines vanilla JS + Three.js, no build step) already has a lot the
design needs: 8 frames, a transform, a momentum driving model, a 6-zone streamed world, 11 dungeon
archetypes, gems/resonances, a skill tree, devotions, mastery, seasons, save codes. This maps the
design onto it and orders the work.

## 1. Keep as-is

| System | File | Note |
|---|---|---|
| PSX render pipeline, pooling, procedural textures | assets.js, models.js | the look is right |
| World streaming, zones, nests, weather, HARROW | world.js | terrain gets height (below) |
| 11 dungeon archetypes incl. Cipher Halls | dungeons.js + game.js | RACEWAY/CONVOY/GAUNTLET become Vector content |
| Gems, sockets, 16 resonances | gems.js | doc 05 §3 adds runes and cores to the same sockets |
| Devotions, mastery, seasons, trials, broker, collection, save codes | meta.js, progress.js | collection log becomes completable |
| Corrupted mirror bosses as frame unlocks | enemies.js, game.js | doc 06 keeps them |
| Procedural audio/music | audio.js, music.js | add per-form engine loops |
| Onboarding hints, announce queue | game.js | reuse for Mission 1 |

## 2. Change

| Design | Today | Work |
|---|---|---|
| Chase camera + mouse aim + floating reticle (doc 08) | fixed top-down `updateCamera`, ground-plane raycast aim | new camera rig, aim ray from camera through reticle, pitch; terrain becomes a height field (`world.js` layouts get a noise height function; `models.js` props sit on it) |
| Transform as core verb (doc 02) | `toggleSpeeder` swaps to one `buildSpeeder`, Reach-only | per-frame Vector builder in `models.js` (jet/bike/tank/disc/cycle/beast), `player.form` state machine with 0.3 s blend, momentum carry, over-speed slide, auto-drop |
| Form-gated weapon slots + salvos (doc 05 §1) | primary only; `STRAFE_DEF` fixed in Vector | loadout = 2 Frame + 2 Vector + salvo; `updateWeapons` reads the active form's slots; salvo paint/release on RMB |
| One handling model (doc 03) | `race.js` rider sim **and** `game.js updateDrive` | delete the rider sim; `race.js` keeps only track/gate/AI/scoring and calls `updateDrive` for every rider (AI included). Add gearCurve, drift entry rules, UG2 scoring, nitro refill events, catch-up slider |
| Stagger (doc 02 §5) | none | `e.impact`, `e.stability`, decay, 2 s stun, ×1.5 window; Impact bar under target HP |
| Two fuels + heat (doc 02 §3) | boost meter + energy | rename energy → Heat (inverted), add flight fuel; Arts cost recharge + heat |
| Attributes and rating curves (doc 04) | flat armor, % block, uncapped stacking | `stats.js` (new): six attributes, `K(L)`, `A/(A+K)`, rating→% with brackets; `playerDamage`/`damageEnemy` use the buckets pipeline |
| Three-layer trees (doc 04 §3) | 18-node tree | pilot tree = existing tree; add frame trees (3 per line) and weapon lines with the diminishing curve; loadouts |
| Weapon economy (doc 05) | `rollRewards` dead, 13 secondaries unreachable, LOADOUT screen unreachable | hangar loadout screen (revive `preset-screen`), mission reward = weapon, drops with parts+rarity, blueprints; `upgrades.js` becomes `weapons.js` catalog |
| Enemy ladder + capital ships (doc 07) | 8 trash + 2 midboss + racers + corrupt | barracks spawners, tanks, hover trio, dropships, jets (air AI), aces, capital-ship hull as walkable geometry |
| Missions (doc 07 §3) | waves (classic) / objectives (dungeons) | `missions.js`: scripted objective graph per mission, timed traversal, reward drip; reuse dungeon objective code (bastion = defend, convoy = escort, heist = timed) |
| Trace mode (doc 03 §7) | TRACE DUEL in race.js (heading turn, 80-segment trail) | grid-snap turns, wall-grind accel, rubber reservoir, brake reservoir, finite walls, Sumo/Fortress zones |
| HUD (doc 08) | innerHTML every frame | dirty-flag updates; radar disc; weapon panel with ghosted other form; form badge |
| Controls (doc 08 §2) | K double-bound, Z X C wards | rebind; wards → Arts |

## 3. Fix on the way

- `buildRelay` defined twice in models.js (second silently wins).
- `sanctityMaybe` empty; `masteryBonus().fourthCard` vestigial; `expBankT` unused.
- `GH.rand` in texture generation makes visuals non-deterministic; seed it.
- `game.js` (6.3k lines) should split: `player.js`, `vehicle.js`, `combat.js`, `missions.js`,
  `hud.js`, `expedition.js`, `dungeon-loops.js`. Script order in index.html stays load-bearing.
- README describes a different game; replace with a pointer to `docs/design/`.

## 4. Roadmap (milestones, each playable)

| M | Deliverable | Proves |
|---|---|---|
| **M1 Vertical slice** | chase camera, height-field terrain in the wreck zone, Frame with beam rifle + saber + salvo, jet Vector with nose vulcan, one-key transform with momentum, stagger, radar disc HUD, Mission 1 "Zero Hour" | the transform loop is fun |
| **M2 Circuit** | unified `updateDrive` with drift scoring and nitro refills, Sunspire Circuit + Drift + Drag on the model, catch-up slider, tuning parts | the Vector is fun on its own |
| **M3 Hangar** | six attributes, rating curves, pilot tree + first frame tree + two weapon lines, loadout screen, weapon catalog with parts/rarity, 20 weapons live, collection log completable | depth without confusion |
| **M4 Act 1** | missions 1–5 + R1, enemy ladder to dropships, Masked Walker, first frame unlock, 6 frames with Vectors (jet, bike, tank) | the campaign shape works |
| **M5 Acts 2–3** | 12 more frames incl. transformable/funnel/bio-organic/drill lines, sync/battery/hype/Spike-Dock, Trace duels, Gemini Chorus, General Thunder + hub-ship | anime-derived systems land |
| **M6 Act 4 + endgame** | remaining frames, Mirror Titan, difficulty bands, sets, seasons on the new economy, weekly Trace ladder | 40 hours |

M1 is the risk. If the chase-camera transform loop is not fun in the browser at 1/3 resolution,
nothing after it matters. Budget it first and test it with the three Gun Metal screenshots as the target.

## 5. Naming and IP

Before M4 ships publicly: rename (doc 00 §7), audit frame silhouettes against Bandai designs (V-fin
plus twin eyes plus tricolor together is the recognisable combination; use any two, never all three
on one frame), and keep "Gundam" out of the title, code and store copy.
