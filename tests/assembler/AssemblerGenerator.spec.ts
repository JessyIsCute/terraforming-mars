import {expect} from 'chai';
import {SeededRandom} from '../../src/common/utils/Random';
import {CardType} from '../../src/common/cards/CardType';
import {Tag} from '../../src/common/cards/Tag';
import {AssemblerGenerator, compactTexts} from '../../src/server/assembler/AssemblerGenerator';
import {AssembledCardDefinition} from '../../src/server/assembler/AssembledCardDefinition';
import {AssembleSpec} from '../../src/server/assembler/AssembleSpec';
import {fitsOnCard} from '../../src/server/assembler/AssemblerRender';
import {newAssembledCard} from '../../src/server/assembler/AssembledCard';
import {validateBehavior} from '../../src/server/cards/Card';
import {IActionCard} from '../../src/server/cards/ICard';
import {CardName} from '../../src/common/cards/CardName';
import {testGame} from '../TestGame';
import {runAllActions} from '../TestingUtils';
import {cast} from '../../src/common/utils/utils';
import {OrOptions} from '../../src/server/inputs/OrOptions';
import {SelectPlayer} from '../../src/server/inputs/SelectPlayer';
import {Units} from '../../src/common/Units';
import {BUY_COST, MAX_COST, MIN_COST} from '../../src/server/assembler/AssemblerValues';

/** Simple, some and busy cards: the complexity ranges these tests ask for. */
type Band = 'low' | 'mid' | 'high';
const COMPLEXITIES: Array<Band> = ['low', 'mid', 'high'];
const RANGE: Record<Band, AssembleSpec> = {
  low: {minComplexity: 1, maxComplexity: 1},
  mid: {minComplexity: 2, maxComplexity: 4},
  high: {minComplexity: 5, maxComplexity: 7},
};

function gen(generator: AssemblerGenerator, name: string, band: Band, spec: AssembleSpec = {}): AssembledCardDefinition {
  return generator.generate(name, {...RANGE[band], ...spec});
}

