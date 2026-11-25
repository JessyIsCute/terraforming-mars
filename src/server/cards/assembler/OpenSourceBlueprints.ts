import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {AssemblerExpansion} from '../../assembler/AssemblerExpansion';
import {AssembleSpec} from '../../assembler/AssembleSpec';
import {all} from '../Options';

/** Asked for as complexity 1 (benefits only, no effects or drawbacks), but worth about 30 M€; it takes several benefits, so its complexity ends up higher. */
export const OPEN_SOURCE_BLUEPRINTS_PRESET: AssembleSpec = {maxComplexity: 1, minCost: 28, maxCost: 32};
export const OPEN_SOURCE_BLUEPRINTS_DISCOUNT = 10;

export class OpenSourceBlueprints extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.OPEN_SOURCE_BLUEPRINTS,
      tags: [Tag.EARTH],
      cost: 8,

      metadata: {
        cardNumber: 'AS06',
        renderData: CardRenderer.builder((b) => {
          b.assemble(1, {all}).text('~30').asterix().br;
          b.text('yours:').megacredits(-OPEN_SOURCE_BLUEPRINTS_DISCOUNT);
        }),
        description: 'Every player Assembles a simple card costing about 30 M€ into their hand. Yours costs 10 M€ less.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    for (const p of player.game.players) {
      const preset = p === player ? {...OPEN_SOURCE_BLUEPRINTS_PRESET, costAdjust: -OPEN_SOURCE_BLUEPRINTS_DISCOUNT} : OPEN_SOURCE_BLUEPRINTS_PRESET;
      AssemblerExpansion.assembleIntoHand(p, 1, preset);
    }
    return undefined;
  }
}
