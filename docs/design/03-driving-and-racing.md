# 03 — Driving and racing (CIRCUIT)

One handling model for every ground Vector: free roam, Circuit races, the RACEWAY dungeon, and the
Sunspire hub race. `race.js`'s separate rider sim is retired (doc 09). The model is the NFS
Underground "drift factor" model: kill lateral velocity each frame, less when drifting.

## 1. Vehicle state and integration

```
pos, yaw, vel (world);  fwd = (sin yaw, 0, cos yaw);  right = (cos yaw, 0, −sin yaw)
vF = dot(vel, fwd)        forward speed
vL = dot(vel, right)      lateral speed
drift ∈ {false,true}; slipAngle = atan2(vL, |vF|); nitro ∈ [0,1]; heat as in doc 02
```

### Throttle and engine

```
TOP        per Vector (bike 55, tank 40, waverider ground-effect 60 m/s)
targetTop  = TOP × (nitroOn ? 1.15 : 1)
throttleF  = throttle × ENGINE × gearCurve(vF / targetTop)
             gearCurve = 1.0 at 0 with sawtooth dips of 0.15 at 0.25 / 0.5 / 0.75 — a fake gearbox
drag       = DRAG_C × vF × |vF| + ROLL_C × vF
brakeF     = brake ? −BRAKE × sign(vF) : 0        (BRAKE ≈ 34 m/s², the codebase's value)
nitroF     = nitroOn && nitro > 0 ? 0.6 × ENGINE : 0
vF        += (throttleF + drag + brakeF + nitroF) × dt
```

### Steering and grip

```
steerRate = STEER_MAX × clamp(1 − vF / (2 × TOP), 0.35, 1)      less lock at speed
yawRate   = steer × steerRate × (drift ? 1.6 : 1.0)               steering assist while drifting
yaw      += yawRate × dt
gripK     = exp(−λ × dt),  λ_normal = 1.8 (≈0.97/frame at 60 Hz),  λ_drift = 8 (≈0.87/frame)
vL       *= gripK                                                  this IS the tyre model
vel       = fwd × vF + right × vL
```

Real friction is deliberately not simulated. Lowering rear friction in a physics engine produces
uncontrollable spins (every arcade-drift tutorial finds this). Ice hazard: λ_normal = 0.6.

## 2. Drift: entry, sustain, exit, scoring (UG2 rules)

```
ENTRY, any of:
  handbrake (Space) && |steer| > 0.3 && vF > 0.35 TOP  → drift; vF ×= 0.90; vL += sign(steer) × 0.35 vF
  brake tap < 0.25 s && throttle && |steer| > 0.5 && vF > 0.5 TOP → drift; vL += sign(steer) × 0.20 vF
  throttle lift ≥ 0.15 s && |steer| > 0.6 (bike Vectors only)     → drift        (Ridge Racer lift)

SUSTAIN:
  vF loses 3%/s; counter-steer halves slip growth; steering into the slide grows it
  throttle lift while drifting → λ = 4 (tightens the line, UG's "let go and reapply")
  flip steer sign while |slip| > 15° → keep drift, kick vL the other way (pendulum transition)

EXIT:
  |slip| < 6° for 0.20 s, or wall hit, or vF < 0.2 TOP → drift off
  clean exit with throttle held → vF += 0.03 TOP (Ridge Racer snap)

SCORING (UG2 verbatim):
  chain += vF × |slip| × dt × zoneBonus       zoneBonus 1.5 near barriers / on dirt (counter turns orange)
  multiplier = 1 + count(chain ≥ [250, 1000, 3000, 8000]),  max 5×
  vF < 0.3 TOP for > 1.0 s → multiplier −1 ("not enough speed")
  drift end (clean) → banked += chain × multiplier; chain = 0
  wall hit → chain = 0, multiplier = 1, nitro dumped (codebase's WALL — NITRO DUMPED rule stays)
```

Style pays out as salvage at the end of a race (`min(150, style/4)` today; scale with tier).

## 3. Nitro

```
drain 0.35/s while held (≈ 3 s per tank); FOV +12°, radial blur, camera pull-back
refill: clean section +0.10 (×1..×5 streak), near-miss +0.03 (×1..×5), 360 spin +0.25,
        head start (perfect launch) +0.15, drifting +0.08/s while |slip| > 20°,
        "ultimate charge" ×2 if drifting within 1 s of nitro running out
Street-X style modes disable nitro. Drag mode allows nitro once; timing it after a perfect shift is the skill.
```

## 4. Catch-up (fair rubber band, exposed as a slider)

