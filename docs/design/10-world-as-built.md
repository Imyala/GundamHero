# 10 — The world as built (terrain, biomes, fauna, tracks)

What shipped in the code for the "make the world amazing" round, so the design docs and the
build agree. Files: `js/terrain.js` (new), `js/atmos.js` (new), `js/models.js`, `js/enemies.js`,
`js/stages.js`, `js/dungeons.js`, `js/world.js`, `js/game.js`, `js/race.js`, `js/assets.js`.

## Shaking objects

The PS1 vertex snap quantised clip space to a 96-step grid regardless of render size. At one-third
resolution that was a jump of about three pixels per step, so everything lurched as the camera
moved. The snap now tracks the real framebuffer (`GH.assets.setSnap` from the resize handler), which
keeps the retro wobble at exactly one render pixel.

## Terrain

Every zone owns an analytic height field `h(x, z)` (seeded value noise, biome shaping, flat pads
under installations, a sealed rim). The same function drives the ground mesh, every entity's y, the
camera, vehicle physics and surface queries. Zones load in 0.2 to 1.0 s in a headless Chromium.

| Zone | Biome | Shape | Ground | Surface effects |
|---|---|---|---|---|
| wreck | DUNE COAST | NE-running dune ridges, a beach and sea to the south (the camp is on the beach) | sand | soft: bog and jump; water hydroplanes |
| glacier | FROST RANGE | rolling valleys, ridged mountain ranges, frozen lakes | snow | soft: snowbound and drift jumps; lakes are ice |
| cloister | RAIN CANOPY | rolling hills, ponds and river basins | moss | water slows, mud slows |
| ember | CINDER WASTES | cinder cones, lava basins with a lava plane | basalt | lava burns both forms |
| storm | THUNDER HIGHLANDS | terraced mesas | slate | none (lightning is the hazard) |
| null | VOID SANCTUM | shard ridges and chasms | void | low gravity (11 vs 24): long jumps |

**Map edge.** A 16-unit cliff bank starts 10 units inside the playable edge, then mountains rise
to about 60 units over the next 100, with ridged noise on top. Gate pads carve passes through the
bank so travel gates stay reachable. Fog now runs 30 to 98 units in the open so hills and the rim
read before the haze takes them. You cannot see off the map from any position or form.

**Pads.** Camp, circuit ring, duel pit, gates, nests, relays, lairs, vaults, chests, objectives,
checkpoints, convoy waypoints and breaches sit on flat pads blended into the field.

**Roads and stains** are painted into the terrain's vertex colours instead of floating decals.

## Vehicle physics on terrain (`updateDrive`)

- Gravity along the slope: climbs bleed speed, descents lend it, sheer rock stops you.
- **Soft ground on a steep face** (sand, snow): above 58% of top speed you launch (`DUNE JUMP`
  / `DRIFT JUMP`); below 48% you bog down. Bogged: forward is a crawl, **reverse gear digs you out**.
- **Crests**: leaving a downslope above 70% top speed goes airborne. Airborne: 25% steering,
  grip 0.6, gravity per biome, hard landings scrub speed and shake the camera. Air time above
  1.5 units banks nitro.
- Reverse gear: hold the opposite direction below 1.5 speed.
- Water: hydroplane (ice grip) and a 70% cap. Lava: burn ticks.
- Races: more than 1.2 units outside the ribbon edge is `OFF TRACK`, 110%/s drag.
- The drive HUD prints one word: `DRIFT`, `BOGGED — REVERSE`, `SNOWBOUND — REVERSE`, `AIR`, `OFF TRACK`.
- The hull pitches with the ground and with its flight arc.

Frame form: climbing costs stride (up to 55% at slope 0.8), descending lends up to 25%, slopes over
1.15 are walls. Water 62%, mud 80%, lava burns, `CHILLED` and `SNARED` statuses from fauna.

## Weather (`GH.atmos`)

One particle cloud per zone wrapped around the pilot: snow (900 flakes), rain streaks (line
segments, 700 to 900), rising embers, wind-gusted sand, drifting void motes. Dungeons get 35%.

## Vegetation and rock

Per-biome prop kinds, clustered by density noise into groves and boulder fields, stamped from
six authored variants per kind into a handful of merged meshes (about 3,000 to 5,000 props per
zone, 10 to 20 draw calls).

| Zone | Kinds |
|---|---|
| wreck | palm, saguaro cactus, dune rock, wreck ribs, bones |
| glacier | snow-capped pine, snow rock, ice spire, dead tree |
| cloister | jungle tree with buttress roots, fern, vine curtain, glowing mushroom, moss rock |
| ember | basalt column cluster, lava rock with glowing seam, charred tree with ember tips, vent stack |
| storm | slate spire, heather, dead tree, menhir |
| null | crystal, floating shard, monolith with a violet stripe, void reed |

## Zone-native hostiles

Common fauna is tinted per zone. Eleven new types with five new behaviours:

| Zone | Type | Behaviour |
|---|---|---|
| wreck | Dune Scarab | armoured chaser, takes 60% damage |
| wreck | Sand Maw | **burrower**: tunnels fast under the crowd (plume only, 30% damage taken), telegraphs, erupts to bite for 2.6 s, re-buries |
| glacier | Frost Stalker | pack dasher, pounces |
| glacier | Rime Wisp | frost shots chill the frame (60% speed for 1.6 s) |
| cloister | Vine Lurker | **ambusher**: a bush until you are within 6.5 units, snares you if inside 4.2, then lunges |
| cloister | Spore Bloat | slow sac; on death a chilling spore cloud |
| ember | Magma Crawler | leaves a burning trail while hunting |
| ember, storm | Drake | **flyer**: circles at height 3.2, dives to strike; melee reaches it only on the dive |
| storm | Storm Sentinel | floating obelisk, three-shot arc bursts |
| null | Void Phantom | **phantom**: blinks out (invulnerable), reappears 4.2 units from you |
| null | Null Shard | crystalline skirmisher, void shots |

Stage rosters and expedition packs use them from wave 2 to 5 onward.

## Race tracks

`genRaceway(size, zoneId)` builds a closed Catmull-Rom spline from authored control points:
DUNE RUN (wreck, esses and a hairpin), THUNDER RIDGE (storm, hairpins), CALDERA LOOP (ember),
ICEFALL (glacier), plus a ring fallback. `GH.terrain.buildTrack` lays a 14-unit ribbon with
red-white curbs and a dashed centre line conforming to the field, tyre walls on the outside of
every real corner, light posts on both sides, and the start gantry across the line. Raceway
dungeons use a gentle field (28% amplitude) so the asphalt rolls.

## Dungeons

Every dungeon is themed by its territory: the biome's ground and rock, 30% prop density, the
territory's weather at 35%, and its **hazard** placed in the field (ice sheets, vine snares, vents,
lightning, drifting rifts), except in authored floors (labyrinth, halls, fluxways, raceway).
Depths, hive and crucible dungeons also carry the biome's water or lava plane.

## Dev hooks

`GH.game.devZone(id)`, `GH.game.devSpeeder(on)`, `GH.game.devState()` drive the headless harness in
the scratchpad (`test.js`, `race.js`, `track.js`): zone loads, screenshots, a scripted race, reverse
and dune-jump checks, and a console-error sweep.
