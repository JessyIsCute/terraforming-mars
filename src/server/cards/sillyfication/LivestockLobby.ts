import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardResource} from '../../../common/CardResource';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {all} from '../Options';

export class LivestockLobby extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.LIVESTOCK_LOBBY,
      cost: 9,

      metadata: {
        cardNumber: 'X42',
        renderData: CardRenderer.builder((b) => {
          b.effect('When any player adds an animal to a card, that player gains 1 M€ and you gain 1 plant.', (eb) => {
            eb.resource(CardResource.ANIMAL, {all}).asterix().startEffect.megacredits(1, {all}).plants(1);
          });
        }),
      },
    });
  }

  public onResourceAddedByAnyPlayer(cardOwner: IPlayer, activePlayer: IPlayer, card: ICard, count: number) {
    if (card.resourceType === CardResource.ANIMAL) {
      activePlayer.stock.add(Resource.MEGACREDITS, count, {log: true});
      cardOwner.stock.add(Resource.PLANTS, count, {log: true});
    }
  }
}
