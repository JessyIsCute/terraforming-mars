import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';

export class Transhumanists extends Party implements IParty {
  readonly name = PartyName.TRANSHUMANISTS;
  readonly bonuses = [TRANSHUMANISTS_BONUS_1];
  readonly policies = [TRANSHUMANISTS_POLICY_1];
}

// Placeholder: Transhumanists' real bonus is not yet defined for this fan expansion.
class TranshumanistsBonus01 extends Bonus {
  readonly id = 'trab01' as const;
  readonly description = 'No effect yet (Transhumanists\' real bonus is not yet defined for this fan expansion)';

  getScore(_player: IPlayer) {
    return 0;
  }

  grantForPlayer(_player: IPlayer): void {}
}

// Placeholder: Transhumanists' real policy is not yet defined for this fan expansion.
class TranshumanistsPolicy01 implements IPolicy {
  readonly id = 'trap01' as const;
  readonly description = 'No effect yet (Transhumanists\' real policy is not yet defined for this fan expansion)';
}

export const TRANSHUMANISTS_BONUS_1 = new TranshumanistsBonus01();
export const TRANSHUMANISTS_POLICY_1 = new TranshumanistsPolicy01();
