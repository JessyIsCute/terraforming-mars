import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {ProtectedHabitats} from '../../base/ProtectedHabitats';

/** Protected Habitats, with an additional Mars tag. */
export class ProtectedHabitatsSilly extends ProtectedHabitats {
  public override get name() {
    return CardName.PROTECTED_HABITATS_SILLY;
  }

  public override get tags() {
    return [Tag.MARS];
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X67'};
  }
}
