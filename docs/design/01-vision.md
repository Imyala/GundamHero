# 01 — Vision and pillars

## The fantasy

You are an ace test pilot with the only transforming prototype on the planet. Ground forces plod;
you don't. The map is huge, the enemy is everywhere, and the base is on fire. You **drop out of the
sky as a jet, land as a giant, and leave as a jet** with a new weapon strapped to the rack.

Three feelings, in order of priority:

1. **The transform is free.** Gun Metal's single strongest asset, per every review: change form at
   any time, no cost, no cooldown. The tension is *which form am I in*, never *can I afford it*.
2. **Speed has grip.** NFS Underground's planted, forgiving car with drift as an explicit request
   that pays out in score and nitro. The Vector form is a car with wings, not a sim plane.
3. **Numbers you can read.** Sacred's "one free point per level, cooldown is the cost"; WoW's
   "show the percent, hide the rating". Depth is in the hangar, not on the HUD.

## Pillars in detail

### SORTIE (missions)

Gun Metal reviewers loved: at-will transform, hectic arcade combat, big destructible maps, weapon
variety. They hated: too many defend/escort missions, slow unresponsive mech, weapons arriving too
fast to tell apart, 4-hour length, no replay value.

Rules derived from that:

- Defend/escort capped at **40%** of missions. The rest: assault, dogfight-only, capital-ship
  boarding, minesweeping, infiltration, timed traversal, boss duels.
- **Every mission introduces exactly one new thing**: a weapon, a frame, or an enemy class. Never two.
- The Frame form is *deliberate*, not slow: 0.15 s turn response, a boost dash, low hover. Slowness
  was Gun Metal's flaw, not its feature.
- Missions replay with modifiers, loot tiers and race leaderboards so the 4-hour campaign is the
  tutorial for a 40-hour game.
- Escort targets have 2x the HP the player expects and allies shoot down 30% of incoming, so the
  player is a force multiplier, not a babysitter.

### CIRCUIT (racing)

The Vector form has to be fun on its own, or the transform is a fast-travel button. NFS Underground
is the model: drift chains with multipliers, nitro earned by driving well, perfect-shift drag races,
Outrun duels in free roam. Armagetron adds the Trace mode: a light-cycle wall game where the mech's
Vector form draws walls and the Frame form fights on the map you drew.

### HANGAR (building)

Sacred: attributes auto-grow (identity stays), one free point nudges, Combat Arts cost recharge time,
sockets are commitments, item tiers Common → Set. WoW: three-layer trees (pilot / frame / weapon
lines), 5-point tier gates, capstones, choice nodes, free loadout swaps in the hangar, rating DR.
Vital Shell (which this repo's arena mode already mirrors): devotions as one active permanent stat line.

## Tone and look

Keep the codebase's PSX look (1/3 resolution, vertex snap, flat shading). Gun Metal's palette per
screenshot: sun-bleached deserts, snowfields with pine, amber grass plains, a violet-dawn sky with
lens flares. Zeon-style greys and Gundam tricolor on frames read perfectly in flat shading.

HUD vocabulary from Gun Metal: radar disc, blocky cyan panels, form badge with armor number.

## Accessibility ladder (easy in, deep down)

| Minute | The player has learned |
|---|---|
| 0–2 | Move, aim, fire, transform (one key each) |
| 2–6 | Lock-on, missile salvo (hold to paint, release), repair beacon in Frame form only |
| 6–15 | Heat, boost fuel, stagger window, per-form weapon slots |
| 15–40 | First race: throttle, brake, handbrake drift, nitro from drifting |
| 40–90 | First skill point, first socket, first Corrupted mirror boss, first frame unlock |
| 90+ | Weapon lines, frame tree gates, parts and rarity, difficulty bands, Trace duels, ascension tiers |

Nothing on the right of the table is required to finish the campaign on Bronze.
