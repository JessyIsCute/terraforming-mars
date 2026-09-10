import {IGame} from '../IGame';
import {BlackMarketSlot} from '../blackmarket/BlackMarketData';
import {BlackMarketModel, BlackMarketSlotModel} from '../../common/models/BlackMarketModel';

/** Market cards aren't owned by any player yet, so this builds a minimal, player-independent CardModel rather than reusing `cardsToModel` -- mirrors `MutationMarketModel.ts`'s `previewCardModel`. */
export function createBlackMarketModel(game: IGame): BlackMarketModel | undefined {
  const data = game.blackMarketData;
  if (data === undefined) {
    return undefined;
  }
  return {
    slots: data.slots.map((slot) => slotModel(slot)),
  };
}

function slotModel(slot: BlackMarketSlot): BlackMarketSlotModel {
  if (slot === undefined) {
    return undefined;
  }
  return {
    card: {name: slot.card.name, calculatedCost: slot.card.cost},
    price: slot.price,
  };
}
