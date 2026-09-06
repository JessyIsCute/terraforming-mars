import {expect} from 'chai';
import {MutationMarkets} from '../../src/server/mutationmarkets/MutationMarkets';
import {MutationEffects} from '../../src/server/mutationmarkets/MutationEffects';
import {MutationName} from '../../src/common/mutationmarkets/MutationName';
import {CardName} from '../../src/common/cards/CardName';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {fakeCard} from '../TestingUtils';

describe('Nested Mutation', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [/* game */, player] = testGame(2);
  });

  it('grants a discounted copy of the card to hand when played', () => {
    const card = fakeCard({name: CardName.PLANT_EATER, cost: 10, mutations: [{mutation: MutationName.NESTED_MUTATION}]});

    expect(player.cardsInHand).has.lengthOf(0);
    MutationMarkets.maybeGrantNestedCopy(player, card);

    expect(player.cardsInHand).has.lengthOf(1);
    const copy = player.cardsInHand[0];
    expect(copy.name).to.eq(CardName.PLANT_EATER);
    expect(copy).to.not.eq(card); // a genuinely separate instance
    // Plant Eater costs 10: -40% = -4, within [3, 12] -> clamped to -4? no: |−4|=4 is within [3,12], so -4.
    expect(copy.cost).to.eq(10 - 4);
  });

  it('does not grant a copy for a card with no Nested Mutation applied', () => {
    const card = fakeCard({name: CardName.PLANT_EATER, cost: 10});
    MutationMarkets.maybeGrantNestedCopy(player, card);
    expect(player.cardsInHand).has.lengthOf(0);
  });

  it('does not re-grant a copy for an already-spawned copy (no infinite nesting)', () => {
    const spawnedCopy = fakeCard({
      name: CardName.PLANT_EATER,
      cost: 6,
      mutations: [{mutation: MutationName.NESTED_MUTATION, bakedCostDelta: -4}],
    });
    MutationMarkets.maybeGrantNestedCopy(player, spawnedCopy);
    expect(player.cardsInHand).has.lengthOf(0);
  });

  it('grants the copy automatically when the mutated card is actually played', () => {
    const card = fakeCard({name: CardName.PLANT_EATER, cost: 10, mutations: [{mutation: MutationName.NESTED_MUTATION}]});
    player.playCard(card);

    const copy = player.cardsInHand.find((c) => c.name === CardName.PLANT_EATER);
    expect(copy).is.not.undefined;
    expect(copy!.mutations).has.lengthOf(1);
    expect(copy!.mutations![0].bakedCostDelta).to.be.lessThan(0);
  });

  it('MutationEffects.applyCost applies a baked cost delta regardless of the mutation\'s own effect kind', () => {
    const copy = fakeCard({cost: 10, mutations: [{mutation: MutationName.NESTED_MUTATION, bakedCostDelta: -4}]});
    expect(MutationEffects.applyCost(copy, 10)).to.eq(6);
  });

  it('MutationEffects.highlightsFor marks nested + cost for a spawned copy', () => {
    const original = fakeCard({mutations: [{mutation: MutationName.NESTED_MUTATION}]});
    expect(MutationEffects.highlightsFor(original)).to.deep.eq({nested: true});

    const copy = fakeCard({mutations: [{mutation: MutationName.NESTED_MUTATION, bakedCostDelta: -4}]});
    expect(MutationEffects.highlightsFor(copy)).to.deep.eq({nested: true, cost: true});
  });
});
