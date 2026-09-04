# 06 — Frames: design language, lines, the launch roster

All designs are original placeholders inspired by the catalog in `docs/research/04-gundam-designs.md`
and `05-eva-gurren-other.md`. Rule for the artists: **head = tier, colour = allegiance, asymmetry =
specialisation, every gimmick has a bill, every transform has a job.**

## 1. Design language

| Family | Head | Body | Colour | Reads as |
|---|---|---|---|---|
| **Hero** | twin eyes + forked crest | squared chest with intakes, slim waist, skirt armour, backpack thrusters | white base, one dark torso colour, one warm accent (never all of white/blue/red/yellow together) | prototype, protagonist |
| **Production** | single visor, no crest | same body simplified | faction muted | grunt, squadmate, cheap repair |
| **Mono-eye** | one glowing eye on a rail, horn for commanders | rounded chest, one spiked pauldron + one shield, external cables, tank feet | olive; aces in one bright colour | enemy backbone; capturable |
| **Heavy** | mono-eye slit | huge skirt, bell legs with hover jets, hunched | purple/black | elite weight |
| **Newtype** | hidden eyes, sweeping horns | flared binders, hollow torso with drone racks | pink/white/purple, red for the rival | remote weapons, aristocracy |
| **Relic** | jaw face, twin eyes | exposed inner frame at joints, slab armour, no beam glow | grey with one accent | ancient melee, eats its pilot |
| **Bio-organic** | single or quad optics, muzzle jaw | thin, restraints as armour, shoulder pylons, entry plug | hazard orange/blue, purple/green, red | grown not built, battery-limited |
| **Drill** | a face on the chest, sunglasses crest | mismatched welded parts, drills for limbs | red and gold | hot-blooded, combining, capture |
| **Variable** | narrow visor | jet with legs folded under, arms as pylons | grey/white with a squadron stripe | three modes, missile circus |

## 2. Lines and the 24-frame launch roster

Stat lean uses the six attributes of doc 04: OUT / REA / FRM / SRV / COO / UPL. Tier per the
catalog's ladder: T0 trainer, T1 production, T2 ace custom, T3 prototype, T3b rebuilt, T5 overdrive, T6 relic.
"Codebase" = the current HERO FRAME mech it replaces (keeps its unlock/mastery data).

### Line A — Hero (tricolor prototypes; Frame tree: Striker/Bastion/Vector)

