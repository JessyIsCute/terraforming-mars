# Assembler — value table

What every part of a generated card is worth, in M€. The generator adds up the parts and sets the
card's cost from the total.

## How a card's cost is set

```
value(card) = sum of the values of its parts (tables below)
cost(card)  = max(0, round(value - 3))
```

A card's **value** is what it gives you. Its **cost** is that minus 3, because every project card
already costs 3 M€ to buy into your hand. This matches the real game: Power Plant (+1 energy
production, building + power tags) is worth about 8 and costs 4.

Without the tag-synergy values below, this table reproduces the printed costs of the 163 plain
official cards with an average error of **2.4 M€** and no overall lean (bias ±0.0). 66% come out
within 2 M€.

## Resources (gained once)

| Part | Value | Notes |
|---|---:|---|
| 1 M€ | 1 | by definition |
| 1 steel | 2 | |
| 1 titanium | 3 | |
| 1 plant | 2.3 | |
| 1 heat | 1.2 | |
| 1 energy | 1.2 | |
| Draw 1 card | 3 | the price of buying a card |
| 1 resource on a card (microbe, floater…) | 1.5 | a resource on a card that scores VP per resource is worth that VP share instead: 1 VP per animal = 3.3, 1 VP per 4 microbes = 0.8 |

## Production (per step)

| Part | Value | Notes |
|---|---:|---|
| M€ production | 3.3 | fitted to official cards, see fit-results.md (was 4) |
| Steel production | 5.1 | fitted to official cards, see fit-results.md (was 7). Project cards alone say ~4.6; preludes say more because they produce from generation 1 |
| Titanium production | 8.5 | fitted to official cards, see fit-results.md (was 10) |
| Plant production | 6 | lowered from 8; see "Lichen" below |
| Energy production | 6 | lowered from 7; see "Energy" below |
| Heat production | 4.5 | fitted 4.3–4.9 |

## Terraforming and tiles

| Part | Value | Notes |
|---|---:|---|
| 1 TR | 7 | fitted to official cards, see fit-results.md (10 cards; was 9). Still about 1 VP (3.3) + 1 M€ production (3.3) |
| VP | 3.3 | fitted to official cards, see fit-results.md (42 cards; was 5) |
| Temperature or oxygen step | 8.5 | includes its TR. Printed cards price a step slightly below a full TR |
| Venus step | 9 | |
| Ocean tile | 11 | TR plus about 2 M€ of placement bonus |
| Greenery tile | 14 | raises oxygen and gives 1 VP at the end |
| City tile | 8.8 | fitted to official cards (11 cards; was 8). The city tag is priced separately |
| Special tile (Nuclear Zone, Mohole Area…) | 2.5 | the real value is usually the effect or VP printed with it |

## Tags

A tag is worth two things:

1. **Base 0.5.** Every tag counts for milestones, awards and "per tag you have" effects in general.
2. **Synergy.** What the rest of the deck does with that tag. It's counted from the official card
   pool (547 project cards, corporations and preludes):
   - **cards that require it:** 0.08 M€ each (Mass Converter, Warp Drive… need science)
   - **cards that count it ("per tag"):** 0.15 M€ each, or 0.3 when the count gives VP (Io
     Mining Industries: 1 VP per Jovian tag)
   - **cards that discount it or trigger on it:** 0.12 M€ each (Space Station, Olympus
     Conference, Decomposers…)

**Paying with steel or titanium is not priced.** It used to add 1 M€ plus 5% (building) or 10%
(space) of the cost. That counted the same thing twice: steel and titanium are worth 2 and 3 M€
*because* building and space cards accept them. Official cards don't charge for it either: without
it the table matches them slightly better (average error 2.8 → 2.7 M€), and the fit prices a building
tag at about 2.7 and a space tag at about 1.4 in total.

| Tag | Require it | Count it | Discount/trigger | Synergy | **Total** |
|---|---:|---:|---:|---:|---:|
| Science | 24 cards (avg 3.2 needed) | 3 | 7 | 3.2 | **3.7** |
| Jovian | 8 | 9 (mostly VP) | 3 | 3.7 | **4.2** |
| Venus | 8 | 10 | 8 | 3.1 | **3.6** |
| Earth | 11 | 6 | 9 | 2.9 | **3.4** |
| Space | 0 | 3 | 9 | 1.5 | **2.0** |
| Building | 0 | 4 | 3 | 1.0 | **1.5** |
| Plant | 1 | 3 | 9 | 1.6 | **2.1** |
| Microbe | 1 | 2 | 8 | 1.35 | **1.9** |
| Animal | 1 | 0 | 6 | 0.8 | **1.3** |
| Power | 3 | 2 | 1 | 0.7 | **1.2** |
| City | 0 | 0 | 3 | 0.4 | **0.9** |
| **Wild** | counts as every tag | | | ~11 | **6** |
| Event | | | | | **2** (fitted to 18 events; was 0.5), and the card's other tags are gone once played |

