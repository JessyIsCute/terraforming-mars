import {Tag} from '../../../common/cards/Tag';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {PlayerInput} from '../../PlayerInput';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {DeclareCloneTag} from '../../pathfinders/DeclareCloneTag';
import {ICloneTagCard} from './ICloneTagCard';
import {DrawCards} from '../../deferredActions/DrawCards';

export class PlanetPr extends CorporationCard implements ICorporationCard, ICloneTagCard {
  constructor() {
    super({
      name: CardName.PLANET_PR,
      startingMegaCredits: 40,
      initialActionText: 'Choose a planet tag, then draw a card with that tag',

      metadata: {
        cardNumber: 'Pf00', // Renumber
        description: 'You start with 40 M€.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).br;
          b.corpBox('effect', (ce) => {
            ce.effect('When you raise a planetary track 1 or more steps, raise it 1 additional step, including this time.', (eb) => {
              eb.planetaryTrack().startEffect.planetaryTrack();
            });
            ce.effect('Whenever you trigger a planetary track bonus, also gain a resource depending on the track: ' +
              'Venus → 1 floater, Earth → 2 M€, Mars/Moon → 1 steel, Jovian → 1 titanium.', (eb) => {
              eb.planetaryTrack().startEffect.text('bonus');
            });
          });
        }),
      },
    });
  }

  public cloneTag: Tag = Tag.CLONE;

  public override get tags(): Array<Tag> {
    return [this.cloneTag];
  }

  public override initialAction(player: IPlayer): PlayerInput | undefined {
    player.game.defer(new DeclareCloneTag(player, this))
      .andThen((tag) => {
        player.game.defer(DrawCards.keepAll(player, 1, {tag}));
        return undefined;
      });
    return undefined;
  }
}
