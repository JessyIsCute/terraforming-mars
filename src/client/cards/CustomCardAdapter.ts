import {CardName} from '@/common/cards/CardName';
import {ClientCard} from '@/common/cards/ClientCard';
import {CardModel, CustomCardModel} from '@/common/models/CardModel';
import {getCard} from '@/client/cards/ClientCardManifest';

/**
 * Builds a `ClientCard`-shaped object from the wire-provided `CustomCardModel` fallback data
 * (`CardModel.customCard`, populated server-side in `cardsToModel()` for a Custom Card Maker
 * card -- see that function's doc comment). Used by `Card.vue` when `getCard(name)` misses the
 * client's compiled static manifest, which is always the case for a custom card, since it was
 * never baked into `cards.json` at build time.
 */
export function buildClientCardFromCustom(name: CardName, customCard: CustomCardModel): ClientCard {
  return {
    name,
    module: customCard.module,
    tags: customCard.tags,
    victoryPoints: undefined, // already inside metadata.victoryPoints, auto-populated server-side
    cost: customCard.cost,
    type: customCard.type,
    requirements: customCard.requirements,
    metadata: customCard.metadata,
    resourceType: customCard.resourceType,
    compatibility: customCard.compatibility,
    hasAction: customCard.hasAction ?? false,
  };
}

/**
 * The client-side card for a card model: from the static manifest, or, for a card generated or
 * authored at runtime (Custom Card Maker, Assembler), from the face data the server sent along.
 */
export function getClientCard(model: CardModel): ClientCard | undefined {
  return getCard(model.name) ?? (model.customCard !== undefined ? buildClientCardFromCustom(model.name, model.customCard) : undefined);
}
