import {CardName} from '../../../common/cards/CardName';
import {CardType} from '../../../common/cards/CardType';
import {CardRenderer} from '../render/CardRenderer';
import {Size} from '../../../common/cards/render/Size';
import {IProjectCard} from '../IProjectCard';
import {IPlayer, CanAffordOptions} from '../../IPlayer';
import {SilverCard} from './SilverCard';

/**
 * High Orbit (fan): Planetary Outpost. On play: become the first player. Only one copy of
 * Planetary Outpost can be played per generation, across all players -- since this is a
 * "Silver" card with 5 separate physical copies in the deck (see
 * CardFactorySpec.copiesInDeck), that constraint can't be tracked on a single card instance.
 * Instead it's tracked game-wide, by CardName, in the new `IGame.cardsPlayedThisGeneration`
 * set (see Game.ts, reset each generation in `startGeneration`).
 *
 * No VP on this card -- the source material shows an ambiguous icon but no confirming VP text.
 */
export class PlanetaryOutpost extends SilverCard implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.PLANETARY_OUTPOST,
      cost: 4,

      metadata: {
        cardNumber: 'HO06',
        renderData: CardRenderer.builder((b) => {
          b.firstPlayer().br;
          b.text('Only 1 Planetary Outpost may be played per generation.', {size: Size.SMALL});
        }),
        description: 'Become the first player. Only 1 copy of Planetary Outpost may be played per generation, across all players.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer, canAffordOptions: CanAffordOptions): boolean {
    if (!super.bespokeCanPlay(player, canAffordOptions)) {
      return false;
    }
    return !player.game.cardsPlayedThisGeneration.has(this.name);
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    game.cardsPlayedThisGeneration.add(this.name);
    game.overrideFirstPlayer(player);
    game.log('${0} played ${1} and became the first player', (b) => b.player(player).card(this));
    return undefined;
  }
}
