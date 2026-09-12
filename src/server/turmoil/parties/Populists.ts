import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';

export class Populists extends Party implements IParty {
  readonly name = PartyName.POPULISTS;
  readonly bonuses = [POPULISTS_BONUS_1];
  readonly policies = [POPULISTS_POLICY_1];
}

// Placeholder: Populists' real bonus is not yet defined for this fan expansion.
class PopulistsBonus01 extends Bonus {
  readonly id = 'popb01' as const;
  readonly description = 'No effect yet (Populists\' real bonus is not yet defined for this fan expansion)';

  getScore(_player: IPlayer) {
    return 0;
  }

  grantForPlayer(_player: IPlayer): void {}
}

// Placeholder: Populists' real policy is not yet defined for this fan expansion.
class PopulistsPolicy01 implements IPolicy {
  readonly id = 'popp01' as const;
  readonly description = 'No effect yet (Populists\' real policy is not yet defined for this fan expansion)';
}

export const POPULISTS_BONUS_1 = new PopulistsBonus01();
export const POPULISTS_POLICY_1 = new PopulistsPolicy01();
