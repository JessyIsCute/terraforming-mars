import {expect} from 'chai';
import {calibrate, fitVotes, summarizeValueVotes} from '../../src/server/assembler/AssemblerVoteFit';
import {SeededRandom} from '../../src/common/utils/Random';
import {AssemblerValueVote, AssemblerVote, Verdict, shiftTableValue, votedTableValue, votedValue} from '../../src/common/assembler/AssemblerVotes';
import {EffectCategory} from '../../src/common/assembler/EffectCategory';

let n = 0;
function vote(verdict: Verdict, parts: Array<[EffectCategory | 'tags', number]>): AssemblerVote {
  const breakdown = parts.map(([g, value]) => g === 'tags' ? {text: 'Tags: space', value} : {text: g, value, category: g});
  const value = breakdown.reduce((s, l) => s + l.value, 0);
  n++;
  return {card: `Assembled preview-1-${n}`, title: 'Card', cost: Math.round(value - 3), verdict, assembled: {complexity: 1, value, breakdown}, at: n};
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

describe('AssemblerVoteFit: table values and the check', () => {
  function valueVote(key: string, shown: number, real: number, verdict: Verdict, at = 1): AssemblerValueVote {
    return {key, label: key, shown, real, verdict, at};
  }

  it('a value vote moves the number by 15% of what was shown', () => {
    expect(votedTableValue({shown: 2, verdict: 'fair'})).eq(2);
    expect(votedTableValue({shown: 2, verdict: 'too-expensive'})).closeTo(1.7, 1e-9);
    expect(votedTableValue({shown: 10, verdict: 'much-too-cheap'})).eq(13);
    // at least 0.2 per step for small numbers
    expect(votedTableValue({shown: 0.3, verdict: 'too-cheap'})).closeTo(0.5, 1e-9);
  });

  it('suggests a number per value from all its votes', () => {
    const rows = summarizeValueVotes([
      valueVote('stock.steel', 2, 2, 'too-expensive'),
      valueVote('stock.steel', 2.5, 2, 'much-too-expensive'),
      valueVote('tr', 7, 7, 'fair'),
    ]);
    expect(rows[0].key).eq('stock.steel');
    expect(rows[0].votes).eq(2);
    expect(rows[0].suggested).closeTo((1.7 + 1.75) / 2, 1e-9);
    expect(rows[1]).to.include({key: 'tr', suggested: 7, lean: 0});
  });

  it('splits verdicts by how the price was moved', () => {
    const c = calibrate([
      {shift: -2, verdict: 'too-cheap'}, {shift: -3, verdict: 'much-too-cheap'},
      {shift: 0, verdict: 'fair'},
      {shift: 4, verdict: 'too-expensive'},
    ]);
    expect(c.down).deep.eq({count: 2, lean: 1.5});
    expect(c.none).deep.eq({count: 1, lean: 0});
    expect(c.up).deep.eq({count: 1, lean: -1});
  });

  it('moves about 60% of table values, by 15-40%', () => {
    const rng = new SeededRandom(0.5);
    const shown = Array.from({length: 1000}, () => shiftTableValue(10, () => rng.next()));
    const moved = shown.filter((v) => v !== 10);
    expect(moved.length).within(520, 680);
    for (const v of moved) {
      expect(Math.abs(v - 10)).within(1.5, 4);
    }
    expect(moved.some((v) => v < 10) && moved.some((v) => v > 10)).is.true;
  });
});
