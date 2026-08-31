# HERO FRAME

A single-player, top-down **mech arena survivor** in the browser — low-poly PS1-style
3D, fantasy-archetype mechs, auto-firing weapons, and 20 escalating waves of enemies.
Built from scratch with Three.js and zero build tooling: clone it, open it, play it.

Inspired by the wave-survivor / action-roguelite genre; all names, art, code, and
audio here are original and generated procedurally at runtime (no binary assets).

## Play

Open `index.html` in any modern browser — no server or install needed.
(If your browser blocks local files, run `python3 -m http.server` in this folder
and visit `http://localhost:8000`.)

### Controls

| Input | Action |
|---|---|
| WASD / arrows | Move |
| Mouse | Aim (weapons fire automatically) |
| Space | Boost (dash — AEGIS's boost rams and knocks back) |
| Shift / Right-click | Special (per frame: Block, Overdrive, Nova, Frenzy, Blink) |
| 1 / 2 / 3 | Pick a wave-reward card |
| Esc / P | Pause |

Dev shortcut: `index.html?wave=10` starts a run at wave 10 with catch-up levels
(handy for testing bosses and late-game balance).

## The game

- **5 playable frames**, each a fantasy archetype in mech armor:
  - **AEGIS** — knight. Greatblade arcs, a shield that heals when you block, a ramming boost.
  - **VULCAN** — gunner. Twin autocannons; Overdrive doubles fire rate.
  - **HEXEN** — arcanist. Seeking hexbolts that pierce; Nova shoves the swarm away.
  - **MORROW** — reaper. A whirling scythe aura with lifesteal; Frenzy doubles its radius.
  - **STRIX** — duelist. Piercing rail lances, high crit; Blink teleports through danger.
- **20 waves** with a countdown timer, three arena palettes as you go deeper, and
  bosses at waves 10 (**CARRION HULK**) and 20 (**OMEGA HUSK**) with telegraphed slams,
  adds, and bullet rings.
- **XP gems** drop from kills and level you up mid-wave (each frame has its own
  per-level stat growth); hearts heal, salvage coins bank to `localStorage`.
- **Wave rewards**: after every wave, pick 1 of 3 cards — new secondary weapons
  (Flak Fan, Missile Rack, Orbit Blades, Arc Coil, Mine Layer, Gun Drone — all
  stack and level) or traits (damage, attack speed, armor, crit, regen, magnet,
  lifesteal, +1 projectile, and more).
- **Feel**: floating damage numbers with crits, screenshake, knockback, blob
  shadows, procedural sound effects, soft aim-assist, and a 1/3-resolution
  pixelated renderer for the retro look.

## Code layout

```
index.html        page + HUD/menus markup
css/style.css     retro UI styling
lib/three.min.js  Three.js r150 (vendored, MIT)
js/util.js        math helpers
js/assets.js      procedural canvas textures & shared materials
js/models.js      low-poly mech/enemy/pickup/prop mesh builders
js/mechs.js       playable frame definitions (stats, weapons, specials)
js/upgrades.js    wave-reward card pool
js/enemies.js     enemy defs + per-wave composition/scaling
js/audio.js       WebAudio procedural SFX
js/game.js        core loop: combat, waves, pickups, HUD, screens
js/main.js        renderer, input, screen wiring
```

## Roadmap ideas

- Meta progression: spend banked salvage on permanent unlocks between runs
- More frames, weapons, enemy types, and arena hazards
- Gamepad + touch controls
- Music loop, hit-stop, and juicier deaths
