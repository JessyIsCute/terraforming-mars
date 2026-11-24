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

### Phase 2 — the expansion
- `GameModule` / `Expansion` entry `assembler`, a game option, and a checkbox on the create-game
  screen (`src/client/components/create/`).
- `AssemblerCardManifest` with a handful of printed cards that use the keyword, e.g.
  - **Assembly Line** — Action: spend 4 M€ to Assemble 1.
  - **Prototype Workshop** — Assemble 2. Gain 1 steel.
  - **Salvage Yard** — Effect: when you play an assembled card, gain 2 M€.
- Optional setup seeding.
- The card name enum: assembled cards are not in `CardName` (cast like `DataDrivenCard` does). The
  printed Assembler cards do get normal enum entries.

### Phase 3 — client polish
- An "assembled" marker on the card face, and the value breakdown in the card's tooltip.
- A client test for an assembled card (Vitest, `tests/client/`).

### Phase 4 — v2 effects and tuning
- Trigger effects ("when you play a X tag, gain Y") as a generic trigger card class.
- Recount tag synergy from the game's actual card pool at setup (see value-table.md, "Make it
  live").
- Themed part bundles, so high-complexity cards read as one idea, not six random lines.
- Playtest and tune.

## Deploy

Push to `main` → the VPS's `tm-deploy.timer` builds and restarts within ~5 minutes. A restart
reloads games from the database, so the Phase 1 save/load tests are what keep live games safe.
