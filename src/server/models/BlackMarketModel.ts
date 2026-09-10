import {IGame} from '../IGame';
import {IProjectCard} from '../cards/IProjectCard';
import {CardModel} from '../../common/models/CardModel';
import {BlackMarketModel} from '../../common/models/BlackMarketModel';

/** Market cards aren't owned by any player yet, so this builds a minimal, player-independent CardModel rather than reusing `cardsToModel` -- mirrors `MutationMarketModel.ts`'s `previewCardModel`. */
export function createBlackMarketModel(game: IGame): BlackMarketModel | undefined {
  const data = game.blackMarketData;
  if (data === undefined) {
    return undefined;
  }
  return {
    slots: data.slots.map((slot) => slotModel(slot?.card)),
  };
}

function slotModel(card: IProjectCard | undefined): CardModel | undefined {
  if (card === undefined) {
    return undefined;
  }
  return {
    name: card.name,
    calculatedCost: card.cost,
    reserveUnits: card.reserveUnits,
  };
}
