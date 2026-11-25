import {expect} from 'chai';
import {SeededRandom} from '../../src/common/utils/Random';
import {CardType} from '../../src/common/cards/CardType';
import {Tag} from '../../src/common/cards/Tag';
import {AssemblerGenerator, compactTexts, complexityOfSlots} from '../../src/server/assembler/AssemblerGenerator';
import {AssembledCardDefinition, AssemblerComplexity} from '../../src/server/assembler/AssembledCardDefinition';
import {AssembleSpec} from '../../src/server/assembler/AssembleSpec';
import {fitsOnCard} from '../../src/server/assembler/AssemblerRender';
import {newAssembledCard} from '../../src/server/assembler/AssembledCard';
import {validateBehavior} from '../../src/server/cards/Card';
import {CardName} from '../../src/common/cards/CardName';
import {testGame} from '../TestGame';
import {Units} from '../../src/common/Units';
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

  describe('presets', () => {
    function many(spec: AssembleSpec, complexity: AssemblerComplexity = 'mid', count = 200) {
      const generator = new AssemblerGenerator(new SeededRandom(0.77));
      return Array.from({length: count}, (_, i) => generator.generate(`Assembled preset-${i}`, complexity, spec));
    }

    it('required tags are always on the card', () => {
      for (const def of many({tags: [Tag.SCIENCE]})) {
        expect(def.tags, def.name).includes(Tag.SCIENCE);
        expect(new Set(def.tags).size).eq(def.tags.length);
      }
    });

    it('tagCount gives exactly that many tags', () => {
      for (const def of many({tagCount: 4})) {
        expect(def.tags, def.name).has.length(4);
        expect(new Set(def.tags).size).eq(4);
        // an event's extra event tag would make 5, which the client collapses to one icon
        expect(def.type, def.name).not.eq(CardType.EVENT);
      }
    });

    it('presets that ask for tags never make events, so the tags stay in play', () => {
      for (const def of many({tags: [Tag.JOVIAN]}, 'low')) {
        expect(def.type, def.name).not.eq(CardType.EVENT);
      }
    });

    it('a cost range holds, even for low complexity with a high minimum', () => {
      for (const def of many({minCost: 28, maxCost: 32}, 'low')) {
        expect(def.cost, def.name).is.within(28, 32);
        // No single benefit is worth 28 M€: it takes several, so the card says it isn't low.
        expect(def.complexity).not.eq('low');
        // Asked for low: still no effects, actions or drawbacks
        expect(def.effectTexts, def.name).is.empty;
        expect(def.cost).eq(Math.round(def.value - BUY_COST));
      }
      for (const def of many({maxCost: 8}, 'low')) {
        expect(def.cost, def.name).is.at.most(8);
      }
    });

    it('costAdjust changes the printed cost and is recorded', () => {
      for (const def of many({minCost: 28, maxCost: 32, costAdjust: -10}, 'low', 50)) {
        expect(def.costAdjust).eq(-10);
        expect(def.cost, def.name).eq(Math.round(def.value - BUY_COST) - 10);
        expect(def.cost).is.within(18, 22);
      }
    });

    it('preset cards still fit on a card and validate', () => {
      // High complexity at 28+ M€ often can't fit on a card (the generator page reports those); the
      // cost preset is tested at low complexity, as Open Source Blueprints uses it.
      for (const [spec, complexity] of [[{tagCount: 4}, 'high'], [{tags: [Tag.SCIENCE]}, 'high'], [{minCost: 28, maxCost: 32}, 'low']] as Array<[AssembleSpec, AssemblerComplexity]>) {
        for (const def of many(spec, complexity, 60)) {
          expect(fitsOnCard(def), def.name).is.true;
          expect(() => validateBehavior(def.behavior, def.name as CardName)).not.to.throw();
        }
      }
    });
  });
  describe('complexity', () => {
    // Every benefit, effect or action, drawback and requirement is a slot.
    function slots(def: AssembledCardDefinition) {
      return def.breakdown.filter((l) => !l.text.startsWith('Tags:') && l.text !== 'Pay with steel/titanium').length;
    }

    it('cards stay within their slots when nothing is forced', () => {
      const limits = {low: [1, 1], mid: [2, 3], high: [4, 6]};
      for (const complexity of COMPLEXITIES) {
        for (const def of generateMany(0.55, 200, complexity)) {
          expect(def.complexity, def.name).eq(complexity);
          expect(slots(def), def.name).within(limits[complexity][0], limits[complexity][1]);
        }
      }
    });

    it('a low active card is just its effect or action', () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.61));
      for (let i = 0; i < 100; i++) {
        const def = generator.generate(`Assembled blue-${i}`, 'low', {type: CardType.ACTIVE});
        expect(def.effectTexts, def.name).has.length(1);
        expect(slots(def), def.name).eq(1);
        expect(def.complexity).eq('low');
      }
    });

    it('low cards have no requirement unless asked, and then read as mid', () => {
      for (const def of generateMany(0.62, 200, 'low')) {
        expect(def.requirements, def.name).is.empty;
      }
      for (const def of generateMany(0.63, 50, 'low', true)) {
        expect(def.complexity, def.name).eq('mid');
      }
    });

    it('a guaranteed drawback on a low card makes it mid; sabotage alone stays low', () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.64));
      const seen = new Set<string>();
      for (let i = 0; i < 80; i++) {
        const def = generator.generate(`Assembled bane-${i}`, 'low', {categories: ['cooling']});
        // "Decrease any heat production" is one slot; "Decrease your heat production" needs a benefit too.
        const drawback = def.breakdown.some((l) => l.category === 'cooling' && l.value < 0);
        expect(def.complexity, def.name).eq(drawback ? 'mid' : 'low');
        expect(def.complexity).eq(complexityOfSlots(slots(def)));
        seen.add(def.complexity);
      }
      expect([...seen].sort()).deep.eq(['low', 'mid']);
    });
  });

  describe("triggers on the card's own tag", () => {
    function triggerCards(): Array<AssembledCardDefinition> {
      const generator = new AssemblerGenerator(new SeededRandom(0.71));
      return Array.from({length: 300}, (_, i) => generator.generate(`Assembled trig-${i}`, 'mid', {categories: ['synergy']}))
        .filter((d) => d.trigger !== undefined);
    }

    it('say "including this" exactly when the card has the tag', () => {
      const cards = triggerCards();
      const self = cards.filter((d) => d.tags.includes(d.trigger!.tag));
      const other = cards.filter((d) => !d.tags.includes(d.trigger!.tag));
      expect(self.length).gt(5);
      expect(other.length).gt(5);
      for (const d of self) {
        expect(d.effectTexts.join(' '), d.name).contains(`${d.trigger!.tag} tag, including this, gain`);
      }
      for (const d of other) {
        expect(d.effectTexts.join(' '), d.name).not.contains('including this');
      }
    });

    it('do fire for the card itself when played', () => {
      const def = triggerCards().find((d) => d.tags.includes(d.trigger!.tag) && d.requirements.length === 0 && d.behavior?.stock === undefined && d.behavior?.production === undefined)!;
      expect(def, 'a plain self-triggering card').is.not.undefined;
      const [/* game */, player] = testGame(1);
      const before = player.stock.asUnits();
      player.playCard(newAssembledCard(def));
      const after = player.stock.asUnits();
      const gained = Units.of(def.trigger!.gain);
      for (const r of Object.keys(def.trigger!.gain) as Array<keyof Units>) {
        expect(after[r] - before[r], r).gte(gained[r]);
      }
    });
  });
  it('never puts a wild tag on an event', () => {
    let events = 0;
    let wild = 0;
    for (const complexity of COMPLEXITIES) {
      for (const def of generateMany(0.81, 600, complexity)) {
        if (def.type === CardType.EVENT) {
          events++;
          expect(def.tags, def.name).not.include(Tag.WILD);
        } else if (def.tags.includes(Tag.WILD)) {
          wild++;
        }
      }
    }
    expect(events).gt(200);
    expect(wild, 'other cards still get wild tags').gt(0);
  });
});