```
gap   = trackDist(leader) − trackDist(ai)      signed metres
band  = clamp(gap / 300, −1, 1)
aiTop = 1 + 0.12 × band                        behind +12%, ahead −12%
aiSkill = clamp(base + 0.3 × band, 0, 1)       ahead → brakes earlier, corners slower
playerAssist = gap < −400 ? +5% top : 0        never shown in the HUD
```

Options → "Catch-up: 0–100%". NFS players modded `CatchUpMayb` out for a reason.

## 5. Sense of speed (cheap in Three.js)

- FOV = 60 + 25 × (vF/TOP)² + 12 × nitroOn, lerp 0.15 s.
- Camera lag: follow point trails by 0.4 + 0.8 × (vF/TOP) m; on drift, orbit toward the outside
  of the slide so the hull yaws visibly.
- Radial streaks above 45% speed (already pooled in the codebase), skid ribbons under slides,
  hull bank into the slide, constant tremor above 80%.
- Track graph: sparse between districts, dense alleys inside (UG2's shortcut rule).

## 6. Race modes

| Mode | Rules | Where |
|---|---|---|
| **Circuit** | 3 laps, 8–10 gates, 3 rivals, live fire allowed, destroyed rivals regrid 3 s later two gates back (codebase RACEWAY rule) | every zone |
| **Sprint** | point to point through a zone, one shot, shortcuts matter | travel routes between zones |
| **Drift** | closed loop, 2 laps, score not time; wall hits wipe the chain | hub + ember |
| **Drag** | straight, forced manual: shift key at the gear dips; window colours white/blue/green/red, green ×1.15 engine for 0.6 s, red adds heat, heat 1.0 = blown engine; one lane hop allowed | wreck runway |
| **Outrun** | free-roam challenge: hold a 300 m lead over a rival for 20 s | any zone, triggered by driving up to a rival |
| **Street X** | tight lot, nitro disabled, pure grip | glacier |
| **Trace Duel** | Armagetron light-cycle, last rider standing | duel pit |
| **Trace Sumo** | shrinking ring, radius 56 → 0 at 0.57 m/s | duel pit |
| **Trace Fortress** | hold the zone: +0.5/s per attacker inside, −0.25/s per defender, −0.1/s decay, 1.0 = conquered | storm zone |

**Perfect launch**: first throttle inside the last 0.7 s of the countdown primes +0.6 nitro (already in code).

## 7. Trace (the Armagetron mode)

Map Armagetron's ten load-bearing variables onto the Cycle Vector. Read directly from the game's
`settings.cfg` and `gCycleMovement.cpp`.

| Armagetron | Default | In this game |
|---|---|---|
| `CYCLE_SPEED` | 30 | base speed 30 m/s; minimum 0.25 × base, you cannot stop |
| `CYCLE_DELAY` | 0.1 s | minimum time between turns |
| turn | instant 90° | instant snaps to 4 (or 6) arena axes; each turn speed ×0.95; double-tap = 180 |
| `CYCLE_ACCEL` | 10 | wall-grinding boost `a = ACCEL × (1/(2+D) − 1/(2+6))` per side for any wall within 6 m; tunnel between two enemy walls ×1.5; rim gives 0; decays back to base at 0.1/s |
| `CYCLE_RUBBER` | 1 (comp 5) | the **shield**: reservoir 3, drained by penetration shortfall/40, regenerates in 10 s; at 0 the cycle breaks and dumps you into Frame with a stagger instead of killing you |
| `CYCLE_BRAKE` | 30 | tactical reservoir: 1 s of use, 10 s refill; hold to bait, release for the surge |
| `WALLS_LENGTH` | −1 (comp 400) | finite 400 m walls (≈ 13 s of trail) so arenas never choke |
| explosion | 4 | a destroyed cycle punches a 2 m hole in nearby walls; teammates dive through |
| `WALLS_STAY_UP_DELAY` | 8 | transforming back to Frame leaves your wall standing 8 s: the trail is terrain you fight on |

**Transform = commit.** In Frame you stop, strafe, jump. Transforming to Cycle locks minimum speed,
snaps heading to the grid and starts extruding wall. You ride to draw the map, you stand up to fight on it.

Tutorial beats, from the community skill vocabulary: (1) grind for speed, (2) dig with rubber,
(3) seal a box. Later: hole, adjust, 180, sweeper.

## 8. Tuning (Sacred-style performance shop)

Vector parts are gear (doc 05): **engine** (ENGINE, TOP), **transmission** (gearCurve dips,
perfect-shift window), **suspension** (λ_normal, steerRate), **tyres** (λ_drift, snap boost),
**weight** (BRAKE, drag), **nitrous** (tank size, refill rates), **turbo** (afterburner).
Each is a socketable item with rarity, so a race build is a real build.
