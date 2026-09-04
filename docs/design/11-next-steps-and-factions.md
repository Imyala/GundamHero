# 11 — What comes next, and factions

Written after the "built territories" round (doc 10 covers what shipped). This is the
recommendation list, ordered by how much each item changes how the game feels per day of work.

## 1. What the game needs next (recommended order)

1. **Chase camera and mouse aim** (doc 08). Everything built so far is seen from a steep fixed
   camera. Hive spires, castle walls and sky islands only pay off when you can look *up* at them.
   This is still the single biggest change and the biggest risk. Two to three days for a slice.
2. **Frame form on the tracks.** Racing is vehicle-only. The Gun Metal loop wants you to transform
   mid-race: a jump you can only make as a jet, a hairpin you can only take as a walker. Give the
   race modes a "transform allowed" flag and a per-form top speed.
3. **The weapon economy** (doc 05). The 13 secondary weapons are still unreachable, so every new
   creature dies to the same primary. Mission rewards, drops with rarity, and a loadout screen
   turn the new fauna into reasons to build.
4. **Enemy "signature moves" with counters.** The new behaviours (burrower, flyer, ambusher,
   phantom, slammer, turret, caller, latcher) each need a readable counter: shoot the plume,
   bait the dive, torch the bush, mark the phantom, dodge the slam, flank the turret, kill the
   caller first, shake the leech with a dash. Doc 07 §1 lists the stagger values that make this work.
5. **Zone events.** Built zones want scripted set pieces: a hive lockdown (doors close, spire
   alarms), a keep siege (ballistas on the walls, gate breached), a sky gale that moves the
   bridges, a warrens cave-in that reroutes tunnels. The siege relay code is the seed.
6. **A real minimap for built zones.** Streets, walls and tunnels should draw on the minimap
   from the structure layout so the hive and the warrens are navigable.
7. **Vehicle variety on tracks.** Bike, tank, jet and cycle Vectors (doc 02) with different
   grip, top speed and jump behaviour; today every frame drives the same skimmer.
8. **Kart items.** Boost pads landed; the next kart-racer layer is pickups on the line: a shield,
   a mine, a homing missile, a short nitro. The projectile and mine systems already exist.
9. **Audio per zone.** The generative sequencer has one song per original zone. The five built
   zones reuse them; each needs its own root, tempo and drum pattern, plus wind, rain and
   cavern drips from the atmosphere module.
10. **Save migration.** New zones, new dungeon ids and new enemy ids are all additive, but an old
    save standing on what is now a building or solid rock needs the open-spot search on load.

## 2. Factions

The world now has places that read as *owned*: a hive, a keep, a citadel, an undercity, a court
in the sky. That is the shape factions need. Proposal for discussion:

### The five houses

| Faction | Seat | Doctrine | Frame line (doc 06) | Race discipline | Signature demand |
|---|---|---|---|---|---|
| **Spire Combine** | Spire Hive | industry, mass production, drones | Production line (LINE, SKATER, ARSENAL) | Drag and Street X on the hive circuit | deliver salvage quotas |
| **Wardens of the Keep** | Bastion Keep | order, walls, honour duels | Hero line (VANGUARD, DELTA, CHRYSALIS) | Circuit and Sprint | hold sieges, win duels |
| **Citadel Remnant** | Fallen Citadel | relics, memory, salvage of the old war | Newtype line (SEER, WITCH, REAPER) | Drift | recover artifacts, clear lairs |
| **Deep Kin** | Deep Warrens | survival, capture, kitbash | Drill line (KEYHEAD, COREBREAKER) | Trace duels underground | capture enemy machines |
| **Aether Court** | Aether Court | ascension, sync, the sky | Bio-organic and Variable lines (REVENANT, ARROW) | Outrun over the islands | ace customs, high sync |

The six original biomes stay contested ground where factions send you; the five built zones are
the seats. The hub camp on the dune coast stays neutral.

### Joining

- **Reputation** per faction, −100 to +100, moved by contracts (the Broker already tracks
  contracts), race podiums on their circuit, and whose fauna you kill (the Combine's hab brutes
  count against them, the Kin's glow mites count for the Court, and so on).
- At +40 you may **pledge**. One pledge at a time. Pledging opens the seat's inner district
  (a new dungeon gate), its frame line's blueprint vendor, its race series, and its tree branch.
- **Rival factions** react: their patrols go hostile in the open, their seats close, their
  circuits run against you with bounties on your hull.
- **Betrayal** is allowed: pledge elsewhere and reputation with the old house collapses to −60,
  with a "traitor" ace custom hunting you for a season.

### Making your own

- After clearing three seats' inner districts you can **raise a banner**: pick a name, a paint
  (the cosmetics system), a doctrine (one of five stat lines, on top of the attributes), and a
  seat: any cleared nest cluster becomes your outpost with a beacon, a broker and a race gate.
- Your faction recruits **wingmates** from captured or pledged frames (the wingmate code exists),
  levies **tithes** from territories you hold (nests cleansed = income), and must **defend** them
  (the siege machine, now fired at you).
- Player factions are single-player entities with save-backed state; nothing here needs a server.
  If multiplayer ever comes, the same reputation table works as a leaderboard.

### What to build first

1. Reputation counters and a faction panel in the hangar (a day).
2. Faction patrols: each built zone's fauna tagged with a house, hostile or neutral by reputation.
3. Pledge gates: one inner-district dungeon per seat, reusing the DEPTHS archetype with a house
   boss (the Revenant mirrors already exist as bosses; give each house one).
4. Race series per house with the existing tracks.
5. Then the player banner.

## 3. Open questions for you

- Should factions gate frames (you can only fly a house's line while pledged) or only discount them?
- Is betrayal permanent within a profile, or does a season reset it?
- Do you want the hub camp to become a faction seat too, or stay neutral forever?

---

## Decisions taken (this round)

Your three rules are now the design, and the build follows them:

1. **Any frame line can be built by anyone.** Houses never gate parts. A house you stand with sheds
   its favoured weapon families more readily: reward rolls weight a pledged house's parts ×2.4, an
   allied house's ×1.6, and a hostile house's ×0.7. Nothing is ever locked.
2. **Betrayal stains.** Pledging to a rival while pledged drops the old house to −60 and leaves a
   stain of 100, which caps how high regard can climb (cap = 100 − 1.4 × stain). Every deed (a
   contract, a dungeon clear, a podium) wears every stain down by 3. Roughly thirty-five deeds to
   clear it fully: not easy, never impossible. Renouncing without a new pledge is not betrayal, just −20.
3. **Your own banner, then a seat.** After ascending ten dungeons, or standing at 60 with two houses,
   you may raise a banner: a name, a doctrine (one of the five stat lines, replacing the pledge's),
   and a paint. Leaving a pledge this way costs −20, not a stain. From there you align through work
   or face them all. A seat needs three territories held (every nest broken) and either two houses
   at 60 or three at −60; the camp becomes your court and flies your banner.

Everything else from the recommendation list also shipped; see doc 10's "round three" section.
