# Assembler — implementation plan

Goal: cards that are generated **during a game**, saved with it, playable by anyone who draws them,
and drawn on the client like any other card. Prices come from [value-table.md](value-table.md).

## Decisions (change here if they're wrong)

- **Assemble is a keyword**, like gaining a resource: `Assemble 1` on a card's play or action
  generates one card.
- **New cards are shuffled into the project deck** at a random position, so anyone can draw them.
- Optional game setting: shuffle N assembled cards into the deck at setup (default 0).
- v1 generates **automated and event cards, plus blue cards with a declarative action or a
  discount**. Triggers ("when you play a science tag…") need custom code per trigger type and come
  in v2.

## What already exists and gets reused

| Piece | File | Use |
|---|---|---|
| Card built from data | `src/server/cards/DataDrivenCard.ts` | base for `AssembledCard` |
| Card lookup by name, including on reload | `src/server/createCard.ts` (custom-card fallback) | add a second fallback for assembled cards |
| Sending a card's face to the client | `src/server/models/ModelUtils.ts` → `CardModel.customCard` | same path, so `Card.vue` already draws them |
| Behavior engine | `src/server/behavior/` | assembled cards are pure `behavior` / `action` data |

## The one hard part: cards that exist only inside one game

`createCard()` gets only a card **name**. Hands and decks are saved as names and rebuilt on every
reload, which happens after every move. So:

1. Every assembled card gets a unique name: `Assembled <gameId>-<n>` (e.g. `Assembled g7f3a-12`).
2. The game saves the full definitions in `SerializedGame.assembledCards`.
3. `Game.deserialize` **registers those definitions first, before `Player.deserialize`** (which
   rebuilds hands). Right now players are deserialized on the first line, so the register call goes
   above it.
4. `createCard` falls back to the assembled-card registry when the name isn't in a manifest or the
   custom library.
5. When `GameLoader` evicts a game, its assembled cards are unregistered. `Card.ts` also caches
   properties per name forever (`cardProperties`), so drop those entries too.

## Phases

### Phase 1 — engine (server only, no UI yet)
- `src/server/assembler/AssemblerValues.ts`: the value table as constants.
- `src/server/assembler/AssemblerGenerator.ts`: game RNG + complexity → `AssembledCardDefinition`
  (cost, tags, requirements, `behavior`, `action`, `cardDiscount`, `renderData` built with
  `CardRenderer.builder`, description). Same rules as `docs/assembler/analysis/demo-generate.js`.
- `src/server/assembler/AssembledCard.ts`: extends `Card`. Supports `behavior`, a declarative
  `action` (like `ActionCard`) and `cardDiscount`.
- `src/server/assembler/AssembledCardRegistry.ts`: register / unregister / lookup by name.
- `Behavior.assemble?: number` + executor support: generate N cards and shuffle them into the deck.
- Save/load: `SerializedGame.assembledCards`, the register call in `Game.deserialize`, the
  `createCard` fallback, `ModelUtils` sending the card's face.

**Tests:**
- 1,000 generated cards per seed: every one passes behavior validation, cost = formula, cost in
  0–40, requirements and tags valid.
- Same seed → same cards.
- Assemble → serialize → deserialize: assembled cards in hand and deck survive.
- Playing an assembled card runs its behavior; its action is usable; its discount applies.

### Phase 2 — the expansion (done)
- Module `assembler`, game option `assemblerExpansion`, a checkbox on the create-game screen, a
  badge in the game-setup details, a gear (⚙️) expansion icon, and the card list filter letter `A`.
- **Assemble into your hand.** Assembling only into the deck helps every player, so a card that
  pays for it would be a bad buy. The keyword has two forms:
  - `assemble: 3` shuffles 3 new cards into the project deck (any player can draw them);
  - `assemble: {count: 1, into: 'hand'}` puts the new card straight into your hand.
- **The Assemble icon**: a copper token with a gear (`CardRenderer` `.assemble(n)`, CSS only, no art).
- **Setup seeding**: with the expansion on, 12 assembled cards are shuffled into the deck at game
  start, before hands are dealt (`AssemblerExpansion.SETUP_CARDS`).
- **Printed cards** (`src/server/cards/assembler/`), priced with the value table (an assembled card
  in hand ≈ drawing a card, 3):

  | # | Card | Cost | Tags | Text |
  |---|---|---:|---|---|
  | AS01 | Assembly Line | 8 | building | Action: spend 1 M€ to Assemble a card into your hand. |
  | AS02 | Prototype Workshop | 9 | science, building | Assemble 2 cards into your hand. Gain 1 steel. |
  | AS03 | Salvage Yard | 7 | building | Effect: when you play an assembled card, gain 2 M€. Assemble 3 cards into the deck. |
  | AS04 | Modular Factory | 13 | building | +1 steel production. Assemble a card into your hand. 1 VP. |

- **Presets** (`AssembleSpec`): any Assemble can constrain the card it makes: `complexity`,
  required `tags`, an exact `tagCount`, a `minCost`/`maxCost` range (a card worth too little gets
  extra good parts, so even a low-complexity card can reach ~30 M€), and `costAdjust` (e.g. -10)
  applied after pricing and recorded on the card. Presets that ask for tags never make events (so
  the tags stay in play), and no card with 4+ tags is an event (the client would collapse 5 tag
  icons into one).
