import {Tag} from '../../../common/cards/Tag';
import {CardType} from '../../../common/cards/CardType';
import {CardResource} from '../../../common/CardResource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {ActionCard} from '../ActionCard';

export class FungalFrenzy extends ActionCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.FUNGAL_FRENZY,
      tags: [Tag.MICROBE],
      cost: 11,
      resourceType: CardResource.MICROBE,

      requirements: {temperature: 8},

      behavior: {
        addResources: {tag: Tag.MICROBE},
      },

      action: {
        or: {
          autoSelect: true,
          behaviors: [
            {
              spend: {resourcesHere: 1},
              production: {plants: 1},
              title: 'Remove 1 microbe to increase your plant production 1 step',
            },
            {
              addResources: 1,
              title: 'Add 1 microbe to this card',
            },
          ],
        },
      },

      metadata: {
        cardNumber: 'X06',
        renderData: CardRenderer.builder((b) => {
          b.arrow().resource(CardResource.MICROBE).nbsp.or().br;
          b.resource(CardResource.MICROBE).arrow().production((pb) => pb.plants(1)).br;

          b.plainText('Action: Add 1 microbe to this card, or remove 1 microbe to raise your plant production 1 step.', /* parens */ true);
          b.br;
          b.resource(CardResource.MICROBE).slash().tag(Tag.MICROBE);
        }),
        description: 'Requires +8°C or warmer. Add 1 microbe to this card for each microbe tag you have, including this.',
      },
    });
  }
}
