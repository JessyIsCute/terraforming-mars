import {Tag} from '../../../../common/cards/Tag';
import {CardName} from '../../../../common/cards/CardName';
import {Pristar} from '../../turmoil/Pristar';

/** Pristar, with an additional Mars tag. */
export class PristarSilly extends Pristar {
  public override get name() {
    return CardName.PRISTAR_SILLY;
  }

  public override get tags() {
    return [Tag.MARS];
  }

  public override get metadata() {
    return {...super.metadata, cardNumber: 'X57'};
  }
}