- **Card pack** (AS05–AS14), built on presets. See `card-pack.jpg` and, for one card each preset
  made, `card-pack-presets.jpg`:

  | # | Card | Cost | Tags | Text |
  |---|---|---:|---|---|
  | AS05 | Research Prototype | 3 | science (event) | Assemble a card with at least 1 science tag into your hand, then discard a card. |
  | AS06 | Open Source Blueprints | 8 | earth (event) | Every player Assembles a simple card costing ~30 M€ into their hand. Yours costs 10 M€ less. |
  | AS07 | Quad-Core Chassis | 5 | building | Assemble a card with exactly 4 tags into your hand. |
  | AS08 | Assembly Robots | 10 | science, building | Effect: assembled cards cost you 2 M€ less. Assemble a card into your hand. |
  | AS09 | Reverse Engineering | 7 | science | Action: discard a card from your hand to Assemble a card into your hand. |
  | AS10 | Specialized Fabricator | 5 | building | Assemble a card with your most common tag into your hand. |
  | AS11 | Venture Prototype | 6 | space | Assemble a high-complexity card into your hand. Gain 1 titanium. |
  | AS12 | Production Run | 10 | building, power | +1 energy production. Assemble a card into your hand and 2 into the deck. |
  | AS13 | Hall of Prototypes | 7 | building | 1 VP per 2 assembled cards you've played (events included). |
  | AS14 | Bargain Bin | 2 | (event) | Assemble a simple card costing at most 8 M€ into your hand. Gain 2 M€. |

- Memory: when the server unloads a game, its assembled cards are unregistered and their cached
  card properties dropped (`Cache.evict`). They're re-registered when the game is loaded again.

### Phase 3 — client polish (done)
- Assembled cards carry the Assembler ⚙ badge in the bottom corner (`module: 'assembler'`), like
  the printed Assembler cards.
- Hovering an assembled card shows a copper ⚙ button; clicking it opens a popup with the card's
  complexity, each priced part, the total value, cost = value − 3, and any preset adjustment
  (e.g. Open Source Blueprints' −10) with the final cost.
- The server sends this as `CardModel.assembled` (`AssembledCardInfo`, `src/common/models/CardModel.ts`).
- Component: `src/client/components/card/CardAssembledInfo.vue`; test:
  `tests/client/components/card/CardAssembledInfo.spec.ts`.

### Effect categories, names and the card generator page (done)
- Every generated part belongs to an effect category (`src/common/assembler/EffectCategory.ts`):
  heat, cooling, plants, blight, energy, drain, metal, money, debt, water, air, knowledge, city,
  prestige, infamy, efficiency, synergy. Cooling, blight, drain, debt and infamy are drawbacks (or
  sabotage against another player).
- Names come from the categories (`AssemblerNames.ts`): the strongest benefit gives the noun, the
  next category (a drawback first) the adjective, and high-complexity cards an "of ..." ending.
  Parts worth 10 M€ or more use the bigger words ("Frozen" instead of "Cooled").
- Presets can guarantee categories (`categories`) and a card type (`type`).
- `/assembler` is a public card generator page (linked from the start screen and the Card Maker):
  pick complexity, type, guaranteed effects, tags, cost range, cost change and a requirement; a
  seed makes results shareable. A second tab shows the value table, built from the generator's
  own constants (`AssemblerValueTable.ts`, `api/assembler/values`).
- `api/assembler` generates without saving anything; 60 requests a minute per client by default
  (`ASSEMBLER_PREVIEW_QUOTA`). Combinations that rarely fit on a card (high complexity at
  35+ M€) come back partly, with a count of the cards that couldn't be made.
- Icon widths in `AssemblerRender.ts` were measured in the browser; 480 generated cards were
  checked with no icons past the card edge.

### Phase 4 — v2 effects and tuning
- Trigger effects ("when you play a X tag, gain Y") as a generic trigger card class.
- Recount tag synergy from the game's actual card pool at setup (see value-table.md, "Make it
  live").
- Themed part bundles, so high-complexity cards read as one idea, not six random lines.
- Playtest and tune.

## Deploy

Push to `main` → the VPS's `tm-deploy.timer` builds and restarts within ~5 minutes. A restart
reloads games from the database, so the Phase 1 save/load tests are what keep live games safe.

## Rating mode ("Rate cards" tab)

`/assembler#rate` shows one generated card at a time with five verdicts, from "Way too cheap" to "Way too expensive" (keys 1–5; S skips).
Votes are kept in the browser's localStorage (`assemblerVotes`) and downloaded as JSON.
The side panel shows, for each kind of effect, the average verdict on cards that have it.

To turn downloaded votes into suggested changes:

    npx tsx src/server/tools/assembler_votes.ts votes.json [more.json ...] [--markdown out.md]

Each vote says what the card is worth: its cost + 3, moved by 15% (at least 2 M€) for each verdict step.
`AssemblerVoteFit` solves one factor per kind of effect, plus a flat offset, so that the cards' scaled parts match those values.
Each factor is pulled toward 1 as if 3 extra votes said the card was fair.
