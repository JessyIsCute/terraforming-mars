import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../ICard';
import {IProjectCard} from '../IProjectCard';
import {CardResource} from '../../../common/CardResource';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {SelectCard} from '../../inputs/SelectCard';
import {PlayerInput} from '../../PlayerInput';
import {Priority} from '../../deferredActions/Priority';
import {MutationName} from '../../../common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '../../../common/mutationmarkets/MutationDefinitions';
import {describeMutationEffect} from '../../../common/mutationmarkets/describeMutation';
import {MutationEffects} from '../../mutationmarkets/MutationEffects';

// A science-conference corp in the mold of Olympus Conference: every Science or Microbe
// tag played (including this card's own) either banks a science resource here, or --
// once 2 are banked -- spends them to mutate one of the cards in the player's OWN hand
// (mirroring Blacklab Cartel's Infect, which likewise targets a card in hand, not
// something already on the table -- a mutation applied there behaves exactly like one
// won from the market: MutationEffects' cost/tag/type effects are live getters, and any
// "on play" grant fires normally, for real, whenever the player eventually plays it).
// Deliberately effect-triggered, not action-based, and unrelated to Underworld
// corruption, as a positive counterpart to Blacklab Cartel's opponent-targeting Infect.
export class HelixConference extends CorporationCard implements ICorporationCard {
  // A representative spread across the three effect families a mutation can have
  // (addRandomTag / costPercent+VP / convertType) -- arbitrary otherwise, since every
  // mutation works correctly on a card still in hand.
  private static readonly MUTATION_CHOICES: ReadonlyArray<MutationName> = [
    MutationName.SCIENCE_PATRON,
    MutationName.GIGANTIC_UNDERTAKINGS,
    MutationName.BUILDING_MOGUL,
  ];

  constructor() {
    super({
      name: CardName.HELIX_CONFERENCE,
      tags: [Tag.SCIENCE],
      startingMegaCredits: 40,
      resourceType: CardResource.SCIENCE,

      metadata: {
        cardNumber: 'MM02',
        description: 'You start with 40 M€. When you play a science or microbe tag, including this, ' +
          'either add a science resource to this card, or remove 2 science resources from this card ' +
          'to apply one of 3 mutations to a card in your hand.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(40).br;
          b.tag(Tag.SCIENCE).tag(Tag.MICROBE).colon().resource(CardResource.SCIENCE).br;
          b.or().br;
          b.minus().resource(CardResource.SCIENCE, 2).asterix();
        }),
      },
    });
  }

  public onCardPlayed(player: IPlayer, card: ICard) {
    const count = player.tags.cardTagCount(card, [Tag.SCIENCE, Tag.MICROBE]);
    this.onQualifyingTagAdded(player, count);
  }

  public onNonCardTagAdded(player: IPlayer, tag: Tag) {
    if (tag === Tag.SCIENCE || tag === Tag.MICROBE) {
      this.onQualifyingTagAdded(player, 1);
    }
  }

  private onQualifyingTagAdded(player: IPlayer, count: number) {
    for (let i = 0; i < count; i++) {
      player.defer(() => this.offerChoice(player), Priority.OLYMPUS_CONFERENCE);
    }
  }

  private offerChoice(player: IPlayer): PlayerInput | undefined {
    // Can't spend 2 yet -- no meaningful choice, so just bank this one (mirrors Olympus
    // Conference's own resourceCount === 0 fast path).
    if (this.resourceCount < 2) {
      player.addResourceTo(this, {log: true});
      return undefined;
    }
    return new OrOptions(
      new SelectOption('Remove 2 science resources from this card to mutate a card in your hand', 'Mutate').andThen(() => {
        player.removeResourceFrom(this, 2, {log: true});
        return this.selectCardToMutate(player);
      }),
      new SelectOption('Add a science resource to this card', 'Add resource').andThen(() => {
        player.addResourceTo(this, {log: true});
        return undefined;
      }),
    ).setTitle('Select an option for Helix Conference');
  }

  private selectCardToMutate(player: IPlayer): PlayerInput | undefined {
    const candidates = player.cardsInHand;
    if (candidates.length === 0) {
      return undefined;
    }
    return new SelectCard('Select a card in your hand to mutate', 'Mutate', candidates).andThen(([card]) => {
      return this.selectMutation(player, card);
    });
  }

  private selectMutation(player: IPlayer, card: IProjectCard): PlayerInput {
    const game = player.game;
    const orOptions = new OrOptions();
    for (const mutation of HelixConference.MUTATION_CHOICES) {
      const definition = MUTATION_DEFINITIONS[mutation];
      orOptions.options.push(
        new SelectOption(`${definition.prefix}: ${describeMutationEffect(definition.effect)}`, 'Mutate').andThen(() => {
          const applied = MutationEffects.apply(card, mutation, game.rng);
          card.mutations = card.mutations === undefined ? [applied] : [...card.mutations, applied];
          game.log('${0} mutated ${1} with ${2}', (b) => b.player(player).card(card).string(definition.name));
          return undefined;
        }));
    }
    return orOptions.setTitle('Select a mutation to apply');
  }
}
