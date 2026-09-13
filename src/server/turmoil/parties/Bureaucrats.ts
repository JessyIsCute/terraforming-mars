import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../../cards/ICard';
import {Resource} from '../../../common/Resource';
import {DiscardCards} from '../../deferredActions/DiscardCards';

/**
 * More Parties: Bureaucrats, one of the 6 new "Political Agendas" parties. Policy 1 (capping
 * blue-card actions per generation) and policy 2 (a "start of each turn" trigger) are not
 * implemented: this codebase has no per-generation blue-card-action cap and no per-player
 * "start of turn" hook to build them on -- both would require substantial new core-engine
 * machinery, out of scope for this pass.
 */
export class Bureaucrats extends Party implements IParty {
  readonly name = PartyName.BUREAUCRATS;
  readonly bonuses = [BUREAUCRATS_BONUS_1, BUREAUCRATS_BONUS_2];
  readonly policies = [BUREAUCRATS_POLICY_1, BUREAUCRATS_POLICY_2, BUREAUCRATS_POLICY_3, BUREAUCRATS_POLICY_4];
}

class BureaucratsBonus01 extends Bonus {
  readonly id = 'burb01' as const;
  readonly description = 'Gain 2 M€ for every delegate you have in a party';

  getScore(player: IPlayer) {
    const turmoil = player.game.turmoil;
    if (turmoil === undefined) {
      return 0;
    }
    return turmoil.parties.reduce((sum, party) => sum + party.delegates.count(player), 0);
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player) * 2, {log: true, from: {partyName: PartyName.BUREAUCRATS}});
  }
}

// Adapted: the source also references "every Chairman bonus," an EPIC campaign concept this
// codebase doesn't model -- dropped, keeping only the influence-based scoring.
class BureaucratsBonus02 extends Bonus {
  readonly id = 'burb02' as const;
  readonly description = 'Gain 2 M€ for every influence you have';

  getScore(player: IPlayer) {
    const turmoil = player.game.turmoil;
    if (turmoil === undefined) {
      return 0;
    }
    return turmoil.getInfluence(player);
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player) * 2, {log: true, from: {partyName: PartyName.BUREAUCRATS}});
  }
}

// Not implemented: would require a new "blue-card actions used this generation" cap mechanic
// applied globally, which this codebase has no equivalent of today.
class BureaucratsPolicy01 implements IPolicy {
  readonly id = 'burp01' as const;
  readonly description = 'Not implemented in this codebase: this generation you can take at most ' +
    '2 actions on cards in play, plus the influence you have (would require a new global action-cap mechanic)';
}

// Not implemented: this codebase has no per-player "start of turn" hook (only generation-start).
class BureaucratsPolicy02 implements IPolicy {
  readonly id = 'burp02' as const;
  readonly description = 'Not implemented in this codebase: at the start of each turn, pay 3 M€ ' +
    'minus the influence you have (no per-turn hook exists here)';
}

// No behavior of its own -- its effect is applied directly by
// TurmoilHandler.applyOnDelegatePlacedEffect.
class BureaucratsPolicy03 implements IPolicy {
  readonly id = 'burp03' as const;
  readonly description = 'Every time you place a delegate, gain 3 M€';
}

class BureaucratsPolicy04 implements IPolicy {
  readonly id = 'burp04' as const;
  readonly description = 'Every time you play a card, discard a card. Does not apply to the chairman';

  onCardPlayed(player: IPlayer, _card: ICard) {
    const turmoil = player.game.turmoil;
    if (turmoil !== undefined && turmoil.chairman === player) {
      return;
    }
    player.game.defer(new DiscardCards(player, 1, 1, 'Select a card to discard (Turmoil Bureaucrats)'));
  }
}

export const BUREAUCRATS_BONUS_1 = new BureaucratsBonus01();
export const BUREAUCRATS_BONUS_2 = new BureaucratsBonus02();
export const BUREAUCRATS_POLICY_1 = new BureaucratsPolicy01();
export const BUREAUCRATS_POLICY_2 = new BureaucratsPolicy02();
export const BUREAUCRATS_POLICY_3 = new BureaucratsPolicy03();
export const BUREAUCRATS_POLICY_4 = new BureaucratsPolicy04();
