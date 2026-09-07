import {expect} from 'chai';
import {describeMutationRequirement, describeMutationEffect} from '../../src/common/mutationmarkets/describeMutation';
import {Resource} from '../../src/common/Resource';
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

  it('describes effects', () => {
    expect(describeMutationEffect({kind: 'none'})).to.eq('');
    expect(describeMutationEffect({kind: 'addRandomTag'})).to.eq('Gains a random new tag');
    expect(describeMutationEffect({kind: 'costPercent', percent: -30, minAbsDelta: 3, maxAbsDelta: 12})).to.eq('Cost -30%');
    expect(describeMutationEffect({kind: 'costPercent', percent: 50, minAbsDelta: 3, maxAbsDelta: 12, vpPerAbsDelta: 3})).to.eq('Cost +50%, gains VP');
    expect(describeMutationEffect({kind: 'nestedCopy', percent: -40, minAbsDelta: 3, maxAbsDelta: 12})).to.eq('Playing it grants a 40% cheaper copy');
    expect(describeMutationEffect({kind: 'grantResourceOnPlay', resource: Resource.PLANTS, amount: 2})).to.eq('Gain 2 Plants on play');
    expect(describeMutationEffect({kind: 'grantProductionOnPlay', resource: Resource.STEEL, amount: 1})).to.eq('+1 Steel production on play');
    expect(describeMutationEffect({kind: 'convertType'})).to.eq('Becomes an Event (or Automated) card; an Active card gets a M€ rebate on play instead');
  });
});
