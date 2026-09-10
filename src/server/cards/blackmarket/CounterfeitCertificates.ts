import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class CounterfeitCertificates extends Card implements IProjectCard {
  constructor(name: CardName = CardName.COUNTERFEIT_CERTIFICATES) {
    super({
      name,
      type: CardType.EVENT,
      tags: [Tag.EARTH],
      cost: 2,
      reserveUnits: {heat: 1},
      victoryPoints: -1,

      behavior: {
        tr: 2,
      },

      metadata: {
        cardNumber: 'BM05',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(1, {digit}).plainText('Spend 1 heat.', /** parens */ true).br;
          b.tr(2);
        }),
        description: 'Spend 1 heat. Gain 2 TR (forged terraforming credentials).',
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
