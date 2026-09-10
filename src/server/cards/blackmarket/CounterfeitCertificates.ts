import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';

export class CounterfeitCertificates extends Card implements IProjectCard {
  constructor(name: CardName = CardName.COUNTERFEIT_CERTIFICATES) {
    super({
      name,
      type: CardType.EVENT,
      tags: [Tag.EARTH],
      cost: 0,
      victoryPoints: -1,

      behavior: {
        tr: 3,
      },

      metadata: {
        cardNumber: 'BM05',
        renderData: CardRenderer.builder((b) => {
          b.tr(3);
        }),
        description: 'Gain 3 TR (forged terraforming credentials).',
      },
    });
  }
}

export class CounterfeitCertificatesII extends CounterfeitCertificates {
  constructor() {
    super(CardName.COUNTERFEIT_CERTIFICATES_II);
  }
}

export class CounterfeitCertificatesIII extends CounterfeitCertificates {
  constructor() {
    super(CardName.COUNTERFEIT_CERTIFICATES_III);
  }
}
