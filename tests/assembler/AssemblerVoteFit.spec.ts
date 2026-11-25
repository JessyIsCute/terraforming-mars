import {expect} from 'chai';
import {fitVotes} from '../../src/server/assembler/AssemblerVoteFit';
import {AssemblerVote, Verdict, votedValue} from '../../src/common/assembler/AssemblerVotes';
import {EffectCategory} from '../../src/common/assembler/EffectCategory';

let n = 0;
function vote(verdict: Verdict, parts: Array<[EffectCategory | 'tags', number]>): AssemblerVote {
  const breakdown = parts.map(([g, value]) => g === 'tags' ? {text: 'Tags: space', value} : {text: g, value, category: g});
  const value = breakdown.reduce((s, l) => s + l.value, 0);
  n++;
  return {card: `Assembled preview-1-${n}`, title: 'Card', cost: Math.round(value - 3), verdict, assembled: {complexity: 'low', value, breakdown}, at: n};
}

describe('AssemblerVoteFit', () => {
  it('a verdict moves the fair value by 15%, at least 2 M€', () => {
    expect(votedValue(vote('fair', [['money', 20]]))).eq(20);
    expect(votedValue(vote('too-cheap', [['money', 20]]))).eq(23);
    expect(votedValue(vote('much-too-expensive', [['money', 20]]))).eq(14);
    expect(votedValue(vote('too-expensive', [['money', 8]]))).eq(6);
  });

  it('finds the kind of effect the votes call too expensive', () => {
    const votes: Array<AssemblerVote> = [];
    for (let i = 0; i < 15; i++) {
      votes.push(vote('too-expensive', [['metal', 14], ['tags', 2]]));
      votes.push(vote('fair', [['money', 12 + (i % 3)], ['tags', 2]]));
      votes.push(vote('fair', [['energy', 10], ['tags', 2]]));
    }
    const fit = fitVotes(votes);
    const factor = (g: string) => fit.groups.find((r) => r.group === g)!.factor;
    expect(factor('metal')).lt(0.9);
    expect(factor('money')).within(0.9, 1.1);
    expect(factor('energy')).within(0.9, 1.1);
    expect(fit.groups[0].group).eq('metal');
    expect(fit.groups.find((r) => r.group === 'metal')!.lean).eq(-1);
    expect(fit.errorAfter).lt(fit.errorBefore);
  });

  it('a handful of votes barely moves a factor', () => {
    const fit = fitVotes([vote('much-too-cheap', [['heat', 10]])]);
    expect(fit.groups[0].factor).within(1, 1.15);
  });

  it('cards that all feel too cheap move the offset', () => {
    const votes = Array.from({length: 20}, (_, i) => vote('too-cheap', [[(['money', 'heat', 'water', 'plants'] as const)[i % 4], 8 + (i % 5)]]));
    expect(fitVotes(votes).offset).gt(0.5);
  });
});
