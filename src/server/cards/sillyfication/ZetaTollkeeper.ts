import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {PlayerInput} from '../../PlayerInput';
import {DeltaProjectExpansion, DELTA_TRACK_TAGS} from '../../delta/DeltaProjectExpansion';
import {Size} from '../../../common/cards/render/Size';

/** Re-triggers its owner's current Delta Project position bonus, without moving the
 * marker - both automatically each generation while in the lead, and on demand via its
 * own action. See DeltaProjectExpansion.applyZetaTollkeeperGenerationStart for the
 * generation-start logic. */
export class ZetaTollkeeper extends CorporationCard implements ICorporationCard, IActionCard {
  constructor() {
    super({
      name: CardName.ZETA_TOLLKEEPER,
      tags: [],
      startingMegaCredits: 72,

      behavior: {
        production: {megacredits: -3},
      },

      metadata: {
        cardNumber: 'DP13',
        description: 'You start with 72 M€ and -3 M€ production.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(72).nbsp.production((pb) => pb.minus().megacredits(3)).br;
          b.corpBox('effect-action', (cea) => {
            cea.vSpace(Size.LARGE);
            cea.br;
            cea.effect('At the start of each generation, if you are the furthest along the Delta Project track, gain your current position\'s bonus again (not the Jovian tag or a blue card action).', (e1) => {
              e1.empty().startEffect.plate('Delta track').asterix();
            });
            cea.br;
            cea.action('Gain your current Delta Project position\'s bonus again.', (ab) => {
              ab.empty().startAction.plate('Delta track').asterix();
            });
          });
        }),
      },
    });
  }

  public canAct(player: IPlayer): boolean {
    const position = player.deltaProjectData?.position ?? 0;
    return DELTA_TRACK_TAGS[position] !== undefined;
  }

  public action(player: IPlayer): PlayerInput | undefined {
    const position = player.deltaProjectData?.position ?? 0;
    DeltaProjectExpansion.grantRewardForPosition(player, position, 'primary');
    player.game.log('${0} used Zeta Tollkeeper to gain their Delta Project position bonus again', (b) => b.player(player));
    return undefined;
  }
}
