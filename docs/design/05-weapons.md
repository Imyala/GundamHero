# 05 — Weapons and unlocks

Goal: **lots of weapons that feel different**, unlocked steadily. Gun Metal had 24 (12 per form)
and reviewers said they arrived too fast and blurred together. Borderlands proves a handful of part
slots with manufacturer identity feels like millions. The answer is a moderate catalog of *named*
weapons (60 at launch) whose parts roll, on a strict one-new-weapon-per-mission drip.

## 1. Slots

- **4 loadout slots per sortie** (Gun Metal): 2 Frame, 2 Vector. Weapons are form-gated.
- **Missile salvo** counter shared across forms, separate ammo pools per form (Gun Metal manual rule).
- **Infinite basics**: Frame machine pistols and Vector nose vulcan never run out.
- **Melee** is Frame-only and the highest DPS; every frame ships a signature melee.
- **Ammo pickups** restore 50% for all equipped weapons.

## 2. Weapon families (12) and the anime weapon they echo

| Family | Form | Echo | Feel | Impact/hit |
|---|---|---|---|---|
| **Vulcan / machine pistol** | both | head vulcans, GM machine gun | infinite, fast, weak | 3 |
| **Beam rifle** | Frame | RX-78 beam rifle | precise, heat per shot, pierces light armor | 30 |
| **Bazooka / launcher** | Frame | hyper bazooka, Guncannon | slow shell, splash, big stagger | 80 |
| **Gatling / cannon** | both | Heavyarms, Zaku machine gun | clip + reload, spin-up | 8 |
| **Blade** | Frame | beam saber, heat hawk, GN sword, beam naginata | 3-hit combo, dash-slash | 60 |
| **Lance / drill** | Frame | Kimaris lance, Gurren drill | charge attack, pierce, ram bonus | 100 |
| **Missiles** | both (salvo) | Gun Metal auto-lock, Itano circus | hold to paint, release | 40 each |
| **Bits / funnels** | Frame | Qubeley funnels, Nu fin funnels, dragoons | orbit, fire from angles, Uplink-scaled | 15 |
| **Mega cannon** | Frame / Disc | mega particle cannon, hyper mega launcher, satellite cannon | root, charge, screen-wide beam, +25 heat | 150 |
| **Field / shield** | Frame | shield with inbuilt guns, AT-field, I-field | absorb pool, break, projected wall | — |
| **Bombs / torpedoes** | Vector | napalm, ground-hugging torpedoes | ground attack from the air | 60 |
| **Traps / drones** | both | mines, gun drone | placed, autonomous | 20 |

The codebase's 13 dead secondaries slot in directly: Flak Fan (gatling), Missile Rack (missiles),
Orbit Blades (bits), Arc Coil (drone/trap), Mine Layer (trap), Gun Drone (drone), Flame Projector
(cannon), Mortar Pod (bazooka), Frost Repeater (beam rifle), Javelin Cycler (lance), Storm Halo
(field), Grav Anchor (trap). Their `perLevel` curves become weapon-line bonuses.

## 3. Parts and rarity (Borderlands structure, Sacred sockets)

Weapon = **family + manufacturer body + barrel + grip + stock + sight + accessory**.

- **Body** sets manufacturer identity: fire pattern and heat profile (three houses: *Anaheim*-style
  precision beams, *Zeon*-style heavy solid ammo, *Celestial*-style GN energy with drain). Names are placeholders.
- **Barrel** sets the displayed name, damage and accuracy.
- **Grip** matching the body's house gives reload/heat bonuses.
- **Accessory** gives the prefix and an on-hit effect (burn, shock, frost, pull).
- **Sight** only rolls at Custom or above.

Rarity is drawn **first** from a balance table (source and difficulty band), then parts are drawn
from pools that rarity unlocks. This stops "sum of parts" rarity exploits.

| Tier | Colour | Mods | Random parts | Sockets |
|---|---|---|---|---|
| Standard | grey | 0 | 0 | 0 |
| Field | green | 1 | 1 | 0 |
| Custom | blue | 2 | 2 | 1 |
| Prototype | purple | 3 | 3 | 2 |
| Signature | orange | 1 fixed signature part with a unique effect + 2 random | 2 | one per family |
| Set | teal | fixed, 2/4-piece bonuses that change an Art; from a converter after the first clear | 2 |

```
Budget(ilvl)      = 10 × 1.15^(ilvl/15)                 (+15% per 15 ilvl)
quality mult      = 1.0 / 1.1 / 1.25 / 1.4 / 1.6  (green → orange)
slot mult         = 1.0 weapon/torso, 0.75 arms/legs, 0.56 head/backpack
secondaries total = 2/3 of the primary budget; each socket costs 10% of budget
```

