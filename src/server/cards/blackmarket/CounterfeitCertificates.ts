import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class CounterfeitCertificates extends Card implements IProjectCard {
  constructor(name: CardName = CardName.COUNTERFEIT_CERTIFICATES, heat: number = 1) {
    super({
      name,
      type: CardType.EVENT,
      tags: [Tag.EARTH],
      cost: 2,
      reserveUnits: {heat},
      victoryPoints: -2,

      behavior: {
        tr: 3,
      },

      metadata: {
        cardNumber: 'BM05',
        renderData: CardRenderer.builder((b) => {
          b.minus().heat(heat, {digit}).plainText(`Spend ${heat} heat.`, /** parens */ true).br;
          b.tr(3);
        }),
        description: `Spend ${heat} heat. Gain 3 TR (forged terraforming credentials).`,
      },
    });
  }
}

export class CounterfeitCertificatesII extends CounterfeitCertificates {
  constructor() {
    super(CardName.COUNTERFEIT_CERTIFICATES_II, 2);
  }
}

export class CounterfeitCertificatesIII extends CounterfeitCertificates {
  constructor() {
    super(CardName.COUNTERFEIT_CERTIFICATES_III, 3);
  }
}

export class CounterfeitCertificatesIV extends CounterfeitCertificates {
  constructor() {
    super(CardName.COUNTERFEIT_CERTIFICATES_IV, 4);
  }
}
