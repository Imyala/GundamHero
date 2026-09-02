# 08 — HUD, controls, camera, onboarding

## 1. HUD (Gun Metal layout, from the screenshots)

```
┌───────────────────────────────────────────────────────────────┐
│                   [ RADAR DISC, top centre ]                   │
│          red enemies · blue allies · green pickups/beacons     │
│          yellow objectives · outer ring = off-radar bearing    │
│                                                               │
│                         ( reticle )                           │
│                      red / blue / NO TARGET                   │
│                   ── heat ── ── flight ── ── thruster ──       │
│                     target name + HP + Impact bar             │
│                                                               │
│ ┌ SHIELD ████░ ┐                          ┌ form badge [T] ┐  │
│ │ MISSILES  6  │                          │   ▲ jet icon   │  │
│ │ PISTOLS   ∞  │  (4 slots, current form) │      85        │  │
│ │ BAZOOKA  12  │  other form's 2 ghosted  └────────────────┘  │
│ └──────────────┘                                              │
└───────────────────────────────────────────────────────────────┘
```

- **Radar disc** at the top (Gun Metal put it there; keep it). 200 m radius.
- **Weapon panel** bottom-left: the current form's slots with ammo, the other form's two ghosted
  beneath so the player always knows what a transform will give them.
- **Form badge** bottom-right with the transform key printed on it and the armor number.
- **Heat / flight / thruster** stacked under the reticle so eyes never leave the crosshair.
- **Salvo counter** separate from per-weapon ammo.
- Race HUD (VEL, nitro, DRIFT chain and multiplier, lap/place) replaces the weapon panel in races.
- Damage numbers, boss bar, announce queue, hint line: keep from the codebase.
- HUD updates: dirty-flag DOM writes, not `innerHTML` every frame (codebase pain point).

## 2. Controls

| Action | Keyboard / mouse | Pad |
|---|---|---|
| Move / throttle | W A S D (Vector: W throttle, S brake) | left stick |
| Aim / pitch-bank | mouse | right stick |
| Fire selected | LMB (hold) | RT |
| Missile salvo | RMB hold to paint, release | LT |
| Cycle weapon / quick select | Q tap / 1–4 | A / bumpers |
| **Transform** | **T** | **Y** |
| Boost dash / handbrake drift | Space | A (hold) |
| Nitro / afterburner / assault dash | Shift | RB |
| Side-step / barrel roll | double-tap A or D | B |
| Jump-jet | C | X |
| Block (hold) | Q hold | LB |
| Hard lock | Tab | R3 |
| Combat Arts 1–4 | R F G + mouse-wheel click | D-pad up/down/left/right |
| Wingmate command | V | back |
| Interact | E | — |
| Skill tree / map / pause | K / M / Esc | start |

Conflicts to resolve from the codebase: `K` is both P2 down and the skill tree; ward keys Z X C
become Art keys; co-op P2 on I J K L stays for arena mode only.

Block is **hold Q** in Frame form (Q cycles weapons on a tap, blocks on a hold). Gun Metal's
throttle-on-an-axis rule means pad Vector throttle is right-stick Y, not a trigger.

## 3. Camera

- Chase camera: 9 m behind, 4 m above the Frame; 14 m behind, 5 m above a Vector at cruise, pulling
  back with speed (doc 03 §5). Mouse orbits; hard lock centres on the target with the player
  offset left (AC6).
- Floating reticle inside a 40° cone (Starsiege) instead of torso twist: cheap and never fights the camera.
- Vertical: pitch limits ±60° in Frame; free in jet Vector.
- Keep the PSX pipeline (1/3 resolution, vertex snap). Fog and sky per zone from the screenshots.

## 4. Onboarding (Mission 1 "Zero Hour", 6 minutes)

1. Spawn in Frame next to a beacon at 60% HP. Hint: stand still to repair.
2. Commander: farms under attack. Hint: **T** to transform. Radar shows yellow objective.
3. Fly. Hint: Shift for afterburner; first timed traversal is generous (90 s for 40 s of flight).
4. Three jets. Hint: hold RMB to paint, release. Then LMB vulcans. Kill = first ammo pickup.
5. Land (auto-drop by braking). Ground walkers. Hint: LMB is melee inside 15 m of a locked target.
6. A barracks. Hint: kill the building, stop the stream.
7. Return to base. Reward screen: Flak Fan. Pilot level 2, first attribute point (auto-suggested).

Every hint is one-shot per profile (codebase `seenHints`). Nothing below level 5 mentions trees.
