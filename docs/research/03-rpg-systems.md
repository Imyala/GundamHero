# RPG Systems Research: Sacred Gold, World of Warcraft, and Loot-Game Reference Points

Research date: 2026-09-02
Purpose: extract concrete, numeric progression/stat/gear mechanics from Sacred Gold and World of Warcraft (plus brief Diablo 2 / Path of Exile / Borderlands notes) to inform a stat + skill-tree + gear/weapon-unlock design for a mech action game.

Sourcing note: the sandbox's egress proxy blocked direct page fetches of sacredwiki.org, warcraft.wiki.gg, wowpedia, wowhead, fandom, GameFAQs, Steam and GOG forums, so every fact below comes from search-result summaries of those pages (URLs listed inline) or, where explicitly marked "(background)", from well-established community knowledge that I could not re-verify against a live page in this session. Treat "(background)" numbers as design-reference values, not citations.

---

## A. Sacred Gold (Sacred 2004 + Underworld 2005)

### A.1 Classes

Base game: Gladiator, Seraphim, Wood Elf, Battle Mage, Vampiress, Dark Elf. Underworld added the Daemon and the Dwarf. Level cap in Underworld is 216 (a darkmatters.org thread is literally titled "how many attribute and skill points will my character get when reach 216 level").

Class personalities from the community guides ([Character Selection Guidebook](https://steamcommunity.com/sharedfiles/filedetails/?id=674591498), [Build Compendium](https://steamcommunity.com/sharedfiles/filedetails/?id=2861334611), [Altered Gamer](https://www.alteredgamer.com/sacred/15676-underworld-guide-to-the-characters-gladiator-seraphim-vampiress/)):

- Gladiator: pure strength/weapon fighter, "jack-of-all-trades that can be effective with any weapon", nothing magical.
- Seraphim: angelic melee + Celestial (light) magic hybrid.
- Wood Elf: ranged bow specialist, squishy.
- Battle Mage: low physical stats, no physical combat arts; basic attacks miss and hit weakly, everything is spells.
- Vampiress: human form wields weapons; transforms into vampire form for blood magic and summons (wolves, bats).
- Dark Elf: traps + martial arts (compared to Diablo II's Assassin).
- Daemon (UW): melee weapon + sorcery hybrid, can fly for exploration.
- Dwarf (UW): melee/ranged hybrid whose class weapons are guns (cannot use bows/crossbows).

Design point: every class is a distinct verb set (fly, transform, trap, shoot, cast) rather than a stat reskin. The weakest class design (Gladiator) is the one that is "just stats".

### A.2 Attributes (six)

Per [SacredWiki: Attributes](https://www.sacredwiki.org/index.php/Sacred:Attributes) and the [MattP GameFAQs guide](https://gamefaqs.gamespot.com/pc/915057-sacred/faqs/40592):

| Attribute | Effect |
|---|---|
| Strength | Attack rating, melee weapon damage, health |
| Endurance | Defense rating, reduced poison damage taken |
| Dexterity | Defense rating, ranged (bow/crossbow) damage |
| Physical Regeneration | Faster natural HP regen and faster regeneration of non-magical combat arts (special moves) |
| Mental Regeneration | Spell damage and faster regeneration of spells |
| Charisma | Poison damage dealt, cheaper vendor prices |

Points: on level-up the character gets 1 free attribute point, and in addition all attributes automatically grow by 9/86 of their class starting value per level (summary of [SacredWiki: Attributes](https://www.sacredwiki.org/index.php/Sacred:Attributes)). Bonus attribute points come from quests (Bounty Hunt: 2 points; The Path to Becoming a True Fighter: 1 point). So the class's starting profile is the dominant term; the player's free point is a nudge, not the whole build. This is one reason Sacred is "easy to jump in": you cannot brick a character with attribute points.

### A.3 Skills

Per [SacredWiki: Skills](https://www.sacredwiki.org/index.php/Sacred:Skills), [Skills Availability](https://www.sacredwiki.org/index.php/Sacred:Skills_Availability), [Altered Gamer skills guide](https://www.alteredgamer.com/sacred/15718-gamers-guide-to-the-skills/):

- Each level gives 1 skill point and 1 attribute point.
- New skill slots (choose one skill from the class's list) open at levels 3, 6, 12, 20, 30 and 50, on top of the class's starting skills. So the whole "what am I" decision is spread over six discrete moments, and the last one is at level 50 out of 216.
- Skill list (partial, Sacred 1): Weapon Lore (attack rate + damage for all weapons; damage broken into physical/fire/magic/poison), Magic Lore (spell damage), Meditation (spell regen), Concentration (special-move regen), Armor (less hindrance, more protection from armor), Agility (offense + defense in combat), Trading (better vendor stock; community reduces Trading and Disarming to "Magic Find"), Disarming, Riding, Parry, Constitution, Sword/Axe/Long-hand/Dual-wield/Ranged weapon lores per class, Forge Lore (Dwarf), etc.
- Skill value to effect: skills stack additively with item percentages. Example from the wiki summary: a sword with +31% physical damage plus level 10 Weapon Lore gives 31 + 69 = 100% total weapon bonus. Weapon skills push toward the attack-speed cap of 220 (the "percent" shown is actually added to attack speed). Diminishing returns: past roughly 170-180 points in a skill each point adds little, and it often takes several points to reach the next benefit tier ([search summary](https://www.sacredwiki.org/index.php/Sacred:Weapon_Lore)).
- Magic Find is a real stat with a concave formula: % = 10 * sqrt(value) ([SacredWiki: Chance of finding special items](https://www.sacredwiki.org/index.php/Sacred:Chance_of_finding_special_items)). MF increases set/unique drop chance and quality of rare/magic items.
- No respec: skill choices and skill points are permanent (background; the community "build compendium" exists precisely because choices are irrevocable).

### A.4 Combat Arts, runes, and regeneration-as-cost

Per [SacredWiki: Combat Arts](https://www.sacredwiki.org/index.php/Sacred:Combat_Arts), [Runes](https://www.sacredwiki.org/index.php/Sacred:Runes), [Combos](https://www.sacredwiki.org/index.php/Sacred:Combos), [Combo Master](https://www.sacredwiki.org/index.php/Sacred:Combo_Master), [Bondbug's combo guide](https://www.sacredwiki.org/index.php/Combo_(And_Rune)_Guide_by_Bondbug), [CA regeneration formulae](https://www.sacredwiki.org/index.php/Sacred:CA_and_Spell_Regeneration_Formulae_(+_Base_Value),_by_Telenochek_and_Covenant_and_edited_by_Myles_(Part_1)):

- There is no mana. Each Combat Art (CA) has a regeneration time (cooldown). Using a CA outside of a combo puts every CA of that type (special move or spell) on regeneration.
- Learning: runes drop from enemies or come as quest rewards. Right-click a rune to learn the CA (if unknown) or raise its level by 1. Runes for other classes can be traded 4:1 at the Combo Master for a rune of your class.
- The cost of power: every CA level raises effect but also raises regeneration time. Socketing a rune into an item raises the CA level with a smaller regen penalty than reading it. This makes "how high do I read this rune" a real optimisation problem (Bondbug's guide is entirely about optimal CA level).
- Regen formula (from the wiki page summary):
  - Time = Base_time * Regeneration
  - Base_time = base time at the rune level actually read + 1/2 base time of the rune level supplied by equipment
  - Regeneration = 1/(1 + regen_attribute/100) * 1/(1 + regen_skill/100 + item_regen/100) * 1/(1 + special_regen_skill/100)
  - regen_attribute is Mental Regeneration for spells, Physical Regeneration for special moves; regen skills are Meditation (spells) / Concentration (moves).
  Notice the three multiplicative buckets, with items and the general skill additive inside one bucket. That structure (additive inside a bucket, multiplicative across buckets) is the same one WoW uses.
- Combos: at the Combo Master you chain up to 4 CAs into one combo; the character performs them back-to-back. Combos ignore the per-type regen lock, have their own regen timer which is reduced only by Physical/Mental Regeneration in proportion to the moves/spells mix, and can be instantly recharged with Potions of Concentration. Weapon-based special moves scale from weapon damage; spells scale from Mental Regeneration and Magic Lore.
- Horses ([SacredWiki: Horses](https://www.sacredwiki.org/index.php/Sacred:Horses), [Riding](https://www.sacredwiki.org/index.php/Sacred:Riding), [Altered Gamer mounts](https://www.alteredgamer.com/sacred/15720-underworld-guide-to-mounts/)): mounting cuts attack rating by 1/3 until Riding ~32, above 33 the horse gives attack bonuses; Riding raises the base damage of the horse CAs Rear Up and Charge; in Underworld the horse's HP pools with yours and if the shared pool hits zero both die. Horses are mainly a traversal and escape tool (explicitly recommended for hardcore).

### A.5 Items

Per [SacredWiki: Items](https://www.sacredwiki.org/index.php/Sacred:Items), [Sockets](https://www.sacredwiki.org/index.php/Sacred:Sockets), [Set Items](https://www.sacredwiki.org/index.php/Sacred:Set_Items), [Unique Items](https://www.sacredwiki.org/index.php/Sacred:Unique_Items), [Tetrol's socketing guide](http://clan-da.com/showthread.php?t=4972):

- Tiers: Common (no bonuses) -> Magic -> Rare (best random) -> Unique (fixed name and bonuses) -> Set (unique-like, plus bonuses when multiple pieces are worn). Community colour shorthand: blues for magic, yellow rares, brown "super uniques", green set items.
- Sockets: shown as small boxes on the item card. A blacksmith (or a Dwarf with Forge Lore) socketing rings, amulets, runes or skulls into them. All stats on a socketed ring/amulet transfer to the item (only those usable by your class work). Socket colour (gold/silver/bronze in the community's terminology) gives a percentage boost to fixed-value bonuses of the socketed piece (e.g. +100 damage becomes +105) but not to percentage bonuses (+50% stays +50%). Removing socketed items returns only one of them; the rest are destroyed.
- Socketed runes raise a CA's level with less regen penalty than reading, which is what makes the socket system central to endgame build tuning.

### A.6 Difficulty, hardcore, world

Per [SacredWiki: Game Difficulty](https://www.sacredwiki.org/index.php/Sacred:Game_Difficulty), [GOG forum](https://www.gog.com/forum/sacred_series/sacred_gold_difficulty), [Steam discussion](https://steamcommunity.com/app/12320/discussions/0/3110277460806769936/):

- Five difficulties with overlapping level bands: Bronze 1-60, Silver 20-100, Gold 60-140, Platinum 100-180, Niobium 140+.
- Single player: finish the Silver campaign to unlock Gold, Gold to unlock Platinum, Platinum to unlock Niobium. Multiplayer gates by character level instead.
- Enemies and item rewards scale up per tier; enemies also scale near the player's level within a tier (a Steam thread complains that at level 50 every enemy is at least 5 levels above the player).
- Hardcore (permadeath) existed on the ClosedNet multiplayer servers (shut down 1 Feb 2009).
- World: open from the start ("more than three quarters of the world is open to the players from the very start"), 16 regions / 100+ explorable areas, 200-500+ side quests, some randomly assigned ([GamesXtreme review](https://www.gamesxtreme.com/article/3282/sacred-underworld-review), [Jefklak's Codex](https://jefklakscodex.com/games/pc/sacred/)).

### A.7 What made Sacred "easy to jump into, deep to master"

1. Class = verb set. You choose a fantasy, not a stat sheet.
2. Attribute growth is mostly automatic (9/86 of start per level); the player's single free point is low-stakes.
3. Skills are picked at only six milestone levels (3/6/12/20/30/50), but each skill is a 200-point sink with diminishing returns, so mastery is "where do the points go" not "which skill".
4. No mana: cooldown is the resource, and raising a skill's power raises its cooldown. One dial, deep consequences (optimal rune level, sockets vs reading, Concentration potions).
5. Combos are player-authored macros. Four CAs, one timer. Beginners never need them; experts build their whole rotation around them.
6. Sockets give every item a second life and make jewellery a crafting currency.
7. Overlapping difficulty bands mean a build that is "done" at 60 still has 150 levels of Niobium to test it; the game never asks you to restart.
8. Free-roam world from minute one, horse for pace.

---

## B. World of Warcraft

### B.1 Classic / TBC / WotLK talent trees (2004-2010)

Per [Blizzard Watch: What are talents](https://blizzardwatch.com/2019/06/19/talents-talent-trees-wow-classic/), [Blizzard Watch: How talent trees evolved](https://blizzardwatch.com/2022/10/31/wow-cataclysm-talent-trees/), [Warcraft Wiki: Talent](https://warcraft.wiki.gg/wiki/Talent):

- Three trees per class. One talent point per level from 10 to 60 = 51 points (Classic); 61 points at 70 (TBC); 71 points at 80 (WotLK).
- Tier gating: tier N requires 5*(N-1) points in that tree. 5 for tier 2, 10 for tier 3, 15/20/25/30 for tiers 4-7; the 31-point capstone sits on tier 7. TBC extended to a 41-point capstone at tier 9, WotLK to a 51-point capstone at tier 11.
- Talents had 1-5 ranks; many were flat percent boosts ("+1% crit per point, 5 ranks"), a few were active abilities (Mortal Strike, Bloodthirst) and the capstones defined a spec.
- Hybrid meta: almost no build spent much past 31 points in one tree; the remaining 20 went into a second tree to pick up synergies. The 31 Arms / 20 Fury warrior was the canonical example, and splits like 31/8/12 were "pretty much best in slot" ([Blizzard Watch](https://blizzardwatch.com/2022/10/31/wow-cataclysm-talent-trees/)).
- Respec: paid at a trainer; cost escalated with each respec (1g up to a 50g cap that decayed monthly) (background). Dual Talent Specialization arrived in patch 3.1 for 1000g (background).
- Cataclysm: total dropped to 41 points; you were forced to spend 31 in one spec before touching the others, and Mastery became the spec-defining stat ([Warcraft Tavern](https://www.warcrafttavern.com/cataclysm/guides/talent-system-overhaul/)).
- Mists of Pandaria removed trees entirely: six (later seven) rows of three, one pick per row every 15 levels. Blizzard's stated reason: roughly 80% of the old trees were role-defining talents "crucial to rotations and performance" that everyone took, and only 20% were the interesting utility choices; they wanted the mandatory stuff baseline and the choices "front and center" ([Blizzard: Class Talent System](https://worldofwarcraft.blizzard.com/en-us/news/3773320), [Wowpedia: Talents (history)](https://wowpedia.fandom.com/wiki/Talents_(history))).

What made the old trees satisfying (synthesised from the sources above): a point every level (constant drip), visible progress toward a named capstone, cross-tree synergy that rewarded reading, and the fantasy of "my build". What made them fail: 80% mandatory picks, trap talents, and cookie-cutter guides.

### B.2 Dragonflight-era trees (2022-)

Per [Warcraft Wiki: Dragonflight Talent System](https://warcraft.wiki.gg/wiki/Dragonflight_Talent_System), [Icy Veins talent guide](https://www.icy-veins.com/wow/dragonflight-talent-system-guide), [Blizzard Watch loadouts](https://blizzardwatch.com/2022/10/25/set-save-share-talents-dragonflight/), [MMO-Champion node breakdown](https://www.mmo-champion.com/threads/2627394-Breakdown-of-talent-point-nodes-available-in-Dragonflight), [PC Gamer](https://www.pcgamer.com/world-of-warcraft-wow-dragonflight-talent-tree/):

- Two trees: a Class tree (shared by all specs of the class, mostly utility and baseline kit) and a Spec tree (damage/healing/tanking engine). Points alternate between trees as you level 10-70; 31 class + 30 spec points at 70 (background for the exact split; the search summary confirms "30 points available" in the spec tree against "50 talents", so 3/5 of the spec tree can be taken).
- Gates: row 5 unlocks after 8 points spent in that tree; row 8 unlocks after 20 points.
- Node types: square = passive, round = active ability, octagon = choice node (pick one of two or three). Most nodes are single-rank; a minority have two ranks; three-rank nodes were mostly removed in patches.
- Loadouts: multiple saved builds, free swaps outside combat in rested areas (no gold cost) ([Blizzard Watch](https://blizzardwatch.com/2022/10/25/set-save-share-talents-dragonflight/)).
- The War Within added a third, small Hero Talent tree (one of two per spec, ~11 points over levels 71-80) (background).

Design lesson: the hybrid fantasy came back via the class/spec split (the class tree is the "second tree"), gates are absolute-count not per-tier, and free respec plus loadouts solved the old "afraid to experiment" problem.

### B.3 Stats

Primary and secondary. Per [Wowpedia: Attributes](https://wowpedia.fandom.com/wiki/Attributes), [Combat rating system](https://wowpedia.fandom.com/wiki/Combat_rating_system), [Haste](https://wowpedia.fandom.com/wiki/Haste):

- Primary: Strength (plate melee), Agility (leather/mail physical), Intellect (casters), Stamina (health for all). Since Legion, one primary stat per spec and gear auto-switches.
- Secondary: Critical Strike (200% damage/healing in PvE, 150% in PvP), Haste (attack/cast speed, cooldown recovery for some specs, and the 1.5s global cooldown down to a floor of 0.75s at 100% haste), Mastery (spec-specific effect), Versatility (damage/healing up by X%, damage taken down by X/2%). Historical secondaries that were removed: Hit, Expertise, Armor Penetration, Resilience, Spirit, Dodge/Parry as ratings.
- Tertiary (rare rolls): Leech, Avoidance, Speed, Indestructible.

Rating conversions. Per [Wowpedia: Combat rating system](https://wowpedia.fandom.com/wiki/Combat_rating_system) and [Blue Tracker: Level 70 conversions](https://www.bluetracker.gg/wow/topic/us-en/36573662-combat-ratings-level-70-conversions/):

- Ratings were introduced in patch 2.0.1 to replace flat "+2% crit" item stats. Rating converts linearly to percent; the rating needed per 1% rises with level so that new item tiers can keep adding numbers without everyone hitting 100% crit.
- Melee crit rating per 1%: 14 at level 60, 22.08 at 70, 45.91 at 80. The ratio grows ~1.6x per 10 levels in that era.
- Modern (Dragonflight/TWW) numbers from theorycraft sites (e.g. [Mechanical Priest](https://mechanicalpriest.com/compendium/stats-and-scaling)): a few hundred rating per 1% at cap, with Versatility costing roughly 15-20% more rating per point than Crit/Haste, and Haste slightly cheaper (background; exact per-patch values change).

Diminishing returns on secondary stats (BfA 8.x introduced it for Corruption/azerite era; formalised for all four secondaries in Shadowlands). Per [Wowhead: Update on DR thresholds](https://www.wowhead.com/news/update-on-diminishing-returns-for-secondary-stats-in-shadowlands-new-thresholds-318435), [Wowhead: DR in secondary stat ratings](https://www.wowhead.com/news/diminishing-returns-in-secondary-stat-ratings-in-shadowlands-317580), [Icy Veins](https://www.icy-veins.com/forums/topic/51621-diminishing-returns-added-to-secondary-stats-in-shadowlands/), [XPOff](https://xpoff.com/threads/mastery-diminishing-returns-dr-thresholds.97320/):

| Percent from rating (pre-DR) | Penalty on rating in this band |
|---|---|
| 0-30 | 0% |
| 30-39 | 10% |
| 39-47 | 20% |
| 47-54 | 30% |
| 54-66 | 40% |
| 66-126 | 50% |
| >126 | hard cap: no more from gear |

The penalty is piecewise-marginal (like tax brackets): rating that would land you at 35% is taxed 10% only on the part above 30. Mastery uses "mastery points" so the same thresholds apply to its percent-equivalent. Only rating from gear is subject to DR; percentage buffs from talents and raid buffs are added after. Tertiary stats (Leech/Avoidance/Speed) got their own, harsher DR curves and armor got none in that pass (background).

Additive vs multiplicative. Sacred's regen formula and WoW's damage pipeline share the same shape (background, consistent with the Sacred formula above and standard WoW theorycraft): modifiers of the same category (e.g. all "+X% damage" talents that share a school) sum, then categories multiply: damage = base * (1 + sum(additive_talents)) * (1 + versatility) * (crit ? 2 : 1) * (1 + sum(aura_buffs)) * target_multipliers. Warlords of Draenor also flipped movement-speed bonuses from multiplicative to additive and removed disease-multiplier mechanics by baking them into base spells ([WoD beta notes](https://worldofwarcraft.blizzard.com/en-gb/news/13423478/warlords-of-draenor%E2%84%A2-beta-patch-notes-august-27)).

Stat squish. WoD (2014) and BfA (2018) divided all numbers by large factors so that health/damage stayed readable; Midnight (2026) is doing it again ([Warcraft Tavern](https://www.warcrafttavern.com/wow/news/stat-squish-coming-in-world-of-warcraft-midnight/), [Ten Ton Hammer](https://www.tentonhammer.com/guides/warlords-of-draenor-stat-changes-and-stat-squish)). Player-facing lesson: everything was squished proportionally and "it felt like players were killing enemies just as quickly as before". Design lesson: exponential item budgets force periodic renormalisation; a game with a fixed level cap does not need one if it keeps budgets linear-ish.

Armor. Per [Wowpedia: Damage reduction](https://wowpedia.fandom.com/wiki/Damage_reduction), [Vanilla wiki: Armor](https://vanilla-wow-archive.fandom.com/wiki/Armor), [Nostalrius thread](https://forum.nostalrius.org/viewtopic.php?f=24&t=17968):

- DR = Armor / (Armor + K), K keyed off the attacker's level.
- Classic/TBC: K = 400 + 85 * AttackerLevel for levels 1-59; K = 467.5 * AttackerLevel - 22167.5 for 60+. Example: 12000 armor vs a level 73 boss = 12000 / (12000 + 11960) ~ 50%.
- Cap 75% (Classic era); modern cap 85% (background).
- The K-per-level trick is the same idea as rating-per-level: armor is a rating, and the enemy's level sets the conversion, so armor never becomes a percentage you can max.

Crowd-control DR. Per [Warcraft Wiki: Diminishing returns](https://warcraft.wiki.gg/wiki/Diminishing_returns), [Maxroll CC DR](https://maxroll.gg/wow/resources/crowd-control-diminishing-returns): categories (stun, silence, disarm, knockback, root, disorient, incapacitate); within a category and within an 18s window durations go 100% -> 50% -> 25% -> immune; the timer resets ~18s (16s in some eras) after the last effect ends; knockbacks are immune after one use and reset in 10s; taunts immune after the fifth.

### B.4 Item level, stat budget, gear tiers, sets

Per [ZAM: Itemization Formulas](https://wow.allakhazam.com/wiki/Itemization_Formulas_(WoW)), [Classic wiki: Item level](https://classic-wow-archive.fandom.com/wiki/Item_level), [WoW-TC stat scaling](https://bfa.bloodmallet.com/wowtc/system/stat-scaling/), [Venomous Thoughts: itemization budgets](https://venomousthoughts.wordpress.com/2014/05/27/itemization-budgets-and-upgrades-in-wow/):

- Classic-era formula: ItemValue = sum over stats of (StatAmount * StatMod)^1.5, then rooted; item level sets a budget per slot and per quality (epic gets more budget per ilvl than rare, rare more than uncommon). StatMods let one "cheap" stat appear in bigger numbers than a "pricey" one (1% crit = 14 Agility, 5 mp5 = 12 Spirit in the ZAM table).
- Slot multipliers: chest/legs/head/2H weapon = 1.0, shoulders/hands/feet/waist ~0.75, wrists/neck/ring/cloak ~0.5625, trinket/off-hand ~ 0.5 etc. (background, consistent with the ZAM page).
- Modern: budget grows exponentially, +15% every 15 item levels (from the Venomous Thoughts summary); secondaries on socket-less items total about 2/3 of the primary stat amount; a socket costs budget; enchants and gems add on top.
- Quality tiers: Poor (grey) / Common (white) / Uncommon (green) / Rare (blue) / Epic (purple) / Legendary (orange) / Artifact + Heirloom (light gold) ([Wowpedia: Quality](https://wowpedia.fandom.com/wiki/Quality), [Epic](https://wowpedia.fandom.com/wiki/Epic)). Poor and Common have no stats; Uncommon has 1-2 stats; Rare and Epic more stats and higher budget per ilvl; Legendary is story-tied and unique.
- Class tier sets: 5 (later 4) slots, with 2-piece and 4-piece bonuses (Classic had up to 8-piece bonuses at 2/4/6/8) that change rotations rather than adding raw stats; Dragonflight's Revival Catalyst lets any same-slot item be converted into tier so set completion is not RNG-locked (background).

### B.5 Onboarding (levels 1-10)

Per [Blizzard Watch: Exile's Reach](https://blizzardwatch.com/2020/04/08/exiles-reach-wow-shadowlands-leveling/), [Wowhead guide](https://www.wowhead.com/guide/exiles-reach-walkthroughs-analysis), [Massively OP](https://massivelyop.com/2020/10/15/taking-a-look-at-world-of-warcrafts-new-starter-experience-exiles-reach/):

- Classic: one new ability roughly every 2 levels from a trainer, first talent point at 10; the first 10 levels are deliberately "auto-attack plus one button".
- Exile's Reach (Shadowlands 2020) is a 1-10 island that teaches one thing per new ability: each new spell arrives with a quest that requires it (Paladins learn Divine Shield from a ghost paladin; Warriors practise Charge; Rogues combo points; Hunters taming), ends in a 1-5 player mini-dungeon with two bosses, then hands you to a capital city.
- Talents, secondary stats, and gear quality above green are all absent until after 10. The first "choice" moment coincides with the first tree point.

---

## C. Brief reference points

### C.1 Diablo II synergies (patch 1.10, 2003)

Per [PureDiablo: Synergies](https://www.purediablo.com/d2wiki/Synergies), [DiabloWiki: Synergies](https://diablo2.diablowiki.net/Synergies), [Patch 1.10](https://diablo.fandom.com/wiki/Patch_1.10_(Diablo_II)):

- Each hard point in a listed low-tier skill adds a flat percent to a high-tier skill: Fire Bolt gives +14% Fire Ball damage per point, Sacrifice gives +12% Zeal per point, Redemption +15% to Sacrifice.
- Only hard points count; +skills from items do not feed synergies. This keeps the "skill sink" honest and rewards committing 20 points to a filler skill you never cast.
- Purpose: revive unused early skills and diversify builds. Side effect: one-skill builds got even stronger (20 in main + 60 in synergies) and respec was so painful that Blizzard added the Den of Evil reset and Token of Absolution in 1.13 (background).

### C.2 Path of Exile passive tree

Per [PoE passive tree](https://www.pathofexile.com/passive-skill-tree), [Maxroll beginner guide](https://maxroll.gg/poe/getting-started/passive-skill-tree-for-beginners), [PoE Wiki: Passive skill](https://pathofexile.fandom.com/wiki/Passive_skill):

- ~1,300 nodes in one shared web; seven class start points; ~99 points from levels plus ~24 from quests (background).
- Three tiers of node: small (+10 to +30 of a stat, pathing filler), notable (named, +50-200 or a mechanic; the clusters' "headlines"), keystone (rule change with a drawback, e.g. Chaos Inoculation: 1 max life, immune to chaos). Masteries (3.16) add one pickable bonus per cluster once you own a notable there.
- Respec: refund points from quests, plus Orbs of Regret one point at a time; expensive enough that most players plan with an offline tool. Depth extreme, onboarding extreme too; the lesson is that the tree is legible only because notables/keystones give macro-level landmarks.

### C.3 Borderlands weapon parts

Per [Borderlands Wiki: Gun Parts (BL2)](https://borderlands.fandom.com/wiki/Gun_Parts_(Borderlands_2)), [BL2 Weapon Components](https://borderlands-archive.fandom.com/wiki/Borderlands_2:Weapon_Components), [Steam parts guide](https://steamcommunity.com/sharedfiles/filedetails/?id=1443647450), [Rarity](https://borderlands.fandom.com/wiki/Rarity), [BL4 licensed parts](https://www.sportskeeda.com/esports/what-licensed-parts-system-borderlands-4):

- A gun is a tuple: body (sets manufacturer and base stats), barrel (sets the weapon's name and most of its damage/accuracy profile), grip (sets prefix; matching the body's manufacturer gives reload/magazine bonuses), stock (recoil/stability), sight (absent on white guns, guaranteed on high rarity), accessory (prefix and a special effect), element, material (skin). BL1 advertised 17.75 million combinations (background).
- Rarity is not summed from parts; each gun rolls against a "balance" definition that decides which part pools it may draw from, and higher rarity unlocks the better pools. White = Common, Green = Uncommon, Blue = Rare, Purple = Epic, Orange = Legendary (unique red-text part). BL4's Licensed Parts: Common guns get 1 cross-manufacturer part slot, Uncommon 2, and so on, so rarity directly equals "how many wild parts can spawn".
- Takeaway for a mech game: parts = slots with a manufacturer identity, rarity = number of unlocked slots plus access to better part pools, legendary = one fixed signature part plus random rest.

---

## D. Design takeaways: a stat + tree + gear system for a mech action game

The goal is Sacred's "one free point per level, choices at milestones, cooldown is the resource" accessibility, WoW's rating/DR maths for long-term balance, and Borderlands-style part randomisation for weapons.

### D.1 Attributes (six, Sacred-style)

Automatic growth plus one free point per pilot level. Auto-growth per level = 10% of the frame's starting value (Sacred's 9/86 rounded), so frames keep their identity and the free point is a nudge.

| Attribute | Core effect | Secondary effect |
|---|---|---|
| Output (OUT) | +1% weapon damage per point (melee and ranged, split by weapon class in tooltips) | +0.5 max heat |
| Reactor (REA) | energy-weapon and Combat-Art damage +1%/pt | Combat-Art recharge speed +0.5%/pt (Sacred's Mental Regeneration) |
| Frame (FRM) | +HP (frame_base * 0.01 * FRM) | armor rating +2/pt |
| Servo (SRV) | evasion rating +2/pt, mobility (boost speed) +0.25%/pt | melee attack speed cap approach |
| Coolant (COO) | heat dissipation and weapon-skill recharge +0.5%/pt (Sacred's Physical Regeneration) | HP regen out of combat |
| Uplink (UPL) | drone/ally/hack effects +1%/pt, vendor prices -0.5%/pt | loot find % = 10 * sqrt(UPL_bonus) (Sacred's MF curve) |

### D.2 Core formulas

- Level scaling constant: K(L) = 400 + 85 * L for the attacker's level L (WoW Classic's constant, works well up to level 60-80).
- Armor: DR = Armor / (Armor + K(L_attacker)), cap 75%.
- Evasion: chance = Evasion / (Evasion + K(L_attacker)), cap 50%; a dodged hit still applies half of any status build-up.
- Ratings to percent (Crit, Haste, Precision, Tenacity): pct = rating / R(L_player), with R(L) = 14 * 1.048^(L-1) (this reproduces 14 at level 1 scale, ~22 at 10 levels later, ~46 at 25 levels later: the Classic 60/70/80 progression compressed to a 1-60 game). Show players the percent, never the rating, except in the advanced panel.
- Diminishing returns on rating-derived percent: apply WoW's Shadowlands brackets, with the 30/39/47/54/66 thresholds and 10/20/30/40/50% marginal penalties and a 126% hard cap, but scale them down for an action game where 100% crit would be broken: use brackets at 20/27/33/38/45% with the same penalties and a 60% cap from rating. Percent from talents and buffs is added after DR.
- Crit: damage * 2.0 (PvE), with a Crit-Power tertiary stat that raises the multiplier by up to +50% additively (2.0 -> 2.5).
- Haste: fire rate, melee speed and Combat-Art recharge all scale by 1/(1 + haste); global recovery 1.0s floor 0.5s.
- Damage pipeline (additive inside a bucket, multiplicative across buckets, the Sacred/WoW structure):
  damage = base_weapon * (1 + attribute_pct) * (1 + sum(tree_passives_same_school)) * (1 + versatility) * crit_mult * (1 + sum(external_buffs)) * (1 - target_DR) * (1 - target_resist_school)
  Buffs in the same bucket add so stacking five "+10% damage" nodes gives +50% not +61%; putting Versatility, crit and the target in separate buckets keeps them each worth something.
- Combat-Art cost = recharge time only (no energy bar). Recharge = Base(level) * 1/(1 + REA_or_COO/100) * 1/(1 + tree_recharge/100 + gear_recharge/100). Raising an art's rank raises Base(level) by 8% per rank (Sacred's read-a-rune penalty), while a rank from a socketed module raises Base by only 4% per rank. Heat is the second, short-term limiter: every weapon shot adds heat, overheat = forced 3s vent.

### D.3 Trees

Three layers, borrowing the Dragonflight class/spec split and Classic tier gating.

1. Pilot tree (shared, 25 nodes, 1 point per level from 5 to 30 = 26 points). Utility, mobility, heat, loot find, drone command. Two gates: row 4 needs 6 points, row 7 needs 14.
2. Frame tree (one of three per frame: Striker / Bastion / Vector, 40 nodes, 1 point per level from 10 to 50 = 41 points, plus 4 from milestone bosses = 45). Tier gating every 5 points like Classic; capstone at 30 points; a second frame tree can be dipped for the last 15 points, which recreates the 31/20 hybrid meta on purpose. Node types: square passive (1-2 ranks), round active (unlocks or upgrades a Combat Art), octagon choice (one of two). Never more than 2 ranks per node (Dragonflight's lesson).
3. Weapon mastery lines (one per weapon class: rifle, cannon, blade, launcher, drone). 20-point sink per line, 1 point per pilot level from level 1 (Sacred's skill points). Each line is a Sacred-style diminishing curve: bonus = 60 * (1 - e^(-points/12)) %, so the first 5 points give ~20%, 12 points ~38%, 20 points ~49%. Points in a weapon line also synergise Diablo-style: each hard point in a line adds +2% damage to that weapon class's Combat Arts (hard points only, not gear).

Point budget by pilot level (level cap 60):

| Level | Pilot tree | Frame tree | Weapon lines | Free attribute points |
|---|---|---|---|---|
| 1-4 | 0 | 0 | 4 | 4 |
| 5-9 | 5 | 0 | 5 | 5 |
| 10-30 | 21 (cap 26 at 30) | 21 | 21 | 21 |
| 31-50 | 0 | 20 (+4 boss) | 20 | 20 |
| 51-60 | 0 | 0 | 10 | 10 |
| Total at 60 | 26 | 45 | 60 | 60 |

Onboarding follows Exile's Reach: levels 1-4 teach one weapon, one Combat Art and heat; the first tree point at 5 arrives with a mission that requires the thing it unlocks; frame choice and the frame tree open at 10; sockets open at 15; secondary stats stay hidden on gear until 20.

### D.4 Respec rules

- Attributes: permanent, but they are low-stakes because 90% of growth is automatic. A one-time full attribute reset item drops from the first campaign clear.
- Pilot tree and frame tree: free respec at any hangar (Dragonflight loadouts, up to 5 saved builds); in-mission changes are locked.
- Weapon mastery lines: Sacred-style permanence with an escape hatch: refund points come from side-quest chains (2-3 per act), and a rare Recalibration Module refunds one whole line. This keeps weapon identity sticky without being a trap.
- Combat-Art ranks (rune reading): permanent, exactly as in Sacred; the "sockets raise it cheaper" rule gives an out.

### D.5 Gear and weapon unlocks

Rarity tiers (Borderlands/WoW hybrid): Standard (grey, 0 mods, no parts roll) / Field (green, 1 mod, 1 random part) / Custom (blue, 2 mods, 2 random parts, 1 socket) / Prototype (purple, 3 mods, 3 random parts, 2 sockets) / Signature (orange, 1 fixed signature part with a unique effect + 2 random parts, 2 sockets, one per weapon family) / Set (teal, fixed stats, 2/4-piece bonuses that change a Combat Art, obtainable through a Catalyst-style converter after the first clear).

Weapon = frame-class + manufacturer body + barrel + grip + stock + sight + accessory. Body sets manufacturer identity (fire pattern, heat profile), barrel sets the weapon's displayed name and damage/accuracy, grip matching the body's manufacturer gives reload/heat bonuses, accessory gives the prefix and an on-hit effect, sight only rolls at Custom or above. Rarity is drawn first from a balance table (drop source and difficulty tier), then parts are drawn from pools unlocked by that rarity; this is BL2's structure and stops "sum of parts" rarity exploits.

Stat budget: Budget(ilvl) = 10 * 1.15^(ilvl/15) (WoW's +15% per 15 ilvl), quality multiplier 1.0/1.1/1.25/1.4/1.6 for green through orange; slot multipliers 1.0 for weapon/torso, 0.75 for arms/legs, 0.56 for head/back-pack; secondaries total 2/3 of the primary budget; each socket costs 10% of the item budget. Sockets accept modules (rings/amulets equivalent), Combat-Art runes (raise an art's rank with the cheaper 4% recharge penalty), and cores (fixed-value bonuses get the socket's tier bonus, +5%/+10%/+15%, percent bonuses do not, exactly like Sacred). Removing a socketed item destroys the others in the item (Sacred's rule) so socketing is a commitment.

Difficulty: five overlapping bands (Bronze 1-30, Silver 15-45, Gold 30-60, Platinum 45-60+, Niobium 60+), enemy level = max(band floor, player level + tier offset {0, 2, 4, 6, 8}), loot budget and rarity weights rise per tier. Campaign clear on the current tier unlocks the next in solo; co-op gates by level. Hardcore is a separate flag with its own leaderboard.

### D.6 One-line rationale

Sacred proves that "cooldown is the cost, power raises the cooldown, sockets are the pressure valve" gives a whole endgame from one dial; WoW proves that ratings keyed to enemy level, bucketed additive/multiplicative modifiers and bracketed diminishing returns keep that endgame from breaking over 60 levels of gear; Borderlands proves that a handful of part slots with manufacturer identity feels like millions of guns. Combine the three and the mech game gets a build system players can ignore for ten levels and theorycraft for a hundred hours.
