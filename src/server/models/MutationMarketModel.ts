import {IGame} from '../IGame';
import {IProjectCard} from '../cards/IProjectCard';
import {CardModel} from '../../common/models/CardModel';
import {MutationEffects} from '../mutationmarkets/MutationEffects';
import {MutationMarkets} from '../mutationmarkets/MutationMarkets';
import {MUTATION_DEFINITIONS} from '../../common/mutationmarkets/MutationDefinitions';
import {MutationMarketData, MutationRow} from '../mutationmarkets/MutationMarketData';
import {
  MutationMarketModel,
  MutationMarketMutationSlotModel,
  MutationMarketProjectSlotModel,
} from '../../common/models/MutationMarketModel';

/** Market cards aren't owned by any player yet, so this builds a minimal, player-independent CardModel rather than reusing `cardsToModel`. */
export function createMutationMarketModel(game: IGame): MutationMarketModel | undefined {
  const data = game.mutationMarketData;
  if (data === undefined) {
    return undefined;
  }
  return {
    projectSlots: data.projectSlots.map((card, index) => projectSlotModel(game, data, card, index)),
    alignedRow: data.alignedRow.map((_slot, index) => mutationSlotModel(game, data, 'alignedRow', index)),
    offsetRow: data.offsetRow.map((_slot, index) => mutationSlotModel(game, data, 'offsetRow', index)),
    offsetRowIsTop: data.offsetRowIsTop,
  };
}

function projectSlotModel(game: IGame, data: MutationMarketData, card: IProjectCard | undefined, index: number): MutationMarketProjectSlotModel {
  if (card === undefined) {
    return undefined;
  }
  const model: CardModel = {
    name: card.name,
    calculatedCost: card.cost,
  };
  if (card.mutations !== undefined && card.mutations.length > 0) {
    model.mutationAddedTag = card.mutations.find((m) => m.chosenTag !== undefined)?.chosenTag;
    model.mutationHighlight = MutationEffects.highlightsFor(card);
  }

  const auction = data.projectAuctions[index];
  const auctionModel = auction === undefined ? undefined : {
    highBid: auction.escrow[auction.highBidder],
    highBidderColor: game.getPlayerById(auction.highBidder).color,
  };

  return {card: model, active: MutationMarkets.isProjectSlotActive(index), auction: auctionModel};
}

function mutationSlotModel(game: IGame, data: MutationMarketData, row: MutationRow, index: number): MutationMarketMutationSlotModel {
  const slot = data[row][index];
  if (slot === undefined) {
    return undefined;
  }
  const definition = MUTATION_DEFINITIONS[slot.mutation];
  return {
    mutation: slot.mutation,
    active: MutationMarkets.isMutationSlotActive(row, index, data),
    minimumBid: definition.minimumBid,
    playerProgress: MutationMarkets.playerProgressFor(game, definition.requirement),
  };
}
