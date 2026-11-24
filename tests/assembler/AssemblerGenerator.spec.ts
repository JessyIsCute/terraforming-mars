import {expect} from 'chai';
import {SeededRandom} from '../../src/common/utils/Random';
import {CardType} from '../../src/common/cards/CardType';
import {Tag} from '../../src/common/cards/Tag';
import {AssemblerGenerator, compactTexts} from '../../src/server/assembler/AssemblerGenerator';
import {AssembledCardDefinition, AssemblerComplexity} from '../../src/server/assembler/AssembledCardDefinition';
import {newAssembledCard} from '../../src/server/assembler/AssembledCard';
import {validateBehavior} from '../../src/server/cards/Card';
import {CardName} from '../../src/common/cards/CardName';
import {BUY_COST, MAX_COST, MIN_COST} from '../../src/server/assembler/AssemblerValues';

const COMPLEXITIES: Array<AssemblerComplexity> = ['low', 'mid', 'high'];

function generateMany(seed: number, count: number, complexity: AssemblerComplexity, forceRequirement = false): Array<AssembledCardDefinition> {
  const generator = new AssemblerGenerator(new SeededRandom(seed));
  const cards: Array<AssembledCardDefinition> = [];
  for (let i = 0; i < count; i++) {
    cards.push(generator.generate(`Assembled test-${seed}-${complexity}-${forceRequirement}-${i}`, complexity, {forceRequirement}));
  }
  return cards;
}

describe('AssemblerGenerator', () => {
  for (const complexity of COMPLEXITIES) {
    it(`builds 500 valid ${complexity} cards`, () => {
      for (const def of generateMany(0.42, 500, complexity)) {
        expect(def.cost, def.name).is.within(MIN_COST, MAX_COST);
        // cost = round(value - 3)
        expect(def.cost, def.name).eq(Math.round(def.value - BUY_COST));
        // the breakdown adds up to the value (each line is rounded to 0.1)
        const sum = def.breakdown.reduce((s, l) => s + l.value, 0);
        expect(Math.abs(sum - def.value), `${def.name} breakdown`).lt(0.5);

        // card type matches what's on it
        const blue = def.action !== undefined || def.cardDiscount !== undefined || def.trigger !== undefined;
        expect(def.type === CardType.ACTIVE, def.name).eq(blue);
        if (def.type === CardType.EVENT) {
          expect(def.tags, 'events get their tag from the card type, like printed events').not.includes(Tag.EVENT);
          expect(def.victoryPoints).is.undefined;
        }
        expect(new Set(def.tags).size).eq(def.tags.length);

        // behavior is valid and the card can be built (this also builds its picture)
        validateBehavior(def.behavior, def.name as CardName);
        validateBehavior(def.action, def.name as CardName);
        const card = newAssembledCard(def);
        expect(card.cost).eq(def.cost);
        expect(card.metadata.renderData).is.not.undefined;
      }
    });
  }

  it('low complexity cards have a single part', () => {
    for (const def of generateMany(0.7, 200, 'low')) {
      // parts + tags (+ requirement) (+ payment)
      const parts = def.breakdown.filter((l) => !l.text.startsWith('Tags:') && !l.text.startsWith('Requires') && !l.text.startsWith('It must be') && l.text !== 'Pay with steel/titanium');
      expect(parts, def.name).has.length(1);
    }
  });

  it('high complexity cards always have an effect or action and at least one bad part', () => {
    for (const def of generateMany(0.9, 200, 'high')) {
      expect(def.effectTexts.length, def.name).gte(1);
      expect(def.breakdown.some((l) => l.value < 0 && !l.text.startsWith('Requires') && !l.text.startsWith('It must be')), def.name).is.true;
    }
  });

  it('forceRequirement always adds a requirement', () => {
    for (const complexity of COMPLEXITIES) {
      for (const def of generateMany(0.3, 100, complexity, true)) {
        expect(def.requirements, def.name).has.length(1);
      }
    }
  });

  it('is deterministic for a seed', () => {
    const a = generateMany(0.123, 50, 'mid');
    const b = generateMany(0.123, 50, 'mid');
    expect(a).deep.eq(b);
    const c = generateMany(0.124, 50, 'mid');
    expect(c).not.deep.eq(a);
  });

  it('merges production changes into one sentence, like printed cards', () => {
    expect(compactTexts([
      'Raise your TR 1 step.',
      'Increase your plant production 1 step.',
      'Decrease your heat production 1 step.',
      'Increase your M€ production 2 steps.',
    ])).deep.eq([
      'Decrease your heat production 1 step and increase your plant production 1 step and M€ production 2 steps.',
      'Raise your TR 1 step.',
    ]);
    expect(compactTexts(['Gain 2 steel.'])).deep.eq(['Gain 2 steel.']);
  });
});
