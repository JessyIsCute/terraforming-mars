import {IGame} from '../IGame';
import {ICard} from '../cards/ICard';
import {IProjectCard} from '../cards/IProjectCard';
import {CardModel} from '../../common/models/CardModel';
import {MutationName} from '../../common/mutationmarkets/MutationName';
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
  const coveringMutations = MutationMarkets.coveringMutations(data, index);
  // A market card is never itself already mutated (that only happens once it's won), so
  // this preview -- "what would this card look like with its covering mutation(s)
  // applied?" -- is the only mutation-related model info a market card ever needs.
  const model = previewCardModel(game, card, coveringMutations);

  const auction = data.projectAuctions[index];
  const auctionModel = auction === undefined ? undefined : {
    highBid: auction.escrow[auction.highBidder],
    highBidderColor: game.getPlayerById(auction.highBidder).color,
  };

  return {
    card: model,
    active: MutationMarkets.isProjectSlotActive(index),
    auction: auctionModel,
    coveringMutations,
  };
}

/**
 * What `card` would look like (cost/highlight/VP) if a bidder won it with every one of
 * `coveringMutations` applied -- computed without touching the real card instance, since
 * nothing has actually been won yet. A mutation with a randomized outcome (Tag
 * Diversifier's chosen tag) still shows its glow (`highlight.tag`), just not which tag,
 * since that's only decided at auction resolution.
 */
function previewCardModel(game: IGame, card: IProjectCard, coveringMutations: ReadonlyArray<MutationName>): CardModel {
  const model: CardModel = {
    name: card.name,
    calculatedCost: card.cost,
  };
  if (coveringMutations.length === 0) {
    return model;
  }
  // A market card is never yet mutated, so its current `cost` IS its base cost.
  const baseCost = card.cost;
  const preview = {
    mutations: coveringMutations.map((mutation) => ({mutation})),
    baseCost,
  } as ICard;
  model.calculatedCost = MutationEffects.applyCost(preview, baseCost);
  model.mutationHighlight = MutationEffects.highlightsFor(preview);
  const vp = MutationEffects.victoryPointsBonus(preview, game.players[0]);
  if (vp !== 0) {
    model.mutationVictoryPoints = vp;
  }
  return model;
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
