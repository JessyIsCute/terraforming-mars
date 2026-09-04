import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardResource} from '../../../common/CardResource';
import {ICard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {Space} from '../../boards/Space';
import {CITY_TILES} from '../../../common/TileType';
import {CardName} from '../../../common/cards/CardName';
import {SelectCard} from '../../inputs/SelectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SimpleDeferredAction} from '../../deferredActions/DeferredAction';
import {Priority} from '../../deferredActions/Priority';
import {CardRenderer} from '../render/CardRenderer';
import {all, digit} from '../Options';

const PREY_CARDS: ReadonlyArray<CardName> = [
  CardName.BIRDS,
  CardName.FISH,
  CardName.SUBZERO_SALT_FISH,
  CardName.VERMIN,
];

export class Cats extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.CATS,
      tags: [Tag.EARTH, Tag.ANIMAL],
      cost: 14,

      resourceType: CardResource.ANIMAL,
      victoryPoints: {resourcesHere: {}, per: 2},

      metadata: {
        cardNumber: 'T12',
        renderData: CardRenderer.builder((b) => {
          b.resource(CardResource.ANIMAL, {amount: 1, digit}).br;
          b.effect('When any city tile is placed, you may remove an animal from Birds, Fish, Sub-zero Salt Fish, or Vermin. Either way, add an animal to this card.', (eb) => {
            eb.city({all}).startEffect.resource(CardResource.ANIMAL);
          });
        }),
        description: 'Starts with 1 animal.',
      },
    });
  }

  public override bespokePlay(player: IPlayer) {
    player.addResourceTo(this, {qty: 1, log: true});
    return undefined;
  }

  private prey(game: IPlayer['game']): Array<{owner: IPlayer, card: ICard}> {
    const found: Array<{owner: IPlayer, card: ICard}> = [];
    for (const owner of game.players) {
      for (const name of PREY_CARDS) {
        const card = owner.playedCards.get(name);
        if (card !== undefined && card.resourceCount > 0) {
          found.push({owner, card});
        }
      }
    }
    return found;
  }

  public onTilePlaced(cardOwner: IPlayer, _activePlayer: IPlayer, space: Space) {
    if (space.tile === undefined || !CITY_TILES.has(space.tile.tileType)) {
      return;
    }
    const game = cardOwner.game;
    const prey = this.prey(game);
    if (prey.length > 0) {
      game.defer(new SimpleDeferredAction(cardOwner, () =>
        new OrOptions(
          new SelectCard('Remove an animal from one of these cards', 'Remove', prey.map((p) => p.card))
            .andThen(([chosen]) => {
              const target = prey.find((p) => p.card === chosen);
              target?.owner.removeResourceFrom(chosen, 1, {removingPlayer: cardOwner, log: true});
              return undefined;
            }),
          new SelectOption('Do not remove an animal'),
        ), Priority.DEFAULT));
    }
    cardOwner.addResourceTo(this, {qty: 1, log: true});
  }
}
