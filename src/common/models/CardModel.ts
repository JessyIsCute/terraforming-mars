import {Units} from '../Units';
import {CardName} from '../cards/CardName';
import {Resource} from '../Resource';
import {AdditionalProjectCosts, CardDiscount, StandardProjectCanPayWith} from '../cards/Types';
import {Tag} from '../cards/Tag';
import {Warning} from '../cards/Warning';

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
    mutationAddedTag?: Tag; // MutationMarkets: an extra tag granted by a mutation (e.g. Tag Diversifier), not part of the card's static tag list
    mutationHighlight?: {tag?: boolean, cost?: boolean, vp?: boolean}; // MutationMarkets: which parts of the card get the mutated-green glow
    mutationVictoryPoints?: number; // MutationMarkets: extra VP granted by mutations, on top of the card's own printed VP formula
}
