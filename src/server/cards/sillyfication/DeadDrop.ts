import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {IPlayer} from '../../IPlayer';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {DiscardCards} from '../../deferredActions/DiscardCards';

/**
 * An ordinary-looking, ordinarily-playable event - but Cutout Networks (see CutoutNetworks.ts)
 * seeds extra copies of it into the deck at game start (and can slip more in near the top with
 * its action), turning it into a shared trigger every player can stumble into. Known gap:
 * multiple simultaneous copies of this card can exist across different players' tableaus at
 * once, which `Game.getCardPlayerOrThrow`/`getCardPlayerOrUndefined` (a global name -> owner
 * lookup) can't disambiguate - safe here only because nothing about this card's own effect, or
 * Cutout Networks', ever needs that lookup.
 */
export class DeadDrop extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.EVENT,
      name: CardName.DEAD_DROP,
      cost: 0,

      metadata: {
        cardNumber: 'X50', // Renumber
        renderData: CardRenderer.builder((b) => {
          b.minus().cards(1).colon().cards(1).slash().megacredits(5);
        }),
        description: 'Discard a card. Then draw a card, or gain 5 M€.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return player.cardsInHand.length > 0;
  }

  public override bespokePlay(player: IPlayer) {
    // DiscardCards.andThen callbacks are fire-and-forget (its own internal .andThen wrappers
    // discard whatever they return) - the follow-up choice has to be queued as its own
    // deferred action rather than returned directly here.
    player.game.defer(new DiscardCards(player, 1, 1)).andThen(() => {
      player.defer(() => new OrOptions(
        new SelectOption('Draw a card', 'Draw').andThen(() => {
          player.drawCard();
          return undefined;
        }),
        new SelectOption('Gain 5 M€', 'Gain M€').andThen(() => {
          player.stock.add(Resource.MEGACREDITS, 5, {log: true});
          return undefined;
        }),
      ));
      return undefined;
    });
    return undefined;
  }
}
