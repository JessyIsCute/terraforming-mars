import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {uppercase} from '../Options';

// No "Action:" or "Effect:" label appears on the printed card, just a plain all-caps
// one-time instruction with no repeat-use wording, so this is a bespoke on-play behavior
// (AUTOMATED), not a repeatable action. See batch spec notes for card 23.
export class PatentPooling extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.PATENT_POOLING,
      tags: [Tag.SCIENCE],
      cost: 10,

      behavior: {
        drawCard: {count: 1, pay: true},
      },

      metadata: {
        cardNumber: 'Im123',
        renderData: CardRenderer.builder((b) => {
          b.text('Look at the top card of the deck and either buy or discard it.', {size: Size.SMALL, uppercase});
        }),
      },
    });
  }
}
