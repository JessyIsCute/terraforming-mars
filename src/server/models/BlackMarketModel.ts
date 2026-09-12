import {IGame} from '../IGame';
import {IProjectCard} from '../cards/IProjectCard';
import {CardModel} from '../../common/models/CardModel';
import {BlackMarketModel, BlackMarketRowModel} from '../../common/models/BlackMarketModel';
import {BlackMarketRowData} from '../blackmarket/BlackMarketData';

/** Market cards aren't owned by any player yet, so this builds a minimal, player-independent CardModel rather than reusing `cardsToModel` -- mirrors `MutationMarketModel.ts`'s `previewCardModel`. */
export function createBlackMarketModel(game: IGame): BlackMarketModel | undefined {
  const data = game.blackMarketData;
  if (data === undefined) {
    return undefined;
  }
  return {
    early: rowModel(data.early),
    mid: data.mid === undefined ? undefined : rowModel(data.mid),
    late: data.late === undefined ? undefined : rowModel(data.late),
  };
}

function rowModel(row: BlackMarketRowData): BlackMarketRowModel {
  return row.slots.map((slot) => slotModel(slot?.card));
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
