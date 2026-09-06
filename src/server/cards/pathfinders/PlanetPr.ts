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
import {CardResource} from '../../../common/CardResource';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';

export class PlanetPr extends CorporationCard implements ICorporationCard, ICloneTagCard {
  constructor() {
    super({
      name: CardName.PLANET_PR,
      startingMegaCredits: 32,
      initialActionText: 'Choose a planet tag, then draw a card with that tag',

      behavior: {
        stock: {steel: 2, titanium: 1},
      },

      metadata: {
        cardNumber: 'Pf00', // Renumber
        description: 'You start with 32 M€, 2 steel, and 1 titanium.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(32).nbsp.steel(2, {digit}).nbsp.titanium(1, {digit}).br;
          b.corpBox('effect', (ce) => {
            ce.effect('When you raise a planetary track 1 or more steps, raise it 1 additional step, including this time.', (eb) => {
              eb.planetaryTrack().startEffect.planetaryTrack();
            });
            ce.br;
            ce.effect('Whenever you trigger the Venus track\'s bonus, also gain 1 floater.', (eb) => {
              eb.tag(Tag.VENUS, {size: Size.SMALL}).startEffect.resource(CardResource.FLOATER, {size: Size.SMALL});
            });
            ce.effect('Whenever you trigger the Earth track\'s bonus, also gain 2 M€.', (eb) => {
              eb.tag(Tag.EARTH, {size: Size.SMALL}).startEffect.megacredits(2, {size: Size.SMALL});
            });
            ce.br;
            ce.effect('Whenever you trigger the Mars or Moon track\'s bonus, also gain 1 steel.', (eb) => {
              eb.tag(Tag.MARS, {size: Size.SMALL}).nbsp.tag(Tag.MOON, {size: Size.SMALL}).startEffect.steel(1, {size: Size.SMALL});
            });
            ce.effect('Whenever you trigger the Jovian track\'s bonus, also gain 1 titanium.', (eb) => {
              eb.tag(Tag.JOVIAN, {size: Size.SMALL}).startEffect.titanium(1, {size: Size.SMALL});
            });
            ce.br;
            ce.effect('At the start of each generation, whichever planetary track is furthest along (and hasn\'t finished) drops back 3 steps.', (eb) => {
              eb.planetaryTrack().startEffect.planetaryTrack().minus().text('3');
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
