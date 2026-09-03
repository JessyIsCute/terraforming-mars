import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {NoctisCity} from '../../base/NoctisCity';

/** Noctis City, with an additional Mars tag. */
export class NoctisCitySilly extends NoctisCity {
  public override get name() {
    return CardName.NOCTIS_CITY_SILLY;
  }

  public override get tags() {
    return [Tag.CITY, Tag.BUILDING, Tag.MARS];
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X63'};
  }
}
