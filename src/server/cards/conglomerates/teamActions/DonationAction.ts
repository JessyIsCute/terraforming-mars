import {StandardActionCard} from '../../StandardActionCard';
import {CardName} from '../../../../common/cards/CardName';
import {CardRenderer} from '../../render/CardRenderer';
import {IPlayer} from '../../../IPlayer';
import {Resource} from '../../../../common/Resource';
import {OrOptions} from '../../../inputs/OrOptions';
import {SelectOption} from '../../../inputs/SelectOption';
import {ConglomeratesExpansion} from '../../../conglomerates/ConglomeratesExpansion';

const DONATABLE_RESOURCES = [Resource.STEEL, Resource.TITANIUM, Resource.PLANTS, Resource.ENERGY, Resource.HEAT] as const;
const DONATION_MC = 4;
const DONATION_RESOURCE_AMOUNT = 2;

const RESOURCE_LABEL: Record<typeof DONATABLE_RESOURCES[number], string> = {
  [Resource.STEEL]: 'steel',
  [Resource.TITANIUM]: 'titanium',
  [Resource.PLANTS]: 'plants',
  [Resource.ENERGY]: 'energy',
  [Resource.HEAT]: 'heat',
};

export class DonationAction extends StandardActionCard {
  constructor() {
    super({
      name: CardName.TEAM_DONATION,
      metadata: {
        cardNumber: 'TA3',
        renderData: CardRenderer.builder((b) => {
          b.standardProject(`Send ${DONATION_MC} M€ and ${DONATION_RESOURCE_AMOUNT} of a standard resource to your teammate.`, (eb) => {
            eb.empty().startAction.text('Cost: 1 Coordination');
          });
        }),
      },
    });
  }

  private currentCost(player: IPlayer): number {
    return ConglomeratesExpansion.getTeamActionCost(player, 'donation');
  }

  private donatableResources(player: IPlayer): ReadonlyArray<typeof DONATABLE_RESOURCES[number]> {
    return DONATABLE_RESOURCES.filter((resource) => player.stock.get(resource) >= DONATION_RESOURCE_AMOUNT);
  }

  public canAct(player: IPlayer): boolean {
    if (player.teammates().length === 0) {
      return false;
    }
    if (player.conglomeratesData.coordination < this.currentCost(player)) {
      return false;
    }
    if (player.megaCredits < DONATION_MC) {
      return false;
    }
    return this.donatableResources(player).length > 0;
  }

  public action(player: IPlayer) {
    const teammate = player.teammates()[0];
    const options = this.donatableResources(player).map((resource) =>
      new SelectOption(`Send ${DONATION_RESOURCE_AMOUNT} ${RESOURCE_LABEL[resource]}`, 'Send').andThen(() => {
        this.actionUsed(player);
        ConglomeratesExpansion.spendCoordination(player, this.currentCost(player), {log: true});
        player.stock.deduct(Resource.MEGACREDITS, DONATION_MC, {log: true});
        player.stock.deduct(resource, DONATION_RESOURCE_AMOUNT, {log: true});
        teammate.stock.add(Resource.MEGACREDITS, DONATION_MC, {log: true, from: {player}});
        teammate.stock.add(resource, DONATION_RESOURCE_AMOUNT, {log: true, from: {player}});
        ConglomeratesExpansion.increaseTeamActionCost(player, 'donation');
        return undefined;
      }),
    );
    return new OrOptions(...options).setTitle('Select a resource to send with your donation').reduce();
  }
}
