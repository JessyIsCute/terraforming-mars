import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {MartianRails} from '../../base/MartianRails';

/** Martian Rails, with an additional Mars tag. */
export class MartianRailsSilly extends MartianRails {
  public override get name() {
    return CardName.MARTIAN_RAILS_SILLY;
  }

  public override get tags() {
    return [Tag.BUILDING, Tag.MARS];
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X62'};
  }
}
