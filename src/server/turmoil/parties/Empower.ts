import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';

export class Empower extends Party implements IParty {
  readonly name = PartyName.EMPOWER;
  readonly bonuses = [EMPOWER_BONUS_1];
  readonly policies = [EMPOWER_POLICY_1];
}

// Placeholder: Empower's real bonus is not yet defined for this fan expansion.
class EmpowerBonus01 extends Bonus {
  readonly id = 'empb01' as const;
  readonly description = 'No effect yet (Empower\'s real bonus is not yet defined for this fan expansion)';

  getScore(_player: IPlayer) {
    return 0;
  }

  grantForPlayer(_player: IPlayer): void {}
}

// Placeholder: Empower's real policy is not yet defined for this fan expansion.
class EmpowerPolicy01 implements IPolicy {
  readonly id = 'empp01' as const;
  readonly description = 'No effect yet (Empower\'s real policy is not yet defined for this fan expansion)';
}

export const EMPOWER_BONUS_1 = new EmpowerBonus01();
export const EMPOWER_POLICY_1 = new EmpowerPolicy01();
