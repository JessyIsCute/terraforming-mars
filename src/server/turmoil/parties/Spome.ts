import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';

export class Spome extends Party implements IParty {
  readonly name = PartyName.SPOME;
  readonly bonuses = [SPOME_BONUS_1];
  readonly policies = [SPOME_POLICY_1];
}

// Placeholder: Spome's real bonus is not yet defined for this fan expansion.
class SpomeBonus01 extends Bonus {
  readonly id = 'spob01' as const;
  readonly description = 'No effect yet (Spome\'s real bonus is not yet defined for this fan expansion)';

  getScore(_player: IPlayer) {
    return 0;
  }

  grantForPlayer(_player: IPlayer): void {}
}

// Placeholder: Spome's real policy is not yet defined for this fan expansion.
class SpomePolicy01 implements IPolicy {
  readonly id = 'spop01' as const;
  readonly description = 'No effect yet (Spome\'s real policy is not yet defined for this fan expansion)';
}

export const SPOME_BONUS_1 = new SpomeBonus01();
export const SPOME_POLICY_1 = new SpomePolicy01();
