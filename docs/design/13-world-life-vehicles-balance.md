# 13 — World life, drifting, vehicles, silhouettes, and the balance pass

What this round changed, and the research each change is built on. Research sources are the
existing reports in `docs/research/` plus the searches cited inline.

## 1. Drifting: why it was infinite, and the rules now

The old drift was a single flag: hold SPACE above 20% speed. Nothing ended it, nothing paid for it.
Arcade drift games all put a *bill* and a *payout* on the slide:

- **Mario Kart**: a held drift charges a Mini-Turbo through colour tiers and pays a boost on release
  (0.62 s / 1.67 s / 2.63 s for the three tiers); the boost is *released by letting go*
  ([Super Mario Wiki: Mini-Turbo](https://www.mariowiki.com/Mini-Turbo),
  [Nintendo Life drifting guide](https://www.nintendolife.com/guides/mario-kart-8-deluxe-drifting-guide-how-to-drift-slipstream-and-boost)).
- **Need for Speed Underground**: entry is a brake tap or handbrake while steering at speed; the slide
  scrubs speed the whole time; spinning out or hitting a wall ends it and costs points
  ([NFS wiki: Drift Race](https://nfs.fandom.com/wiki/Drift_Race),
  `docs/research/02-racing-armagetron.md` §A4, §T4).
- **Ridge Racer**: the exit is a *snap* back to traction when the wheel is straightened
  (`02-racing-armagetron.md` line 116).

Implemented in `game.js` `updateDrive`:

| Phase | Rule |
|---|---|
| Entry | hold BOOST, speed > 35% top, steering > 25%, not airborne, no cooldown, skids not hot. Tail kicks out toward the outside of the turn; 5% speed lost. |
| Sustain | charge tiers at 0.8 / 1.8 / 2.8 s; speed scrubs at 3.5 + 0.25 × slip per second; nitro banks from slip (kept). |
| Exit | release, or wheel straight and tail settled for 0.25 s, or wall (crash), or speed < 18%, or **3.4 s cooked**. |
| Payout | TURBO / SUPER / ULTRA: +15 / 25 / 35% top speed (capped 1.35×), turbo 0.5 / 1.0 / 1.6 s, +6 / 12 / 20% nitro. |
| Cooldown | 0.35 s after a release, 0.9 s after a cooked release, and a HEAT gauge blocks re-entry while hot. |

The HUD reads `DRIFT`, `DRIFT ●`, `DRIFT ●●`, `DRIFT ●●● RELEASE!`, `TURBO`, `SKIDS HOT`.

## 2. Nitro and air

NFS models nitrous as extra engine force, not a cap override (`02` §A6). We keep that and add lift:
a nitro launch off a crest or a soft dune adds +3.5 (or ×1.35) vertical velocity, the bottle keeps
burning for 0.45 s of afterburner lift in the air, forward speed is held while airborne with nitro,
gentler crests (slope −0.30 instead of −0.42) launch under nitro, and a jump over 1.2 s pays "BIG AIR"
nitro back. WAVERIDER vehicles take 55% gravity (they glide).

## 3. Vehicles: 23 designs, two per lineage

`js/vehicles.js` pairs a drivetrain with a silhouette. New drivetrains: **WAVERIDER** (fast, low grip,
long glides), **BEAST** (four legs: high grip, big jumps, hard ram), **SIEGE CRAWLER** (slowest, most
grip, heaviest ram). The first design is standard issue; the second is built in the WORKSHOP → VECTORS
tab (120 alloy, 1 core, 150 salvage) once you own the lineage's base frame. The pick is a button on
the frame select screen and is remembered per lineage. Relic frames get one bespoke machine each.

| Lineage | Standard | Built |
|---|---|---|
| AEGIS | PALADIN TANK (tank, shield bow) | WAR-SLED (crawler, twin lances) |
| VULCAN | GUN-TANK (tank, twin cannons) | HALFTRACK (crawler, rotary cannon) |
| FANG | TALON BIKE (bike, claw skids) | RIDGE-CAT (beast) |
| HEXEN | SIGIL DISC (disc, hovers water) | STAFF-GLIDER (waverider) |
| VIPER | STEALTH BIKE (bike) | BLADE-WING (waverider) |
| MORROW | REAPER DISC (disc, rim blades) | HEARSE (crawler) |
| STRIX | INTERCEPTOR (waverider jet) | LANCE BIKE (bike) |
| TITAN | SIEGE CRAWLER (crawler) | FORTRESS DISC (disc) |

`tools/gallery.html?what=vehicles` renders all of them side by side.

## 4. Frame silhouettes

The design bible's rule (`06-frames.md`): *head = tier, colour = allegiance, asymmetry =
specialisation*. `models.js` `buildMech` now carries a body language per lineage, drawn from the
archetype catalogue (`04-gundam-designs.md` §0, §6a) and the Eva / Gurren reports (`05-eva-gurren-other.md`):

| Lineage | Head | Body | Source archetype |
|---|---|---|---|
| AEGIS | twin eyes, V-fin, jewel | chest intakes, skirt, two blade hilts | Gundam-type hero |
| VULCAN | single wide visor, brow, antenna | broad boxy shoulders, ammo drums on the hips | GM-type production |
| FANG | mono-eye on a rail, commander horn, cable | one spiked pauldron + one shield, beast legs, thruster tail | Zeon mono-eye |
| HEXEN | hidden dark visor, sweeping horns | slim, flared back binders | Newtype |
| VIPER | hooded narrow head, slit eye | thin limbs, cloak plates | stealth (Deathscythe / Blitz) |
| MORROW | jaw face, dim eyes, exposed neck | bare inner frame with slab plates, twin reactors | Relic (Barbatos) |
| STRIX | narrow visor, fin crest | swept wings, pointed feet | Variable (Zeta / Valkyrie) |
| TITAN | slit sunk into the shoulders, dome | bell legs with hover jets, huge skirt, hunched | Heavy (Dom) |
| REVENANT-13 | muzzle jaw, one optic, horn | shoulder pylons, restraint clamps, red core | Evangelion |
| COREBREAKER, KEYHEAD | red shades, spike crest | a face on the chest, drill forearms | Gurren Lagann |

Pack bolt-ons (wings, blade fins, shoulder cannon, coil, hood) and mark trim stack on top, so the 135
read as eight families × five packs × three marks, not 135 palettes. `tools/gallery.html?what=base`.

## 5. Balance pass (`tools/balance.js`)

Power = √(DPS × effective HP) × (speed/17)^0.35, with reloads amortised, splash and arc credited,
elemental damage credited at 40%. Every variant is compared with its own lineage base, relics with the
base they descend from. Before: LAUNCHER sat at 1.29 / 1.42 / 1.58× against AILE's 1.09 / 1.20 / 1.33×,
and relics ranged 1.47–2.78×. After tuning the pack multipliers and relic stats:

| Mark | Band (all five packs) |
|---|---|
| MK.II | 1.09 – 1.12× |
| CUSTOM | 1.20 – 1.24× |
| PROTOTYPE | 1.34 – 1.38× |
| RELIC | 1.50 – 1.64× of the base lineage |

The base eight are deliberately untouched (hand-tuned, and the heuristic under-rates HEXEN's homing splash).
Run `node tools/balance.js` (or `--csv`) after any stat change.

## 6. Living in the Reach: what RuneScape and Albion teach

- **Achievement Diaries** highlight existing content in an area through tiered task ladders (easy →
  elite) paying area-scoped perks ([OSRS Wiki](https://oldschool.runescape.wiki/w/Achievement_Diary),
  [RuneScape Wiki: Area Tasks](https://runescape.wiki/w/Area_Tasks_achievements)).
  → **Zone diaries**: four tiers per territory (kills, elites, nests, caches, veins, drive time, dungeon
  tier, signals). HARD pays +10% salvage in that zone, ELITE +25% alloy. On the WORLD MAP.
- **Daily challenges / slayer tasks** give a reason to log in and a direction for the session
  ([RuneScape Wiki: repeatable events](https://runescape.wiki/w/Slayer_daily_challenge)).
  → **Daily task board**: three seeded tasks a day, claim each, sweep all three for a bonus core and a
  streak that grows 10 alloy a day. On the BROKER screen and the PILOT sheet. Contracts (slayer-style
  hunts) already existed and now feed the board.
- **Random events** interrupt the grind with a small surprise ([RuneScape Wiki: Random events](https://runescape.wiki/w/Random_events)).
  → **Cache signals**: every ~100 s (faster in dangerous zones) a treasure site pings, is marked gold on
  the minimap, and pays alloy (and a core chance at Danger III+).
- **Albion's zone tiers** trade risk for reward: blue → black zones with rising fame and resource tier
  ([Albion Wiki: Types of Regions](https://wiki.albiononline.com/wiki/Types_of_Regions),
  [KeenGamer zone guide](https://www.keengamer.com/articles/guides/albion-online-everything-you-need-to-know/section/3-albion-online-zone-colors-pvp-rules-and-risk-levels/)).
  → Alloy drops scale +25% per danger level, veins are richer and more numerous by danger, Danger III–IV
  veins can hold a frame core, and the zone entry banner states DANGER, DIARY progress and perks.
- **Gathering** as a parallel loop to combat.
  → **Alloy veins**: 5 + 2×danger crystal clusters per territory, regrown daily, mined with the interact
  key, shown on the minimap.

## 7. Hooking the loop (what keeps people)

Every session now has: a daily board (3 short goals), a zone diary (a long ladder with a perk at the
end), a workshop bill to save toward (a frame or a vehicle), a random signal to chase, and a streak to
protect. The remaining gaps, in order of leverage: a guided first ten minutes, a leaderboard for the
WEEKLY, cloud saves, and a hangar viewer that shows the machine you are building.
