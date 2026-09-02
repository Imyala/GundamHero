# Research Report 02 — Arcade Driving (NFS Underground 1/2) and Light-Cycle Combat (Armagetron Advanced)

*Prepared 2026-09-02 for the GundamHero design effort (Three.js browser game with a mech that transforms into a vehicle).*

**Method note.** ~35 web searches plus direct fetches. The network proxy in this environment blocked most fan wikis (nfs.fandom.com, needforspeed.miraheze.org, wiki.armagetronad.org/.net, forums3.armagetronad.net, GameFAQs, speedrun.com, Wikipedia). Where those are cited below the facts come from the search-engine extract of that page rather than a full read, and are marked "(via search extract)". Armagetron facts marked "(source)" were read directly from the game's C++ and `.cfg` files on GitHub, which is the most authoritative source available for that game's physics.

---

## Part A — Need for Speed: Underground (2003) and Underground 2 (2004)

### A1. Handling philosophy in one paragraph

Both Undergrounds are night-time street racers built on EA Black Box's arcade model: cars are heavy, grippy and forgiving on the throttle, oversteer is something you *request* (handbrake, brake tap, throttle lift) rather than something that ambushes you, and the whole feel is tuned around a huge sense of speed rather than physical fidelity. GameSpot's UG2 review put it plainly: "The cars handle well, with things like turning, powersliding, and proper cornering technique being easy to pick up," while some critics called the handling "sloppy" next to sims; player impressions at launch called UG2 "more sim-like than before, still arcadey" ([GameSpot UG2 review](https://www.gamespot.com/reviews/need-for-speed-underground-2-review/1900-6113360/), [Digital Sportspage impressions](https://forums.digitalsportspage.com/viewtopic.php?t=5783), [Metacritic](https://www.metacritic.com/game/need-for-speed-underground-2/)). Modern retrospectives note the handling "is incredibly smooth, making it more playable today than many of its modern successors."

### A2. Acceleration, gears and the drivetrain model

- **Automatic by default, manual optional.** Circuit/Sprint use auto or manual; **Drag mode forces manual shifting** and is the only mode where shift timing is the core skill ([NFS wiki: Underground/Drag](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground/Drag), via search extract).
- **Shift window colouring (Drag).** The tach needle and a central HUD circle are colour-coded: **White = "Short Shift"** (too early), **Blue = "Good Shift!"** (slightly early), **Green = "Perfect Shift!"** (optimal), **Red = over-rev**. Over-revving outside top gear builds **engine temperature**; at max temperature you get **"Engine Blown"** and forfeit the race ([NFS wiki Drag](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground/Drag); [UG2 Drag](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Drag); [Neoseeker "The Perfect Shift"](https://www.neoseeker.com/forums/6608/t401072-perfect-shift/)).
- **Head Start.** In Drag and Street X (UG2) every racer can earn a "Head Start" by holding revs in the optimal band when the countdown ends ([UG2 Street X](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Street_X)). Community guides report the head start is also worth **200 nitrous points** in UG2 ([SuperCheats NOS refill](https://www.supercheats.com/xbox/need-for-speed-underground-2/5727/very-easy-nos-refill/)).
- **Drag lane changes.** You tap left/right to hop lanes and dodge traffic; hitting traffic in Drag is effectively a lost race ([SuperCheats drag tips](https://www.supercheats.com/playstation2/need-for-speed-underground-2/20955/drag-racing/)).
- **Tuning philosophy for the power band (UG2 dyno).** Guides converge on "make the ECU and turbo curves peak around 5,000–6,000 rpm" for general use; for Drag, push ECU/turbo toward the **high** rev range for "a quick blast of acceleration"; for Drift, bias to the **lower-middle** range so the rear can be kept spinning at moderate speed ([Speedrun.com UG2 tuning guide](https://www.speedrun.com/nfsu2/guides/wtr6d), [ItStillWorks dyno tips](https://itstillworks.com/12558849/dyno-tips-for-need-for-speed-underground-2), [ShunAuto dyno guide](https://shunauto.com/article/how-to-dyno-tune-a-car-in-nfsu2)).

### A3. Braking: brake vs handbrake

- **Foot brake**: slows the car and, when *tapped* while accelerating into a corner with steering held, "will force the rear of the car to lose grip and begin to slide" — this is the higher-speed drift entry ([NFS wiki "Drift Race"](https://nfs.fandom.com/wiki/Drift_Race), via search extract).
- **Handbrake (E-brake, R1 on PS2)**: locks the rear axle. "Hold the handbrake briefly, then turn towards the corner – the car will slide around sideways." It scrubs far more speed than a brake tap and produces a sharper rotation, so it is the go-to for tight hairpins and for doughnuts (hold steer + handbrake + gas, release handbrake after ~1 s) ([SuperCheats drift points](https://www.supercheats.com/playstation2/need-for-speed-underground/21132/getting-good-drifting-points/), [ChapterCheats NFSU](https://www.chaptercheats.com/cheats/playstation2/10250/need-for-speed-underground-cheat-codes)).
- Guides advise "using the brakes also helps prevent crashing or hitting the wall" — in Drift mode braking mid-slide is a legitimate angle-control tool.

### A4. Drifting — initiation, sustain, counter-steer

Three initiation methods, all confirmed across the wiki/guides:

1. **Handbrake** before or at turn-in (lowest speed, biggest angle).
2. **Brake tap** while steering under power (keeps more speed).
3. **Throttle lift / weight transfer** — "let go of the accelerator at any point of a drift and reapply it whilst turning in the opposite direction to continue a drift around a different corner"; rear-drive cars can weight-transfer (Scandinavian-flick style) ([Drift Race wiki](https://nfs.fandom.com/wiki/Drift_Race)).

**Sustaining and chaining.** "To make your drift longer, when your car is starting to straighten out going forward, turn in the opposite direction from your last turn" — i.e., the pendulum/transition drift, which is how top scores are built on the enclosed drift circuits. Counter-steer is required *immediately* after initiation to hold the angle ("the player must immediately steer to the opposite direction to initialise a drift"). On keyboard, the speedrun community uses a **"double tapping"** technique (rapid alternating taps) to modulate steering angle because digital input is otherwise all-or-nothing ([Speedrun.com NFSU double tapping guide](https://www.speedrun.com/nfsu/guides/i65ij)).

**Tuning for drift (UG2).** Reduce **rear tire grip**, raise ride height to maximum and stiffen the suspension "to increase responsiveness", and lower steering ratio/increase sensitivity; "the steering ratio determines how much you can turn while braking or drifting and how fast the turn ratio reacts to your demands" ([Speedrun tuning guide](https://www.speedrun.com/nfsu2/guides/wtr6d), [GTPlanet NFS:U2 Tuning](https://www.gtplanet.net/forum/threads/nfs-u2-tuning.51450/)). For all *other* events guides say max out tire grip front and rear, drop the car as low as it goes, and stiffen shocks; softer setups "allow a vehicle to slide more often, while stiffer setups improve grip by inducing more understeer."

### A5. Drift scoring (UG1 vs UG2)

**UG2 rules** ([NFS wiki UG2/Drift](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Drift), via search extract):

- Points accrue continuously while sliding; the running total is banked when the car straightens out.
- **Multiplier ladder:** reach **250 → 2x, 1,000 → 3x, 3,000 → 4x, 8,000 → 5x** points in the *current* chain to step up the multiplier (max 5x).
- **Wall/obstacle hit = lose the un-banked drift score and reset the multiplier.** "If you hit a wall while drifting, you'll lose all your score, and you'll have to get a high Drift Multiplier again." Hitting traffic on public-road drift events also resets.
- **Multiplier decay:** "The multiplier will gradually be reduced if the player does not keep enough speed around the track" — so slow, safe slides are punished.
- **Bonus zones:** drifting near barriers on enclosed circuits, on dirt sections, or near traffic on public-road events turns the point counter from light green to **orange** and awards more points.
- UG2 added **downhill public-road drift** events alongside UG1's enclosed circuits.

**UG1 rules** (from guides): same "score while sliding, bank on straighten" structure; the multiplier rose with drift *length/speed* and doughnuts were a farmable bonus; contacting walls "ends the drift" rather than always wiping banked score. Top-score threads show the metagame was chaining transitions rather than single long slides ([GTPlanet drifting top scores](https://www.gtplanet.net/forum/threads/need-for-speed-underground-2-drifting-top-scores.74116/), [GameSpot UG1 walkthrough](https://www.gamespot.com/articles/need-for-speed-underground-walkthrough/1100-6085684/)).

### A6. Nitrous (NOS) rules: UG1 vs UG2

- **UG1: finite tank, no refill.** You buy Nitrous (levels 1–3 in the performance shop), it is a single bar spent by holding the button, and it does **not** regenerate within a race — strategy guides talk about "use it at the start if you're confident of holding first, or save it for the last lap" ([Neoseeker NFSU FAQ](https://www.neoseeker.com/nfs-underground/faqs/101925-need-for-speed-underground-d.html); [NFS wiki Nitrous Oxide System](https://nfs.fandom.com/wiki/Nitrous_Oxide_System), via extract).
- **UG2: refillable via "Racebreaker" style points.** "A feature was introduced to refill the nitrous bar with criteria such as drifting, near miss the traffic and more" ([Need for Speed Encyclopedia: Nitrous](https://needforspeed.miraheze.org/wiki/Nitrous), [Racebreaker](https://needforspeed.miraheze.org/wiki/Racebreaker)). Guide-reported values ([SuperCheats "Very easy NOS refill"](https://www.supercheats.com/xbox/need-for-speed-underground-2/5727/very-easy-nos-refill/), [GameFAQs UG2 PC guide](https://gamefaqs.gamespot.com/pc/920469-need-for-speed-underground-2/faqs/33703)):
  - **Drifting / near-miss**: small refill per event, with a multiplier up to **5x** for consecutive clean near-misses.
  - **Clean section**: **150 nitrous points** for clearing a section of the route without touching guard rails/walls, with its own escalating multiplier.
  - **360 spin**: **400 nitrous points** each.
  - **Head start**: **200 nitrous points**.
  - **Nitrous is disabled entirely in Street X** ([UG2 Street X](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Street_X)).
- **Hydraulics** (UG2): require Hydraulics level 1+; only usable when stopped, holding handbrake and flicking the stick; they are a style/visual toy, not a boost source ([ChapterCheats hydraulics](https://www.chaptercheats.com/cheat/xbox/12527/need-for-speed-underground-2/hint/9297)).
- Nitrous stages raise both "top speed and acceleration ratings" in the shop — it is modeled as extra engine force, not as a speed cap override ([UG2 Performance Shop](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Performance_Shop)).

### A7. Catch-up / rubber-banding

Both games have aggressive catch-up. Modders found a per-race **`CatchUpMayb`** field (range -1..9; -1 is "default", *not* off) next to an AI **skill 0–9** field; the popular "No Rubberbanding (catch up = off)" mods zero it out and raise skill instead ([NFSMods 4715](https://nfsmods.xyz/mod/4715), [NFSMods 1694 UG2 no-rubberband](https://nfsmods.xyz/mod/1694), [NFSMods 5400](https://nfsmods.xyz/mod/5400)). Players have complained about it since 2003 ([NFSUnlimited thread](https://forum.nfsunlimited.net/viewtopic.php?p=383537)). The general industry design (Nic Melder's GameAIPro chapter) is two-pronged: **speed scaling** ("speed up when behind, slow down when ahead", with a band beyond which it kicks in) and **skill scaling** (leaders brake earlier, corner slower, accelerate less) ([GameAIPro ch.42](https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter42_A_Rubber-Banding_System_for_Gameplay_and_Race_Management.pdf), [TV Tropes Rubber-Band AI](https://tvtropes.org/pmwiki/pmwiki.php/Main/RubberBandAI)).

### A8. Race modes

| Mode | Game | Rules |
|---|---|---|
| Circuit | both | 2–10 laps on a closed loop of city streets (UG1 lets you set laps). |
| Sprint | both | Point-to-point, one pass. |
| Knockout / Lap Knockout | UG1 | Last-place eliminated each lap. |
| Drag | both | Straight-line, **forced manual**, colour-coded shift window, engine temperature/blown engine, lane-hop traffic, head start ([NFS wiki Drag](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground/Drag)). |
| Drift | both | Enclosed circuits (UG1/UG2) plus downhill public roads (UG2); score/multiplier rules above. |
| Street X | UG2 | 4 cars, enclosed short technical course, laps, **no nitrous**, head start ([UG2 Street X](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Street_X)). |
| URL (Underground Racing League) | UG2 | Tournaments on closed circuits, up to **6 cars**, 1–3 races, **points table** decides the winner ([UG2 Racing Modes, NFSUnlimited wiki](http://wiki.nfsunlimited.net/wiki/Need_for_Speed_Underground_2_Racing_Modes)). |
| Outrun | UG2 | Free-roam 1v1 challenge: **overtake and hold a 1,000 ft (300 m) lead** to win; no fixed route ([UG2 Outrun](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Outrun)). |

### A9. Performance tuning and the UG2 dyno

Part categories and what the shop says they do ([UG2 Performance Shop](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Performance_Shop), [StrategyWiki NFSU upgrades](https://strategywiki.org/wiki/Need_for_Speed:_Underground/Upgrades_and_Parts)):

- **Engine** → acceleration. **ECU** → acceleration + top speed. **Turbo** → acceleration (forced induction). **Drivetrain/Transmission** → top speed. **Nitrous** → top speed + acceleration. **Tires** → handling. **Suspension** → handling. **Weight reduction** → acceleration + handling. **Brakes** (UG2) → handling.
- Tiers: **Street / Pro / Extreme / Unique** (UG2), roughly Level 1/2/3 in UG1. Unique parts unlock via star rating/magazine progress.
- **UG2 Dyno sliders**: ECU curve, turbo curve, **ride height**, **springs/shocks**, **tire grip front/rear**, **steering ratio/sensitivity**, **aerodynamics/downforce** (higher aero stage → more downforce range), **gear ratios**, **brake bias**, **nitrous** (duration vs power). Consensus setups: low and stiff for grip events; high, stiff and low rear grip for drift; soft rear + low front for drag ([Speedrun tuning](https://www.speedrun.com/nfsu2/guides/wtr6d), [ShunAuto](https://shunauto.com/article/how-to-dyno-tune-a-car-in-nfsu2)).

### A10. Style points, reputation, visual rating

- **UG1 Style Points** accrue from driving actions (drifts, near-misses, drafting, clean sections, air) during events and drive unlocks; the **Visual Reputation** (up to **5 stars** in UG1, **10** in UG2) acts as a **multiplier applied after the event**, and gates magazine covers, unique parts and (UG1) tournament entry ([NFS wiki Style Points](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground/Style_Points), [Miraheze Visual Rating](https://needforspeed.miraheze.org/wiki/Visual_Rating), [Star Rating](https://nfs.fandom.com/wiki/Star_Rating)).
- The community patch **novisualrep** documents how tightly progression was coupled to visual parts: in UG1 the star rating "depends on which parts are unlocked", races 14 and 30 are gated by it; in UG2 it only gates DVD covers ([thelink2012/novisualrep README](https://github.com/thelink2012/novisualrep/blob/master/README.md)).

### A11. Sense of speed

Underground's signature is **nitrous/high-speed radial motion blur** on the screen edges, headlight/streetlight bloom and wet-road reflections, plus a pull-back **FOV widen** and camera shake under NOS. The community treats the blur as core identity: "NFSU no motion blur… why?" threads and mods restoring/adding blur exist for both games ([TechGuy thread](https://www.techguy.org/threads/need-for-speed-underground-no-motion-blur-crown-animations-and-headlights-why.185655/), [NFSU2 New Motion Blur video](https://www.youtube.com/watch?v=KhRUU0gyjlc), [NFSU2 CAM CONTROL mod](https://www.nfscars.net/need-for-speed-underground-2/6/files/view/12703/), [WSGF FOV hack thread](https://www.wsgf.org/phpBB3/viewtopic.php?t=19395)). The general principle stated in those threads: "having the FOV wider at high speeds will show the background moving faster and make your sense of speed faster."

### A12. Track design

- **UG1 — Olympic City** (LA/NY/SF/Vancouver/London/Paris mash-up): "All circuit and sprint courses' models are interconnected, following the logic of a single map." Circuits like *Olympic Square* loop through Downtown, the Hotel Verona intersection, Grand Station bus terminal and a construction site — i.e., a loop stitched from a few distinctive set-pieces ([NFS wiki Olympic City](https://nfs.fandom.com/wiki/Olympic_City), [Olympic Square](https://nfs.fandom.com/wiki/Olympic_Square)).
- **UG2 — Bayview**: four districts (**City Core, Beacon Hill, Jackson Heights, Coal Harbor**) "each connected by only a few roads", free-roam between events, plentiful shortcuts (alleys, parking garages, park paths) that "often require skillful maneuvering" ([Miraheze Bayview](https://needforspeed.miraheze.org/wiki/Bayview), [NFS wiki Bayview](https://nfs.fandom.com/wiki/Bayview)). Shortcuts are the primary skill-expression in Circuit/Sprint; enclosed circuits (Street X, URL, Drift) remove traffic and shortcuts to make the *car* the test.

### A13. Community reverse-engineering of the handling

Hard numbers are thin because UG1/UG2 keep car data in a binary VLT database. What is documented:

- Handling lives in VLT nodes **`pvehicle`, `chassis`, `tires`, `rigidbodyspec`**; the modder Fierelier ported UG2 handling into Most Wanted "with as many values as possible transferred 1:1" and ships a Python script (`ug2ish-handling.py`) so you can see every field touched ([NFSMods UG2ish handling](https://nfsmods.xyz/mod/4589)).
- Documented tire fields (Black Box engine, MW docs but same lineage): `tire_grip*`, `STATIC_GRIP`, `DYNAMIC_GRIP`, `STEERING`, `TENSOR_SCALE` — "TENSOR_SCALE seems to be overall handling speed scale… the bigger the 2nd value the slower the car will respond to steering input" ([NFS Modder's Corner VLT docs](https://nfsmodderscorner.blogspot.com/2021/02/nfsmw-car-vlt-values-documentation.html)).
- Later community patches expose **steering sensitivity, downforce and traction-control sliders with 100 ticks** for this engine family ([NFSMods 5605](https://nfsmods.xyz/mod/5605)); a "Lightweight Handling Mod" and "Perf Balancing" mods show grip and steering are the two levers the community keeps touching ([NFSMods 1685](https://nfsmods.xyz/mod/1685), [NFSMods 802](https://nfsmods.xyz/mod/802)).
- Takeaway: the engine is a **tire-grip / steering-response** model with separate static vs dynamic (sliding) grip and a body inertia tensor scale — exactly the two-regime friction model you'd build for an arcade drift.

### A14. How arcade racers implement drift (Ridge Racer / Burnout / generic)

- **Ridge Racer**: drift = "lay on the brakes or let off the accelerator" while steering; **drift-type cars slide if you lift for ~half a second**, grip-type cars need the "drift brake" (lift + light brake, then floor it for max angle). Exit is a **snap** back to traction when you counter-steer to alignment: "Regaining wheel alignment is what triggers the 'snap' back into traction — do it right and you'll fly out of the corner" ([Ridge Racer wiki Drifting](https://ridgeracer.fandom.com/wiki/Drifting), [Speedrun.com R4 guide](https://www.speedrun.com/rrt4/guides/0k29s), [PlayStation Classics R4](https://playstationclassics.co.uk/2022/08/ridge-racer-type-4-drifting/)). RR6/7: drifting **charges up to three nitrous tanks**, and drifting on the residual speed right after a boost expires charges faster ("**Ultimate Charge**") ([Ridge Racer wiki Nitrous](https://ridgeracer.fandom.com/wiki/Nitrous), [RR6](https://ridgeracer.fandom.com/wiki/Ridge_Racer_6)).
- **Burnout 3 / Paradise**: boost earned by drifting, near-misses, oncoming driving; B3's bar starts at **240 units and grows to 720 (4 segments)** through takedowns; drift is "heavy braking and acceleration in quick succession" then steer *into* the turn to hold angle ([Burnout wiki Boost](https://burnout.fandom.com/wiki/Boost), [Burnout wiki Drift](https://burnout.fandom.com/wiki/Drift), [Burnout 3 Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2291470178)).
- **Implementation pattern** (2D/3D arcade tutorials): keep forward and lateral velocity separate; each frame **multiply lateral velocity by a "drift factor" 0.90–0.95** (higher = more slide) instead of simulating tire friction; a drift button lowers the factor and adds a steering-assist so "the vehicle's forward vector and linear speed direction are offset while not losing control" ([Yarsa Labs 2D arcade car](https://blog.yarsalabs.com/basic-2d-arcade-car-controller-in-unity/), [GameDev.net arcade drift thread](https://www.gamedev.net/forums/topic/712162-how-do-i-implement-arcade-drift-using-a-physics-engine/), [Medium: 2D drift game](https://medium.com/@romanvinnick/building-a-2d-drift-racing-game-with-react-pixi-js-and-physics-d9f9074c4d0c)). Simply lowering rear-wheel friction in a real physics engine "quickly caused the player to lose grip and control", which is why arcade games script the slide.

---

## Part B — Armagetron Advanced

### B1. Core rules

Armagetron is a GPL Tron light-cycle game (Linux/Mac/Win, 2001–present). Every cycle leaves a solid wall behind it; **walls persist** (infinite by default, `WALLS_LENGTH -1`, or finite in competitive modes), **cycles cannot stop** (speed is clamped above `CYCLE_SPEED_MIN`), and **turns are instant 90° snaps** (`ARENA_AXES 4`; maps can define other axis counts). Touching any wall or the rim kills you; a dead cycle's wall stays up for `WALLS_STAY_UP_DELAY` (8 s) then vanishes, and its explosion punches a **hole** of `EXPLOSION_RADIUS` (4 m default, 2 m in Fortress) through nearby walls ([settings.cfg (source)](https://github.com/hhirsch/armagetron/blob/master/config/settings.cfg), [settings_dedicated.cfg (source)](https://github.com/hhirsch/armagetron/blob/master/config/settings_dedicated.cfg), [Armagetron config docs](https://armagetron.sourceforge.net/doc/config.html)). Modes range from freestyle/last-man-standing to team-based Fortress, Sumo and CTF ([Wikipedia](https://en.wikipedia.org/wiki/Armagetron_Advanced), [The Basics](https://wiki.armagetronad.org/index.php/The_Basics)).

### B2. Server config variables — defaults (source: `config/settings.cfg`)

| Variable | Default | Meaning |
|---|---|---|
| `CYCLE_SPEED` | **30** m/s (10 in code fallback) | base speed the cycle decays toward |
| `CYCLE_START_SPEED` | 20 | spawn speed |
| `CYCLE_SPEED_MIN` | 0.25 | min speed as ratio of base |
| `CYCLE_SPEED_MAX` | 0 (=unlimited) | cap |
| `CYCLE_SPEED_DECAY_BELOW` / `_ABOVE` | 5.0 / 0.1 | how fast speed returns to base from below / above |
| `CYCLE_ACCEL` | **10** | wall-acceleration multiplier |
| `CYCLE_ACCEL_OFFSET` | 2 | offset in the 1/(offset+d) curve |
| `CYCLE_WALL_NEAR` | 6 m | wall counts as "near" inside this |
| `CYCLE_ACCEL_SELF/TEAM/ENEMY/RIM` | 1 / 1 / 1 / **0** | per-wall-type multiplier (rim gives nothing by default) |
| `CYCLE_ACCEL_TUNNEL` / `_SLINGSHOT` | 1 / 1 | between two foreign walls / between own and foreign wall |
| `CYCLE_BOOST_*`, `CYCLE_BOOSTFACTOR_*` | 0 / 1 | one-shot speed bonus when *leaving* a wall (off by default) |
| `CYCLE_RUBBER` | **1** (SP) / **3** (dedicated) | rubber reservoir ("niceness when hitting a wall"; docs: 1 single-player, 3–10 online) |
| `CYCLE_PING_RUBBER` | 3 | extra rubber scaled by ping |
| `CYCLE_RUBBER_TIME` | 10 s | full-reservoir regeneration time |
| `CYCLE_RUBBER_SPEED` | 40 | "logarithmic speed of wall approximation" |
| `CYCLE_RUBBER_MINDISTANCE` (+`_RATIO`, `_RESERVOIR`, `_UNPREPARED`, `_PREPARATION`) | .001 / .0001 / .005 / .005 / .2 | minimum standoff from the wall, larger when the reservoir is empty or the grind was "unprepared" |
| `CYCLE_RUBBER_MINADJUST` | .05 | standoff when adjusting/180-ing into a wall |
| `CYCLE_RUBBER_DELAY` / `_DELAY_BONUS` | 0 / .5 | fraction of the turn delay during which rubber is only 50% effective (punishes 180s) |
| `CYCLE_RUBBER_MALUS_TURN` / `_MALUS_TIME` | 0 / 5 s | per-turn penalty that divides rubber effectiveness by (1+malus), decaying over 5 s |
| `CYCLE_RUBBER_WALL_SHRINK` | 0 (1 in Fortress) | your trail shortens as you burn rubber |
| `CYCLE_DELAY` | **0.1** s | minimum time between turns |
| `CYCLE_DELAY_TIMEBASED` | 1 | 1 = pure time; 0 = distance-based (fast cycles turn quicker) |
| `CYCLE_DELAY_DOUBLEBIND_BONUS` | 1 | scales the delay for a second turn in the same direction |
| `CYCLE_TURN_SPEED_FACTOR` | **0.95** | speed multiplier applied on every turn |
| `CYCLE_TURN_MEMORY` | 3 | queued turn inputs |
| `CYCLE_BRAKE` | **30** | brake deceleration; **negative = booster** |
| `CYCLE_BRAKE_DEPLETE` / `_REFILL` | 1.0 / 0.1 | brake reservoir drain per second while braking / refill per second |
| `CYCLE_WIDTH`, `CYCLE_WIDTH_SIDE` | 0 | non-zero makes tight tunnels cost rubber |
| `CYCLE_INVULNERABLE_TIME`, `CYCLE_WALL_TIME` | 0 | spawn protection / delay before walls form |
| `WALLS_LENGTH` | -1 (infinite) | trail length in metres |
| `WALLS_STAY_UP_DELAY` | 8 s | dead player's trail persists |
| `EXPLOSION_RADIUS` | 4 | hole radius |
| `SIZE_FACTOR` | map-dependent | arena scale |
| `WIN_ZONE_MIN_ROUND_TIME` / `_MIN_LAST_DEATH` | 60 / 30 s | when the instant-win zone spawns |
| `WIN_ZONE_INITIAL_SIZE` / `_EXPANSION` / `_DEATHS` | 5 / 1 / 0 | zone radius, growth m/s, 1 = death zone |
| `FORTRESS_CONQUEST_RATE` / `_DEFEND_RATE` / `_CONQUEST_DECAY_RATE` | .5 / .25 / .1 | points/s per attacker, per defender, passive decay |
| `FORTRESS_CONQUEST_TIMEOUT`, `_COLLAPSE_SPEED` | 0 / .5 | abandoned-zone timeout / shrink rate after conquest |
| `FORTRESS_SURVIVE_WIN`, `_CONQUERED_WIN`, `_CONQUERED_SCORE`, `_HELD_SCORE`, `_MAX_PER_TEAM` | 1 / 0 / 0 / 0 / 0 | victory & scoring rules |

Sources: [settings.cfg](https://github.com/hhirsch/armagetron/blob/master/config/settings.cfg), [gCycleMovement.cpp](https://github.com/hhirsch/armagetron/blob/master/src/tron/gCycleMovement.cpp), [gCycle.cpp](https://github.com/hhirsch/armagetron/blob/master/src/tron/gCycle.cpp), [gWinZone.cpp](https://github.com/hhirsch/armagetron/blob/master/src/tron/gWinZone.cpp), and the doc mirror at [wrtlprnft.net/armadoc/config.html](https://wrtlprnft.net/armadoc/config.html).

### B3. Rubber — the mechanic that makes the game playable online

**What it is.** "When you get close to a wall, rubber artificially slows your cycle at a certain distance from the wall. `CYCLE_RUBBER` gives the maximum amount of rubber you have got." It exists "to compensate for network latency… when you hit a wall, and the server thinks you've hit the wall, it's a physical impossibility for you to be certain you're near the wall" ([Rubber wiki page](https://wiki.armagetronad.org/index.php/Rubber), via search extract).

**How it works (source, `gCycleMovement::TimestepCore`)** — pseudo-code paraphrase:

```
d = raycast forward distance to nearest wall
stop = MINDISTANCE + MINDISTANCE_RATIO*wallLen + MINDISTANCE_RESERVOIR*(1 - rubberFillFraction)
if d < stop:
    shortfall   = stop - d                 # the distance you "would" have travelled into the wall
    rubber     += shortfall * effectiveness / RUBBER_SPEED    # burn reservoir instead of dying
    position    = clamped at 'stop' (you visually stick to the wall, speed effectively 0 forward)
if rubber >= rubberGranted:  die
rubber -= dt * rubberGranted / CYCLE_RUBBER_TIME               # regenerates, full in 10 s
```

`rubberGranted ≈ CYCLE_RUBBER + CYCLE_PING_RUBBER * ping`, and `effectiveness` is divided by `(1 + malus)` after hectic turning and multiplied by `CYCLE_RUBBER_DELAY_BONUS` (0.5) during the first `CYCLE_RUBBER_DELAY` fraction of the turn delay — both specifically "to punish 180s and hectic turning" ([Rubber page](https://wiki.armagetronad.org/index.php/Rubber), [gCycleMovement.cpp](https://github.com/hhirsch/armagetron/blob/master/src/tron/gCycleMovement.cpp)). The **`CYCLE_RUBBER_SPEED` = 40** term makes the approach logarithmic: you never quite reach the wall, you asymptote onto it while the reservoir drains. Clients receive rubber and brake reservoir state from the server each sync.

**Feel.** With rubber 1 (single-player) a wall touch is near-instant death; with rubber 5 (Fortress) you can *press* into a wall for a fraction of a second, then turn away — which is the whole basis of "digging" and tight grinding. High-rubber public servers (10+) are a different, mazey game where players routinely bounce off walls ([Building Your Skillset](https://wiki.armagetronad.net/index.php?title=Building_Your_Skillset)).

### B4. Wall acceleration ("grinding")

**Formula (docs + source):**

```
for each side sensor (left, right), hit distance D within CYCLE_WALL_NEAR:
    a = CYCLE_ACCEL * ( 1/(CYCLE_ACCEL_OFFSET + D)  -  1/(CYCLE_ACCEL_OFFSET + CYCLE_WALL_NEAR) )
    a *= CYCLE_ACCEL_{SELF|TEAM|ENEMY|RIM}      # depending on whose wall
if walls on both sides:
    a *= CYCLE_ACCEL_TUNNEL   (both foreign)   or   CYCLE_ACCEL_SLINGSHOT (own + foreign)
speed += a * dt
```

The subtraction guarantees acceleration is exactly 0 at `D = CYCLE_WALL_NEAR`, "so there are no jumps" ([config docs](https://armagetron.sourceforge.net/doc/config.html), [Grinding wiki](https://wiki.armagetronad.org/index.php/Grinding)). With defaults (`ACCEL 10, OFFSET 2, NEAR 6`) a cycle at D = 0.1 m gets ~3.5 m/s² and at D = 3 m ~0.75 m/s²; Fortress doubles `CYCLE_ACCEL` to 20 ([fortress_physics.cfg (source)](https://github.com/hhirsch/armagetron/blob/master/config/examples/cvs_test/fortress_physics.cfg)). **Speed decay** pulls you back toward `CYCLE_SPEED` (30) at rate `DECAY_ABOVE * (speed - base)` = 0.1/s above base and much faster (5/s) from below, so grinding gains are transient and must be renewed — the maximum sustainable speed is `CYCLE_SPEED + a_max / DECAY_ABOVE` (source `sg_MaxSpeed`). Reviews consistently name this as the hook: "The closer the player drives to a wall, the faster their Light-Cycle will go, creating an exciting, fast-paced game full of strategic planning" ([Freewaregenius review](https://freewaregenius.com/duel-with-tron-inspired-light-cycles-in-armagetron-advanced-a-simple-game-with-sophisticated-ai/), [JayIsGames](https://jayisgames.com/review/armagetron-advanced.php)).

**Grinding vs digging.** Grinding = driving parallel and close to a wall for the boost. **Digging** = deliberately turning *into* a wall, letting rubber absorb the impact so you end up as close as physically possible, then turning to grind — "technically a misuse of the rubber mechanics… but essential to understand" ([Glossary](https://wiki.armagetronad.org/index.php?title=Glossary)). `CYCLE_RUBBER_MINDISTANCE_UNPREPARED` makes an *unprepared* dig (no recent turn) stop further from the wall than a prepared one, rewarding deliberate setups.

### B5. Brake

Holding brake subtracts `CYCLE_BRAKE` (30) from acceleration while draining a reservoir at `CYCLE_BRAKE_DEPLETE` (1.0/s, so ~1 s of continuous braking by default) that refills at `CYCLE_BRAKE_REFILL` (0.1/s). Servers set **negative** `CYCLE_BRAKE` (e.g. `-16`) to turn the key into a limited **turbo** — the racing-server configs do this, and the shipped example `single_use_turbo.cfg` shows the pattern ([settings.cfg](https://github.com/hhirsch/armagetron/blob/master/config/settings.cfg), [config/examples](https://github.com/hhirsch/armagetron/tree/master/config/examples), [Console commands](https://wiki.armagetronad.org/index.php?title=Console)). Typical competitive values seen in server configs: `CYCLE_BRAKE 90`, `CYCLE_BRAKE_REFILL .5`, `CYCLE_BRAKE_DEPLETE 0.25`. Reviews note that unlike the film, "Armagetron Advanced allows you to brake… but adds a tactical element by giving you a speed boost after you finish braking" — the boost is the speed-decay-from-below pulling you back up at 5 m/s², which feels like a launch ([Open Source For You review](https://www.opensourceforu.com/2009/09/linux-game-review-armagetron-advanced/)). Braking's real use is *timing*: slow so the enemy commits, then accelerate off their wall.

### B6. Turn delay, double-binding, turn cost

- `CYCLE_DELAY 0.1` s between turns; with `CYCLE_DELAY_TIMEBASED 1` it is pure time, `0` scales with distance so fast cycles turn more often.
- Every turn multiplies speed by `CYCLE_TURN_SPEED_FACTOR 0.95` — a 5% tax on zig-zagging.
- **Double/triple binding**: bind two keys to the same direction and press both to queue two turns → an instant 180. "In gamemodes with higher turn delay like sumo or fortress, you will find a much closer split between players triple and double binding" ([Double Binding](https://wiki.armagetronad.org/index.php/Double_Binding), [Keybinds](https://wiki.armagetronad.org/index.php?title=Keybinds), [SourceForge feature request #30](https://sourceforge.net/p/armagetronad/feature-requests/30/)). `CYCLE_DELAY_DOUBLEBIND_BONUS` lets servers make the second half of a 180 cheaper or dearer.
- 180s and **adjusts** (a quick out-and-back that shifts your line 1 lane) override the min-distance rules (`CYCLE_RUBBER_MINADJUST`) so they can be executed flush to a wall.

### B7. Zones and game modes

Zones are circles drawn on the floor (`gWinZone.cpp`): **win zone** (enter to win, spawns after 60 s of stalemate), **death zone** (`WIN_ZONE_DEATHS 1`, expanding, kills on contact — used to end stalling rounds), **fortress zone**, **sumo zone**, **flag/base zones** (CTF).

- **Classic / Freestyle**: last cycle standing, infinite walls, `GAME_TYPE 0` freestyle or 1 last-team-standing.
- **Team**: same, with shared wall ownership (team walls accelerate you like your own).
- **Fortress** (the competitive standard, e.g. the monthly "Ladle"): two teams, each with a zone. Conquest score starts at 0 and is updated per second as **`+CONQUEST_RATE × attackersInside − DEFEND_RATE × ownersInside − DECAY_RATE`**, clamped ≥ 0; reaching 1.0 conquers the zone (default rates .5/.25/.1, Fortress-soccer .3/.2/.1). Last team with an unconquered zone wins (`FORTRESS_SURVIVE_WIN 1`); conquered zones shrink at `FORTRESS_COLLAPSE_SPEED` and can kill a fraction of the owners (`_CONQUERED_KILL_RATIO`) ([gWinZone.cpp (source)](https://github.com/hhirsch/armagetron/blob/master/src/tron/gWinZone.cpp), [Fortress wiki](https://wiki.armagetronad.org/index.php?title=Fortress), [Fortress tie-breaking thread](https://forums3.armagetronad.net/viewtopic.php?t=14951)). Competitive physics (`fortress_physics.cfg`): `CYCLE_SPEED 30, CYCLE_ACCEL 20, CYCLE_RUBBER 5, CYCLE_DELAY .1, WALLS_LENGTH 400, EXPLOSION_RADIUS 2, CYCLE_RUBBER_WALL_SHRINK 1`. Scoring: 10 per round win, 2 per kill ([fortress_scoring.cfg](https://github.com/hhirsch/armagetron/blob/master/config/examples/cvs_test/fortress_scoring.cfg)).
- **Sumo**: same physics, but `FORTRESS_CONQUEST_RATE 0`, `DEFEND_RATE .6`, `DECAY -.3` (i.e. the zone *charges up* while you stand in it and drains when you leave), zone `WIN_ZONE_INITIAL_SIZE 56.56` shrinking at `-.5656`/s; when your zone collapses you explode. "The goal… like sumo wrestling, is to stay inside the circle while forcing your opponents out" ([sumo_complete.cfg](https://github.com/hhirsch/armagetron/blob/master/config/examples/cvs_test/sumo_complete.cfg), [Sumo wiki](https://wiki.armagetronad.org/index.php?title=Sumo)). Team Sumo exists (`teamsumo.cfg`).
- **Capture the Flag**: grab the enemy flag zone, return it to your base; touching your base respawns dead teammates, so "blocking enemies from getting to their own base to respawn their allies" is a tactic ([Rules for CTF, Sumo and Ladle](https://forums3.armagetronad.net/viewtopic.php?f=3&t=21786)).
- **Racing / High rubber / Mazing servers**: negative brake turbos, huge rubber, finite walls (`health_is_wall_length.cfg` even ties HP to trail length) ([config/examples](https://github.com/hhirsch/armagetron/tree/master/config/examples), [Mazing](https://wiki.armagetronad.org/index.php/Mazing)).

### B8. Strategy vocabulary

From the [Glossary](https://wiki.armagetronad.org/index.php?title=Glossary), [Multi-Player Tactics](https://wiki.armagetronad.org/index.php?title=Multi-Player_Tactics), [Fortress Tactics – defense](https://wiki.armagetronad.org/index.php?title=Fortress_Tactics_defense) / [offense](https://wiki.armagetronad.net/index.php?title=Fortress_Tactics_offense), and the "complete Fortress tutorial" thread ([forums](https://forums3.armagetronad.net/viewtopic.php?t=18566)):

- **Box / boxing**: enclose an opponent so they run out of space. "In limited trail length, making boxes is pointless as they'll just stall and escape, so make any boxes as small as possible."
- **Seal / sealing**: close a box or the zone perimeter by grinding so tightly that "another player can't get out with a closer grind"; the sealer in Fortress "drives along the closest mate's wall until reaching the zone limit, then begins drawing a square around the zone."
- **Hole / holing**: a gap left in a wall (by a death explosion or by a deliberately loose turn) that a teammate can dive through; exploding a teammate on purpose next to the enemy defence is a legitimate opener.
- **Dig / grind / outgrind**: see B4. "If someone is hugging walls you can either outgrind them or go around to the other side and force them off."
- **Adjust / 180 / cut / core dump**: micro-line shifts; reversing; taking a lane off an opponent; leaving a trail that kills a chaser.
- **Sweeper / defender / attacker / center**: Fortress roles — defender spirals around the home zone, sweeper clears attackers from the flank, attackers grind teammates' walls to reach the enemy zone with speed. "Defense revolves around making sure there is a defender in a place where an opponent is going to be."
- **Stalling / camping**: spending rubber or braking to wait; tolerated in finite-wall modes but the death zone eventually forces action.
- The built-in AI (`gAIBase.cpp`) formalises the same ideas: states **SURVIVE, TRACE (follow an enemy wall), PATH, CLOSECOMBAT** with sub-behaviours *fear, caution, attack, seek, trap* and explicit "boxing" detection ([gAIBase.cpp (source)](https://github.com/hhirsch/armagetron/blob/master/src/tron/gAIBase.cpp)).

### B9. Why it feels great

1. **One rule, deep consequences**: everything you do leaves a permanent mark; position is strategy.
2. **Speed is earned by risk** — the accel curve is hyperbolic in distance, so the last 30 cm to a wall is worth more than the previous 5 m. Fear and reward are the same axis.
3. **Rubber turns a binary fail into an analog resource**: you *feel* the wall push back, you can bail, and 180s cost you extra. It also cleanly absorbs 100–300 ms of network latency, so online play is fair.
4. **Instant, quantised turns** make intent legible to everyone: you can read an opponent's plan from geometry alone.
5. **Turn tax (0.95) and speed decay** prevent jitter-spam and make straight, committed lines the fastest.
6. **Modes are just config**: Fortress, Sumo, racing and turbo servers all emerge from the same ~40 variables, so servers develop distinct "physics cultures" (low-rubber precision vs high-rubber mazing).

---

## Design takeaways — a concrete arcade handling model for a Three.js browser game

### T1. Vehicle state (per frame, `dt` in seconds)

```
pos, yaw, vel (world), speed = |vel|
fwd = (sin yaw, 0, cos yaw), right = (cos yaw, 0, -sin yaw)
vF = dot(vel, fwd)     # forward component
vL = dot(vel, right)   # lateral component
drift = false, driftAngle = 0, nitro in [0,1], gripK
```

### T2. Throttle / engine (UG-style gear feel without a real gearbox)

```
targetTop  = TOP * (nitroOn ? 1.15 : 1)
throttleF  = throttle * ENGINE * gearCurve(vF / targetTop)     # gearCurve: 1.0 at 0, sawtooth dips at 0.25/0.5/0.75 to fake shifts
drag       = DRAG_C * vF * |vF| + ROLL_C * vF
brakeF     = brake ? -BRAKE * sign(vF) : 0
nitroF     = nitroOn && nitro > 0 ? NITRO_F : 0
vF        += (throttleF + drag + brakeF + nitroF) * dt
```

Perfect-shift bonus (optional Drag mode): at each sawtooth dip, if the player taps *shift* within ±80 ms of the dip, multiply `ENGINE` by 1.15 for 0.6 s and flash green; too early = white (no bonus), late/red = heat += 0.25, heat ≥ 1 = engine blown.

### T3. Grip, slip and steering (the "drift factor" model, NFS/Ridge-Racer flavoured)

```
steerRate  = STEER_MAX * clamp(1 - vF / (2*TOP), 0.35, 1)        # less lock at speed (UG "steering ratio")
yawRate    = steer * steerRate * (drift ? 1.6 : 1.0)               # steering assist while drifting
yaw       += yawRate * dt

gripK      = drift ? GRIP_DRIFT : GRIP_NORMAL     # e.g. 0.80 vs 0.97 per 60 Hz frame; frame-rate independent: gripK = exp(-lambda*dt)
vL        *= gripK                                # kill lateral velocity each frame — this IS the tyre model
vel        = fwd * vF + right * vL
slipAngle  = atan2(vL, |vF|)
```

`GRIP_NORMAL` ≈ 0.97 gives Underground's planted feel; `GRIP_DRIFT` ≈ 0.80–0.88 gives a long, controllable slide. Real tyre friction is deliberately *not* simulated, matching how the GameDev.net and Unity tutorials found that lowering rear friction in a physics engine produced uncontrollable spins.

### T4. Drift entry / sustain / exit

```
ENTRY (any of):
  handbrake pressed && |steer| > 0.3 && vF > 0.35*TOP           -> drift=true, vF *= 0.90, vL += sign(steer)*0.35*vF   (UG handbrake)
  brakeTap (<0.25 s) && throttle && |steer| > 0.5 && vF > 0.5*TOP -> drift=true, vL += sign(steer)*0.20*vF             (UG brake-tap)
  throttle released for >=0.15 s && |steer| > 0.6 && DRIFT_CAR   -> drift=true                                        (Ridge Racer lift)

SUSTAIN:
  while drift: vF loses only 3%/s (arcade momentum), lateral kill = GRIP_DRIFT
  counter-steer (steer opposite to sign(vL)) reduces |slipAngle| growth by 50%; steering with the slide increases it
  throttle lift while drifting -> gripK = 0.90 (tightens the line, UG "let go and reapply")
  transition: if the player flips steer sign while |slipAngle| > 15°, keep drift=true and add vL kick the other way (pendulum)

EXIT:
  |slipAngle| < 6° for 0.20 s, or wall hit, or vF < 0.2*TOP  -> drift=false
  on clean exit with throttle held: vF += SNAP_BOOST (≈ 3% of TOP) — the Ridge Racer "snap"
```

### T5. Drift scoring (UG2 rules verbatim)

```
while drift: chain += vF * |slipAngle| * dt * zoneBonus     # zoneBonus 1.5 near barriers / on dirt (counter turns orange)
multiplier = 1 + count(chain >= [250, 1000, 3000, 8000])     # max 5x
if vF < 0.3*TOP for > 1.0 s: multiplier = max(1, multiplier - 1)   # "not enough speed" decay
on drift end (clean): banked += chain * multiplier; chain = 0
on wall hit: chain = 0; multiplier = 1                        # UG2 wall reset
```

### T6. Nitro (blend of UG1 finite tank + UG2 refills + Ridge Racer charge)

```
nitro drains 0.35/s while held (≈ 3 s per full tank); NITRO_F ≈ 0.6*ENGINE; FOV += 12°, radial blur, camera pull-back
refill events: clean section +0.10 (x1..x5 streak), near-miss +0.03 (x1..x5), 360 spin +0.25, head start +0.15,
               drifting +0.08/s while |slipAngle| > 20° (Ridge Racer), "ultimate charge" x2 if drifting within 1 s of nitro running out
Street-X style modes: nitro disabled.  Drag mode: nitro allowed once, timing it after a perfect shift is the skill.
```

### T7. Catch-up (fair rubber-band)

```
gap = trackDist(leader) - trackDist(ai)      # signed, metres
band = clamp(gap / 300, -1, 1)               # ±300 m neutral zone edge
aiTopScale   = 1 + 0.12 * band               # behind: up to +12% top speed; ahead: −12%
aiSkill      = clamp(baseSkill + 0.3 * band, 0, 1)   # ahead → brakes earlier, corners slower (GameAIPro "skill" method)
playerAssist = gap < -400 ? +0.05 top speed : 0     # gentle, never visible in the HUD
```
Expose a `catchUp` slider 0–1 in options (the community modded UG's `CatchUpMayb` to 0 for a reason), and never let the leader's scale drop below what the player can physically reach.

### T8. Sense of speed (cheap in Three.js)

- Camera FOV: `60 + 25 * (vF/TOP)^2 + 12 * nitroOn`, with 0.15 s lerp.
- Camera lag: follow point trails the car by `0.4 + 0.8*(vF/TOP)` m; on drift, orbit the camera toward the *outside* of the slide so the car yaws visibly.
- Post-process: radial blur strength `0.4*(vF/TOP)^3 + 0.5*nitroOn`; streak sprites on light sources; wet-asphalt planar reflection for a night city.
- Shortcuts: UG2's fun comes from **few connections between districts** and **many alleys inside** — keep the graph sparse at the macro level and dense at the micro.

### T9. Light-cycle / trail mode for a transforming mech

Map Armagetron's ~10 load-bearing variables onto the vehicle form:

- **Transform = commit.** In mech form you can stop, strafe and jump; transforming into the cycle locks you at `CYCLE_SPEED` minimum (`SPEED_MIN 0.25*base`), snaps heading to the arena axes (4 or 6), and starts extruding a light wall from the rear. Transforming back leaves the wall standing for `WALLS_STAY_UP_DELAY` seconds — so the "trail" becomes a temporary battlefield-shaping tool, and the mech form is how you *use* the map you drew.
- **Turn model**: instant 90° snaps with `CYCLE_DELAY 0.1 s`, each turn `speed *= 0.95`; double-tap a direction for a 180 (cost: rubber effectiveness halved for that turn).
- **Grinding = risk boost**: `a = ACCEL * (1/(2+D) - 1/(2+6))` per side for any wall within 6 m; own/team/enemy walls all count, arena rim gives 0; between two enemy walls (tunnel) ×1.5. Speed decays back to base at 0.1/s above base — boost is transient, so players must keep hugging.
- **Rubber = the "shield" stat**: reservoir `R` (e.g. 3 units), drained by `shortfall/40` per unit of penetration into a wall, regenerated in 10 s; hitting 0 breaks the cycle and dumps you into mech form with a stagger instead of killing you (softer than Armagetron, better for a hero game). Show it as a glowing bumper that flares on contact so the player *feels* the wall.
- **Brake key = tactical reservoir**: `BRAKE 30`, 1 s of use, 10 s refill; hold to bait, release for the decay-from-below surge (5 m/s²). Optionally negative in a "turbo" mode.
- **Finite walls** (`WALLS_LENGTH` ≈ 400 m ≈ 13 s of trail) keep an arena from choking and make *boxing* a timing game rather than a foregone conclusion; a destroyed cycle's explosion punches a `2 m` hole in nearby walls — teammates can dive through.
- **Zones**: a Fortress-style objective circle scored as `+0.5/s per attacker inside − 0.25/s per defender − 0.1/s decay`, and Sumo-style shrinking rings (radius 56 → 0 at 0.57 m/s) for duels. Both need nothing but a circle test per frame and read instantly in Three.js.
- **Skill vocabulary to design UI/tutorials around**: grind, dig, seal, box, hole, adjust, 180, sweeper/defender. Give the first tutorial three beats: (1) grind for speed, (2) dig with rubber, (3) seal a box.

**One sentence each:** the car mode should feel like Underground — planted, forgiving, with drift as an explicit request that pays out in score and nitro; the cycle mode should feel like Armagetron — rigid, instant, and fast only when you are one bad frame from a wall. The transform is the bridge: you drive to earn nitro, you ride to draw the map, you stand up to fight on it.

---

### Source index (all URLs cited above)

NFS: [NFS wiki UG2/Drift](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Drift) · [NFS wiki Style Points](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground/Style_Points) · [NFS wiki Drag (UG1)](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground/Drag) · [UG2 Drag](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Drag) · [UG2 Street X](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Street_X) · [UG2 Outrun](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Outrun) · [Drift Race](https://nfs.fandom.com/wiki/Drift_Race) · [Nitrous Oxide System](https://nfs.fandom.com/wiki/Nitrous_Oxide_System) · [Miraheze Nitrous](https://needforspeed.miraheze.org/wiki/Nitrous) · [Miraheze Racebreaker](https://needforspeed.miraheze.org/wiki/Racebreaker) · [Miraheze Visual Rating](https://needforspeed.miraheze.org/wiki/Visual_Rating) · [Miraheze Bayview](https://needforspeed.miraheze.org/wiki/Bayview) · [UG2 Performance Shop](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Performance_Shop) · [UG2 Performance Tuning](https://nfs.fandom.com/wiki/Need_for_Speed:_Underground_2/Performance_Tuning) · [Speedrun.com UG2 tuning](https://www.speedrun.com/nfsu2/guides/wtr6d) · [Speedrun.com NFSU double-tap drift](https://www.speedrun.com/nfsu/guides/i65ij) · [GameFAQs UG2 PC guide](https://gamefaqs.gamespot.com/pc/920469-need-for-speed-underground-2/faqs/33703) · [GameFAQs UG2 PS2 guide](https://gamefaqs.gamespot.com/ps2/920467-need-for-speed-underground-2/faqs/34283) · [GameSpot UG1 walkthrough](https://www.gamespot.com/articles/need-for-speed-underground-walkthrough/1100-6085684/) · [GameSpot UG2 review](https://www.gamespot.com/reviews/need-for-speed-underground-2-review/1900-6113360/) · [NFSUnlimited UG2 modes](http://wiki.nfsunlimited.net/wiki/Need_for_Speed_Underground_2_Racing_Modes) · [NFSMods no-rubberband UG1](https://nfsmods.xyz/mod/4715) · [NFSMods no-rubberband UG2](https://nfsmods.xyz/mod/1694) · [NFSMods UG2ish handling](https://nfsmods.xyz/mod/4589) · [NFSMods 100-tick steering patch](https://nfsmods.xyz/mod/5605) · [NFS Modder's Corner VLT docs](https://nfsmodderscorner.blogspot.com/2021/02/nfsmw-car-vlt-values-documentation.html) · [novisualrep](https://github.com/thelink2012/novisualrep) · [GameAIPro rubber-banding](https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter42_A_Rubber-Banding_System_for_Gameplay_and_Race_Management.pdf) · [Ridge Racer Drifting](https://ridgeracer.fandom.com/wiki/Drifting) · [Ridge Racer Nitrous](https://ridgeracer.fandom.com/wiki/Nitrous) · [Burnout Boost](https://burnout.fandom.com/wiki/Boost) · [GameDev.net arcade drift](https://www.gamedev.net/forums/topic/712162-how-do-i-implement-arcade-drift-using-a-physics-engine/) · [Yarsa Labs arcade car](https://blog.yarsalabs.com/basic-2d-arcade-car-controller-in-unity/)

Armagetron: [settings.cfg](https://github.com/hhirsch/armagetron/blob/master/config/settings.cfg) · [settings_dedicated.cfg](https://github.com/hhirsch/armagetron/blob/master/config/settings_dedicated.cfg) · [fortress_physics.cfg](https://github.com/hhirsch/armagetron/blob/master/config/examples/cvs_test/fortress_physics.cfg) · [fortress_scoring.cfg](https://github.com/hhirsch/armagetron/blob/master/config/examples/cvs_test/fortress_scoring.cfg) · [sumo_complete.cfg](https://github.com/hhirsch/armagetron/blob/master/config/examples/cvs_test/sumo_complete.cfg) · [fortress_soccer.cfg](https://github.com/hhirsch/armagetron/blob/master/config/examples/fortress_soccer.cfg) · [gCycleMovement.cpp](https://github.com/hhirsch/armagetron/blob/master/src/tron/gCycleMovement.cpp) · [gCycle.cpp](https://github.com/hhirsch/armagetron/blob/master/src/tron/gCycle.cpp) · [gWinZone.cpp](https://github.com/hhirsch/armagetron/blob/master/src/tron/gWinZone.cpp) · [gAIBase.cpp](https://github.com/hhirsch/armagetron/blob/master/src/tron/gAIBase.cpp) · [config docs (sourceforge)](https://armagetron.sourceforge.net/doc/config.html) · [config docs mirror](https://wrtlprnft.net/armadoc/config.html) · [Rubber](https://wiki.armagetronad.org/index.php/Rubber) · [Grinding](https://wiki.armagetronad.org/index.php/Grinding) · [The Basics](https://wiki.armagetronad.org/index.php/The_Basics) · [Glossary](https://wiki.armagetronad.org/index.php?title=Glossary) · [Fortress](https://wiki.armagetronad.org/index.php?title=Fortress) · [Fortress Tactics defense](https://wiki.armagetronad.org/index.php?title=Fortress_Tactics_defense) · [Sumo](https://wiki.armagetronad.org/index.php?title=Sumo) · [Double Binding](https://wiki.armagetronad.org/index.php/Double_Binding) · [Multi-Player Tactics](https://wiki.armagetronad.org/index.php?title=Multi-Player_Tactics) · [Building Your Skillset](https://wiki.armagetronad.net/index.php?title=Building_Your_Skillset) · [Fortress tutorial thread](https://forums3.armagetronad.net/viewtopic.php?t=18566) · [Sumo default settings thread](https://forums3.armagetronad.net/viewtopic.php?f=22&t=19640) · [CTF/Sumo/Ladle rules](https://forums3.armagetronad.net/viewtopic.php?f=3&t=21786) · [Wikipedia](https://en.wikipedia.org/wiki/Armagetron_Advanced) · [Freewaregenius review](https://freewaregenius.com/duel-with-tron-inspired-light-cycles-in-armagetron-advanced-a-simple-game-with-sophisticated-ai/) · [Open Source For You review](https://www.opensourceforu.com/2009/09/linux-game-review-armagetron-advanced/) · [JayIsGames review](https://jayisgames.com/review/armagetron-advanced.php)
