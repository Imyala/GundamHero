# 04 — Progression: attributes, formulas, trees, difficulty

Sacred Gold gives the accessibility model: attributes auto-grow so a frame keeps its identity, one
free point per level is a nudge, Combat Arts cost recharge time instead of mana, sockets are
commitments. WoW gives the maths: ratings keyed to enemy level, bucketed additive/multiplicative
modifiers, bracketed diminishing returns, 5-point tier gates, capstones, free loadouts.

Level cap **60**. Pilot level is account-wide; frames have separate mastery (kept from the codebase).

## 1. Attributes (six)

Auto-growth per level = **10% of the frame's starting value** (Sacred grows 9/86 ≈ 10.5%), plus
**one free point per level**. Frames differ by starting spread, not by what points can do.

| Attribute | Core effect | Secondary effect |
|---|---|---|
| **Output** (OUT) | +1% weapon damage per point | +0.5 max Heat |
| **Reactor** (REA) | +1% beam / Combat Art damage per point | Combat Art recharge +0.5%/pt |
| **Frame** (FRM) | +HP = base × 0.01 × FRM | Armor rating +2/pt, Stability +1/pt |
| **Servo** (SRV) | Evasion rating +2/pt | boost speed +0.25%/pt, melee attack speed |
| **Coolant** (COO) | Heat dissipation and weapon-skill recharge +0.5%/pt | HP regen out of combat |
| **Uplink** (UPL) | drone / wingmate / hack effects +1%/pt | loot find % = 10 × √UPL_bonus (Sacred's curve); vendor −0.5%/pt |

Starting spreads (sum 60): hero tricolor 12/10/10/10/9/9; artillery 14/6/16/6/10/8; rogue
10/8/6/16/10/10; funnel/Newtype 8/16/8/10/8/10; Eva-like 12/12/12/10/4/10; drill 16/6/12/10/8/8.

## 2. Formulas

```
K(L)         = 400 + 85 × L                     level constant, attacker's level
Armor DR     = Armor / (Armor + K),  cap 75%
Evasion      = Evasion / (Evasion + K), cap 50%; a dodged hit still applies half status build-up
Rating→%     = rating / R(L),  R(L) = 14 × 1.048^(L−1)     (≈14 at L1, 22 at L10, 46 at L25, 220 at L60)
DR brackets  on rating-derived % (crit, haste, precision, tenacity):
             thresholds 20 / 27 / 33 / 38 / 45 %,  marginal penalty 10 / 20 / 30 / 40 / 50 %,
             hard cap 60% from rating. Percent from talents and buffs adds AFTER DR.
Crit         damage × 2.0; Crit Power tertiary raises to 2.5 max
Haste        fire rate, melee speed and Art recharge scale by 1/(1 + haste); global recovery floor 0.5 s
Damage       = base × (1 + attr%) × (1 + Σ tree passives same school) × (1 + versatility)
               × critMult × (1 + Σ external buffs) × (1 − target DR) × (1 − school resist)
               additive inside a bucket, multiplicative across buckets
Impact       (stagger) is not scaled by damage buckets; only by weapon and Output/20
```

Five "+10% damage" nodes = +50%, not +61%. Crit, versatility and the target's DR sit in their own
buckets so each stays worth something at every gear level.

### Replacing the codebase's stacking problem

Today: block is a flat % roll for total negation, armor is flat subtraction floored at 1, wards cut
75% before armor, and none of it is capped. Mapping:

| Old | New |
|---|---|
| `block` % (14 + level + nodes...) | **Evasion rating** on the curve above, cap 50% |
| `armor` flat subtraction | **Armor rating** on `A/(A+K)`, cap 75% |
| ward ×0.25 | ward = **school resist 50%** for the matched type, its own bucket |
| AEGIS blocking ×0.3 | shield block absorbs a fixed pool (doc 02), then breaks |
| Speeder ×1.25 taken | Vector form: −20% Armor rating (same feel, now on the curve) |

### Combat Arts (Sacred's rune system)

Each frame has 4 Arts (the codebase's RUPTURE / SWEEP / SHACKLE / OVERLOAD hotbar becomes per-frame
Arts). **Cost is recharge time only, plus Heat.**

```
Recharge = Base(rank) × 1/(1 + REA/100) × 1/(1 + treeRecharge/100 + gearRecharge/100)
Base(rank) = Base(1) × 1.08^(rank−1)        reading a rune (+1 rank) raises power AND recharge 8%
socket rune rank: only 1.04^(rank−1)         the socket is the pressure valve
```

Art ranks are permanent, exactly like Sacred. Combos: at Uplink 30 the Combo Console lets you chain
up to 4 Arts into one key with one shared recharge (Sacred's Combo Master). Runes trade 4:1.

## 3. Trees (three layers)

| Layer | Points | Source | Content |
|---|---|---|---|
| **Pilot tree** (shared) | 26 | 1/level from 5 to 30 | utility, mobility, heat, loot find, wingmate commands. Gates: row 4 needs 6 pts, row 7 needs 14 |
| **Frame tree** (3 per frame line: Striker / Bastion / Vector) | 45 | 1/level from 10 to 50 + 4 from act bosses | Classic 5-point tier gates, capstone at 30; last 15 points may dip a second tree (the 31/20 hybrid, on purpose) |
| **Weapon lines** (rifle, cannon, blade, launcher, drone, vehicle) | 60 | 1/level from 1 | Sacred diminishing curve: bonus% = 60 × (1 − e^(−pts/12)); 5 pts ≈ 20%, 12 ≈ 38%, 20 ≈ 49%. Each hard point also +2% to that class's Arts (Diablo 2 synergy) |

Node types (Dragonflight): square passive (1–2 ranks, never more), round active (unlocks/upgrades an
Art), octagon choice (one of two). The codebase's 18-node tree becomes the **Pilot tree** seed.

### Point budget by level

| Level | Pilot | Frame | Weapon lines | Free attribute |
|---|---|---|---|---|
| 1–4 | 0 | 0 | 4 | 4 |
| 5–9 | 5 | 0 | 5 | 5 |
| 10–30 | 21 (cap 26) | 21 | 21 | 21 |
| 31–50 | 0 | 20 (+4 boss) | 20 | 20 |
| 51–60 | 0 | 0 | 10 | 10 |
| **At 60** | **26** | **45** | **60** | **60** |

### Respec

- Attributes: permanent; one full reset item from the first campaign clear. Low stakes because 90%
  of growth is automatic.
- Pilot and Frame trees: **free in the hangar**, up to 5 saved loadouts; locked in-mission.
- Weapon lines: permanent, with escape hatches: 2–3 refund points per act from side missions, and a
  rare Recalibration Module refunds one whole line.
- Art ranks: permanent.

## 4. Difficulty bands (Sacred's overlapping ladder)

| Band | Pilot level | Enemy level | Loot |
|---|---|---|---|
| Bronze | 1–30 | max(1, L+0) | base |
| Silver | 15–45 | max(15, L+2) | rarity weights +1 tier |
| Gold | 30–60 | max(30, L+4) | Prototype floor |
| Platinum | 45–60+ | max(45, L+6) | Signature chance ×2 |
| Niobium | 60+ | L+8, ascension tiers apply (codebase `tierMult`) | Set pieces |

Campaign clear on a band unlocks the next. Hardcore/Iron profiles stay as-is (one death, memorial wall).

## 5. Meta layers kept from the codebase

- **Devotions** (Vital Shell): one active permanent stat line, max rank 10, levelled by finishing sorties.
- **Frame mastery** (cap 50): +0.5% damage and +1 HP per level, cosmetic milestones at 10/25/40/50.
- **Relic seasons**: monthly, 8 relics with downsides. Keep.
- **Trials, Broker, Collection Log**: keep; the Collection Log can now reach 100% (doc 05 makes every weapon obtainable).

## 6. Onboarding ladder (Exile's Reach model)

| Levels | Teaches | Forced by |
|---|---|---|
| 1–4 | one weapon, one Art, heat, transform | Mission 1 "Zero Hour" |
| 5 | first Pilot point | a mission that needs the thing it unlocks (jump-jets) |
| 10 | frame line choice, Frame tree opens | first Corrupted mirror |
| 15 | sockets open | first gem drop |
| 20 | secondary stats appear on gear tooltips | hangar unlock "Advanced Readout" |
| 30 | Combo Console, Trace duels | hub race unlock |
