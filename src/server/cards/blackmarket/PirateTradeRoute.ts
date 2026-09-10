import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {Tag} from '../../../common/cards/Tag';
import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardRenderer} from '../render/CardRenderer';
import {digit} from '../Options';

export class PirateTradeRoute extends Card implements IProjectCard {
  constructor(name: CardName = CardName.PIRATE_TRADE_ROUTE) {
    super({
      name,
      type: CardType.AUTOMATED,
      tags: [Tag.SPACE],
      cost: 0,
      reserveUnits: {steel: 1, titanium: 1},
      victoryPoints: -1,

      behavior: {
        stock: {megacredits: 5},
      },

      metadata: {
        cardNumber: 'BM07',
        renderData: CardRenderer.builder((b) => {
          b.minus().steel(1, {digit}).nbsp.minus().titanium(1, {digit}).plainText('Spend 1 steel and 1 titanium.', /** parens */ true).br;
          b.megacredits(5);
        }),
        description: 'Spend 1 steel and 1 titanium. Gain 5 M€ (raid a cargo hauler).',
      },
    });
  }
}

export class PirateTradeRouteII extends PirateTradeRoute {
  constructor() {
    super(CardName.PIRATE_TRADE_ROUTE_II);
  }
}

export class PirateTradeRouteIII extends PirateTradeRoute {
  constructor() {
    super(CardName.PIRATE_TRADE_ROUTE_III);
  }
}
