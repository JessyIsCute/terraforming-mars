import {StandardActionCard} from '../../StandardActionCard';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {SelectCard} from '../../../inputs/SelectCard';
import {inplaceRemove} from '../../../../common/utils/utils';
import {ConglomeratesExpansion} from '../../../conglomerates/ConglomeratesExpansion';

export class GivePatent extends StandardActionCard {
  constructor() {
    super({
      name: CardName.GIVE_PATENT,
      metadata: {
        cardNumber: 'TA1',
        renderData: CardRenderer.builder((b) => {
          b.standardProject('Give a card from your hand to your teammate.', (eb) => {
            eb.empty().startAction.text('Cost: 2 Coordination');
          });
        }),
      },
    });
  }

  private currentCost(player: IPlayer): number {
    return ConglomeratesExpansion.getTeamActionCost(player, 'givePatent');
  }

  public canAct(player: IPlayer): boolean {
    if (player.teammates().length === 0) {
      return false;
    }
    if (player.cardsInHand.length === 0) {
      return false;
    }
    return player.conglomeratesData.coordination >= this.currentCost(player);
  }

  public action(player: IPlayer) {
    const teammate = player.teammates()[0];
    return new SelectCard(
      'Select a card to give to your teammate',
      'Give',
      player.cardsInHand,
    ).andThen(([card]) => {
      this.actionUsed(player);
      ConglomeratesExpansion.spendCoordination(player, this.currentCost(player), {log: true});
      inplaceRemove(player.cardsInHand, card);
      teammate.cardsInHand.push(card);
      player.game.log('${0} gave ${1} to ${2}', (b) => b.player(player).card(card).player(teammate));
      ConglomeratesExpansion.increaseTeamActionCost(player, 'givePatent');
      return undefined;
    });
  }
}