**Sockets** (the codebase's 4-socket / resonance system stays): accept **gems** (sol/pyre/keen/verd/ruin,
pure/hybrid/prism resonances, 16 named effects — keep all of it), **runes** (raise an Art rank at the
cheaper 4% recharge penalty), and **cores** (fixed-value bonuses get the socket tier bonus +5/+10/+15%).
Removing a socketed item destroys the others in that item (Sacred), so socketing is a commitment.

## 4. Unlock plan

Sources, in the order a player meets them:

1. **Mission reward**: every campaign mission awards exactly one new weapon *or* frame (20 missions → ~14 weapons, 6 frames).
2. **Drops**: enemies drop weapons of their family at rarity by band; aces drop their Signature.
3. **Corrupted mirror bosses**: drop the mirrored frame's signature weapon and unlock the frame (codebase rule).
4. **Blueprints**: 5 fragments from a dungeon archetype craft that archetype's weapon (Labyrinth → bits, Raceway → torpedoes, Halls → field, Crucible → mega cannon).
5. **Capture** (Spike-Dock, doc 06/07): steal an enemy's weapon arm mid-fight; keeps it if you finish the mission.
6. **Races**: podium = Vector part; drift/drag records = tuning parts.
7. **Broker / Trials / Seasons**: existing systems now pay weapons.

The **Collection Log** counts 60 named weapons + 24 frames + 16 resonances + Vector parts, and can reach 100%.

## 5. Launch catalog (60 named weapons; ✱ = Signature)

**Frame — Vulcan / pistol**: Machine Pistols (infinite) · Twin Autocannons · Head Vulcans · Needle Repeater ✱ *Riot Needle*
**Frame — Beam rifle**: Beam Rifle · Long Rifle · Frost Repeater · Pulse Carbine · ✱ *Crimson Duet* (twin rifles, alternating)
**Frame — Bazooka**: Hyper Bazooka · Mortar Pod · Siege Mortar · Grenade Rack · ✱ *Bloom Cannon* (delayed cluster)
**Frame — Gatling**: Flak Fan · Rotary Cannon · Flame Projector · Assault Cannons · ✱ *Chest Gatling* (torso-mounted, fires while meleeing)
**Frame — Blade**: Beam Saber · Heat Hawk · Beam Naginata · Twin Daggers · Scythe · ✱ *GN Edge* (saber that also fires a beam)
**Frame — Lance / drill**: Rail Lance · Javelin Cycler · Heat Rod (whip) · Drill Arm · ✱ *Helix Drill* (grows with Hype meter)
**Frame — Bits**: Orbit Blades · Fin Bits (×4) · Dragoon Pod (×6) · Gun Drone · ✱ *Choir Bits* (bits that also shield)
**Frame — Mega cannon**: Mega Particle Cannon · Hyper Mega Launcher · Ion Cannon · ✱ *Satellite Cannon* (needs orbital relay line of sight)
**Frame — Field**: Heater Shield · Storm Halo · Veil Projector · I-Field Generator ✱
**Frame — Traps**: Mine Layer · Arc Coil · Grav Anchor · Jammer Pod
**Vector — Nose guns**: Nose Vulcan (infinite) · Rapid Cannon · Gauss Gun · ✱ *Phalanx* (shoots down missiles)
**Vector — Rockets**: Mini Rockets · Rockets · Mavericks (anti-air) · Trident (3 homing) · Phoenix (spread) · ✱ *Circus Rack* (12-lock)
**Vector — Bombs**: Demolition Bombs · Napalm · Torpedoes (ground-hugging) · Disc Launcher (ricochets, self-damage) · ✱ *Harpoon* (tethers a target and drags it)

Plus tuning parts for racing (doc 03 §8).

## 6. Introduction drip (Gun Metal's lesson, fixed)

| Mission | New weapon | Why then |
|---|---|---|
| 1 Zero Hour | Machine Pistols, Beam Rifle, Missiles, Nose Vulcan (starter kit) | fixed |
| 2 | Flak Fan | first dropship swarm |
| 3 | Trident | six jets before the APCs land |
| 4 | Beam Saber | first boarding |
| 5 (act boss) | first frame unlock | — |
| 6 | Hyper Bazooka | first heavy tank |
| 7 | Torpedoes | naval mission |
| 8 | Fin Bits | first Newtype-class ace |
| ... | one per mission, alternating Frame/Vector | |

A weapon is never awarded in the same mission as a frame or a new enemy class.
