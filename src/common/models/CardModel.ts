import {EffectCategory} from '../assembler/EffectCategory';
import {Units} from '../Units';
import {CardName} from '../cards/CardName';
import {CardResource} from '../CardResource';
import {CardType} from '../cards/CardType';
import {Resource} from '../Resource';
import {AdditionalProjectCosts, CardDiscount, StandardProjectCanPayWith} from '../cards/Types';
import {Tag} from '../cards/Tag';
import {Warning} from '../cards/Warning';
import {GameModule, Expansion} from '../cards/GameModule';
import {CardMetadata} from '../cards/CardMetadata';
import {CardRequirementDescriptor} from '../cards/CardRequirementDescriptor';
import {ICardRenderItem} from '../cards/render/Types';

/**
 * The face-of-card data `Card.vue` needs but can't find in the client's compiled static
 * manifest (`ClientCardManifest.ts`) -- populated only for a card whose name isn't in that
 * manifest, i.e. a Custom Card Maker submission (see `cardsToModel()` in
 * `src/server/models/ModelUtils.ts`, the single place every `CardModel` is built). A deliberate
 * subset of `ClientCard`: everything `Card.vue`'s computed properties actually read off
 * `cardInstance` for a project card, and nothing else (no `victoryPoints` -- that's already
 * inside `metadata`, auto-populated by `Card.ts`; no `cardDiscount`/`startingMegaCredits`/
 * `cardCost`/`hasAction`/`productionBox`, which only apply to corporations/preludes -- out of
 * scope for custom cards in v1).
 */
export interface CustomCardModel {
    type: CardType;
    cost?: number;
    tags: ReadonlyArray<Tag>;
    requirements?: ReadonlyArray<CardRequirementDescriptor>;
    metadata: CardMetadata;
    resourceType?: CardResource;
    module: GameModule;
    compatibility: Array<Expansion>;
    /** Whether the card has a repeatable action (blue cards). Absent means no. */
    hasAction?: boolean;
}

/** Assembler (fan): how a card generated during the game was priced. Shown in its info popup. */
export interface AssembledCardInfo {
    /** 1 per benefit, effect or action, drawback and requirement, plus 1 per tag after the first. */
    complexity: number;
    /** What the card is worth, in M€. Its cost is round(value - 3), plus costAdjust. */
    value: number;
    /** category: set when the line is one of the card's parts. */
    breakdown: ReadonlyArray<{text: string, value: number, category?: EffectCategory}>;
    /** Set when a preset changed the cost after pricing, e.g. -10. */
    costAdjust?: number;
}

export interface CardModel {
    name: CardName;
    resources?: number;
    calculatedCost?: number;
    isSelfReplicatingRobotsCard?: boolean,
    discount?: Array<CardDiscount>,
    isDisabled?: boolean; // Used with Pharmacy Union
    additionalProjectCosts?: AdditionalProjectCosts;
    warnings?: ReadonlyArray<Warning>;
    reserveUnits?: Readonly<Units>; // Written for The Moon, but useful in other contexts.
    bonusResource?: Array<Resource>; // Used with the Mining cards and Robotic Workforce
    cloneTag?: Tag; // Used with Pathfinders
    standardProjectCanPayWith?: StandardProjectCanPayWith; // Set for standard projects; undefined for regular project cards
    customCard?: CustomCardModel; // Set only for a Custom Card Maker card -- see CustomCardModel's doc comment.
    combinedDisplayName?: string; // DeimosDoubleDownCopy (sillyfication): the copy's display name, e.g. "<real card name> Copy"
    inSpireResources?: ReadonlyArray<ICardRenderItem>; // InSpire (Pathfinders): the resources currently stored on this card
    assembled?: AssembledCardInfo; // Assembler (fan): set only for a card generated during the game
}
