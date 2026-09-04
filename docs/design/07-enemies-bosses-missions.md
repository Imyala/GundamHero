# 07 — Enemies, bosses, missions, world

## 1. Enemy roster (Gun Metal's ladder, mech-flavoured)

Each class introduced by exactly one mission. All have Stability for the stagger system.

| Class | Echo | Stability | Behaviour |
|---|---|---|---|
| **Trooper** | Gun Metal infantry / Ball | 100 | streams from a **Barracks** (500 HP); kill the barracks, stop the stream |
| **Walker** (laser / grenade variants) | Gun Metal walkers | 150 | small biped, continuous laser or lob |
| **Sapper** | suicide bomber | 80 | rare, detonates on death (the codebase's `volatile` elite) |
| **Grunt suit** | Zaku / GM mass production, mono-eye or visor | 300 | machine gun, heat hawk melee, packs of 3 |
| **Missile tank** / **Heavy tank** | Gun Metal | 400 / 700 | ground, twin lasers on heavy |
| **Hover trio** | Dom hover | 350 | always three, strafe in formation |
| **Dropship (APC)** | Gun Metal APC | 600 | lands troops; kill in the air with Trident, on the ground with Flak |
| **Jet** | enemy fighters | 250 | dogfight targets; Vector-form content |
| **Ace custom** | red-comet trope (3× speed) | 900 | a named grunt suit in custom colours with a Signature weapon; drops it |
| **Newtype frame** | funnel users | 1200 | bits; kill the bits first or eat crossfire |
| **Revenant mirror** | codebase revenant bosses | 1500 | black/red mirror of a player frame; phases at 50% and 25% |
| **Capital ship** | Leviathan / Big Zam / Dendrobium | n/a | walkable hull, turrets as sub-targets, boarding |
| **Mother ship** | finale | n/a | act 4 |

Elite modifiers stay (blazing, shielded, swift, volatile, vampiric). Territorial aggro stays.

## 2. Boss puzzles (17, from Angels and Generals; original names)

| # | Boss | Echo | Puzzle |
|---|---|---|---|
| 1 | **Masked Walker** | Sachiel | regrows a mask; core exposed only during the 4 s regrow; final grab + self-destruct you must break |
| 2 | **The Prism** | Ramiel / Operation Yashima | floating polyhedron, instant counter-beam inside 800 m; plug the Satellite Cannon into 3 power nodes, first shot is always deflected so the wingmate tanks the return with a consumable shield |
| 3 | **Gemini Chorus** | Israfel | twin bosses that heal each other; only hits within a 0.3 s sync window on both cores register; rhythm cue on HUD |
| 4 | **Undertow** | Gaghiel | swallows you; brace jaws (hold), call allied strike into the mouth |
| 5 | **Vault Spider** | Matarael | vertical shaft blackout, acid from above; rotate Veil / fetch / fire with the wingmate |
| 6 | **Skyfall** | Sahaquiel | city-sized body drops from orbit; sprint to the predicted impact point, catch (hold), open field, stab core; fail changes the campaign map |
| 7 | **Shadow Well** | Leliel | sphere is a decoy, the shadow is the body; firing on it traps you in a pocket where the battery drains; exit by triggering Feral (doc 06) |
| 8 | **Revenant Wingman** | Bardiel | your wingmate is infected mid-mission; non-lethal route (parasite mass, keep cockpit HP) vs lethal; Dummy autopilot finishes it brutally |
| 9 | **Paperblade** | Zeruel | ribbon arms one-shot plates; unbeatable on standard power; let the battery die, win in Feral, eat the core for perpetual power (permanent unlock) |
| 10 | **Orbital Gaze** | Arael | out of reach; HUD disabled and controls inverted in waves; throw the artifact lance from a ramp with a timing minigame |
| 11 | **Helix Ring** | Armisael | rotating ring merges with your frame, converting HP to boss HP; de-sync fast or self-destruct (lose the chassis for the run) |
| 12 | **General Thunder** | Thymilph / Dai-Gunzan | lance duel on a walking battleship's deck, then Spike-Dock the bridge to capture it as your hub-ship |
| 13 | **General Tide** | Adiane | alternates humanoid sword and scorpion tail forms; vulnerable only during the transform frames (the game's own rule turned against you) |
| 14 | **General Gale** | Cytomander | air-dominance fight on a flying carrier; jet Vectors only; final kamikaze ram to divert |
| 15 | **General Shell** | Guame | invulnerable rolling ball; lure into pits or drill columns |
| 16 | **Cube Swarm** | Mugann | fast shielded enemies that explode into cubes on death near allies; kill at range or drag with Harpoon first |
| 17 | **Mirror Titan** | Granzeboma | matches whatever combination tier you have reached; beaten only by spending the full Hype meter on a tier-skip Helix Break |

Bosses 1, 3, 12, 13 are act bosses. The Revenant mirrors (one per unlockable frame) remain the
frame-unlock bosses inside dungeons.

## 3. Campaign: 4 acts × (5 missions + 2 races)

Defend/escort ≤ 40%. Each mission introduces one thing (weapon, frame or enemy class). Timed
traversal every third mission forces the Vector; dogfights force jet Vectors; boarding forces Frame.

| # | Name | Type | Introduces | Zone |
|---|---|---|---|---|
| 1 | Zero Hour | tutorial: heal at beacon, farms under attack, transform, dogfight, multi-lock | transform, salvo | wreck |
| 2 | Defender | defend HQ, 4 waves from barracks | Barracks, Flak Fan | wreck |
| 3 | Escort | six jets before the APCs land, then flak the landed APCs | Dropship, Trident | wreck |
| R1 | Sunspire Circuit | 3-lap circuit | racing, nitro | wreck |
| 4 | Boarding | walk the hull of a capital ship, kill its turrets, plant a charge | Capital ship, Beam Saber | glacier |
| 5 | **Masked Walker** | act boss | first frame unlock | glacier |
| 6 | Vanguard | timed assault, 3 relays | Heavy tank, Hyper Bazooka | glacier |
| 7 | Tide Run | naval; torpedoes vs surfaced hulls | Torpedoes | cloister |
| R2 | Drift Cloister | drift score | drift chain | cloister |
| 8 | Red Comet | ace duel, 3× speed custom | Ace, Fin Bits | cloister |
| 9 | Minesweeper | clear a field under fire | Jammer Pod, Trace unlock | cloister |
| 10 | **Gemini Chorus** | act boss (sync) | wingmate commands | cloister |
| 11 | Infiltration | no alarms, Cycle Vector through a base | Cycle Vector | ember |
| 12 | Fortification | hold a fort, 6 waves, siege | Mega Particle Cannon | ember |
| R3 | Ember Drag | drag with perfect shifts | gearbox | ember |
| 13 | Skyfall | catch the falling body | Veil Projector | ember |
| 14 | Revenant Wingman | betrayal | Dummy plug | storm |
| 15 | **General Thunder** | act boss, capture the fortress | hub-ship, Spike-Dock | storm |
| 16 | Operation Prism | siege cannon puzzle | Satellite Cannon | storm |
| 17 | Leviathan | boarding at scale | I-Field | null |
| R4 | Null Sprint | cross the null zone before the rifts close | sprint | null |
| 18 | Paperblade | the unwinnable fight | Feral | null |
| 19 | Mother Ship | fleet finale, all Vectors | — | null |
| 20 | **Mirror Titan** | finale | tier-skip Helix Break | null |

Post-campaign: ascending dungeon tiers, daily HARROW, weekly, seasons, Trace ladders, Niobium band.

## 4. World

Keep the six-zone streamed world (500×500 per zone) but make it **chase-camera terrain**: height
field with ridges (Gun Metal's dunes and snow hills), roads for Vectors, bases with beacons and
barracks, capital-ship wrecks as boarding playgrounds. Dungeons keep all 11 archetypes; RACEWAY,
CONVOY and GAUNTLET are already Vector content.

Destructible terrain (Gun Metal): barracks, relays, walls and trees are destructible; craters persist
for the mission.

## 5. Progression mechanics from the anime (opt-in depth, doc 06 frames)

1. **Sync ratio** per frame: rises with play time and no-damage encounters; tighter handling and
   faster Art charge, but a pain link makes chip damage stagger the pilot. Over 100% unlocks over-sync Arts.
2. **Battery / umbilical** (bio-organic line only): tethered to power sockets; leaving range starts
   60 s full / 300 s low-power; low-power halves movement; a captured perpetual core removes the timer.
3. **Hype meter** (drill line): fed by aggression (hit streaks, parries, taunts); spending it scales
   attack *size*; overfill risks Nemesis burst; suppressor fields drain it.
4. **Spike-Dock** (drill line): drill-grapple that hijacks a limb, weapon or vehicle; how enemy frame
   lines are acquired.
5. **Combination tiers**: head-only → head-on-body → body-in-fortress; each tier keeps the lower as
   its core and opens a new arena scale.