function generateMany(seed: number, count: number, complexity: Band, forceRequirement = false): Array<AssembledCardDefinition> {
  const generator = new AssemblerGenerator(new SeededRandom(seed));
  const cards: Array<AssembledCardDefinition> = [];
  for (let i = 0; i < count; i++) {
    cards.push(gen(generator, `Assembled test-${seed}-${complexity}-${forceRequirement}-${i}`, complexity, {forceRequirement}));
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
    function many(spec: AssembleSpec, complexity: Band = 'mid', count = 200) {
      const generator = new AssemblerGenerator(new SeededRandom(0.77));
      return Array.from({length: count}, (_, i) => gen(generator, `Assembled preset-${i}`, complexity, spec));
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
        // No single benefit is worth 28 M€: it takes several, so the card's complexity is higher.
        expect(def.complexity).gt(1);
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
      for (const [spec, complexity] of [[{tagCount: 4}, 'high'], [{tags: [Tag.SCIENCE]}, 'high'], [{minCost: 28, maxCost: 32}, 'low']] as Array<[AssembleSpec, Band]>) {
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
      return def.breakdown.filter((l) => !l.text.startsWith('Tags:')).length;
    }
    // 1 per slot, plus 1 per tag after the first.
    function score(def: AssembledCardDefinition) {
      return slots(def) + Math.max(0, def.tags.length - 1);
    }

    it('is 1 per part and requirement, plus 1 per tag after the first', () => {
      for (const band of COMPLEXITIES) {
        for (const def of generateMany(0.55, 200, band)) {
          expect(def.complexity, def.name).eq(score(def));
          expect(def.complexity, def.name).within(RANGE[band].minComplexity!, RANGE[band].maxComplexity!);
        }
      }
    });

    it('stays in the asked range when nothing is forced', () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.56));
      for (const [min, max] of [[1, 1], [2, 2], [3, 3], [4, 6], [5, 7], [7, 7]]) {
        for (let i = 0; i < 60; i++) {
          const def = generator.generate(`Assembled range-${min}-${max}-${i}`, {minComplexity: min, maxComplexity: max});
          expect(def.complexity, def.name).within(min, max);
        }
      }
    });

    it('without a range, makes mostly simple cards and some busy ones', () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.58));
      const cards = Array.from({length: 300}, (_, i) => generator.generate(`Assembled any-${i}`));
      expect(cards.filter((d) => d.complexity === 1).length).gt(60);
      expect(cards.filter((d) => d.complexity >= 5).length).gt(20);
      expect(Math.max(...cards.map((d) => d.complexity))).lte(7);
    });

    it('more tags is more complexity', () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.57));
      const def = gen(generator, 'Assembled tags-4', 'low', {tagCount: 4});
      expect(def.complexity).eq(slots(def) + 3);
      expect(def.complexity).gt(1);
    });

    it('a complexity 1 active card is just its effect or action', () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.61));
      for (let i = 0; i < 100; i++) {
        const def = gen(generator, `Assembled blue-${i}`, 'low', {type: CardType.ACTIVE});
        expect(def.effectTexts, def.name).has.length(1);
        expect(slots(def), def.name).eq(1);
        expect(def.complexity).eq(1);
      }
    });

    it('complexity 1 cards have no requirement unless asked, which makes them 2 or more', () => {
      for (const def of generateMany(0.62, 200, 'low')) {
        expect(def.requirements, def.name).is.empty;
      }
      for (const def of generateMany(0.63, 50, 'low', true)) {
        expect(def.complexity, def.name).gte(2);
      }
    });

    it('a guaranteed drawback adds to complexity 1; sabotage alone stays 1', () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.64));
      const seen = new Set<number>();
      for (let i = 0; i < 80; i++) {
        const def = gen(generator, `Assembled bane-${i}`, 'low', {categories: ['cooling']});
        // "Decrease any heat production" is one part; "Decrease your heat production" needs a benefit too.
        const drawback = def.breakdown.some((l) => l.category === 'cooling' && l.value < 0);
        expect(def.complexity, def.name).eq(drawback ? 2 : 1);
        expect(def.complexity).eq(score(def));
        seen.add(def.complexity);
      }
      expect([...seen].sort()).deep.eq([1, 2]);
    });
  });

  describe("triggers on the card's own tag", () => {
    function triggerCards(): Array<AssembledCardDefinition> {
      const generator = new AssemblerGenerator(new SeededRandom(0.71));
      return Array.from({length: 300}, (_, i) => gen(generator, `Assembled trig-${i}`, 'mid', {categories: ['synergy']}))
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
  describe('bigger, bolder and PvP parts', () => {
    const all = () => COMPLEXITIES.flatMap((c) => generateMany(0.91, 400, c));

    it('bold cards pair a big benefit with a big drawback', () => {
      const big = all().filter((d) => Number(d.behavior?.production?.steel ?? 0) >= 3 || Number(d.behavior?.production?.megacredits ?? 0) >= 4 || (d.victoryPoints ?? 0) >= 4);
      expect(big.length).gt(5);
      for (const d of big) {
        expect(d.breakdown.some((l) => l.value < 0), d.name).is.true;
      }
    });

    it('makes PvP, discard and multi-VP cards', () => {
      const cards = all();
      expect(cards.some((d) => d.steal !== undefined), 'steal').is.true;
      expect(cards.some((d) => d.discard !== undefined), 'discard').is.true;
      expect(cards.some((d) => d.opponentsDiscard !== undefined), 'opponents discard').is.true;
      expect(cards.some((d) => d.behavior?.decreaseAnyProduction !== undefined), 'decrease any').is.true;
      expect(cards.some((d) => (d.victoryPoints ?? 0) >= 2), 'multi VP').is.true;
      expect(cards.some((d) => d.breakdown.some((l) => l.category === 'rust')), 'rust').is.true;
    });

    it('steal, discard and opponent discard work in a game', () => {
      const cards = all();
      const thief = cards.find((d) => d.steal !== undefined && d.requirements.length === 0 && d.discard === undefined && d.behavior?.lose === undefined)!;
      const [game, player, other] = testGame(2);
      other.stock.add(thief.steal!.resource, 20);
      player.playCard(newAssembledCard(thief));
      runAllActions(game);
      cast(player.popWaitingFor(), OrOptions).options[0].cb();
      expect(other.stock.get(thief.steal!.resource), thief.name).eq(20 - thief.steal!.count);

      const forgetful = cards.find((d) => d.discard !== undefined && d.requirements.length === 0 && d.steal === undefined)!;
      const [game2, p2] = testGame(2);
      p2.cardsInHand.push(...game2.projectDeck.drawN(game2, 5));
      p2.playCard(newAssembledCard(forgetful));
      runAllActions(game2);
      const select = p2.popWaitingFor();
      expect(select, forgetful.name).is.not.undefined;
    });

    it('an opponent of your choice discards', () => {
      const def = all().find((d) => d.targetDiscard !== undefined && d.requirements.length === 0 && d.steal === undefined && d.discard === undefined && d.behavior?.lose === undefined && d.behavior?.decreaseAnyProduction === undefined)!;
      expect(def, 'a target-discard card').is.not.undefined;
      const [game, player, other] = testGame(2);
      other.cardsInHand.push(...game.projectDeck.drawN(game, 3));
      player.playCard(newAssembledCard(def));
      runAllActions(game);
      cast(player.popWaitingFor(), SelectPlayer).cb(other);
      runAllActions(game);
      expect(other.popWaitingFor(), 'the opponent picks the card').is.not.undefined;
    });

    it('tags lean toward the theme of their benefits', () => {
      const generator = new AssemblerGenerator(new SeededRandom(0.92));
      let earth = 0;
      let total = 0;
      for (let i = 0; i < 400; i++) {
        const def = gen(generator, `Assembled theme-${i}`, 'low', {categories: ['money']});
        if (def.type !== CardType.EVENT || def.tags.length > 0) {
          total++;
          earth += def.tags.includes(Tag.EARTH) ? 1 : 0;
        }
      }
      // Earth is one of many tags; money cards draw it far more than their share.
      expect(earth / total).gt(0.2);
    });
  });

  describe('card resources, growth and new triggers', () => {
    const all = () => COMPLEXITIES.flatMap((c) => generateMany(0.93, 500, c));

    it('makes every new kind of part', () => {
      const cards = all();
      expect(cards.some((d) => d.cardResource !== undefined && d.action?.addResources !== undefined), 'collector action').is.true;
      expect(cards.some((d) => d.trigger?.addResource !== undefined), 'collector trigger').is.true;
      expect(cards.some((d) => d.trigger?.drawCard !== undefined), 'draw trigger').is.true;
      expect(cards.some((d) => d.behavior?.addResourcesToAnyCard !== undefined), 'add to another card').is.true;
      expect(cards.some((d) => Object.values(d.behavior?.production ?? {}).some((v) => typeof v === 'object')), 'per tag production').is.true;
      for (const d of cards.filter((c) => c.cardResource !== undefined)) {
        expect(d.type, d.name).eq(CardType.ACTIVE);
        expect(d.victoryPoints, 'VP comes from the resources only').is.undefined;
      }
    });

    it('a collector action adds to the card and scores VP', () => {
      const def = all().find((d) => d.action?.addResources !== undefined && d.requirements.length === 0)!;
      const [game, player] = testGame(1);
      const card = newAssembledCard(def);
      expect(card.resourceType).eq(def.cardResource!.type);
      player.playedCards.push(card);
      for (let i = 0; i < 4; i++) {
        (card as unknown as IActionCard).action(player);
        runAllActions(game);
      }
      expect(card.resourceCount).eq(4);
      expect(card.getVictoryPoints(player)).eq(Math.floor(4 / def.cardResource!.vpPer!));
    });

    it('a collector trigger adds to the card when its tag is played', () => {
      const def = all().find((d) => d.trigger?.addResource !== undefined)!;
      const [, player] = testGame(1);
      const card = newAssembledCard(def);
      player.playedCards.push(card);
      const other = all().find((d) => d.tags.includes(def.trigger!.tag) && d.type !== CardType.EVENT)!;
      card.onCardPlayed!(player, newAssembledCard(other));
      expect(card.resourceCount).eq(1);
    });

    it('a draw trigger draws a card', () => {
      const def = all().find((d) => d.trigger?.drawCard !== undefined)!;
      const [, player] = testGame(1);
      const card = newAssembledCard(def);
      const other = all().find((d) => d.tags.includes(def.trigger!.tag))!;
      const before = player.cardsInHand.length;
      card.onCardPlayed!(player, newAssembledCard(other));
      expect(player.cardsInHand.length).eq(before + 1);
    });

    it('per tag production counts tags, and says "including this" when the card has the tag', () => {
      const cards = all().filter((d) => Object.values(d.behavior?.production ?? {}).some((v) => typeof v === 'object'));
      for (const d of cards) {
        const [, counted] = Object.entries(d.behavior!.production!).find(([, v]) => typeof v === 'object')! as [string, {tag: Tag}];
        expect(d.description.includes('including this'), d.name).eq(d.tags.includes(counted.tag));
      }
      const def = cards.find((d) => d.requirements.length === 0 && d.behavior?.lose === undefined && Object.keys(d.behavior!.production!).length === 1 && d.discard === undefined && d.steal === undefined && d.cardResource === undefined)!;
      expect(def, 'a plain growth card').is.not.undefined;
      const [r, c] = Object.entries(def.behavior!.production!)[0] as [keyof Units, {tag: Tag, per?: number}];
      const [, player] = testGame(1);
      player.tagsForTest = {[c.tag]: 4};
      player.playCard(newAssembledCard(def));
      expect(player.production[r]).gte(Math.floor(4 / (c.per ?? 1)));
    });
  });

  it('a card has the city tag exactly when it places a city', () => {
    let cities = 0;
    for (const complexity of COMPLEXITIES) {
      for (const def of generateMany(0.83, 400, complexity)) {
        const places = def.behavior?.city !== undefined;
        cities += places ? 1 : 0;
        expect(def.tags.includes(Tag.CITY), def.name).eq(places);
      }
    }
    expect(cities).gt(10);
    const generator = new AssemblerGenerator(new SeededRandom(0.84));
    for (let i = 0; i < 20; i++) {
      const def = generator.generate(`Assembled city-${i}`, {tags: [Tag.CITY]});
      expect(def.behavior?.city, def.name).is.not.undefined;
    }
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

