import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {Policy, IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {Tag} from '../../../common/cards/Tag';
import {Resource} from '../../../common/Resource';

/**
 * More Parties: Transhumanists, one of the 6 new "Political Agendas" parties. The source
 * material references "postlude" (a card type this codebase doesn't have) and a "draw 2
 * milestones or awards" mechanic (milestones/awards are a fixed list chosen at game setup here,
 * not a drawable pool) -- both are left unimplemented, per the source document's own guidance to
 * ignore references to content this codebase doesn't model. Bonus B keeps only the "claimed
 * milestone or award" half, dropping the postlude clause.
 */
export class Transhumanists extends Party implements IParty {
  readonly name = PartyName.TRANSHUMANISTS;
  readonly bonuses = [TRANSHUMANISTS_BONUS_1, TRANSHUMANISTS_BONUS_2];
  readonly policies = [TRANSHUMANISTS_POLICY_1, TRANSHUMANISTS_POLICY_2, TRANSHUMANISTS_POLICY_3, TRANSHUMANISTS_POLICY_4];
}

class TranshumanistsBonus01 extends Bonus {
  readonly id = 'trab01' as const;
  readonly description = 'Gain 1 M€ for every wild tag and every card with a tag requirement you have';

  getScore(player: IPlayer) {
    const wildTags = player.tags.count(Tag.WILD, 'raw');
    const tagRequirementCards = player.tableau.asArray().filter((card) => card.requirements.some((r) => r.tag !== undefined)).length;
    return wildTags + tagRequirementCards;
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player), {log: true, from: {partyName: PartyName.TRANSHUMANISTS}});
  }
}

class TranshumanistsBonus02 extends Bonus {
  readonly id = 'trab02' as const;
  readonly description = 'Gain 2 M€ for every milestone or award you have claimed';

  getScore(player: IPlayer) {
    const game = player.game;
    const claimedMilestones = game.claimedMilestones.filter((m) => m.player === player).length;
    const fundedAwards = game.fundedAwards.filter((a) => a.player === player).length;
    return claimedMilestones + fundedAwards;
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player) * 2, {log: true, from: {partyName: PartyName.TRANSHUMANISTS}});
  }
}

class TranshumanistsPolicy01 extends Policy {
  readonly id = 'trap01' as const;
  readonly description = 'You\'re considered having 1 more wild tag';

  override onPolicyStartForPlayer(player: IPlayer): void {
    player.tags.extraWildTags += 1;
  }

  override onPolicyEndForPlayer(player: IPlayer): void {
    player.tags.extraWildTags -= 1;
  }
}

// No behavior of its own -- its effect is applied directly by
// TurmoilHandler.applyOnStandardProjectEffect.
class TranshumanistsPolicy02 implements IPolicy {
  readonly id = 'trap02' as const;
  readonly description = 'Every time you play a standard project, gain 2 M€';
}

// Not implemented: "postlude" is a card type from the EPIC campaign expansion that this
// codebase doesn't model.
class TranshumanistsPolicy03 implements IPolicy {
  readonly id = 'trap03' as const;
  readonly description = 'Not implemented in this codebase: action, pay 5 M€ to buy a postlude (EPIC campaign concept)';
}

// Not implemented: milestones and awards are a fixed list chosen at game setup in this
// codebase, not a drawable pool that could be replaced at runtime.
class TranshumanistsPolicy04 implements IPolicy {
  readonly id = 'trap04' as const;
  readonly description = 'Not implemented in this codebase: action, spend 10 M€ to draw 2 milestones ' +
    'or awards and replace an unclaimed one, optionally claiming it immediately (milestones/awards ' +
    'are a fixed list in this codebase, not a drawable pool)';
}

export const TRANSHUMANISTS_BONUS_1 = new TranshumanistsBonus01();
export const TRANSHUMANISTS_BONUS_2 = new TranshumanistsBonus02();
export const TRANSHUMANISTS_POLICY_1 = new TranshumanistsPolicy01();
export const TRANSHUMANISTS_POLICY_2 = new TranshumanistsPolicy02();
export const TRANSHUMANISTS_POLICY_3 = new TranshumanistsPolicy03();
export const TRANSHUMANISTS_POLICY_4 = new TranshumanistsPolicy04();
