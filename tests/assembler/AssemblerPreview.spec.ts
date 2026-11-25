import {expect} from 'chai';
import {AssemblerPreviewError, parsePreviewRequest, previewCards} from '../../src/server/assembler/AssemblerPreview';
import {getAssembledCardDefinition, isAssembledCardName} from '../../src/server/assembler/AssembledCardRegistry';

function parse(query: string) {
  return parsePreviewRequest(new URLSearchParams(query), () => 42);
}

function rejects(query: string, message: RegExp) {
  expect(() => parse(query)).to.throw(AssemblerPreviewError, message);
}

describe('AssemblerPreview', () => {
  it('defaults: 6 random cards with a random seed', () => {
    expect(parse('')).deep.eq({count: 6, seed: 42, spec: {}});
  });

  it('reads every option', () => {
    const request = parse('count=3&seed=7&minComplexity=5&maxComplexity=7&type=active&categories=heat,synergy&tags=science&tagCount=2&minCost=10&maxCost=30&costAdjust=-5&requirement=1');
    expect(request).deep.eq({
      count: 3,
      seed: 7,
      spec: {
        minComplexity: 5,
        maxComplexity: 7,
        type: 'active',
        categories: ['heat', 'synergy'],
        tags: ['science'],
        tagCount: 2,
        minCost: 10,
        maxCost: 30,
        costAdjust: -5,
        forceRequirement: true,
      },
    });
  });

  it('rejects bad values', () => {
    rejects('count=50', /count/);
    rejects('seed=abc', /seed/);
    rejects('complexity=extreme', /complexity/);
    rejects('minComplexity=9', /minComplexity/);
    rejects('minComplexity=5&maxComplexity=3', /complexity/);
    rejects('type=prelude', /type/);
    rejects('categories=lasers', /Unknown effect/);
    rejects('tags=moon', /Unknown tag/);
  });

  it('explains impossible combinations', () => {
    rejects('categories=efficiency,synergy', /only one effect/);
    rejects('categories=synergy&type=event', /must be active/);
    rejects('categories=city&type=event', /city/);
    rejects('minCost=20&maxCost=10', /lowest cost/);
    rejects('tags=science,space,earth&tagCount=2', /don't fit/);
    rejects('type=event&tags=science', /Events/);
  });

  it('generates the requested cards, the same ones for the same seed', () => {
    const request = parse('count=4&seed=123&categories=cooling&minComplexity=2&maxComplexity=4');
    const first = previewCards(request);
    const again = previewCards(request);
    expect(first.seed).eq(123);
    expect(first.cards).has.length(4);
    expect(again).deep.eq(first);
    for (const card of first.cards) {
      expect(card.customCard?.module).eq('assembler');
      expect(card.assembled?.complexity).within(2, 4);
      expect(card.assembled?.breakdown.map((l) => l.category)).includes('cooling');
      expect(card.combinedDisplayName).is.a('string');
    }
  });

  it('keeps nothing: preview cards are not registered', () => {
    const {cards} = previewCards(parse('count=2&seed=5'));
    for (const card of cards) {
      expect(isAssembledCardName(card.name)).is.false;
      expect(getAssembledCardDefinition(card.name)).is.undefined;
    }
  });

  it('reports cards it could not make, and returns the rest', () => {
    const response = previewCards(parse('count=12&seed=3&complexity=6&minCost=36&maxCost=40'));
    expect(response.cards.length + (response.failed ?? 0)).eq(12);
    expect(response.cards.length).is.greaterThan(0);
    expect(response.failed).is.greaterThan(0);
  });

  it('says so when no card fits', () => {
    expect(() => previewCards(parse('complexity=1&categories=efficiency&maxCost=0')))
      .to.throw(AssemblerPreviewError, /No card fits/);
  });
  it('spread: the same cards, most with a hidden shift of the printed cost', () => {
    const plain = previewCards(parse('count=12&seed=55&complexity=1'));
    const spread = previewCards(parse('count=12&seed=55&complexity=1&spread=1'));
    expect(spread.cards.map((c) => c.name)).deep.eq(plain.cards.map((c) => c.name));
    let moved = 0;
    spread.cards.forEach((card, i) => {
      const real = plain.cards[i].calculatedCost ?? 0;
      const shift = card.assembled?.costAdjust ?? 0;
      expect(card.calculatedCost, card.name).eq(real + shift);
      expect(card.assembled?.breakdown).deep.eq(plain.cards[i].assembled?.breakdown);
      if (shift !== 0) {
        moved++;
        // at least 2 M€, unless that would go below a cost of 0
        expect(Math.abs(shift) >= 2 || card.calculatedCost === 0, card.name).is.true;
      }
    });
    expect(moved).gte(3);
    // the same request moves the same cards the same way
    expect(previewCards(parse('count=12&seed=55&complexity=1&spread=1'))).deep.eq(spread);
  });
});
