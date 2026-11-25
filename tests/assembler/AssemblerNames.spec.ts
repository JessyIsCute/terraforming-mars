import {expect} from 'chai';
import {CATEGORY_WORDS, MAX_TITLE_LENGTH, nameCard} from '../../src/server/assembler/AssemblerNames';
import {AssemblerGenerator} from '../../src/server/assembler/AssemblerGenerator';
import {SeededRandom} from '../../src/common/utils/Random';
import {CardType} from '../../src/common/cards/CardType';
import {EFFECT_CATEGORIES} from '../../src/common/assembler/EffectCategory';

const first = <T>(items: ReadonlyArray<T>) => items[0];

describe('AssemblerNames', () => {
  it('the strongest benefit names the thing, a drawback describes it', () => {
    const title = nameCard([
      {category: 'energy', value: 6, bad: false},
      {category: 'money', value: 4, bad: false},
      {category: 'cooling', value: -2, bad: true},
    ], 3, first);
    expect(title).eq('Cooled Power Cell');
  });

  it('a big effect uses the major words', () => {
    expect(nameCard([{category: 'heat', value: 12, bad: false}, {category: 'cooling', value: -12, bad: true}], 3, first))
      .eq('Frozen Solar Lens');
  });

  it('one category describes itself, without repeating the noun', () => {
    // 'Heated Heater' would be silly: the adjective skips words that start like the noun.
    expect(nameCard([{category: 'heat', value: 4, bad: false}], 1, first)).eq('Warm Heater');
  });

  it('complexity 5 or more adds an ending from a third category', () => {
    expect(nameCard([
      {category: 'plants', value: 9, bad: false},
      {category: 'knowledge', value: 6, bad: false},
      {category: 'drain', value: -3, bad: true},
    ], 5, first)).eq('Drained Greenhouse of Insight');
  });

  it('drops an ending that would make the title too long', () => {
    const last = <T>(items: ReadonlyArray<T>) => items[items.length - 1];
    const title = nameCard([
      {category: 'money', value: 15, bad: false},
      {category: 'drain', value: -12, bad: true},
      {category: 'cooling', value: -3, bad: true},
    ], 5, last);
    // "Power-starved Investment Bank of the Long Night" is too long for a card.
    expect(title).eq('Power-starved Investment Bank');
    expect(title.length).is.at.most(MAX_TITLE_LENGTH);
  });

  it('every category has words in both tiers', () => {
    for (const c of EFFECT_CATEGORIES) {
      const w = CATEGORY_WORDS[c];
      expect(w.nouns[0].length * w.nouns[1].length * w.adjectives[0].length * w.adjectives[1].length * w.endings.length, c).is.greaterThan(0);
    }
  });
});

describe('Assembler effect categories', () => {
  it('every part of a card has a category, and the title uses its words', () => {
    const generator = new AssemblerGenerator(new SeededRandom(0.31));
    for (let i = 0; i < 40; i++) {
      const def = generator.generate('x', i % 2 === 0 ? {minComplexity: 2, maxComplexity: 4} : {minComplexity: 5});
      const parts = def.breakdown.filter((l) => !l.text.startsWith('Tags:') && !l.text.startsWith('Requires') && !l.text.startsWith('It must') && l.text !== 'Pay with steel/titanium');
      for (const line of parts) {
        expect(line.category, line.text).is.not.undefined;
      }
      const words = new Set(parts.flatMap((l) => {
        const w = CATEGORY_WORDS[l.category!];
        return [...w.nouns.flat(), ...w.adjectives.flat()];
      }));
      expect([...words].some((w) => def.title.includes(w)), def.title).is.true;
    }
  });

  for (const category of EFFECT_CATEGORIES) {
    it(`can guarantee ${category}`, () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.5));
      for (let i = 0; i < 5; i++) {
        const def = generator.generate('x', {minComplexity: 2, maxComplexity: 4, categories: [category]});
        expect(def.breakdown.map((l) => l.category), def.title).includes(category);
      }
    });
  }

  it('can guarantee several categories at once', () => {
    const generator = new AssemblerGenerator(new SeededRandom(0.2));
    const def = generator.generate('x', {minComplexity: 5, categories: ['water', 'cooling', 'knowledge']});
    const categories = def.breakdown.map((l) => l.category);
    expect(categories).includes.members(['water', 'cooling', 'knowledge']);
  });

  for (const type of [CardType.AUTOMATED, CardType.ACTIVE, CardType.EVENT] as const) {
    it(`can require a ${type} card`, () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.8));
      for (let i = 0; i < 5; i++) {
        expect(generator.generate('x', {minComplexity: 2, maxComplexity: 4, type}).type).eq(type);
      }
    });
  }
});
