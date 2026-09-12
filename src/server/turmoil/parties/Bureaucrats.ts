import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';

export class Bureaucrats extends Party implements IParty {
  readonly name = PartyName.BUREAUCRATS;
  readonly bonuses = [BUREAUCRATS_BONUS_1];
  readonly policies = [BUREAUCRATS_POLICY_1];
}

// Placeholder: Bureaucrats' real bonus is not yet defined for this fan expansion.
class BureaucratsBonus01 extends Bonus {
  readonly id = 'burb01' as const;
  readonly description = 'No effect yet (Bureaucrats\' real bonus is not yet defined for this fan expansion)';

  getScore(_player: IPlayer) {
    return 0;
  }

  grantForPlayer(_player: IPlayer): void {}
}

// Placeholder: Bureaucrats' real policy is not yet defined for this fan expansion.
class BureaucratsPolicy01 implements IPolicy {
  readonly id = 'burp01' as const;
  readonly description = 'No effect yet (Bureaucrats\' real policy is not yet defined for this fan expansion)';
}

export const BUREAUCRATS_BONUS_1 = new BureaucratsBonus01();
export const BUREAUCRATS_POLICY_1 = new BureaucratsPolicy01();
