import {CorporationCard} from '../corporation/CorporationCard';
import {Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {all} from '../Options';
import {Board} from '../../boards/Board';
import {ICorporationCard} from '../corporation/ICorporationCard';

export class LakefrontResorts extends CorporationCard implements ICorporationCard {
  constructor() {
    super({
      name: CardName.LAKEFRONT_RESORTS,
      tags: [Tag.BUILDING],
      startingMegaCredits: 54,

      metadata: {
        cardNumber: 'R38',
        description: 'You start with 54 M€.',
        renderData: CardRenderer.builder((b) => {
          b.br.br.br;
          b.megacredits(54);
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.MEDIUM);
            ce.effect('When any ocean tile is placed, gain 2 heat. Your bonus for placing adjacent to oceans is 3M€ instead of 2 M€.', (eb) => {
              eb.oceans(1, {size: Size.SMALL, all}).colon().heat(2);
              eb.emptyTile('normal', {size: Size.SMALL}).oceans(1, {size: Size.SMALL});
              eb.startEffect.megacredits(3);
            });
          });
        }),
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.oceanBonus = 3;
    return undefined;
  }

  public override onDiscard(player: IPlayer) {
    player.oceanBonus = 2;
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (Board.isUncoveredOceanSpace(space)) {
      cardOwner.stock.add(Resource.HEAT, 2, {log: true});
    }
  }
}