**Wild:** in the code (`player/Tags.ts`) one wild tag adds +1 to *every* tag count at once, for
requirements and "per tag" counts. It does not fire "when you play a science tag" triggers, unless
you have Cyborgs or Strong Artificial Intelligence. Its synergy summed over all tags is ~11, but you
only build around 2–3 tags, so it's priced at about half: **6**, nearly two science tags.

**Multiple tags:** the most valuable tag counts in full, every extra tag counts **75%**.

**Make it live:** these counts depend on which expansions are on. With Venus off, the Venus tag's
synergy is near zero. The generator should **recount the synergy at game start from that game's
actual card pool** using the weights above. The table shows what you get with all official
expansions.

**Printed cards underprice tags.** Fitting printed costs gives tags only 0–1 M€ each, so
designers mostly don't charge for synergy. With these values, assembled cards cost about 2 M€ more
per tag than a printed card with the same effects. That's intentional (tags are worth that much),
but if playtests say Assembler cards feel overpriced, halving the synergy column is the dial to turn.

## Requirements (lower the value)

| Requirement | Value |
|---|---:|
| Global parameter **at least** X | −6 × how late it unlocks. 0 = the start value, 1 = the max (14% oxygen, +8 °C, 9 oceans, 30% Venus). Example: 5% oxygen = −6 × 5/14 = −2.1 |
| Global parameter **at most** X | −2.5 × how early it closes (1 − the same fraction) |
| **N tags of one type** | **−N^1.5**: −1, −2.8, −5.2, −8, −11.2, −14.7, −18.5 for N = 1…7 |
| Anything else (cities, production, party…) | −3 |

**Why N^1.5 and not −1 per tag:** 7 science tags is far harder to reach than 7× one. The proof
is Anti-Gravity Technology vs Earth Catapult. Both give −2 M€ on every card; Anti-Gravity has one
more VP but needs 7 science tags, and costs 9 less. That only adds up if the requirement is worth
about −14 to −18. With −1 per tag (the old table) Anti-Gravity's effect came out lower than Earth
Catapult's, which is wrong. Now it's 18.5 vs 14.5, so it correctly reads as the stronger card. Warp
Drive and Quantum Extractor (4–5 science) agree.

## Effects and actions (blue cards)

Effects are priced as **gain per use × expected uses**. That means the generator can price any
effect it builds, not just copies of existing ones. The use counts were measured from the official
blue cards: effect value = cost + 3 − everything else on the card.

### Actions (once per generation)

```
value = value of one use (resource table) × uses
```

| Action kind | Uses | Measured on (implied uses) |
|---|---:|---|
| Any normal action | **4** | median 3.3–4.4 across 48 cards: AI Central 4.6, Electro Catapult 4.2, Physics Complex 4.4, Livestock 3.3, Tardigrades 4.4 |
| Conversion that eats resources you must produce (4 energy, 8 heat…) | **2** | Steelworks 2.2, Ore Processor 2.2, Ironworks 2.3, Comet Aiming 2.0, Icy Impactors 1.8 |

One uses count for every normal action, so the card with the bigger action is always worth more:

| Card | One use | × 4 uses | Measured effect value |
|---|---|---:|---:|
| AI Central | draw 2 = 6.0 | 24 | 27.4 |
| Development Center | draw 1 − 1 energy = 1.8 | 7.2 | 11.3 |

Small actions (one use under ~2 M€) measure *more* uses than big ones: Development Center 6.3,
Dirigibles 8.7, Refugee Camps 11.5. That isn't because they get used more. Dividing a card's
leftover price by a tiny per-use gain blows up any error in the rest of the card's price. An
earlier draft turned this into a "cheap actions get 5 uses" rule, which priced Development Center's
draw-1 as if it beat AI Central's draw-2. Don't do that; use 4 for all of them.

Example: "Action: spend 1 energy to gain 2 steel" = (2×2 − 1.2) × 4 = 11.2.

### Discounts

```
−X M€ on every card     = X × 8           (you play ~8 more cards after it)
−X M€ on cards with tag T = X × 8 × share(T) × 2   (×2 because you build around it)
```

| Card | Discount | Predicted | Measured |
|---|---|---:|---:|
| Earth Catapult | −2 all | 16 | 14.5 |
| Anti-Gravity Technology | −2 all | 16 | 18.5 |
| Research Outpost | −1 all | 8 | 8.8 |
| Space Station | −2 space (24%) | 7.7 | 7.0 |
| Shuttles | −2 space | 7.7 | 7.1 |
| Warp Drive | −4 space | 15.4 | 16.2 |

