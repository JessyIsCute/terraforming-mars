import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {ProtectedValley} from '../../base/ProtectedValley';

/** Protected Valley, with an additional Mars tag. */
export class ProtectedValleySilly extends ProtectedValley {
  public override get name() {
    return CardName.PROTECTED_VALLEY_SILLY;
  }

  public override get tags() {
    return [Tag.PLANT, Tag.BUILDING, Tag.MARS];
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X65'};
  }
}
