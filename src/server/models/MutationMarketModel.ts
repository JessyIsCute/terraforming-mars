import {IGame} from '../IGame';
import {ICard} from '../cards/ICard';
import {IProjectCard} from '../cards/IProjectCard';
import {CardModel} from '../../common/models/CardModel';
import {MutationEffects} from '../mutationmarkets/MutationEffects';
import {InfectionEffects} from '../mutationmarkets/InfectionEffects';
import {MutationMarkets} from '../mutationmarkets/MutationMarkets';
import {MUTATION_DEFINITIONS} from '../../common/mutationmarkets/MutationDefinitions';
import {MarketSlotContent} from '../../common/mutationmarkets/MarketSlotContent';
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
  const coveringContent = MutationMarkets.coveringMutations(data, index);
  // A market card is never itself already mutated/infected (that only happens once it's
  // won), so this preview -- "what would this card look like with everything currently
  // covering it applied?" -- is the only mutation/infection-related model info a market
  // card ever needs.
  const model = previewCardModel(game, card, coveringContent);

  const auction = data.projectAuctions[index];
  const auctionModel = auction === undefined ? undefined : {
    highBid: auction.escrow[auction.highBidder],
    highBidderColor: game.getPlayerById(auction.highBidder).color,
  };

  const {above, below} = MutationMarkets.coveringMutationsByRow(data, index);

  return {
    card: model,
    active: MutationMarkets.isProjectSlotActive(index),
    minimumBid: MutationMarkets.minimumBidFor(index),
    auction: auctionModel,
    coveringMutationsAbove: above,
    coveringMutationsBelow: below,
  };
}

/**
 * What `card` would look like (cost/highlight/VP) if a bidder won it with everything in
 * `coveringContent` applied -- computed without touching the real card instance, since
 * nothing has actually been won yet. A mutation with a randomized outcome (Tag
 * Diversifier's chosen tag) still shows its glow (`highlight.tag`), just not which tag,
 * since that's only decided at auction resolution. Infections have no randomized outcome.
 */
function previewCardModel(game: IGame, card: IProjectCard, coveringContent: ReadonlyArray<MarketSlotContent>): CardModel {
  const model: CardModel = {
    name: card.name,
    calculatedCost: card.cost,
  };
  if (coveringContent.length === 0) {
    return model;
  }
  const mutationNames = coveringContent.filter((c) => c.kind === 'mutation').map((c) => c.mutation);
  const infectionNames = coveringContent.filter((c) => c.kind === 'infection').map((c) => c.infection);

  // A market card is never yet mutated/infected, so its current `cost` IS its base cost.
  const baseCost = card.cost;
  const preview = {
    mutations: mutationNames.map((mutation) => ({mutation})),
    infections: infectionNames.map((infection) => ({infection})),
    baseCost,
  } as ICard;

  model.calculatedCost = InfectionEffects.applyCost(preview, MutationEffects.applyCost(preview, baseCost));

  const namePrefixes = [...MutationEffects.namePrefixes(mutationNames), ...InfectionEffects.namePrefixes(infectionNames)];
  if (namePrefixes.length > 0) {
    model.combinedDisplayName = [...namePrefixes, card.name].join(' ');
  }
  if (mutationNames.length > 0) {
    model.mutationNames = mutationNames;
    model.mutationHighlight = MutationEffects.highlightsFor(preview);
    const mutationVp = MutationEffects.victoryPointsBonus(preview, game.players[0]);
    if (mutationVp !== 0) {
      model.mutationVictoryPoints = mutationVp;
    }
  }
  if (infectionNames.length > 0) {
    model.infectionNames = infectionNames;
    model.infectionHighlight = InfectionEffects.highlightsFor(preview);
    const infectionVp = InfectionEffects.victoryPointsBonus(preview);
    if (infectionVp !== 0) {
      model.infectionVictoryPoints = infectionVp;
    }
  }
  return model;
}

function mutationSlotModel(game: IGame, data: MutationMarketData, row: MutationRow, index: number): MutationMarketMutationSlotModel {
  const slot = data[row][index];
  if (slot === undefined) {
    return undefined;
  }
  const active = MutationMarkets.isMutationSlotActive(row, index, data);
  if (slot.kind === 'infection') {
    return {
      kind: 'infection',
      infection: slot.infection,
      active,
    };
  }
  const definition = MUTATION_DEFINITIONS[slot.mutation];
  return {
    kind: 'mutation',
    mutation: slot.mutation,
    active,
    playerProgress: MutationMarkets.playerProgressFor(game, definition.requirement),
  };
}