Tag shares in the official deck: building 31%, space 24–28%, earth 16%, science 15%, venus 11%,
plant 11%, power 11%, microbe 9%, jovian 7%, city 7%, animal 4%. Events are 18% of project cards.

### Triggers ("when … happens, gain …")

```
value = gain per trigger × expected triggers
when YOU play tag T:      triggers = 8 × share(T) × 2
when ANY player does X:   triggers = how often X happens in the rest of the game
```

| Card | Trigger | Measured |
|---|---|---:|
| Optimal Aerobraking | you play a space event → 3 M€ + 3 heat | 9.0 |
| Media Group | you play an event → 3 M€ | 7.5 |
| Advertising | you play a card costing ≥ 20 → +1 M€ production | 5.5 |
| Olympus Conference | you play science → science resource / draw | 4.1 |
| Arctic Algae | anyone places an ocean → 2 plants | 13.0 |
| Rover Construction | anyone places a city → 2 M€ | 5.0 |
| Standard Technology | you do a standard project → 3 M€ back | 7.0 (~2.3 projects) |
| Venusian Animals | you play science → 1 animal (1 VP each) | 17.7 |

### Bad effects (for Assembler's negative cards)

Most negatives are the same formulas with a minus sign, so costs stay consistent:

| Part | Value | Notes |
|---|---:|---|
| Lose your own resources / production | −(table value) | the card must be unplayable if you can't pay. Normal TM behavior; the behavior system already checks it |
| −1 VP | −3.3 | |
| Lower a global parameter | −8.5 | very rare in the real game |
| Your project cards cost +X M€ (ongoing) | −8 × X | mirror of the all-card discount |
| Your cards with tag T cost +X M€ | −8 × share(T) × X | no ×2: you won't build around a penalty |
| Your standard projects cost +X M€ | −2.3 × X | mirror of Standard Technology |
| Remove up to X plants from any player | +0.3 per plant | good for you, but barely |
| Lower any player's production 1 step | +2.5 | good for you |

## Where your anchors and the data disagree

- **Lichen.** Lichen is 7 + 3 = 10 for 1 plant production, which would make plant production
  worth about 8–9. But cards with several steps of it say ~6: Trees (13 for 3 plant production + 1
  plant + 1 VP), Kelp Farming and Bushes. At 8, Kelp Farming would cost 36 instead of 17 and Trees
  25 instead of 13. Lichen is simply expensive for what it does.
- **Energy production.** Your 7 is right for a card with *both* the power tag and energy
  production. The production alone is about 6.
- **Global steps.** Printed cards price a temperature or oxygen step at 7.3–7.9, a bit under a full
  TR. 8.5 is the compromise.

## Cards that are just better versions of others

The same parts at a different price:

- **Acquired Company** (10) vs **Budget Restrictions** (7): both +3 M€ production + Earth tag
- **Diversity Support** (1) vs **Political Alliance** (4): both an event with a requirement and +1 TR
- **Nuclear Zone** (10) vs its Ares version (11)
- **Anti-Gravity Technology** (14) vs **Earth Catapult** (23): same discount, Anti-Gravity has
  more VP and a 7-science requirement

Cheapest for what they give (the table says they should cost more): Kelp Farming 17 → 26,
Farming 16 → 22, Stanford Torus 12 → 17, Dawn City 15 → 22, Lake Marineris 18 → 22. Mass Converter
is off the chart: +6 energy production and a space discount for 8 M€, which only makes sense
because 5 science tags is a real wall.

Most expensive for what they give: Interstellar Colony Ship 24 → 14, Underground City 18 → 13,
Breathing Filters 11 → 6, Snow Algae 12 → 8, Soletta 35 → 30.

Fan expansions are priced about the same as the official game (average error 2.1 M€ over 252 cards
including fan cards).

## How this was made

`analysis/` holds the scripts. They run against a built copy of the game (`build/`), currently the
VPS's `/opt/terraforming-mars/build`; change the path at the top of `export-cards.js` to run
elsewhere.

1. `export-cards.js`: creates every project card, corporation and prelude (1,383) and saves cost,
   tags, behavior, action, discount, requirements and VP to `cards.json`.
2. `fit.js [official|all] [fixed|anchored,fixed]`: least-squares fit of cost against the parts,
   using only cards with no custom code, no action and no blue effect (163 official, 252 total).
   `anchored` fixes your values and fits the rest. `REQEXP=1.5` changes the tag-requirement shape.
3. `synergy.js [official|all]`: per tag, how many cards require it, count it or discount it.
   Trigger counts come from the source: card files whose `onCardPlayed`/discount code references
   the tag.
4. `effects.js`: measures action uses, discount reach and trigger values from the blue cards.
5. `extra.js`: the "same parts, different price" pairs.
6. `check.js`: scores the resource/production/terraforming table against the real cards.
