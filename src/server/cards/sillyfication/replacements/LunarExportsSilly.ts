import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {LunarExports} from '../../colonies/LunarExports';

/** Lunar Exports, with an added Moon tag and 1 M€ more expensive. */
export class LunarExportsSilly extends LunarExports {
  public override get name() {
    return CardName.LUNAR_EXPORTS_SILLY;
  }

  public override get tags() {
    return [Tag.EARTH, Tag.SPACE, Tag.MOON];
  }

  public override get cost() {
    return super.cost + 1;
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X56'};
  }
}
