import {Tag} from '../../../common/cards/Tag';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CardResource} from '../../../common/CardResource';
import {Resource} from '../../../common/Resource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {AddResourcesToCard} from '../../deferredActions/AddResourcesToCard';
import {Priority} from '../../deferredActions/Priority';
import {Size} from '../../../common/cards/render/Size';
import {digit} from '../Options';

type ResourceKey = 'steel' | 'titanium' | 'energy' | 'plants' | 'megacredits' | 'microbe' | 'animal' | 'data' | 'floater';

type Rule = {
  tags: ReadonlyArray<Tag>,
  key: ResourceKey,
  label: string,
};

const RULES: ReadonlyArray<Rule> = [
  {tags: [Tag.BUILDING], key: 'steel', label: 'steel'},
  {tags: [Tag.SPACE], key: 'titanium', label: 'titanium'},
  {tags: [Tag.POWER], key: 'energy', label: 'energy'},
  {tags: [Tag.PLANT], key: 'plants', label: 'plants'},
  {tags: [Tag.MICROBE], key: 'microbe', label: 'a microbe'},
  {tags: [Tag.ANIMAL], key: 'animal', label: 'an animal'},
  {tags: [Tag.SCIENCE], key: 'megacredits', label: 'M€'},
  {tags: [Tag.MARS], key: 'data', label: 'data'},
  {tags: [Tag.JOVIAN, Tag.VENUS], key: 'floater', label: 'a floater'},
];

const STANDARD_RESOURCE: Partial<Record<ResourceKey, Resource>> = {
  steel: Resource.STEEL,
  titanium: Resource.TITANIUM,
  energy: Resource.ENERGY,
  plants: Resource.PLANTS,
  megacredits: Resource.MEGACREDITS,
};

const CARD_RESOURCE: Partial<Record<ResourceKey, CardResource>> = {
  microbe: CardResource.MICROBE,
  animal: CardResource.ANIMAL,
  data: CardResource.DATA,
  floater: CardResource.FLOATER,
};

const MAX_PER_TYPE = 2;

/** Holds up to 2 units each of 9 different resource types at once - a different type per
 * tag (Building/steel, Space/titanium, Power/energy, Plant/plants, Microbe, Animal,
 * Science/M€, Mars/data, Jovian-or-Venus/floater). Whenever a played card carries one of
 * these tags, its owner either banks a unit of the matching type on this card, or (once
 * this card holds at least one) cashes one out - onto production for the five
 * stock-resource types, or onto an eligible card for the four card-resource types. */
export class InSpire extends CorporationCard implements ICorporationCard {
  public data: Partial<Record<ResourceKey, number>> = {};

  constructor() {
    super({
      name: CardName.IN_SPIRE,
      tags: [],
      startingMegaCredits: 43,

      behavior: {
        production: {megacredits: 3},
      },

      metadata: {
        cardNumber: 'PfC98', // Renumber
        description: 'You start with 43 M€ and 3 M€ production. When you play a given tag, put a corresponding resource on this card, or (if it already has one) take a corresponding resource from this card and put it on a card you play or on the production board - or, if you cannot, on any other eligible card. You can keep at most 2 resources of a given type on this card.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(43, {digit}).nbsp.production((pb) => pb.megacredits(3)).br;
          b.corpBox('effect', (ce) => {
            ce.vSpace(Size.LARGE);
            ce.br;
            ce.tag(Tag.BUILDING, {size: Size.SMALL}).colon().steel(1, {size: Size.SMALL});
            ce.br;
            ce.tag(Tag.SPACE, {size: Size.SMALL}).colon().titanium(1, {size: Size.SMALL});
            ce.br;
            ce.tag(Tag.POWER, {size: Size.SMALL}).colon().energy(1, {size: Size.SMALL});
            ce.br;
            ce.tag(Tag.PLANT, {size: Size.SMALL}).colon().plants(1, {size: Size.SMALL});
            ce.br;
            ce.tag(Tag.MICROBE, {size: Size.SMALL}).colon().resource(CardResource.MICROBE, {size: Size.SMALL});
            ce.br;
            ce.tag(Tag.ANIMAL, {size: Size.SMALL}).colon().resource(CardResource.ANIMAL, {size: Size.SMALL});
            ce.br;
            ce.tag(Tag.SCIENCE, {size: Size.SMALL}).colon().megacredits(1, {size: Size.SMALL});
            ce.br;
            ce.tag(Tag.MARS, {size: Size.SMALL}).colon().resource(CardResource.DATA, {size: Size.SMALL});
            ce.br;
            ce.tag(Tag.JOVIAN, {size: Size.SMALL}).nbsp.or().nbsp.tag(Tag.VENUS, {size: Size.SMALL}).colon().resource(CardResource.FLOATER, {size: Size.SMALL});
          });
        }),
      },
    });
  }

  private getCounts(): Partial<Record<ResourceKey, number>> {
    return this.data;
  }

  private getStored(key: ResourceKey): number {
    return this.getCounts()[key] ?? 0;
  }

  private setStored(key: ResourceKey, value: number): void {
    this.data = {...this.getCounts(), [key]: value};
  }

  private canRedistribute(player: IPlayer, key: ResourceKey): boolean {
    const cardResource = CARD_RESOURCE[key];
    if (cardResource !== undefined) {
      return player.getResourceCards(cardResource).length > 0;
    }
    return true;
  }

  private addStored(player: IPlayer, rule: Rule): void {
    this.setStored(rule.key, this.getStored(rule.key) + 1);
    player.game.log('${0} added ${1} to InSpire', (b) => b.player(player).string(rule.label));
  }

  private redistribute(player: IPlayer, rule: Rule): void {
    this.setStored(rule.key, this.getStored(rule.key) - 1);
    player.game.log('${0} took ${1} from InSpire', (b) => b.player(player).string(rule.label));

    const standardResource = STANDARD_RESOURCE[rule.key];
    if (standardResource !== undefined) {
      player.production.add(standardResource, 1, {log: true});
      return;
    }
    const cardResource = CARD_RESOURCE[rule.key];
    if (cardResource !== undefined) {
      player.game.defer(new AddResourcesToCard(player, cardResource, {count: 1}));
    }
  }

  private triggerRule(player: IPlayer, rule: Rule): void {
    player.defer(() => {
      const stored = this.getStored(rule.key);
      const canAdd = stored < MAX_PER_TYPE;
      const canTake = stored > 0 && this.canRedistribute(player, rule.key);

      if (canAdd && !canTake) {
        this.addStored(player, rule);
        return undefined;
      }
      if (!canAdd && canTake) {
        this.redistribute(player, rule);
        return undefined;
      }
      if (!canAdd && !canTake) {
        return undefined;
      }
      return new OrOptions(
        new SelectOption(`Add ${rule.label} to InSpire`, 'Add').andThen(() => {
          this.addStored(player, rule);
          return undefined;
        }),
        new SelectOption(`Take ${rule.label} from InSpire`, 'Take').andThen(() => {
          this.redistribute(player, rule);
          return undefined;
        }),
      ).setTitle('Select an option for InSpire');
    }, Priority.DEFAULT);
  }

  public onCardPlayed(player: IPlayer, card: ICard): void {
    for (const rule of RULES) {
      const count = player.tags.cardTagCount(card, [...rule.tags]);
      for (let i = 0; i < count; i++) {
        this.triggerRule(player, rule);
      }
    }
  }
}
