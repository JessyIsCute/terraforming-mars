import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {ImmigrationShuttles} from '../../base/ImmigrationShuttles';

/** Immigration Shuttles, with an additional Mars tag. */
export class ImmigrationShuttlesSilly extends ImmigrationShuttles {
  public override get name() {
    return CardName.IMMIGRATION_SHUTTLES_SILLY;
  }

  public override get tags() {
    return [Tag.EARTH, Tag.SPACE, Tag.MARS];
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X61'};
  }
}
