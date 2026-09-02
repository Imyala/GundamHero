# 02 — Frame and Vector: the transforming mech

Units: metres and seconds. World scale: a Frame is 18 m tall; the current codebase's mech is about
2 units, so 1 unit ≈ 9 m when porting numbers. Every number here is a starting value to tune.

## 1. The two forms

| | **FRAME** (humanoid) | **VECTOR** (vehicle) |
|---|---|---|
| Purpose | Win fights. Heavy weapons, melee, repair, precision aim | Cross the map, dogfight, race, escape |
| Ground speed | walk 12 m/s, boost dash 30 m/s for 0.5 s | cruise 40 m/s, afterburner 70 m/s |
| Turn | full authority, 0.15 s response | speed-limited (doc 03) |
| Vertical | hover 2 m (skim), jump-jets to 40 m on flight fuel | free flight for jet Vectors; ground-hug for bikes/tanks/cycles |
| Weapons | 2 Frame slots + shared missile salvo + melee | 2 Vector slots + shared missile salvo + nose gun (infinite) |
| Defence | shield block (front 90°, absorbs first 300 dmg then breaks 6 s), side-step | barrel roll (0.6 s, breaks missile lock, i-frames vs projectiles only), outrun missiles above 60 m/s |
| Repair | 2% HP/s within 25 m of a friendly beacon, **Frame form only, stationary** | none |
| Damage taken | ×1.0 | ×1.25 (the current codebase's rule; keep it) |
| Lock cone | 30°, reticle drifts at long range (rewards manual aim) | 60°, lock sticks (you cannot fly and aim on a keyboard) |

Gun Metal's rule made explicit: the Frame is heavy but never slow to respond, the Vector is fast but
cannot heal. Each form's weakness is one key away from the other's strength.

### Vector types (per frame line, doc 06)

| Vector | Handling family | Frames that use it |
|---|---|---|
| **Jet** | free flight, pitch/bank, afterburner | hero tricolor line, transformable line |
| **Waverider** | flight with a ground-effect skim mode; carries a passenger frame | transformable line |
| **Hover-bike** | ground, NFS model, best drift | striker/rogue line |
| **Hover-tank** | ground, NFS model, heavy, turret aims independently | artillery line |
| **Disc** | flight, slow, 360° hover, cannon fires along flight vector | Zeon-style heavy line |
| **Cycle** | ground, Armagetron model, extrudes light walls | trace/duelist line |
| **Beast** | ground quadruped, pounce/lunge, no drift but climbs | animal line |

## 2. Transform rules

1. **One key, both directions, no cost, no cooldown.** `T` on keyboard, `Y` on pad. Never on a
   D-pad or a stick gesture (Robotech Battlecry was penalised for thumb travel).
2. **Blend 0.3 s.** During the blend you are immune to *collision* damage but can still be shot.
3. **Momentum carries.** Frame → Vector converts current velocity into forward Vector speed.
   Vector → Frame keeps the velocity vector and applies Frame drag (12 m/s² ground, 6 m/s² air).
4. **Over-speed slide** (Granvir): a Frame moving faster than its walk speed has 30% control
   authority until it decelerates below it. Transforming out of a 70 m/s dive is a drift you plan for.
5. **Auto-drop** (Macross Ace Frontier): in a jet Vector, full brake for 0.4 s drops to Frame in a
   hover; touching ground below 20% throttle drops to Frame. Prevents crash frustration.
6. **Carry restrictions**: holding a Cipher item or a rescued unit blocks transform ("SERVOS LOADED",
   already in the codebase).
7. **Stagger forces a drop**: a staggered Vector converts to Frame and eats the 2 s stun on the ground.

## 3. Fuels and heat (three meters, all under the reticle)

| Meter | Fills / drains | Used by |
|---|---|---|
| **Thruster** (100) | dash costs 30; recharges 40/s after a 0.5 s delay | side-step, boost dash, barrel roll |
| **Flight** (100) | drains 15/s airborne in Frame, 5/s in jet Vector cruise, 15/s afterburner; recharges 10/s only when landed or in ground Vector | jump-jets, hover above 2 m, Vector flight |
| **Heat** (0–100) | beam cannon +25, assault dash +20, repeated dashes +8 each, big weapons per shot; cools 20/s; at 100 all heat actions lock until 60 | Combat Arts, heavy weapons, afterburner |

Hover at 2 m costs 40% of full flight drain, so the intended Frame locomotion is a low skim, not a walk
(Daemon X Machina's lesson). Reactor upgrades raise Heat cap and cooling; Frame tree nodes raise fuel.

## 4. Targeting

- **Soft lock** (automatic): nearest hostile inside the form's cone within 400 m gets a thin ring;
  weapons with tracking lead it.
- **Hard lock** (`Tab` / R3): camera centres, ring turns white. Breaks only when the target dies or
  leaves 600 m. Use for duels; stay soft when surrounded.
- **Reticle semantics** (Gun Metal): **red** = in range of the *selected* weapon; **blue** = friendly
  (fire disabled); grey **NO TARGET** = this weapon cannot hit this class (bombs vs aircraft).
- **Missile salvos**: a single **salvo** counter (6 per mission at start, grows with progression).
  Hold the missile key to paint up to N targets at 0.35 s each; release to fire. N = 2 in act 1
  rising to 6 by the finale. Anything between you and a painted target intercepts the shot (ZOE rule).
- **Range-contextual attack** (ZOE): the Frame's primary key is melee inside 15 m of a hard-locked
  target and the selected gun outside it. One key, two results, always the right one.

## 5. Stagger (AC6 model, simplified)

Every unit has **Stability** (player 800; enemies 300–1500 by class). Hits add **Impact**:
vulcan 3/round, beam rifle 30, bazooka 80, missile 40 each, saber 60/hit, ram 120 + speed bonus.
When Impact ≥ Stability: **2.0 s stagger**, damage taken ×1.5, then Impact resets 3.5 s later.
Impact decays at 10% of Stability per second when not hit.

Stagger is what makes weapon variety matter: shotguns and bazookas open the window, sabers and
beam rifles cash it in. The HUD shows the Impact bar under the target's health bar.

## 6. Frame movement detail

```
walk        12 m/s, accelerate 40 m/s², turn response 0.15 s (lerp heading with k = 1/0.15)
boost dash  30 m/s for 0.5 s, cost 30 thruster, i-frames 0.12 s at start (codebase rule)
side-step   8 m lateral in 0.25 s, cost 30 thruster
jump-jet    vertical 25 m/s while held, flight fuel
assault dash  (heat 20): straight line at 45 m/s, turning authority 25%, ends in a ram/kick of
              impact 120 and damage 8 + flat if you collide; 0.3 s wind-up so it is readable
melee       saber 3-hit combo, 3 × 120, hit 3 has impact 60; dash-slash if attack pressed while
            boosting toward a locked target inside 15 m
block       hold: front 90°, absorbs first 300 dmg, breaks for 6 s; move ×0.55 while blocking
```

## 7. Jet Vector movement detail

```
throttle    W/S or right-stick Y: continuous 0–1 (Gun Metal put throttle on a stick axis, not a trigger)
cruise      40 m/s at throttle 1; afterburner 70 m/s while Shift held (flight fuel ×3, heat +10/s)
pitch/bank  mouse; bank angle drives yaw rate: yawRate = 1.2 rad/s × sin(bank), max bank 70°
roll        double-tap A/D: 0.6 s barrel roll, breaks all missile locks, i-frames vs projectiles
brake       S at zero throttle: −25 m/s²; full brake 0.4 s → auto-drop to Frame hover
nose gun    infinite ammo vulcan, 3 impact/round, aims along flight vector with soft-lock lead
ground      below 6 m altitude the jet enters ground-effect and uses the NFS model (doc 03) so a
            waverider skimming a road handles like a car
```

## 8. Repair, ammo, pickups (Gun Metal)

- **Beacons** (Re-Energizer towers): 2% HP/s in Frame form within 25 m while stationary. Bases have
  them; capturing an enemy relay converts its beacon.
- **Ammo crates**: restore 50% of max ammo for every equipped weapon (two = full). Infinite-ammo
  weapons (machine pistols, nose vulcan) never need them.
- **Salvo crates**: +2 missile salvos.
- **Coolant**: −50 heat instantly.

## 9. Co-op and wingmate

The codebase already has a wingmate and local P2. In the new model the wingmate flies a second Frame,
obeys "attack my lock / defend the objective / follow" on `V`, and can be told to hold a beacon. In
the Twin-Plug frame (doc 06) P2 drives the second arm pair instead of a second mech.
