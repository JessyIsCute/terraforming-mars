import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {TropicalResort} from '../../base/TropicalResort';

/** Tropical Resort, with an additional Mars tag. */
export class TropicalResortSilly extends TropicalResort {
  public override get name() {
    return CardName.TROPICAL_RESORT_SILLY;
  }

  public override get tags() {
    return [Tag.BUILDING, Tag.MARS];
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X68'};
  }
}
