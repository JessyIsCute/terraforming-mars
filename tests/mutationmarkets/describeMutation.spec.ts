import {expect} from 'chai';
import {describeMutationRequirement, describeMutationReward, describeMutationEffect} from '../../src/common/mutationmarkets/describeMutation';
import {Tag} from '../../src/common/cards/Tag';

describe('describeMutation', () => {
  it('describes count-based requirements', () => {
    expect(describeMutationRequirement({uniqueTags: 5})).to.eq('5 unique tags');
    expect(describeMutationRequirement({expensiveCardsPlayed: 2})).to.eq('2 cards played costing 25+ M€');
    expect(describeMutationRequirement({cheapCardsPlayed: 7})).to.eq('7 cards played costing <7 M€');
    expect(describeMutationRequirement({cardCostStreak: 3})).to.eq('3 cards played in a row, each cheaper');
    expect(describeMutationRequirement({cities: 3})).to.eq('3 cities');
    expect(describeMutationRequirement({tag: Tag.SCIENCE, count: 3})).to.eq('3 Science tags');
  });

  it('describes rewards', () => {
    expect(describeMutationReward({tr: 1})).to.eq('+1 TR');
    expect(describeMutationReward({cards: 1})).to.eq('+1 card');
    expect(describeMutationReward({cards: 2})).to.eq('+2 cards');
    expect(describeMutationReward({tr: 1, victoryPoints: 2})).to.eq('+1 TR, +2 VP');
  });

  it('describes effects', () => {
    expect(describeMutationEffect({kind: 'none'})).to.eq('');
    expect(describeMutationEffect({kind: 'addRandomTag'})).to.eq('Gains a random new tag');
    expect(describeMutationEffect({kind: 'costPercent', percent: -30, minAbsDelta: 3, maxAbsDelta: 12})).to.eq('Cost -30%');
    expect(describeMutationEffect({kind: 'costPercent', percent: 50, minAbsDelta: 3, maxAbsDelta: 12, vpPerAbsDelta: 3})).to.eq('Cost +50%, gains VP');
    expect(describeMutationEffect({kind: 'nestedCopy', percent: -40, minAbsDelta: 3, maxAbsDelta: 12})).to.eq('Playing it grants a 40% cheaper copy');
  });
});
