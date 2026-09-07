import {StandardActionCard} from '../../StandardActionCard';
import {CardName} from '../../../../common/cards/CardName';
import {CardType} from '../../../../common/cards/CardType';
import {CardRenderer} from '../../render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {ICard, IActionCard, isIActionCard} from '../../ICard';
import {OrOptions} from '../../../inputs/OrOptions';
import {SelectOption} from '../../../inputs/SelectOption';
import {ConglomeratesExpansion} from '../../../conglomerates/ConglomeratesExpansion';

export class FacilitySharing extends StandardActionCard {
  constructor() {
    super({
      name: CardName.FACILITY_SHARING,
      metadata: {
        cardNumber: 'TA2',
        renderData: CardRenderer.builder((b) => {
          b.standardProject('Use one of your teammate\'s unused, non-corporation action cards as if it were yours.', (eb) => {
            eb.empty().startAction.text('Cost: 1 Coordination');
          });
        }),
      },
    });
  }

  private currentCost(player: IPlayer): number {
    return ConglomeratesExpansion.getTeamActionCost(player, 'facilitySharing');
  }

  private sharableCards(player: IPlayer, teammate: IPlayer): Array<ICard & IActionCard> {
    const result: Array<ICard & IActionCard> = [];
    for (const card of teammate.tableau) {
      if (card.type !== CardType.ACTIVE) {
        continue;
      }
      if (teammate.actionsThisGeneration.has(card.name)) {
        continue;
      }
      if (isIActionCard(card) && card.canAct(player)) {
        result.push(card);
      }
    }
    return result;
  }

  public canAct(player: IPlayer): boolean {
    if (player.conglomeratesData.coordination < this.currentCost(player)) {
      return false;
    }
    return player.teammates().some((teammate) => this.sharableCards(player, teammate).length > 0);
  }

  public action(player: IPlayer) {
    const options: Array<SelectOption> = [];
    for (const teammate of player.teammates()) {
      for (const card of this.sharableCards(player, teammate)) {
        options.push(
          new SelectOption(card.name, 'Use').andThen(() => {
            this.actionUsed(player);
            ConglomeratesExpansion.spendCoordination(player, this.currentCost(player), {log: true});
            const result = card.action(player);
            teammate.actionsThisGeneration.add(card.name);
            player.game.log('${0} used ${1}\'s ${2} through Facility Sharing', (b) => b.player(player).player(teammate).card(card));
            ConglomeratesExpansion.increaseTeamActionCost(player, 'facilitySharing');
            return result;
          }),
        );
      }
    }
    return new OrOptions(...options).setTitle('Select a teammate\'s facility to use').reduce();
  }
}
