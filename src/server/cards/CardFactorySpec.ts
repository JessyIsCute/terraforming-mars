import {Expansion, GameModule} from '../../common/cards/GameModule';
import {OneOrArray} from '../../common/utils/types';
import {asArray} from '../../common/utils/utils';
import {GameOptions} from '../game/GameOptions';

/**
 * Defines conditions for creating a card in a game, including conditions
 * when it will be included in a game.
 */
export type CardFactorySpec<T> = {
  // Creates a new instance of this card.
  Factory: new () => T;
  // Returns the required modules for this card.
  compatibility?: OneOrArray<Expansion>;
  // False when the card should not be instantiated. It's reserved for fake and proxy cards.
  instantiate?: boolean;
  // Used for Turmoil's global events. When true, classifeid as a "negative" global event.
  negative?: boolean;
  // High Orbit (fan): "Silver" cards exist as this many separate physical copies in the
  // project deck, so multiple players can each independently draw, own, and play their own
  // copy of the same card. Defaults to 1 (the normal, single-copy case) when unset.
  copiesInDeck?: number;
}

export function isCompatibleWith(cf: CardFactorySpec<any>, gameOptions: GameOptions): boolean {
  if (cf.compatibility === undefined) {
    return true;
  }
  const expansions: Array<GameModule> = asArray(cf.compatibility);
  return expansions.every((expansion) => {
    switch (expansion) {
    case 'venus':
      return gameOptions.venusNextExtension;
    case 'colonies':
      return gameOptions.coloniesExtension;
    case 'turmoil':
      return gameOptions.turmoilExtension;
    case 'prelude':
      return gameOptions.preludeExtension;
    case 'prelude2':
      return gameOptions.prelude2Expansion;
    case 'moon':
      return gameOptions.moonExpansion;
    case 'pathfinders':
      return gameOptions.pathfindersExpansion;
    case 'ares':
      return gameOptions.aresExtension;
    case 'ceo':
      return gameOptions.ceoExtension;
    case 'starwars':
      return gameOptions.starWarsExpansion;
    case 'underworld':
      return gameOptions.underworldExpansion;
    case 'deltaProject':
      return gameOptions.deltaProjectExpansion;
    case 'moreParties':
      return gameOptions.morePartiesExpansion;
    }
    throw new Error(`Unhandled expansion type ${expansion}`);
  });
}
