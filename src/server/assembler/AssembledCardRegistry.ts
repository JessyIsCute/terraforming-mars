import {CardName} from '../../common/cards/CardName';
import {AssembledCardDefinition} from './AssembledCardDefinition';

/**
 * Every assembled card currently known to this server process, by name.
 *
 * `createCard()` only gets a card's name, and saved games store hands and decks as names, so a
 * game's assembled cards must be findable by name alone. Each game registers its own cards when
 * it assembles them and again when it's loaded (Game.deserialize, before players are rebuilt).
 * Names contain the game id, so games never collide.
 */
const registry = new Map<string, AssembledCardDefinition>();

export function registerAssembledCard(def: AssembledCardDefinition): void {
  registry.set(def.name, def);
}

/** Forget cards, e.g. when their game leaves memory. Also used by tests to simulate a fresh server process. */
export function unregisterAssembledCards(names: ReadonlyArray<string>): void {
  for (const name of names) {
    registry.delete(name);
  }
}

export function getAssembledCardDefinition(name: CardName | string): AssembledCardDefinition | undefined {
  return registry.get(name);
}

export function isAssembledCardName(name: CardName | string): boolean {
  return registry.has(name);
}

export const ASSEMBLED_NAME_PREFIX = 'Assembled ';

export function assembledCardName(gameId: string, serial: number): string {
  return `${ASSEMBLED_NAME_PREFIX}${gameId}-${serial}`;
}
