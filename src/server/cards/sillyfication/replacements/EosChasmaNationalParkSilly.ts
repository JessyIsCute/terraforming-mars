import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {EosChasmaNationalPark} from '../../base/EOSChasmaNationalPark';

/** Eos Chasma National Park, with an additional Mars tag. */
export class EosChasmaNationalParkSilly extends EosChasmaNationalPark {
  public override get name() {
    return CardName.EOS_CHASMA_NATIONAL_PARK_SILLY;
  }

  public override get tags() {
    return [Tag.PLANT, Tag.BUILDING, Tag.MARS];
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X60'};
  }
}
