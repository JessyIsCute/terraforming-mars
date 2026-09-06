import {expect} from 'chai';
import {MutationEffects} from '../../src/server/mutationmarkets/MutationEffects';
import {MutationName} from '../../src/common/mutationmarkets/MutationName';
import {Tag} from '../../src/common/cards/Tag';
import {fakeCard} from '../TestingUtils';
import {SeededRandom} from '../../src/common/utils/Random';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';

describe('MutationEffects', () => {
  const rng = new SeededRandom(1234);

  describe('applyCost', () => {
    it('leaves an unmutated card untouched', () => {
      const card = fakeCard({cost: 14});
      expect(MutationEffects.applyCost(card, 14)).to.eq(14);
    });

    it('Gigantic Undertakings adds 50% of cost, clamped to [3, 12]', () => {
      const mid = fakeCard({cost: 14, mutations: [{mutation: MutationName.GIGANTIC_UNDERTAKINGS}]});
      expect(MutationEffects.applyCost(mid, 14)).to.eq(21); // +7

      const cheap = fakeCard({cost: 4, mutations: [{mutation: MutationName.GIGANTIC_UNDERTAKINGS}]});
      expect(MutationEffects.applyCost(cheap, 4)).to.eq(7); // +2 -> clamped to +3

      const expensive = fakeCard({cost: 40, mutations: [{mutation: MutationName.GIGANTIC_UNDERTAKINGS}]});
      expect(MutationEffects.applyCost(expensive, 40)).to.eq(52); // +20 -> clamped to +12
    });

    it('Mini Mutation subtracts 30% of cost, clamped to [3, 12], never below 0', () => {
      const mid = fakeCard({cost: 10, mutations: [{mutation: MutationName.MINI_MUTATION}]});
      expect(MutationEffects.applyCost(mid, 10)).to.eq(7); // -3

      const cheap = fakeCard({cost: 4, mutations: [{mutation: MutationName.MINI_MUTATION}]});
      expect(MutationEffects.applyCost(cheap, 4)).to.eq(1); // -1.2 -> clamped to -3

      const veryCheap = fakeCard({cost: 2, mutations: [{mutation: MutationName.MINI_MUTATION}]});
      expect(MutationEffects.applyCost(veryCheap, 2)).to.eq(0); // -3 would go negative, floored at 0
    });

    it('applies both mutations independently against the base cost when a card has two', () => {
      const card = fakeCard({
        cost: 14,
        mutations: [{mutation: MutationName.GIGANTIC_UNDERTAKINGS}, {mutation: MutationName.MINI_MUTATION}],
      });
      // Gigantic: +round(14*0.5)=+7 (within [3,12]). Mini: -round(14*0.3)=-4 (within [3,12]).
      const expected = 14 + 7 - 4;
      expect(MutationEffects.applyCost(card, 14)).to.eq(expected);
    });
  });

  describe('applyTags', () => {
    it('leaves tags untouched with no mutations', () => {
      const card = fakeCard({tags: [Tag.SCIENCE]});
      expect(MutationEffects.applyTags(card, [Tag.SCIENCE])).to.deep.eq([Tag.SCIENCE]);
    });

    it('adds the chosen tag from Tag Diversifier', () => {
      const card = fakeCard({tags: [Tag.SCIENCE], mutations: [{mutation: MutationName.TAG_DIVERSIFIER, chosenTag: Tag.PLANT}]});
      expect(MutationEffects.applyTags(card, [Tag.SCIENCE])).to.deep.eq([Tag.SCIENCE, Tag.PLANT]);
    });

    it('does not duplicate a chosen tag the card already has', () => {
      const card = fakeCard({tags: [Tag.SCIENCE, Tag.PLANT], mutations: [{mutation: MutationName.TAG_DIVERSIFIER, chosenTag: Tag.PLANT}]});
      expect(MutationEffects.applyTags(card, [Tag.SCIENCE, Tag.PLANT])).to.deep.eq([Tag.SCIENCE, Tag.PLANT]);
    });
  });

  describe('victoryPointsBonus', () => {
    let player: TestPlayer;
    beforeEach(() => {
      [/* game */, player] = testGame(2);
    });

    it('is 0 with no mutations', () => {
      const card = fakeCard({cost: 14, baseCost: 14});
      expect(MutationEffects.victoryPointsBonus(card, player)).to.eq(0);
    });

    it('Gigantic Undertakings grants 1 VP per 3 M€ of its cost increase', () => {
      const card = fakeCard({cost: 21, baseCost: 14, mutations: [{mutation: MutationName.GIGANTIC_UNDERTAKINGS}]});
      // Increase is 7 -> floor(7/3) = 2.
      expect(MutationEffects.victoryPointsBonus(card, player)).to.eq(2);
    });

    it('Mini Mutation grants no victory points', () => {
      const card = fakeCard({cost: 7, baseCost: 10, mutations: [{mutation: MutationName.MINI_MUTATION}]});
      expect(MutationEffects.victoryPointsBonus(card, player)).to.eq(0);
    });
  });

  describe('apply', () => {
    it('Tag Diversifier chooses a random tag the card does not already have', () => {
      const card = fakeCard({tags: [Tag.SCIENCE, Tag.PLANT, Tag.BUILDING, Tag.ANIMAL, Tag.CITY]});
      const applied = MutationEffects.apply(card, MutationName.TAG_DIVERSIFIER, rng);
      expect(applied.mutation).to.eq(MutationName.TAG_DIVERSIFIER);
      expect(applied.chosenTag).is.not.undefined;
      expect(card.tags).to.not.include(applied.chosenTag);
      expect(applied.chosenTag).to.not.eq(Tag.WILD);
      expect(applied.chosenTag).to.not.eq(Tag.EVENT);
    });

    it('Gigantic Undertakings and Mini Mutation carry no chosen tag', () => {
      const card = fakeCard({tags: []});
      expect(MutationEffects.apply(card, MutationName.GIGANTIC_UNDERTAKINGS, rng).chosenTag).is.undefined;
      expect(MutationEffects.apply(card, MutationName.MINI_MUTATION, rng).chosenTag).is.undefined;
    });
  });
});
