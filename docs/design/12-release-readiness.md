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

## Still to do before calling it 1.0

### Must (blocks a public release)

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