| # | Frame | Tier | Vector | Role · stat lean | Gimmick (and its bill) | Unlock | Codebase |
|---|---|---|---|---|---|---|---|
| 1 | **VANGUARD** | T3 | Jet | starter all-rounder · even, REA+ | *Learning core*: +1 permanent attribute per act boss (never mass-produced, so #7 LINE is always weaker) | start | aegis |
| 2 | **DELTA** | T3b | **Waverider** (flat delta glider, can carry an ally, ram 120 impact) | interceptor · SRV++, FRM− | *Emotion barrier*: 3 s glow shield at <20% HP, once per mission | mission 5 | strix |
| 3 | **TRIAD** | T3b | **Three craft** (nose fighter / gunship / tank-legs) that re-dock; swap halves at a dropship | heavy swap-in · OUT++, FRM+, SRV− | *Head cannon* ship-killer 4 s charge; *boot strike* kicks the leg module off as a bomb | act 2 mission | — |
| 4 | **CHRYSALIS** | T5 | body-opening **Destroy mode** (not a vehicle) | overdrive · sealed FRM+, open SRV++ melee++ | 5-minute open timer then crash to 50% stats; *magnum* 5 shots, each may break the arm | act 3 mission | — |
| 5 | **MOUSTACHE** | T6 | none | endgame relic · FRM++ (self-repair), REA++ | *Nanoskin* regen 3%/s out of combat; *Moonlight wing* disintegrates all tech in 200 m, once per campaign | finale | — |

### Line B — Production and captured (Frame tree: Bastion)

| # | Frame | Tier | Vector | Role · stat lean | Gimmick | Unlock | Codebase |
|---|---|---|---|---|---|---|---|
| 6 | **CYCLOPS** | T1 | none (mono-eye tracks the player) | enemy backbone, capturable · FRM+, UPL− | *Commander horn* variant: +30% thrust, custom colour, leads squads ("the red one") | Spike-Dock capture, act 1 | — |
| 7 | **LINE** | T1 | mini core-jet | squadmate / cheap repair · FRM−, OUT− | *Modular kit*: any weapon fits; only frame repaired free | after 3 sorties | vulcan |
| 8 | **SKATER** | T1 heavy | **Hover-tank** (kneels into skirt-down slide with fixed forward cannon) | heavy ground assault · FRM++, OUT+ | *Formation strike*: with two LINE allies, a three-in-a-row unblockable dash | Revenant mirror in ember DEPTHS | titan |
| 9 | **SAUCER** | T1 | **Disc** (round, loiter, underslung rifle fires along flight vector) | air patrol · SRV+, UPL+, melee− | *Endless loiter*: no flight fuel drain in disc | Revenant mirror in glacier | — |
| 10 | **ARSENAL** | T2 | **Siege crouch** (four-point stance, cannons lock, cannot move) | suppression artillery · OUT++, FRM+, SRV−− | *Open all hatches* alpha strike, then dry → falls back to a knife | mission 12 Fortification | — |

### Line C — Ace and Newtype (Frame tree: Vector/Striker)

| # | Frame | Tier | Vector | Role · stat lean | Gimmick | Unlock | Codebase |
|---|---|---|---|---|---|---|---|
| 11 | **CRIMSON** | T2 rival | none | rival boss / late unlock · all +, SRV− outside burst | *Abdominal cannon*; escape-pod head keeps the pilot alive; palette locked red until beaten | mission 8 Red Comet then Revenant mirror | — |
| 12 | **SEER** | T3 | none | remote-weapons specialist · UPL++, REA+, FRM− | *Fin bits* 6–24 that orbit, snipe or lock into a barrier; needs Uplink 20; T3b version hijacks enemy drones | Labyrinth blueprint | — |
| 13 | **REAPER** | T3 | **Hover-bike**, cloak folds closed = invisible, jammed, no shields | stealth assassin · SRV+, melee++, FRM− | one scythe swing from invisibility crits ×2.5 | Revenant mirror in cloister | viper |
| 14 | **CLAW** | T3 | **X-claw** flyer that grabs an enemy and fires a chest cannon point-blank | grappler-interceptor · SRV++, melee+, UPL+ | *Wolf-pack net* with two allies | Revenant mirror in wreck | fang |
| 15 | **WITCH** | T3 | none; 11 staves attach to limbs for form change (rifle / wing / boosters) | technical duelist · UPL++, REA++, FRM only via staves | *Link score* tiers control more staves; antidote fields shut it all down | Halls blueprint | hexen |

### Line D — Bio-organic "Revenant" (battery, sync; Frame tree: Bastion/Striker)

| # | Frame | Tier | Vector | Role · stat lean | Gimmick | Unlock | Codebase |
|---|---|---|---|---|---|---|---|
| 16 | **REVENANT-0** | T3 proto | none (crawls on all fours as a fast "beast" gait) | field support · REA++, FRM+, COO−− | strongest *Veil* projector; clamp release trades 30% armour for a strength surge; battery 60 s / 300 s low | Revenant mirror in storm | — |
| 17 | **REVENANT-1 FERAL** | T3 | beast gait | last-stand brawler · OUT+, FRM+ | at 0 battery it doesn't stop: *Feral* AI melee, limb regen, no ranged; eat a boss core to remove the battery | mission 18 Paperblade | morrow |
| 18 | **REVENANT-2 QUAD** | T3b | beast gait | the conventional one · even, UPL+ | four optics = 60° lock cone in Frame; environmental packs (heat, dive) swap per mission | act 3 mission | — |
| 19 | **REVENANT-13 TWIN** | T5 | none | co-op frame · OUT++, REA++ | four arms, two-seat cockpit; P2 or wingmate drives the second pair; sync gates dual spears | act 4 | — |

### Line E — Drill "Corebreaker" (hype, capture, combining; Frame tree: Striker)

| # | Frame | Tier | Vector | Role · stat lean | Gimmick | Unlock | Codebase |
|---|---|---|---|---|---|---|---|
| 20 | **KEYHEAD** | T0 | itself (a head-sized drill-pod, the fastest ground Vector, 1 HP bar) | trainer / Spike-Dock tool · SRV++, FRM−− | *Spike-Dock* into any machine: steal a leg, an arm, a vehicle; docks onto #21 | mission 11 | — |
| 21 | **COREBREAKER** | T3b | Keyhead on a stolen red mid-frame; Vector = **hover-bike** built from the stolen legs | hype build · OUT++, melee++ | *Hype meter* scales attack size; *Helix Break* finisher grows with meter; overfill = Nemesis burst | mission 15 | — |
| 22 | **ARK HULL** | T6 | the captured walking fortress folds into a 200 m frame with #21 in its chest | siege-mission super frame / hub-ship | launches allied frames; tier-skip Helix Break beats the Mirror Titan | mission 15 capture | — |
| 23 | **PUGILIST** | T3 | **Bike** (core lander the suit rides) | martial artist · melee+++, REA+, OUT−− | *Palm finisher*; *Calm mode* (meter fills by not taking damage, not rage): panels open, frame turns gold | Crucible blueprint | — |

### Line F — Variable and beast (Frame tree: Vector)

| # | Frame | Tier | Vector | Role · stat lean | Gimmick | Unlock | Codebase |
|---|---|---|---|---|---|---|---|
| 24 | **ARROW** | T3 | **three modes**: Flight (fast, forward guns), Crouch (bent-knee hover with arms), Stand | variable fighter · SRV++, OUT+ | *Circus* 12-lock missile ult; armour packs bolt on and jettison mid-fight | Raceway blueprint | — |
| 25 | **ANCHOR** | T2 | **Roller** (ankle rollers, twin rocket anchors) | grapple mobility · SRV++, UPL+ | anchor to bosses and terrain, pull enemies in; cockpit ejects as an infantry unit | Trace ladder | — |
| 26 | **RIDGE-CAT** | T2 | **Beast** quadruped (pounce, bite, tail; climbs, no drift) | animal frame · SRV+, FRM+ | swappable armour sets (speed / blades / artillery) at supply points | Convoy blueprint | — |

26 listed; **24 at launch** (ARK HULL and REVENANT-13 are post-M5 stretch). Non-player: **CHOIR**
(white eyeless mass-production drones with membrane wings and a lance; hunt in packs, regenerate,
resurrect once; capturable late as a pilot-less auto-fighting frame) and the **Revenant mirrors**.

## 3. Tiering as progression

```
T0 trainer (KEYHEAD) → T1 production (LINE, CYCLOPS, SKATER, SAUCER) → T2 ace custom (ARSENAL,
CRIMSON, ANCHOR, RIDGE-CAT) → T3 prototype (VANGUARD, SEER, REAPER, CLAW, WITCH, REVENANT-0/1,
PUGILIST, ARROW) → T3b rebuilt (DELTA, TRIAD, REVENANT-2, COREBREAKER) → T5 overdrive (CHRYSALIS,
REVENANT-13) → T6 relic (MOUSTACHE, ARK HULL) → rival mirrors (the Revenant bosses)
```

- **Rebuilt** frames visibly accumulate salvaged enemy parts (Barbatos forms, Build Fighters kitbash):
  each mission's captured part bolts on and changes the silhouette. `models.js` already builds from
  primitives, so bolt-ons are cheap.
- **Packs** are the cheap way to give one hero many silhouettes: VANGUARD gets Aile / Sword /
  Launcher style packs (mobility / blade / artillery) from races and trials.
- **Ace customs** are paint + horn + one asymmetric weapon; the paint is the reward (cosmetics system exists).

## 4. Unlock paths (five, so no single grind)

1. **Story**: one frame per act boss (VANGUARD start, DELTA, TRIAD, CHRYSALIS, MOUSTACHE).
2. **Revenant mirrors** in zone DEPTHS (codebase rule): SKATER, SAUCER, REAPER, CLAW, REVENANT-0, CRIMSON.
3. **Blueprints** from dungeon archetypes: SEER (Labyrinth), WITCH (Halls), PUGILIST (Crucible), ARROW (Raceway), RIDGE-CAT (Convoy).
4. **Capture** via Spike-Dock: CYCLOPS, CHOIR, ARK HULL.
5. **Ladders**: LINE (sorties), ANCHOR (Trace), ARSENAL (Fortification), KEYHEAD/COREBREAKER (missions 11/15).

## 5. Per-frame identity checklist (for every new frame)

- One silhouette read at 64 px (the select-screen icon).
- One Vector with a *job* (glider, loiter, slide, grab, split, bike, beast, wall-drawer).
- One signature weapon (doc 05 ✱) and one melee.
- One gimmick with a bill (timer, heat, battery, ammo, sanity, body).
- One counter the enemy can field (antidote field, jammer, ballistic vs beam armour rule).
- Three Frame trees (Striker / Bastion / Vector) with a 30-point capstone that changes the gimmick.
