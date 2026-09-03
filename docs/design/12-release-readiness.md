# 12 — Release readiness: what shipped in this round, what still blocks a public launch

## Shipped in this round

- **MMO control scheme**: W/S walk, A/D turn, Q/E strafe, right-mouse look, wheel zoom, pitch; the skimmer
  drives on throttle/steer. Every key rebinds on the CONTROLS screen (persisted in `localStorage`).
- **Menus**: a header bar with BACK on every screen (nothing overlaps the HUD any more), ESC closes whatever
  is on top, HUD hidden behind menus, dark backdrops for legibility, descriptions under the title buttons,
  a PILOT SHEET (character + inventory), a HOW TO PLAY screen, an in-page confirm box for destructive actions.
- **Run lifecycle**: EXIT RUN saves (the Reach character, or a parked CLASSIC/ARENA/WEEKLY run resumed from
  the title), NEW RUN / ABANDON RUN delete after a confirm, NEW EXPEDITION wipes the saved pilot only.
- **135 frames**: 8 base + 120 lineage variants + 7 relics, with ALLOY / FRAME CORE materials, a FRAME
  WORKSHOP, feat gating, and pack/mark silhouettes on the models.

## Shipped in the third round

- **ZERO HOUR**, the guided first ten minutes: twelve steps on top of the survivor camp (walk, look,
  fight, cast, ward, transform, drive, drift-turbo, mine a vein, chase a signal, drop a warden, build a
  frame), each with one sentence, a progress readout and a beacon. First PLAY on a fresh profile starts
  it; it can be replayed or skipped from the pause menu; finishing pays alloy, cores, salvage and a
  skill point.
- **Save features**: version stamp, four rolling automatic backups per profile (every five minutes of
  play and on every EXIT RUN) with one-click restore, save-file download and load next to the save code,
  and a title-screen nudge after an hour of play without a backup.
- **Sound and music**: every track is now composed data (chords, bass, motif, drum feel) instead of a
  random pentatonic walk. New cues: BATTLE (a relentless minor-key march ostinato with brass), SORTIE
  (bright major fanfare), RACE, VICTORY sting, HANGAR (menus). New effects for turbo tiers, veins,
  signals, diary tiers, tutorial steps and builds. Separate music and effects volume sliders.
- **Menu pass**: every older screen opens with a two-line "what this is, why you care" header.
- **Performance**: HUD DOM writes are dirty-flagged (hotbar, wards, buffs, readouts only touch the DOM
  when their text changes).
- Title: version number, feedback link, "best on desktop" note for touch devices.

## Shipped in the fourth round

- **Signature abilities** (slot 5, key 5): one per lineage — SHIELD WALL, BARRAGE, POUNCE, SPELLSTORM,
  SHADOW STEP, HARVEST, RAIL CHARGE, SIEGE STANCE. Relics inherit their base lineage's at ×1.25.
- **The hangar viewer**: the workshop detail panel renders the picked frame and its vehicle turning on
  a plinth (second WebGL context; degrades silently where one isn't available).
- **Fifty HUNT bosses** (`js/bosses.js`), four or five per territory, built from a mechanics library
  (slam, ring, line, charge, spiral, mines, blink, summon, shield, weak point, enrage, regen, pull,
  artillery, split, burrow, sweep, drain, burn, frost) with phases at 66% and 33% hull. One roams each
  territory per day at a skull totem; ARENA and CLASSIC midboss waves draw from the pool. Kills pay
  cores and alloy and fill a BESTIARY in the collection log; the world map lists today's hunt per zone.

## Still to do before calling it 1.0

### Must (blocks a public release)

1. ~~Balance pass~~ done (round two, `tools/balance.js`).
1. **Balance pass on the 127 built frames.** Stats are generated from multipliers (docs in `roster.js`);
   nobody has played PROTOTYPE marks or relics against Danger IV. Expect a few to be either useless or
   dominant. Plan: a spreadsheet of DPS × effective HP per frame, cap outliers.
2. **Material economy tuning.** Drop rates (12% alloy per kill, cores from bosses) are first guesses. Play
   three hours from a fresh profile and check that a first MK.II lands inside the first session and a
   PROTOTYPE inside a few evenings.
3. **Mobile / touch.** Touch sticks exist, but the new menus (workshop grid, controls list) have not been
   laid out for phones, and the right-mouse look has no touch equivalent beyond the aim stick.
4. **Save-data migration test.** New fields (`mats`, `feats`, `suspended`, `mechId`) merge one level deep on
   load; verify an old `hf_meta_v2` blob from a real player loads cleanly and that the SAVE CODE round-trips.
5. **Performance on integrated GPUs.** The Reach at 1/3 resolution is fine on a laptop, but the 135-frame
   workshop rebuilds DOM per click and the HUD still writes `innerHTML` per frame (doc 08 noted it).
6. **Accessibility basics**: a text-size option, colour-blind safe ward colours (kinetic/ballistic/arc are
   green/blue/purple today), remappable mouse buttons for left-handed players.

### Should (first patch)

- Gamepad glyphs on the hotbar and a pad-native menu cursor.
- A short guided first mission (doc 08 §4 "Zero Hour") instead of timed hint lines.
- Per-frame ability variants so the 135 frames differ in kit, not only stats.
- Cloud save (the SAVE CODE is a stop-gap; a `localStorage` wipe still loses everything).
- Sound mix pass and a volume slider (there is only mute).
- Analytics-free telemetry opt-in for balance (run length, deaths per wave, frames built).

### Nice

- Frame skins per pack, a hangar viewer that rotates the built model, photo mode.
- Leaderboards for WEEKLY (needs a backend).
- Localisation: all UI strings are inline; extract to a table first.

## How to verify a build

```
python3 -m http.server 8123
NODE_PATH=/opt/node22/lib/node_modules node scratchpad/smoke.js   # or run the same steps by hand:
```

1. Title → CLASSIC → pick AEGIS → SELECT STAGE → TIDE WRECKAGE: A turns, W walks, right-drag looks, Q strafes.
2. ESC → CONTROLS → rebind a key → ESC → ESC resumes.
3. ESC → EXIT RUN → title shows CONTINUE RUN → resumes at the wave → ESC → ABANDON → confirm.
4. HANGAR → FRAME WORKSHOP → `?mats=2000&salvage=5000` → build a MK.II → it appears on the select rack.
5. THE SHATTERED REACH → deploy → T → W/A drive → ESC → EXIT → title shows CONTINUE → NEW EXPEDITION confirm.
