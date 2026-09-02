# Mecha Design Research 05 — Evangelion, Gurren Lagann, and Wider Mecha Breadth

**Purpose:** catalog mech designs and mechanics from *Neon Genesis Evangelion* (NGE + Rebuild) and *Tengen Toppa Gurren Lagann*, plus a breadth pass over other franchises, as raw material for **original** frames, bosses, and progression systems in a mech action game. Nothing here is meant to be copied; the final "Design takeaways" section converts each source idea into an original-but-inspired concept.

**Research note:** 21 web searches were run. The session's egress proxy blocks direct fetches of fandom.com, wikipedia.org, evageeks.org, namu.wiki, tvtropes.org, cbr.com, gamerant.com and every other wiki/news host attempted, so facts below come from search-result extracts plus established franchise knowledge. Source URLs surfaced by search are listed per section and at the end.

---

## Part A — Neon Genesis Evangelion

### A1. Design language (Ikuto Yamashita × Hideaki Anno)

| Element | What it is | Why it matters for game design |
|---|---|---|
| **"Enormous power restrained"** | Yamashita's core brief from Anno was "the image of an *oni*" — a giant barely under human control — plus *Gulliver's Travels* (a giant tied down by small people). | The whole silhouette communicates *containment*, not protection. A frame that looks dangerous *to its own side* is an unusual and memorable visual hook. |
| **Thin, organic, humanoid** | Smooth curves and flowing lines; "not a robot, but a giant human being"; Yamashita said he deliberately discarded the usual visual cues of mass and mechanical efficiency to make something that reads like a relief on a wall. | Contrast axis against boxy Gundam-style frames. A "bio-line" of frames should read as *bodies with plating*, not machines with panels. |
| **Armor = restraints** | The plating is explicitly described as bindings that restrain the Eva and bind it to NERV's control; the armor "doesn't protect the pilot from external threats, it restrains what's inside." | A frame stat where *removing armor increases power* (and risk) inverts the normal armor tradeoff. |
| **Shoulder pylons** | Tall fins on each shoulder that (a) attach external restraints, (b) store the Progressive Knife, and (c) house sensor arrays (designer notes mention a rainbow "LidarWP" beam scanner). | Pylons as a *multi-function module slot*: weapon holster + sensor + restraint anchor. |
| **Entry plug** | A cylindrical cockpit inserted into the spine, filled with LCL (breathable liquid). Pilot control is *entirely* mental; the hand controls exist only to help focus. | Cockpit-as-spine-insert justifies "ejection" as a plug launch, and justifies pain feedback (the pilot is literally inside the nervous system). |
| **Umbilical cable** | Main power is external. Cut/detached → internal battery: ~1 minute at full activity, no more than 5 minutes in minimal-activity mode. | Time-pressure mechanic; see A5. |
| **S² engine** | Angel-derived perpetual power organ. Only the Mass Production Evas (and later Unit-01, after eating Zeruel's) have one. | The "unlock unlimited battery" endgame milestone. |
| **Core** | Red sphere in the chest (Evas and Angels alike). Destroying the core kills the entity. | Universal weak-point rule shared by player and enemy. |
| **Color as role** | Unit-00 orange/blue = prototype; Unit-01 purple/green = test type; Unit-02 red = production; Unit-03 black; Unit-04 silver; MP Evas white. | Palette-as-tier is an easy readable progression language. |

Sources: [EvaGeeks – Evangelions](https://wiki.evageeks.org/evangelions), [EvaGeeks – Ikuto Yamashita](https://wiki.evageeks.org/Ikuto_Yamashita), [Wikipedia – Ikuto Yamashita](https://en.wikipedia.org/wiki/Ikuto_Yamashita), [Takara Model Studio – Unit-01 design guide](https://takaramodel.com/blogs/news/eva-unit-01-lore-design-background-guide), [Evangelion Fandom – Evangelion Equipment](https://evangelion.fandom.com/wiki/Evangelion_Equipment).

### A2. Unit catalog

| Unit | Color / look | Pilot | Distinctive traits | Notable moments |
|---|---|---|---|---|
| **Unit-00 (Prototype)** | Orange (later rebuilt blue); single cyclopean eye; flat, helmet-like head | Rei Ayanami | First working Eva; unstable activation (went berserk on Rei during a test); often used as shield-bearer / support | Held the SSTO heat-shield during Operation Yashima; self-destructed absorbing Armisael. |
| **Unit-01 (Test Type)** | Purple with green accents; single horn; jaw restraint over a mouth of teeth; two eyes | Shinji Ikari | Contains Yui Ikari's soul; goes **berserk** without power; regenerates lost limbs in berserk; ate Zeruel and gained an S² engine; later "awakened" | Berserk vs Sachiel, escape from Leliel's Dirac Sea, Zeruel fight, 400% sync. |
| **Unit-02 (Production Model)** | Crimson; **four eyes** (two pairs); low-profile head with crest | Asuka Langley Soryu | First true production unit; most conventional/capable in standard combat | Gaghiel (underwater, ships), Israfel duet, D-type diving suit vs Sandalphon, final stand vs MP Evas (EoE). |
| **Unit-03** | Black/grey | Toji Suzuhara | Infected by Bardiel during transport; became the Angel's body | Destroyed by Dummy-Plug Unit-01 while pilot still inside. |
| **Unit-04** | Silver | — | Built at NERV-2 (USA) to test the S² engine; vanished with the entire base in an explosion/dimensional event | Never seen in combat — a "lost prototype" story hook. |
| **Mass Production Evas 05–13** | White, eyeless; lipless mouth with huge visible teeth; long retractable wings that deploy flying-squirrel style, then bird-style; no internal battery | **Dummy Plugs** (Kaworu-pattern) | Internal S² engines (no cable); carry polymorphic **replica Lances of Longinus** that reshape into blades; regenerate; nine units | Hunt-pack fight with Unit-02 in *End of Evangelion*; "won" by attrition and regeneration. |
| **Unit-05 (Rebuild 2.0)** | Green/orange; four legs on wheels; lance arm and claw arm; no proper hands | Mari Makinami | Provisional unit, self-destructs killing the 3rd Angel | Opens *2.22*; a deliberately "wrong" Eva shape. |
| **Mark.06 (Rebuild)** | Blue/white; halo; built on the Moon by SEELE | Kaworu Nagisa | One of the surviving "Adams" refit as an Eva; carries a Lance; later possessed (12th Angel) | Stops Unit-01's Third Impact in 2.22 with the Lance. |
| **Unit-08 (Rebuild 3.0/3.0+1.0)** | Pink; later Unit-08β/γ with grafted parts of Mark.09–12 ("Overlapping") | Mari | Sniper/air-drop; ends as a multi-Eva chimera | Absorbs enemy Evas in *Thrice Upon a Time*. |
| **Mark.09 / 09-A, 10, 11, 12 (Rebuild "Opfer" types)** | Mark.09: gold/yellow, headless; 10/11/12 skeletal "Adams" | Autonomous / Rei clone | Hijacks systems on contact (took over the *Wunder*); can regenerate from a head; sacrificial ("Opfer") drones | Beheaded by Unit-02's blade, keeps fighting. |
| **Evangelion 13 (Rebuild)** | Purple/dark; **four arms** (second pair folds against chest); **double entry plug**; twelve "RS Hoppers" drones; awakened state turns eyes/highlights red | Shinji + Kaworu (tandem) | Dual-wields the two Spears; awakens into Third/Fourth Impact trigger | Central boss/turned-weapon of 3.0 and 3.0+1.0. |
| **Unit-01 Awakened / Pseudo-Evolved (Rebuild 2.22)** | Purple with glowing green; grows a halo; jaw restraints shatter; energy hair | Shinji (400%+) | Fires a projected AT field "hand"; near-Third Impact | Zeruel (10th Angel) rescue of Rei. |
| **Unit-01 Type-F / Unit-02'α, Unit-08β (Rebuild)** | Heavy armor and JA-style equipment (Type-F), amputated-and-regrown limbs | various | Equipment variants for specific ops | Combat mini-variants for a "loadout" system. |
| **Extracanonical (games)** | Unit-01 Type-F (Eva-02 "F-type" heavy equipment), Unit-03 Custom, Eva Unit-α/β, Unit-00 Custom | — | Game-only units and equipment | See A6. |

Sources: [EvaGeeks – Evangelions](https://wiki.evageeks.org/evangelions), [Evangelion Fandom – Unit-00](https://evangelion.fandom.com/wiki/Evangelion_Unit-00), [Evangelion Fandom – Mass Production Evangelion](https://evangelion.fandom.com/wiki/Mass_Production_Evangelion), [EvaGeeks – Evangelion 13](https://wiki.evageeks.org/Evangelion_13), [Evangelion Fandom – Evangelion Mark.06](https://evangelion.fandom.com/wiki/Evangelion_Mark.06), [NamuWiki – Unit 13](https://en.namu.wiki/w/%EC%97%90%EB%B0%98%EA%B2%8C%EB%A6%AC%EC%98%A8%20%EC%A0%9C13%ED%98%B8%EA%B8%B0), [EvaGeeks forum – Mark.06 / Eva-13 / Unit-01](https://forum.evageeks.org/viewtopic.php?t=21862), [NERV Archives – Units 05–13](http://www.nervarchives.com/characters.eva05-13.php), [Grokipedia – Mass Production Evangelion](https://grokipedia.com/page/Mass_Production_Evangelion), [EvaGeeks – Extracanonical Mecha](https://wiki.evageeks.org/Extracanonical_Mecha), [CBR – Best Evangelion Mecha Designs](https://www.cbr.com/best-evangelion-mecha-designs-ranked/).

### A3. Weapons and equipment

| Weapon | Description | Gameplay reading |
|---|---|---|
| **Progressive Knife** | Vibrating-edge combat knife stored in the shoulder pylon; molecular-level cutting; short blade (later a box-cutter-style snap-off version for Unit-02) | Default melee; always available; the "finisher on a downed core" tool. |
| **Pallet Rifle / Pallet Gun** | Standard Eva-scale assault rifle; huge muzzle flash; ineffective against an intact AT field | Baseline ranged; teaches "bullets bounce off fields." |
| **Positron Rifle (Sniper)** | Prototype requiring **Japan's entire power grid** (180 million kW) to pierce Ramiel's field; shots bent by gravity, Earth rotation and magnetic fields; two-shot window; beam-vs-beam interference bent both shots off target | Charge-shot "siege weapon" with a wind-up, external power hookup, and counter-beam interplay. |
| **Sonic Glaive / Smash Hawk / Thunder Spear** | Polearm; large throwing axe/hatchet (Unit-02 in *Eva 2.0*); electrified spear | Melee variety: reach, throw, stun. |
| **Magorox Sword** | Long two-handed sword from the *Eva 2.0*-era equipment set / games | Big-damage melee at the cost of speed. |
| **Lance of Longinus** | Giant bident that ignores AT fields; thrown into orbit to kill Arael; replicas carried by MP Evas can reshape into blades | The one weapon that cuts through the "field" mechanic; also the mythic MacGuffin. |
| **Lance of Cassius / Spear of Gaius (Rebuild)** | Counterpart spears | Paired-key weapons. |
| **Type-D equipment** | Pressure/heat-resistant diving suit used in lava (Sandalphon) | Environmental loadout. |
| **Type-F equipment** | Heavy artillery/armor package (games / Rebuild) | "Fortress" loadout. |
| **SSTO heat-shield** | Improvised shield that held Ramiel's beam for seconds | Consumable barrier item. |
| **N² mine** | Non-nuclear mega-explosive; delays but never kills Angels | Environment-scale attack that *hurts* but is never a solution. |
| **Dummy Plug** | Autonomous pilot substitute (clone-based) that ignores pilot ethics and fights savagely | AI co-pilot / autopilot mode with no morale limit. |
| **Jet Alone** | Rival nuclear-powered robot; ran out of control | A "conventional" rival frame line. |

Sources: [Evangelion Fandom – Evangelion Weapons](https://evangelion.fandom.com/wiki/Evangelion_Weapons), [NamuWiki – Positron rifle](https://en.namu.wiki/w/%ED%8F%AC%EC%A7%80%ED%8A%B8%EB%A1%A0%20%EB%9D%BC%EC%9D%B4%ED%94%8C), [NamuWiki – Operation Yashima](https://en.namu.wiki/w/%EC%95%BC%EC%8B%9C%EB%A7%88%20%EC%9E%91%EC%A0%84), [EvaGeeks – Episode 06](https://wiki.evageeks.org/Episode_06).

### A4. AT Field

- Every Angel and Eva projects an **Absolute Terror Field**: an orange hexagonal-ripple barrier. Conventional weapons do nothing; N² mines only scratch.
- **Neutralize to hit**: an Eva must press its own field against the enemy's, cancelling ("neutralizing") it locally, *then* hit. Many fights are a two-step: 00 or 02 opens the field, 01 strikes.
- Field strength varies; Ramiel's is the strongest, requiring the positron rifle; Leliel's is *inverted* (an inside-out field that swallows).
- Offensive uses: Unit-01 (berserk/awakened) shapes its field into a blade or a giant hand; Unit-00's field is used to shove.
- Game reading: a *shield that must be peeled by a rival shield*, with "field clash" as a stamina contest and a temporary window where the enemy is hittable.

### A5. Power, sync, berserk

| Mechanic | Source facts | Game abstraction |
|---|---|---|
| **Umbilical & battery** | Cable = unlimited power, tethered to launch points/sockets around the city. Cut → **1 min full activity / ≤5 min minimal**. Type-3 batteries extend slightly. MP Evas and Unit-04 have no battery. | A visible countdown that starts when the tether breaks; power sockets are map objectives; low-power mode trades speed for time. |
| **Sync ratio** | Numerical link strength between pilot and Eva. Higher = more precise control **and** more pain feedback (Eva damage felt in the pilot's body, sometimes physically manifesting). 0% = can't activate. >100% (400%) = pilot's consciousness merges with the Eva. Fluctuates with mental state. | A dual-edged meter: raises damage/precision but also raises the pilot damage (stagger/vulnerability). |
| **Berserk** | With zero power, Unit-01 moves on its own (Yui). Jaw restraint snaps, arm regenerates, roars, tears Angels apart, eats Zeruel's S² engine. Triggered by the pilot's extreme peril. | "Last stand" state at 0 battery: regen, feral AI-assisted melee, no ranged. |
| **Awakening (Rebuild)** | Sync >400%, halo, restraints blown off, field-projected hand, near-apocalyptic. | Top-tier ult with a world-cost. |
| **Dummy Plug** | NERV can override a pilot with a synthetic mind. | Optional auto-pilot that fights ruthlessly but can't be interrupted. |

Sources: [EvaGeeks – Evangelion Power Sources](https://wiki.evageeks.org/Evangelion_Power_Sources), [EvaGeeks – Umbilical Cable](https://wiki.evageeks.org/Umbilical_cable), [EvaGeeks – Synchronization](https://wiki.evageeks.org/Synchronization), [NERV Archives – Sync Ratio](http://www.nervarchives.com/glossary.syncratio.php), [CBR – Pilots by sync rate](https://www.cbr.com/neon-genesis-evangelion-eva-pilots-ranked-sync-rate/), [Global Anime News – Berserk explained](https://globalanimenews.com/posts/evangelion-unit-01-berserk-mode-explained-without-the-mecha-cliches/), [Anime Posts – Berserk mode](https://animeposts.org/posts/evangelion-unit-01-berserk-mode-explained/).

### A6. Eva games (brief)

- **Neon Genesis Evangelion: Battle Orchestra (PS2/PSP)** — side-scroll 2D fighter with 3D models, *Smash Bros.*-like. **Synchro gauge** fills by landing combos; at ~60% it turns green and unlocks the first Death Move (R1); at >75% it turns blue, enabling a **battle aura** (temporary speed/damage buff) and the Super Death Move. **AT Field** is a post-block counter that deals large damage. Berserk Unit-01 is an unlockable (beat Hard). Positron-rifle super for Unit-01. Roster includes Evas, Angels (Sachiel, Zeruel, etc.), Jet Alone, MP Evas.
- **Evangelion (N64, 1999)** — action game re-enacting Angel battles; features the umbilical-cable *battery timer* as an actual HUD countdown and AT-field neutralizing as a button.
- **Neon Genesis Evangelion 2 (PS2)** — life-sim/strategy where sync ratio, AT-field skills and mental stability are stats.
- **Girlfriend of Steel / Iron Maiden**, pachinko, *Super Robot Wars* appearances — SRW models the battery as a limited "EN" pool and Berserk as a random status.
- **Extracanonical mecha** (games/manga): Unit-01 Type-F heavy equipment, Unit-00 Custom, Unit-03 Custom, Unit-α/β, "Eva-4444C" etc.

Sources: [GameFAQs – Battle Orchestra guide](https://gamefaqs.gamespot.com/ps2/938633-shinseiki-evangelion-battle-orchestra/faqs/74292), [Evangelion Fandom – Battle Orchestra](https://evangelion.fandom.com/wiki/Neon_Genesis_Evangelion:_Battle_Orchestra), [Otapedia – Battle Orchestra](https://otakumode.com/otapedia/anime/neon_genesis_evangelion/battle_orchestra), [EvaGeeks – Extracanonical Mecha](https://wiki.evageeks.org/Extracanonical_Mecha).

### A7. Angels as boss design

| # | Angel | Look | Attack pattern | How it was beaten (the "puzzle") |
|---|---|---|---|---|
| 3 | **Sachiel** | Humanoid, bird-skull mask, exposed ribs; second mask grows after damage | Arm-spike energy lance; eye beams; regenerates a face | Unit-01 berserks; Sachiel self-destructs *hugging* the Eva — teaches "core exposed after mask regrows." |
| 4 | **Shamshel** | Pink squid/cuttlefish; two energy whip arms | Whips slice buildings; grapples Eva | Cable cut, battery countdown; Shinji stabs core with prog knife inside the whip range — "get inside the whips." |
| 5 | **Ramiel** | Floating blue octahedron/diamond; perfect symmetry | Strongest AT field; particle beam that answers any approach; drops a **drill** to bore into the GeoFront | **Operation Yashima**: whole-nation power hookup, positron sniper shot from range; first shot deflected by counter-beam interference; second hits while Unit-00 tanks with an SSTO shield. Rebuild version morphs its shape and fires continuous beams. |
| 6 | **Gaghiel** | Giant fish/whale with a face | Underwater; sinks fleet | Unit-02 on carrier deck, dragged under; pries jaws open so two battleships fire into its mouth — "make the boss swallow the payload." |
| 7 | **Israfel** | Bipedal, mask face; splits into gold (Alpha) and silver (Beta) twins | Twins fight in sync and heal each other | Both cores must be hit **simultaneously**; pilots train a choreographed 62-second routine to music — "sync-attack twin boss." |
| 8 | **Sandalphon** | Embryo/chrysalis in magma; hatches into a swimming creature | Lava environment; crushing pressure | Unit-02 in D-type suit, coolant pumped into its throat, prog knife — "environmental hazard boss." |
| 9 | **Matarael** | Giant four-legged spider with eyes; central eye drips acid | Acid bores down a shaft toward HQ during power outage | Evas climb shaft manually; 02 opens field & shields, 00 fetches gun, 01 fires straight up — "cooperative relay in darkness." |
| 10 | **Sahaquiel** | Colossal flat eye-creature falling from orbit | Uses itself as a kinetic bomb; self-corrects target | Three Evas sprint to intercept; 01 catches, 00 neutralizes field, 02 stabs core — "catch the falling boss." |
| 11 | **Ireul** | Nanomachine/microbe colony (a "virus") | Evolves to hack MAGI supercomputers | Hacked back by Ritsuko — "cyber boss, no mech combat." |
| 12 | **Leliel** | Striped sphere in the sky; the *real* body is its 2D shadow — a Dirac Sea | Swallows Unit-01 into a pocket dimension; **inverted AT field** | Unit-01 berserks after 16 hours and tears its way out — "boss where the visible target is a decoy." |
| 13 | **Bardiel** | Parasitic slime that infects **Unit-03**, growing extra arms | Possessed allied Eva; stretchy limbs, chokes 02 and 00 | Dummy Plug Unit-01 crushes it, pilot still inside — "corrupted ally / hijacked frame boss." |
| 14 | **Zeruel** | Thin body, skull-like face; folded ribbon arms that unfurl like paper | Arm ribbons cut Evas in one stroke; eye beam punches through 22 armor layers to the command center | Unit-01 out of power → berserk, regenerates arm, projects field blade, **eats the core (S² engine)** — "the strongest, only beaten by transformation." |
| 15 | **Arael** | Winged bird-of-light in orbit | Psychic beam that invades a pilot's mind; out of reach | Lance of Longinus thrown from Earth to orbit — "unreachable boss, one-shot artifact weapon." |
| 16 | **Armisael** | Spinning double-helix ring of light | Pierces Unit-00's field and *merges* into it, invading Rei | Unit-00 self-destructs with the Angel inside — "merge/infection boss; sacrifice resolution." |
| 17 | **Tabris (Kaworu)** | Human form; can control Unit-02 remotely | Descends into Terminal Dogma; AT field so strong it stops time-like | Unit-01 crushes him after he *asks* — "the boss who won't fight." |
| — | **Adam / Lilith** | Source beings | — | Setting-level entities; End of Evangelion. |
| Rebuild | **3rd Angel (2.0)** skeletal bird; **4th (Sachiel)**; **5th (Shamshel)**; **6th (Ramiel)** morphing diamond; **7th** (2.0 skeletal insect); **8th (Sahaquiel)** eye-blob with hands; **9th** (Bardiel) — Unit-03; **10th** (Zeruel) — Rei absorbed, awakened 01; **12th** (Mark.06 possessed) | | | Rebuild reorders numbers and re-mixes puzzles. |

Sources: [EvaGeeks – Israfel](https://wiki.evageeks.org/Israfel), [EvaGeeks – Episode 09](https://wiki.evageeks.org/Episode_09), [TV Tropes – Ep. 09 recap](https://tvtropes.org/pmwiki/pmwiki.php/Recap/NeonGenesisEvangelionEpisode09MomentHeartTogether), [EvaGeeks – Leliel](https://wiki.evageeks.org/Leliel), [EvaGeeks – Dirac Sea](https://wiki.evageeks.org/Dirac_Sea), [EvaGeeks – Zeruel](https://wiki.evageeks.org/Zeruel), [Evangelion Fandom – Bardiel](https://evangelion.fandom.com/wiki/Bardiel), [Evangelion Fandom – Episode 19](https://evangelion.fandom.com/wiki/Episode:19), [Evangelion Fandom – Sahaquiel](https://evangelion.fandom.com/wiki/Sahaquiel), [EvaGeeks – Matarael](https://wiki.evageeks.org/Matarael), [EvaGeeks – Armisael](https://wiki.evageeks.org/Armisael), [Otapedia – Angels list](https://otakumode.com/otapedia/anime/neon_genesis_evangelion/angels), [ScreenRant – 17 Angels explained](https://screenrant.com/neon-genesis-evangelions-17-original-angels-explained/), [CBR – Best Angel designs](https://www.cbr.com/evangelion-best-angel-designs/), [Evangelion Fandom – Ramiel](https://evangelion.fandom.com/wiki/Ramiel), [Wikipedia – Kaworu Nagisa](https://en.wikipedia.org/wiki/Kaworu_Nagisa).

---

## Part B — Tengen Toppa Gurren Lagann

### B1. Design language (Yoh Yoshinari, Gainax)

| Element | Facts | Game reading |
|---|---|---|
| **Gunmen / Ganmen = "face"** | The word means face/facade. Nearly every Ganmen has a **giant face for a torso**; its mouth moves when the pilot talks. The face region is laid out like cranial cortices. | The face is the frame's *identity slot*: swap faces = swap personality/abilities. |
| **Boxy, expressive, varied** | ANN's *Dig for Fire* notes Yoshinari "turned the Evangelion design sense on its ear" — chunky, stylized robots whose expression *is* the design. Few Ganmen share a model. | Emphasize silhouettes and expressions rather than panel lines. |
| **Sunglasses** | Kamina's red triangular shades → Gurren's shoulder emblem → Gurren Lagann's chest glasses used as a thrown boomerang blade; recurring "cool" motif. | A signature accessory that doubles as a weapon. |
| **Drills / spiral** | The drill is the physical manifestation of Spiral Power; DNA helix = evolution = fighting spirit. | The single most reusable motif: drills at every scale, from a key to a galaxy. |
| **Hot-blooded escalation** | Each arc multiplies scale: cave → surface → capital → space → universe. Scale is progression. | Progression = literal size tiers. |
| **Faces stack** | Combining is literally *more faces*: Lagann on Gurren's head; Arc-Gurren Lagann's chest is Gurren Lagann; TTGL's chest is Super Galaxy; a combined Ganmen's power scales with face count. | Combination as nesting-doll tiers; each tier keeps the previous as its "core." |
| **Beastmen pilots** | The Spiral King's animal-human hybrids pilot Ganmen; they cannot produce Spiral Power themselves, so their machines run on the King's supply. Humans ("naked apes") are forbidden from pilots. | Enemy pilots vs. stolen machines: stealing a mech is a *political* act. |

Sources: [ANN – Dig For Fire: The Roots of Gurren Lagann](https://www.animenewsnetwork.com/feature/2008-09-07), [Gurren Lagann Fandom – Gunmen](https://gurrenlagann.fandom.com/wiki/Gunmen), [Gurren Lagann Fandom – Mecha](https://gurrenlagann.fandom.com/wiki/Mecha), [Wikipedia – Gurren Lagann](https://en.wikipedia.org/wiki/Gurren_Lagann), [Shapes – Creative team](https://shapes.inc/fandom/gurren-lagann/author).

### B2. Mech catalog

| Mech | Pilot / side | Design | Abilities / notes |
|---|---|---|---|
| **Lagann** | Simon | Tiny head-sized Ganmen, one face, drill arms/legs, started by the **Core Drill** key | **Lagann Impact**: extends a drill and stabs into any machine, rewriting its OS to combine with or hijack it; power scales with Simon's will. |
| **Gurren** | Kamina (then Viral briefly, Simon) | Red mid-size Ganmen with sunglasses shoulder crest; stolen from a Beastman | Standard body; fists, sunglasses boomerang. |
| **Gurren Lagann** | Simon (+Kamina) | Lagann on Gurren's head; iconic chest shades; drills from anywhere | **Giga Drill Break**; "Finishing Move: Giga Drill Maximum"; gains jet-pack and swords by hijacking Dai-Gunzan parts; canonically ~11 m. |
| **Enki → Enkidu → Enkidudu** | Viral | Sleek humanoid Ganmen with dual blades; Enki wears a helmet; Enkidu adds a second face/set of arms; Enkidudu after a beheading | Rival unit that upgrades alongside the hero; sword duels. |
| **Byakou** | Thymilph (Adenine-based "Thunder" general; White Tiger) | Four-legged/humanoid tiger-faced Ganmen with a spear; fires plasma | Beat Gurren Lagann repeatedly until Kamina's death arc. |
| **Dai-Gunzan → Dai-Gurren** | Thymilph → Team Dai-Gurren | Walking battleship with legs (~600 m); Ganmen hangar + deck; captured via Lagann Impact at the King's bridge | The **mech theft** that becomes the team's flagship. |
| **Sayrune** | Adiane (Scorpion) | Swaps between humanoid and scorpion; tail stinger; sub-aquatic ops from **Dai-Gunkai** (sea battleship) | Transforming animal boss. |
| **Dai-Gunkai** | Adiane | Submarine/sea battleship Ganmen | Naval arena; "Adiane the Elegant." |
| **Shuzack** | Cytomander (bird) | Flying Ganmen, fast, ranged | Air general; commands **Dai-Gunten** (flying fortress) and a bird-Ganmen fleet. |
| **Dai-Gunten** | Cytomander | Airborne carrier; drops Ganmen; Cytomander's suicide-ram | Aerial siege arena. |
| **Gember** | Guame (Armadillo) | Rolling ball-form Ganmen; burrows; commands **Dai-Gundo** (earth battleship) | Rolling-boulder boss; ambush from below. |
| **Dai-Gundo** | Guame | Drill-nosed subterranean fortress | Underground arena. |
| **King Kittan** | Kittan | Yellow star-head Ganmen; "King Kittan Deluxe" combination with Kiyalunga + Dayakkaiser | Heroic sacrifice with a Giga Drill Break vs the Death Spiral Machine. |
| **Kiyalunga** | Kiyal | Transforms into a **shield and lance** for King Kittan | Support-as-equipment. |
| **Dayakkaiser** | Kiyoh → later Yoko | Long-range artillery Ganmen (sniper) | "Support artillery" role. |
| **Yoko M Tank / Yoko W Tank** | Yoko | Small tank-Ganmen with sniper rifle; "Yoko W Tank" later; an alternate design of Dayakkaiser | Non-humanoid ally vehicle. |
| **Grapearl** | Human army (post-timeskip) | Mass-produced humanoid **non-face** mechs made by humans to replace Ganmen; faceless, orthodox mecha look | Deliberately "boring" — they fail against the Mugann. Design contrast lesson: losing the face = losing the soul. |
| **Lazengann** | Lord Genome | Black, sleek, skull-faced; body itself is a drill; tentacle-drills; ~size of Gurren Lagann | Final boss of part 1; later reborn as **Lazengann Overload** (a spiral-power biocomputer) in part 2. |
| **Mugann** | Anti-Spiral | Digital/abstract flying polyhedra; lasers; shields; explode into **cubes** on death (killing nearby units) | The "victory is a trap" enemy: you must not kill them near allies. |
| **Arc-Gurren** / **Arc-Gurren Lagann** | Team Dai-Gurren | Spiral battleship (Lord Genome's) ~ several km; combines with Gurren Lagann in its chest to become a 250 m-class mech | Ship→mech transformation; spatial-distortion attacks. |
| **Super Galaxy Dai-Gurren / Super Galaxy Gurren Lagann (Chouginga)** | Team Dai-Gurren | **Cathedral Terra** (the Moon) reveals itself as a warship; transformed, the Super Galaxy Gurren Lagann is about *half the size of Earth*; throws galaxies as shuriken | Planet-scale frame. |
| **Tengen Toppa Gurren Lagann** | all pilots' spirit | Larger than the Milky Way; a "materialized thought" (10^25× Gurren Lagann per databook) | Galaxy drill; **Super Tengen Toppa** (Lagann-hen film) is near-universe scale. |
| **Ashtanga** | Anti-Spiral | Warship made of stone faces; probability-altering missiles; hand/foot drone swarms | A boss of "faces without hearts." |
| **Granzeboma / Super Granzeboma** | Anti-Spiral avatar | Mirror of TTGL, red/black galaxy-scale; **Anti-Spiral Drill Breaker** | Final duel; "the enemy is your equal at every scale." |
| **Death Spiral Machine** | Anti-Spiral | Field generator that crushes Spiral energy | Interrupt/objective boss. |

Sources: [en-academic – List of TTGL mecha](https://en-academic.com/dic.nsf/enwiki/6425710), [Neo Encyclopedia – List of Gurren Lagann mecha](https://neoencyclopedia.fandom.com/wiki/List_of_Gurren_Lagann_mecha), [Gurren Lagann Fandom – Gurren Lagann](https://gurrenlagann.fandom.com/wiki/Gurren_Lagann), [Gurren Lagann Fandom – Lazengann](https://gurrenlagann.fandom.com/wiki/Lazengann), [Gurren Lagann Fandom – Four Supreme Generals](https://gurrenlagann.fandom.com/wiki/Four_Supreme_Generals), [Villains Wiki – Four Supreme Generals](https://villains.fandom.com/wiki/The_Four_Supreme_Generals), [Gurren Lagann Fandom – Dayakkaiser](https://gurrenlagann.fandom.com/wiki/Dayakkaiser), [Gurren Lagann Fandom – Yoko M Tank](https://gurrenlagann.fandom.com/wiki/Yoko_M_Tank), [Gurren Lagann Fandom – Super Galaxy Gurren Lagann](https://gurrenlagann.fandom.com/wiki/Super_Galaxy_Gurren_Lagann), [Gurren Lagann Fandom – Super Galaxy Dai-Gurren](https://gurrenlagann.fandom.com/wiki/Super_Galaxy_Dai-Gurren), [Gurren Lagann Fandom – Mecha size chart](https://gurrenlagann.fandom.com/wiki/Tama%C3%B1o_de_mechas_de_tengen_toppa_gurren_lagann), [Villains Wiki – Mugann](https://villains.fandom.com/wiki/Mugann), [Villains Wiki – Anti-Spiral](https://villains.fandom.com/wiki/Anti-Spiral), [GameRant – 8 Best Gurren Lagann Mechs](https://gamerant.com/best-gurren-lagann-mechs/), [All The Tropes – TTGL Mecha](https://allthetropes.org/wiki/Tengen_Toppa_Gurren_Lagann/Characters/Mecha).

### B3. The Four Generals as a boss set

Names derive from DNA bases (Thymilph/thymine, Adiane/adenine, Guame/guanine, Cytomander/cytosine) and the four Chinese guardian beasts. Each general owns (a) a personal Ganmen, (b) a **Dai-Gun** battleship that defines the arena, and (c) an element: land (Thymilph), sea (Adiane), earth/underground (Guame), sky (Cytomander). This is a clean template: **four elemental generals × personal frame + flagship arena**, each defeated in its own element, with the first general's flagship *captured* to become the player's hub.

Sources: [IMDb – Gurren Lagann trivia](https://www.imdb.com/title/tt0948103/trivia/), [Gurren Lagann Fandom – Four Supreme Generals](https://gurrenlagann.fandom.com/wiki/Four_Supreme_Generals).

### B4. Core mechanics

| Mechanic | Facts | Game abstraction |
|---|---|---|
| **Spiral Power** | Energy of evolution generated by helix-DNA beings; scales directly with willpower; can defy thermodynamics; "materialize thought." Beastmen can't generate it. Overuse risks the **Spiral Nemesis** (universe-destroying over-evolution). | A **hype meter** fed by aggression, risk, and callouts; spending it enlarges drills/attacks; overfilling has a cost. |
| **Lagann Impact** | Drill-stab a machine → rewrite its OS → combine (ally) or hijack (enemy). Used on Gurren, Dai-Gunzan, on enemy parts to steal a jet-pack. | Grapple-and-pierce action: on enemy = steal parts/vehicle; on ally = combine. |
| **Combining (gattai)** | Lagann + Gurren → Gurren Lagann; + Arc-Gurren → Arc-Gurren Lagann; + Cathedral Terra → Super Galaxy; spirit → TTGL. Combined power ∝ faces. King Kittan Deluxe = 3 sibling Ganmen. | Nested tiers; each new tier wraps the previous. |
| **Giga Drill Break** | Signature finisher: giant drill forms on the arm, charged with spiral power; can grow to any scale. | Meter-spending finisher whose size = meter spent. |
| **Mech theft / capture** | Gurren stolen from a Beastman; Dai-Gunzan captured by boarding; Cathedral Terra reclaimed; Viral captured. | Boarding sequences and salvage progression. |
| **Escalation** | Every arc ends with a bigger frame. Loss (Kamina) precedes the first true power-up. | Size-tier progression as the meta-loop. |
| **Anti-Spiral counters** | Mugann cube-bombs; probability-altering weapons; **Death Spiral Field** that suppresses spiral power; the "multiverse labyrinth" trap. | Enemies that punish the hype meter: "the more you spend, the more they drain." |

Sources: [Shapes – Mecha & Spiral Power](https://shapes.inc/fandom/tengen-toppa-gurren-lagann/mecha-and-spiral-power), [Weebipedia – Gurren Lagann (Mech)](https://weebipedia.fandom.com/wiki/Gurren_Lagann_(Mech)), [Gurren Lagann Fandom – Anti-Spiral](https://gurrenlagann.fandom.com/wiki/Anti-Spiral), [SpaceBattles Factions – Anti-Spirals](https://spacebattles-factions-database.fandom.com/wiki/Anti-Spirals).

---

## Part C — Design breadth: other mecha

| Franchise | Signature frame(s) | Design hooks | Mechanics worth stealing |
|---|---|---|---|
| **Macross** | VF-1 Valkyrie (Shoji Kawamori); later VF-19, VF-25 | F-14-based jet that folds into **GERWALK** (legs + arms on a jet body, inspired by a skier's bent-knee stance, flipped bird-like) and **Battroid** (humanoid). Armor packs: Super, Strike, Armored. | Three-mode transform in real time: Fighter = fastest, weakest turning; GERWALK = hover/strafe, best dodge; Battroid = full melee/aim. **Itano Circus** = massive spiraling micro-missile swarms. Pinpoint barrier. |
| **Code Geass** | Glasgow, Sutherland, Lancelot, Guren Mk-II, Gawain, Shinkirō | 4–5 m "Knightmare Frames"; **Landspinners** (ankle roller-skates); **Slash Harkens** (rocket anchors); Factsphere sensor eye; ejectable cockpit block; later Float Units. | Skate-dash movement, grapple-anchor (pull self / yank enemy), Radiant Wave Surger (grip-and-cook melee), Chaos Mines, VARIS variable-charge rifle. |
| **Patlabor** | AV-98 Ingram (police Labor) | Realist, "forklift" work machines; police livery, revolver, riot baton, patrol car transport; detailed maintenance culture. | Civilian-scale scenario; non-lethal tools; "Labor crime" law-enforcement missions. |
| **The Big O** | Big O, Big Duo, Big Fau (Megadeus) | Art-deco black iron bruiser; piston-driven "Sudden Impact" punches; chromebuster chest beam; summoned by voice ("Big O, Action!"). | Summon-on-call heavy frame; slow, huge punches; noir tone. |
| **Escaflowne** | Escaflowne, Alseides Guymelefs | Medieval armor giants powered by dragon "energist" hearts; Escaflowne transforms into a **dragon**; Zaibach Guymelefs have liquid-metal (**Crima Claw**) arms and stealth cloaks. | Fantasy line: dragon-mode flight, liquid-metal arms, blood-bond with pilot (damage hurts pilot). |
| **Zoids** | Liger Zero, Shield Liger, Geno Saurer, Gojulas | Animal mechs with living metal cores; **CAS (Changing Armor System)** swaps Liger Zero's armor (Jäger speed, Schneider blades, Panzer artillery). | Animal-frame line; swappable armor "forms" changing role. |
| **Getter Robo** | Getter-1 (air), Getter-2 (drill/speed), Getter-3 (ground/tank) | Three jets combine in different orders into three robots; drill arm on Getter-2 (direct ancestor of Gurren Lagann); Getter Rays; Shin Getter mutates. | Three-form switch by "recombining"; each form is a distinct role. |
| **Mazinger Z** | Mazinger Z, Great Mazinger | Rocket Punch, Breast Fire, Koshiryoku Beam; **Pilder** hovercraft docks in the head to become the cockpit. | Detachable head-cockpit vehicle (like Lagann!), fist launch, Super Alloy Z. |
| **Voltron / GoLion** | Five lions | Five animal vehicles combine into a knight; Blazing Sword. | Five-part combine; each lion is an element/limb. |
| **Pacific Rim** | Gipsy Danger, Striker Eureka, Cherno Alpha (Zaku-inspired), Crimson Typhoon (three arms, three pilots, Unit-00-like) | Industrial, weight-forward; nuclear vortex turbine; elbow rockets; chain sword; plasma caster. | **Drift**: two pilots must share a neural handshake; solo piloting is lethal. Kaiju as boss-per-mission with escalating categories. |
| **Front Mission** | Wanzers | Body / L-arm / R-arm / legs / backpack part system; weight must not exceed power output; parts have separate HP; losing arms drops weapons, losing legs kills mobility. | Modular loadout with weight budget and per-part damage. |
| **Titanfall** | Ion, Scorch, Northstar, Ronin, Tone, Legion, Monarch | Fixed-loadout "hero titans" per class; Core abilities on a meter; pilot ejection; titans as walking gear. | Class = frame with one core ult; pilot/titan swap; meter-gated cores. |

Sources: [Macross Wiki – Variable Fighter](https://macross.fandom.com/wiki/Variable_Fighter), [Macross Compendium – VF-1](https://macross.anime.net/wiki/VF-1_Valkyrie), [Den of Geek – VF-1 Valkyrie](https://www.denofgeek.com/culture/the-vf-1-valkyrie-a-truly-iconic-mecha-design/), [Code Geass Fandom – Knightmare Frame](https://codegeass.fandom.com/wiki/Knightmare_Frame), [Geass Miraheze – Knightmare Frame](https://geass.miraheze.org/wiki/Knightmare_Frame), [CBR – Coolest Knightmare designs](https://www.cbr.com/best-code-geass-knightmare-designs/), [Mecha Talk – Patlabor](https://www.mechatalk.net/viewtopic.php?t=13787), [Zoids Wiki – Liger Zero](https://zoids.fandom.com/wiki/Liger_Zero), [Zoids Wiki – Liger Zero X](https://zoids.fandom.com/wiki/Liger_Zero_X), [Voltron Wiki – Golion](https://voltron.fandom.com/wiki/Golion), [Nocope – Before Voltron](https://nocope.substack.com/p/before-voltron), [Yokogao – Retro mecha classics](https://www.yokogaomag.com/editorial/retro-mecha-anime-classics), [GameRant – Best animal mecha](https://gamerant.com/best-animal-mecha-in-anime/), [Versus Connections – Mazinger vs Getter](https://versus-connections.fandom.com/wiki/Mazinger_Z_vs._Getter_Robo), [Wikipedia – Great Mazinger vs Getter Robo](https://en.wikipedia.org/wiki/Great_Mazinger_vs._Getter_Robo), [IMDb – del Toro / Cherno Alpha](https://www.imdb.com/news/ni64785091/), [The Artifice – Pacific Rim anime influence](https://the-artifice.com/pacific-rim-anime-influence/), [CBR – Pacific Rim & Evangelion](https://www.cbr.com/pacific-rim-evangelion-similarities/), [Crunchyroll – Jaeger designer](https://www.crunchyroll.com/anime-news/2013/05/10-1/build-your-own-mecha-with-pacific-rims-jaeger-designer), [Front Mission Wiki – Wanzers](https://frontmission.fandom.com/wiki/Wanzers), [Front Mission Wiki – Legs](https://frontmission.fandom.com/wiki/Legs), [LP Archive – FM3 wanzer construction](https://lparchive.org/Front-Mission-3/Update%20161/), [Jiang Sheng – FM1 parts](https://jiangsheng.net/build/html/games/frontmission/mechanics/parts.html), [PCGamesN – Titanfall 2 titan classes](https://www.pcgamesn.com/titanfall-2/titanfall-2-titan-classes), [Titanfall Wiki – Titan](https://titanfall.fandom.com/wiki/Titan).

---

## Design takeaways

Everything below is original and only *inspired* by the sources. Names are placeholders.

### D1. Original frame lines (8+)

**Bio-organic line ("Revenant" line — Eva-inspired)**

| Frame | Concept | Mechanics |
|---|---|---|
| **1. Revenant-0 "Cyclops"** | Prototype of a grown, not built, chassis: single optical cluster, sloped skull-helm, restraint clamps visibly bolted over muscle-plating. Two-tone hazard livery (safety orange over deep blue). | Support role: field-pusher (see P1) with the strongest **Veil** projector; "clamp release" trades 30% armor for a temporary strength surge. Unstable: first activation each mission has a random 3-second freeze unless the pilot's sync is above threshold. |
| **2. Revenant-1 "Feral"** | Test-type; horned, jaw muzzle, thin waist, tall shoulder fins housing a vibro-knife and a rainbow scanner. Purple-black with acid-green seams. | The **Overrun** frame: at 0 battery it doesn't shut down — it enters *Feral* (P2): AI-assisted melee, limb regen, no ranged. Eats a downed boss core to permanently unlock unlimited power. |
| **3. Revenant-2 "Quad-Eye"** | Production model; four optical ports for a wider aim-cone; crimson, most conventional plating. | The "normal" playstyle: best all-round handling, extra lock-on targets, environmental packs (heat-suit, dive-suit) swap in per mission. |
| **4. Revenant-9 "Choir"** | Mass-produced white drones: eyeless, lipless grin, folding membrane wings, perpetual power, polymorphic lance. **Enemy-only** until captured. | Hunt in packs, regenerate, resurrect once. Late-game capture lets the player field one as a Feral-less, battery-free but pilot-less (auto-fighting) frame. |
| **5. Revenant-13 "Twin Plug"** | Four-armed dark chassis with a **two-seat cockpit**; second arm pair folds against the chest. | Co-op or AI-partner frame: the second pilot controls the second arm pair; sync between pilots (P1) gates dual-wield of two field-piercing spears. |

**Drill/spiral line ("Corebreaker" line — Gurren-inspired)**

| Frame | Concept | Mechanics |
|---|---|---|
| **6. Keyhead "Nub"** | A one-metre head-only mech with stubby drill limbs and a huge grinning face, started by a physical key. Starter frame. | Can **Spike-Dock** (P4) into any machine: stealing enemy legs, weapons, even vehicles; combines with a body frame to gain a torso. |
| **7. Corebreaker "Brawler"** | Nub docked on a stolen red mid-frame; chest-mounted shades that fire as a boomerang; rough welds, mismatched parts. | Hype-meter build (P3): all attacks scale with meter; **Helix Break** finisher grows in size with spent meter. |
| **8. Ark-Corebreaker "Hull"** | A captured walking battleship (the first general's flagship) that folds into a 200-m mech with the Brawler seated in its chest. | Tier-two hub-ship: launches allied frames, becomes a boss-scale frame in siege missions. Combination is *nesting*: the smaller frame is always inside. |
| **9. Faceless "Standard"** | Government mass-produced humanoid with **no face**, competent and boring. | The reference "modern" mech; deliberately can't use the hype meter or Spike-Dock — its role is to show what the player's line gives up if it "goes normal." |

**Three-mode line ("Vector" line — Valkyrie-inspired)**

| Frame | Concept | Mechanics |
|---|---|---|
| **10. Vector "Arrow"** | Jet-based variable frame; Flight (fast, forward-only guns), **Crouch** (bent-knee hover with arms, inspired by the skier stance), and Stand (humanoid). | Real-time mode switch with distinct handling; missile swarm ult ("circus"); armor packs bolt on and can be jettisoned mid-fight. |
| **11. Vector "Skater"** | Small 5-m frame with ankle rollers and twin rocket anchors. | Grapple mobility: anchor to bosses and terrain; pull-in enemies; cockpit ejection that keeps the pilot in play as an infantry unit. |
| **12. Beast "Ridge-Cat"** | Quadruped animal frame with swappable **armor sets** (speed / blades / artillery). | Role change at supply points; animal move-set (pounce, bite, tail). |

### D2. Boss concepts derived from Angels and Generals (10+)

| # | Boss | Source echo | Mechanic puzzle |
|---|---|---|---|
| 1 | **The Masked Walker** | Sachiel | A humanoid that regrows a second mask when damaged. The core is only exposed *while* the mask is regrowing (a 4-second window). Final phase: it grapples the player and starts a self-destruct — you must break the grab or eat the blast. |
| 2 | **The Prism** | Ramiel / Operation Yashima | A floating polyhedron with an unbreakable field and an instant counter-beam against anything inside 800 m. Solve by plugging a siege cannon into three city power nodes (each a mini-objective), then firing twice: the first shot is *always* deflected by its counter-beam, so an ally must tank the return beam with a consumable shield while you re-charge. |
| 3 | **Gemini Chorus** | Israfel | Twin bosses that heal each other; every hit on one is redistributed. Only *simultaneous* core strikes register: the game shows a rhythm cue; co-op partners (or the player + AI wingman) must land hits within a 0.3-second sync window. Missing causes the twins to re-merge and reset. |
| 4 | **Undertow** | Gaghiel | Underwater colossus that swallows you. You must survive inside, hold its jaws open with a QTE-like "brace," and call in an allied strike into its mouth. |
| 5 | **Vault Spider** | Matarael | Fight in total darkness in a vertical shaft during a base blackout: acid drips from above; one frame must hold a Veil overhead, another must fetch a weapon from a lower floor, the third fires upward. Solo: you rotate through all three with an AI squad on timers. |
| 6 | **Skyfall** | Sahaquiel | A city-sized body drops from orbit with a moving landing zone; three-lane sprint to reach the predicted impact point; catch (hold input), open field (ally), stab core. Fail = the district is destroyed and the campaign map changes. |
| 7 | **The Shadow Well** | Leliel | The visible sphere is a decoy; the real body is a 2D shadow on the ground. Firing on the sphere drops you into a pocket dimension where the battery drains and the only exit is triggering *Feral* (0-battery state) — a boss that teaches your last-stand mechanic. |
| 8 | **Corrupted Wingman** | Bardiel | A friendly frame is infected mid-mission and turns; its pilot is still alive. Non-lethal takedown route (target the parasite mass, keep cockpit above X HP) vs. lethal route (fast but story cost). Optional autopilot "Dummy" mode finishes it brutally if you toggle it. |
| 9 | **Paperblade** | Zeruel | Unfurling ribbon-arms one-shot armor plates; eye beam pierces walls. Designed to be unbeatable on standard power; the intended solution is to let the battery die on purpose and win in Feral, then *eat the core* to gain perpetual power (a permanent progression unlock). |
| 10 | **The Orbital Gaze** | Arael | Out of reach; a mind-beam disables your HUD and inverts controls in waves. Solve by finding the one artifact weapon and throwing it from a launch ramp with a timing minigame; no ordinary damage counts. |
| 11 | **Helix Ring** | Armisael | A rotating double-helix ring that pierces fields and *merges* with your frame, converting HP to boss HP. Escape by rapidly de-syncing (dropping the sync meter) or sacrifice the frame: self-destruct kills it but loses that chassis for the run. |
| 12 | **General Thunder & the Land-Fortress** | Thymilph / Dai-Gunzan | Spear-tiger duel on the deck of a walking battleship. Winning the duel is only stage 1: you must then Spike-Dock into the bridge to *capture* the fortress — it becomes your hub-ship. |
| 13 | **General Tide (transforming scorpion)** | Adiane / Sayrune | Boss alternates humanoid (sword duel) and scorpion (tail-sting, underwater) forms; each form is only vulnerable during the transformation frames. |
| 14 | **General Gale (sky carrier)** | Cytomander / Dai-Gunten | Air-dominance fight on a moving flying carrier: only Vector frames in Flight mode can reach it; final phase is a kamikaze ram you must divert. |
| 15 | **General Shell (rolling burrower)** | Guame / Gember | Rolls as an invulnerable ball; lure it into pits or drill columns to expose it. |
| 16 | **Cube Swarm** | Mugann | Fast-shielded enemies that *explode into cubes on death*: killing them near allies or objectives punishes you; you must kill them at range or drag them away with anchors first. |
| 17 | **The Mirror Titan** | Granzeboma / Lazengann | A boss built as the negative of your current combined tier — whatever size you've reached, it matches. Beaten only by spending the full hype meter for a tier-skip Helix Break. |

### D3. Progression mechanics (5)

1. **Sync Ratio (pilot bond).** A per-frame percentage rises through play time and successful no-damage encounters, drops with pilot injury or failed missions. Higher sync = tighter handling, faster ult charge, more damage; but a **pain link** scales with it: chip damage to the frame becomes stagger and stat debuffs to the pilot. Above 100% unlock "over-sync" moves (projected field blade, field hand), and a hidden 400% tier triggers the Awakened form with a story cost. Source echo: NGE sync ratio, Battle Orchestra's synchro gauge.
2. **Battery / umbilical.** Frames run tethered to power sockets scattered around the map; leaving socket range or getting the cable cut starts a **countdown (60 s full, 300 s low-power)**. Low-power mode halves movement but preserves the timer. Objectives include restoring sockets. Mid-game unlock: a captured perpetual core removes the timer for one chosen frame; endgame: the Feral state makes 0-battery a *feature*. Source echo: Eva umbilical cable, S² engine.
3. **Spiral hype meter.** Fed by aggression (hit streaks, parries, taunts, callouts, allies cheering), not by taking damage. Spending it scales attack *size* — the Helix Break grows physically. Overfilling risks "Nemesis": a self-damaging burst that forces a cool-down. Enemy factions field suppressors (a Death-Spiral-style field) that drain the meter. Source echo: Spiral Power, Giga Drill Break, Anti-Spiral fields.
4. **Spike-Dock (capture / hijack).** A drill-grapple that pierces any machine: on enemies it rewrites the OS to steal a limb, weapon, or the whole vehicle (turning a boss's flagship into your hub); on allies it combines. Capturing is how you acquire enemy frame lines (the Choir drone, the generals' Ganmen). Source echo: Lagann Impact, Kamina stealing Gurren, Dai-Gunzan capture.
5. **Nested combination tiers.** Scale is the meta-progression: Tier 0 head-only key mech → Tier 1 head-on-body → Tier 2 body-in-fortress → Tier 3 fortress-in-planetoid. Each tier keeps the lower tier as its literal core and unlocks a new arena scale (street → city → orbit). Sub-combos let sibling frames become equipment (one ally becomes your lance and shield). Source echo: Gurren Lagann → Arc → Super Galaxy → Tengen Toppa; King Kittan Deluxe; Getter/Voltron.

**Bonus modifiers to layer on the above:** the **Drift** two-pilot handshake (Pacific Rim) as a co-op sync variant; **Front Mission** per-part HP and weight budgets for the loadout screen; **Zoids CAS** armor forms for the animal line; **Titanfall**-style class cores gated by the hype meter.

---

## Source list (all URLs surfaced by search)

- https://wiki.evageeks.org/evangelions
- https://wiki.evageeks.org/Ikuto_Yamashita
- https://en.wikipedia.org/wiki/Ikuto_Yamashita
- https://evangelion.fandom.com/wiki/Evangelion_Equipment
- https://evangelion.fandom.com/wiki/Evangelion_Unit-00
- https://evangelion.fandom.com/wiki/Evangelion_Weapons
- https://evangelion.fandom.com/wiki/Ramiel
- https://wiki.evageeks.org/Episode_06
- https://en.namu.wiki/w/%EC%95%BC%EC%8B%9C%EB%A7%88%20%EC%9E%91%EC%A0%84
- https://en.namu.wiki/w/%ED%8F%AC%EC%A7%80%ED%8A%B8%EB%A1%A0%20%EB%9D%BC%EC%9D%B4%ED%94%8C
- https://gamefaqs.gamespot.com/ps2/938633-shinseiki-evangelion-battle-orchestra/faqs/74292
- https://evangelion.fandom.com/wiki/Neon_Genesis_Evangelion:_Battle_Orchestra
- https://wiki.evageeks.org/Extracanonical_Mecha
- https://animeposts.org/posts/evangelion-unit-01-berserk-mode-explained/
- https://wiki.evageeks.org/Evangelion_13
- https://evangelion.fandom.com/wiki/Evangelion_Mark.06
- https://forum.evageeks.org/viewtopic.php?t=21862
- https://www.cbr.com/best-evangelion-mecha-designs-ranked/
- https://evangelion.fandom.com/wiki/Mass_Production_Evangelion
- http://www.nervarchives.com/characters.eva05-13.php
- https://grokipedia.com/page/Mass_Production_Evangelion
- https://wiki.evageeks.org/Umbilical_cable
- https://wiki.evageeks.org/Evangelion_Power_Sources
- https://wiki.evageeks.org/Israfel
- https://wiki.evageeks.org/Episode_09
- https://tvtropes.org/pmwiki/pmwiki.php/Recap/NeonGenesisEvangelionEpisode09MomentHeartTogether
- https://wiki.evageeks.org/Leliel
- https://wiki.evageeks.org/Dirac_Sea
- https://wiki.evageeks.org/Synchronization
- http://www.nervarchives.com/glossary.syncratio.php
- https://www.cbr.com/neon-genesis-evangelion-eva-pilots-ranked-sync-rate/
- https://wiki.evageeks.org/Zeruel
- https://evangelion.fandom.com/wiki/Bardiel
- https://evangelion.fandom.com/wiki/Episode:19
- https://globalanimenews.com/posts/evangelion-unit-01-berserk-mode-explained-without-the-mecha-cliches/
- https://evangelion.fandom.com/wiki/Sahaquiel
- https://wiki.evageeks.org/Matarael
- https://screenrant.com/neon-genesis-evangelions-17-original-angels-explained/
- https://www.cbr.com/evangelion-best-angel-designs/
- https://wiki.evageeks.org/Armisael
- https://otakumode.com/otapedia/anime/neon_genesis_evangelion/angels
- https://en.wikipedia.org/wiki/Kaworu_Nagisa
- https://www.animenewsnetwork.com/feature/2008-09-07
- https://gurrenlagann.fandom.com/wiki/Gunmen
- https://gurrenlagann.fandom.com/wiki/Mecha
- https://gurrenlagann.fandom.com/wiki/Gurren_Lagann
- https://gurrenlagann.fandom.com/wiki/Lazengann
- https://en-academic.com/dic.nsf/enwiki/6425710
- https://neoencyclopedia.fandom.com/wiki/List_of_Gurren_Lagann_mecha
- https://allthetropes.org/wiki/Tengen_Toppa_Gurren_Lagann/Characters/Mecha
- https://shapes.inc/fandom/tengen-toppa-gurren-lagann/mecha-and-spiral-power
- https://weebipedia.fandom.com/wiki/Gurren_Lagann_(Mech)
- https://gurrenlagann.fandom.com/wiki/Four_Supreme_Generals
- https://villains.fandom.com/wiki/The_Four_Supreme_Generals
- https://www.imdb.com/title/tt0948103/trivia/
- https://gamerant.com/best-gurren-lagann-mechs/
- https://gurrenlagann.fandom.com/wiki/Dayakkaiser
- https://gurrenlagann.fandom.com/wiki/Yoko_M_Tank
- https://gurrenlagann.fandom.com/wiki/Super_Galaxy_Gurren_Lagann
- https://gurrenlagann.fandom.com/wiki/Super_Galaxy_Dai-Gurren
- https://gurrenlagann.fandom.com/wiki/Tama%C3%B1o_de_mechas_de_tengen_toppa_gurren_lagann
- https://villains.fandom.com/wiki/Mugann
- https://villains.fandom.com/wiki/Anti-Spiral
- https://gurrenlagann.fandom.com/wiki/Anti-Spiral
- https://spacebattles-factions-database.fandom.com/wiki/Anti-Spirals
- https://en.wikipedia.org/wiki/Gurren_Lagann
- https://macross.fandom.com/wiki/Variable_Fighter
- https://macross.anime.net/wiki/VF-1_Valkyrie
- https://www.denofgeek.com/culture/the-vf-1-valkyrie-a-truly-iconic-mecha-design/
- https://codegeass.fandom.com/wiki/Knightmare_Frame
- https://geass.miraheze.org/wiki/Knightmare_Frame
- https://www.cbr.com/best-code-geass-knightmare-designs/
- https://www.mechatalk.net/viewtopic.php?t=13787
- https://zoids.fandom.com/wiki/Liger_Zero
- https://zoids.fandom.com/wiki/Liger_Zero_X
- https://voltron.fandom.com/wiki/Golion
- https://nocope.substack.com/p/before-voltron
- https://www.yokogaomag.com/editorial/retro-mecha-anime-classics
- https://gamerant.com/best-animal-mecha-in-anime/
- https://versus-connections.fandom.com/wiki/Mazinger_Z_vs._Getter_Robo
- https://en.wikipedia.org/wiki/Great_Mazinger_vs._Getter_Robo
- https://www.imdb.com/news/ni64785091/
- https://the-artifice.com/pacific-rim-anime-influence/
- https://www.cbr.com/pacific-rim-evangelion-similarities/
- https://www.crunchyroll.com/anime-news/2013/05/10-1/build-your-own-mecha-with-pacific-rims-jaeger-designer
- https://frontmission.fandom.com/wiki/Wanzers
- https://frontmission.fandom.com/wiki/Legs
- https://lparchive.org/Front-Mission-3/Update%20161/
- https://jiangsheng.net/build/html/games/frontmission/mechanics/parts.html
- https://www.pcgamesn.com/titanfall-2/titanfall-2-titan-classes
- https://titanfall.fandom.com/wiki/Titan
