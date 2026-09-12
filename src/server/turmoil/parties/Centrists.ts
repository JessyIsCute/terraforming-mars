import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';

export class Centrists extends Party implements IParty {
  readonly name = PartyName.CENTRISTS;
  readonly bonuses = [CENTRISTS_BONUS_1];
  readonly policies = [CENTRISTS_POLICY_1];
}

// Placeholder: Centrists' real bonus is not yet defined for this fan expansion.
class CentristsBonus01 extends Bonus {
  readonly id = 'cenb01' as const;
  readonly description = 'No effect yet (Centrists\' real bonus is not yet defined for this fan expansion)';

  getScore(_player: IPlayer) {
    return 0;
  }

  grantForPlayer(_player: IPlayer): void {}
}

// Placeholder: Centrists' real policy is not yet defined for this fan expansion.
class CentristsPolicy01 implements IPolicy {
  readonly id = 'cenp01' as const;
  readonly description = 'No effect yet (Centrists\' real policy is not yet defined for this fan expansion)';
}

export const CENTRISTS_BONUS_1 = new CentristsBonus01();
export const CENTRISTS_POLICY_1 = new CentristsPolicy01();
