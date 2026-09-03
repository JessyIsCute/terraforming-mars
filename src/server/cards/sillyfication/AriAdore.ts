import {IProjectCard} from '../IProjectCard';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {ALL_TAGS, Tag} from '../../../common/cards/Tag';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {Resource} from '../../../common/Resource';
import {SerializedCard} from '../../SerializedCard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';

// The real tags a player can accumulate (no wild / event / clone bookkeeping tags).
const COUNTABLE_TAGS = ALL_TAGS.filter((tag) => tag !== Tag.WILD && tag !== Tag.EVENT && tag !== Tag.CLONE);

// A knock-off Aridor.
export class AriAdore extends Card implements IProjectCard {
  public allTags = new Set<Tag>();

  constructor() {
    super({
      type: CardType.ACTIVE,
      name: CardName.ARI_ADORE,
      cost: 28,
      victoryPoints: 2,

      metadata: {
        cardNumber: 'X39',
        renderData: CardRenderer.builder((b) => {
          b.effect('When you get a new type of tag in play [event cards do not count], gain 1 M€ for each tag you have.', (eb) => {
            eb.diverseTag().startEffect.megacredits(1).slash().wild(1);
          });
        }),
      },
    });
  }

  private tagsForCard(card: ICard): Array<Tag> {
    if (card.type === CardType.EVENT) {
      return [];
    }
    return card.tags.filter((tag) => tag !== Tag.WILD);
  }

  public override bespokePlay(player: IPlayer) {
    for (const card of player.tableau) {
      for (const tag of this.tagsForCard(card)) {
        this.allTags.add(tag);
      }
    }
    return undefined;
  }

  private processTags(player: IPlayer, tags: ReadonlyArray<Tag>) {
    for (const tag of tags) {
      const currentSize = this.allTags.size;
      this.allTags.add(tag);
      if (this.allTags.size > currentSize) {
        player.stock.add(Resource.MEGACREDITS, player.tags.multipleCount(COUNTABLE_TAGS), {log: true});
      }
    }
  }

  public onNonCardTagAdded(player: IPlayer, tag: Tag) {
    this.processTags(player, [tag]);
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    this.processTags(player, this.tagsForCard(card));
  }

  public serialize(serialized: SerializedCard) {
    serialized.allTags = Array.from(this.allTags);
  }

  public deserialize(serialized: SerializedCard) {
    this.allTags = new Set(serialized.allTags);
  }
}
