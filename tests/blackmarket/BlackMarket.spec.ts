import {expect} from 'chai';
import {BlackMarket} from '@/server/blackmarket/BlackMarket';
import {BLACK_MARKET_ROW_SLOT_COUNT} from '@/server/blackmarket/BlackMarketData';
import {BLACK_MARKET_DESIGNS} from '@/server/cards/blackmarket/BlackMarketCardManifest';
import {SmuggledReactorCore, SmuggledReactorCoreII, SmuggledReactorCoreIII, SmuggledReactorCoreIV} from '@/server/cards/blackmarket/SmuggledReactorCore';
import {CounterfeitCertificates} from '@/server/cards/blackmarket/CounterfeitCertificates';
import {RogueAiContract} from '@/server/cards/blackmarket/RogueAiContract';
import {OreForOxygenRacket} from '@/server/cards/blackmarket/OreForOxygenRacket';
import {CardName} from '@/common/cards/CardName';
import {IGame} from '@/server/IGame';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';

function designIndexFor(name: CardName): number {
  const index = BLACK_MARKET_DESIGNS.findIndex((design) => design.printings.includes(name));
  if (index === -1) {
    throw new Error(`No design contains ${name}`);
  }
  return index;
}

const SMUGGLED_REACTOR_CORE_DESIGN = designIndexFor(CardName.SMUGGLED_REACTOR_CORE);
const COUNTERFEIT_CERTIFICATES_DESIGN = designIndexFor(CardName.COUNTERFEIT_CERTIFICATES);
const UNDERGROUND_CASINO_DESIGN = designIndexFor(CardName.UNDERGROUND_CASINO);
const ORE_FOR_OXYGEN_RACKET_DESIGN = designIndexFor(CardName.ORE_FOR_OXYGEN_RACKET);
const ROGUE_AI_CONTRACT_DESIGN = designIndexFor(CardName.ROGUE_AI_CONTRACT);

describe('BlackMarket', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2, {blackMarketExpansion: true});
  });

  it('initialize deals the early row with 4 distinct designs, each showing its cheapest printing, none sold, and leaves mid/late locked', () => {
    const data = game.blackMarketData!;
    expect(data).is.not.undefined;
    expect(data.early.slots).has.lengthOf(BLACK_MARKET_ROW_SLOT_COUNT);
    expect(data.early.slots.every((slot) => slot !== undefined)).is.true;
    expect(data.early.sold.every((sold) => sold === false)).is.true;
    expect(new Set(data.early.slots.map((slot) => slot!.designIndex)).size).to.eq(BLACK_MARKET_ROW_SLOT_COUNT);
    expect(data.early.slots.every((slot) => slot!.variantIndex === 0)).is.true;
    expect(data.early.slots.every((slot) => BLACK_MARKET_DESIGNS[slot!.designIndex].tier === 'early')).is.true;
    expect(data.mid).is.undefined;
    expect(data.late).is.undefined;
  });

  it('unlocks the mid row once the game reaches generation 4, and not before', () => {
    const data = game.blackMarketData!;
    game.generation = 3;
    BlackMarket.onGenerationStart(game);
    expect(data.mid).is.undefined;

    game.generation = 4;
    BlackMarket.onGenerationStart(game);
    expect(data.mid).is.not.undefined;
    expect(data.mid!.slots).has.lengthOf(BLACK_MARKET_ROW_SLOT_COUNT);
    expect(data.mid!.slots.every((slot) => BLACK_MARKET_DESIGNS[slot!.designIndex].tier === 'mid')).is.true;
  });

  it('unlocks the late row once the game reaches generation 7, and not before', () => {
    const data = game.blackMarketData!;
    game.generation = 6;
    BlackMarket.onGenerationStart(game);
    expect(data.late).is.undefined;

    game.generation = 7;
    BlackMarket.onGenerationStart(game);
    expect(data.late).is.not.undefined;
    expect(data.late!.slots).has.lengthOf(BLACK_MARKET_ROW_SLOT_COUNT);
    expect(data.late!.slots.every((slot) => BLACK_MARKET_DESIGNS[slot!.designIndex].tier === 'late')).is.true;
  });

  it('never re-initializes an already-unlocked row', () => {
    const data = game.blackMarketData!;
    game.generation = 4;
    BlackMarket.onGenerationStart(game);
    const midBefore = data.mid;

    game.generation = 5;
    BlackMarket.onGenerationStart(game);
    expect(data.mid).to.equal(midBefore);
  });

  it('excludes the Underground Casino design (Crime tag) from the early row when Underworld is not enabled', () => {
    const data = game.blackMarketData!;
    const activeDesigns = [...data.early.slots.map((s) => s?.designIndex), ...data.early.designQueue];
    expect(activeDesigns).to.not.include(UNDERGROUND_CASINO_DESIGN);
  });

  it('includes the Underground Casino design when Underworld is enabled', () => {
    const [underworldGame] = testGame(2, {blackMarketExpansion: true, underworldExpansion: true});
    const data = underworldGame.blackMarketData!;
    const activeDesigns = [...data.early.slots.map((s) => s?.designIndex), ...data.early.designQueue];
    expect(activeDesigns).to.include(UNDERGROUND_CASINO_DESIGN);
  });

  it('buy deducts both the card\'s M€ cost and its reserveUnits via the normal play pipeline, adds it to the tableau, and marks the slot sold (hidden) for the rest of the generation', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new SmuggledReactorCore(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 0};
    player.megaCredits = 1;
    player.titanium = 2;

    BlackMarket.buy(game, player, 'early', 0);

    expect(player.megaCredits).to.eq(0);
    expect(player.titanium).to.eq(0);
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE)).is.true;
    expect(data.early.sold[0]).is.true;
    // The slot's design/printing is still tracked internally (so onGenerationEnd can advance
    // it) even though it now reads as sold/hidden.
    expect(data.early.slots[0]!.designIndex).to.eq(SMUGGLED_REACTOR_CORE_DESIGN);
    expect(data.early.slots[0]!.variantIndex).to.eq(0);
  });

  it('regression: buying a pure-M€-cost design (no reserveUnits) actually charges its M€ cost', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new RogueAiContract(), designIndex: ROGUE_AI_CONTRACT_DESIGN, variantIndex: 0};
    player.megaCredits = 8;

    BlackMarket.buy(game, player, 'early', 0);

    expect(player.megaCredits).to.eq(0);
    expect(player.playedCards.has(CardName.ROGUE_AI_CONTRACT)).is.true;
  });

  it('canAfford is false, and buy throws, when the player lacks the M€ for a pure-M€-cost design', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new RogueAiContract(), designIndex: ROGUE_AI_CONTRACT_DESIGN, variantIndex: 0};
    player.megaCredits = 7;

    expect(BlackMarket.canAfford(player, data.early.slots[0]!.card)).is.false;
    expect(() => BlackMarket.buy(game, player, 'early', 0)).to.throw();
    expect(player.megaCredits).to.eq(7);
  });

  it('canAfford is true once the player has enough M€', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new RogueAiContract(), designIndex: ROGUE_AI_CONTRACT_DESIGN, variantIndex: 0};
    player.megaCredits = 8;

    expect(BlackMarket.canAfford(player, data.early.slots[0]!.card)).is.true;
  });

  it('cannot buy an already-sold slot again this generation', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new SmuggledReactorCore(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 0};
    player.megaCredits = 100;
    player.titanium = 100;

    BlackMarket.buy(game, player, 'early', 0);

    expect(() => BlackMarket.buy(game, player, 'early', 0)).to.throw();
  });

  it('a fixed-price design\'s M€ cost escalates by variant (1 / 2 / 3), with a flat resource cost', () => {
    expect(new SmuggledReactorCore().cost).to.eq(1);
    expect(new SmuggledReactorCoreII().cost).to.eq(2);
    expect(new SmuggledReactorCoreIII().cost).to.eq(3);
    for (const printing of [new SmuggledReactorCore(), new SmuggledReactorCoreII(), new SmuggledReactorCoreIII()]) {
      expect(printing.reserveUnits).to.deep.include({titanium: 2});
    }
  });

  it('onGenerationEnd advances every slot -- sold or still unsold -- to the design\'s next printing, and resets sold', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new SmuggledReactorCore(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 0};
    data.early.sold[0] = true; // simulate: bought earlier this generation
    data.early.slots[1] = {card: new CounterfeitCertificates(), designIndex: COUNTERFEIT_CERTIFICATES_DESIGN, variantIndex: 0};
    data.early.sold[1] = false; // still sitting there, unsold

    BlackMarket.onGenerationEnd(game);

    expect(data.early.sold[0]).is.false;
    expect(data.early.slots[0]!.designIndex).to.eq(SMUGGLED_REACTOR_CORE_DESIGN);
    expect(data.early.slots[0]!.variantIndex).to.eq(1);
    expect(data.early.slots[0]!.card.name).to.eq(CardName.SMUGGLED_REACTOR_CORE_II);

    // Unsold slots advance too -- this isn't a "keep it until bought" pile anymore.
    expect(data.early.sold[1]).is.false;
    expect(data.early.slots[1]!.designIndex).to.eq(COUNTERFEIT_CERTIFICATES_DESIGN);
    expect(data.early.slots[1]!.variantIndex).to.eq(1);
    expect(data.early.slots[1]!.card.name).to.eq(CardName.COUNTERFEIT_CERTIFICATES_II);
  });

  it('onGenerationEnd rotates to a fresh design once a design\'s printings run out, if one remains in the queue', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new SmuggledReactorCoreIV(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 3};
    data.early.designQueue = [COUNTERFEIT_CERTIFICATES_DESIGN];

    BlackMarket.onGenerationEnd(game);

    const next = data.early.slots[0]!;
    expect(next.designIndex).to.eq(COUNTERFEIT_CERTIFICATES_DESIGN);
    expect(next.variantIndex).to.eq(0);
    expect(data.early.sold[0]).is.false;
    expect(data.early.designQueue).has.lengthOf(0);
  });

  it('onGenerationEnd leaves a permanently-exhausted slot empty (no design left in the queue)', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new SmuggledReactorCoreIV(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 3};
    data.early.designQueue = [];

    BlackMarket.onGenerationEnd(game);

    expect(data.early.slots[0]).is.undefined;
    expect(data.early.sold[0]).is.false;
  });

  it('onGenerationEnd only touches unlocked rows', () => {
    expect(() => BlackMarket.onGenerationEnd(game)).to.not.throw();
    expect(game.blackMarketData!.mid).is.undefined;
    expect(game.blackMarketData!.late).is.undefined;
  });

  it('buying from the mid row deducts price and marks the slot sold', () => {
    const data = game.blackMarketData!;
    game.generation = 4;
    BlackMarket.onGenerationStart(game);
    data.mid!.slots[0] = {card: new OreForOxygenRacket(), designIndex: ORE_FOR_OXYGEN_RACKET_DESIGN, variantIndex: 0};
    player.megaCredits = 1;
    player.steel = 3;

    BlackMarket.buy(game, player, 'mid', 0);

    expect(player.megaCredits).to.eq(0);
    expect(player.steel).to.eq(0);
    expect(player.playedCards.has(CardName.ORE_FOR_OXYGEN_RACKET)).is.true;
    expect(data.mid!.sold[0]).is.true;
  });

  it('throws when buying from a row that has not unlocked yet', () => {
    expect(() => BlackMarket.buy(game, player, 'mid', 0)).to.throw();
  });

  it('serialize/deserialize round-trips all 3 rows, including a locked mid/late', () => {
    const data = game.blackMarketData!;
    const serialized = BlackMarket.serialize(data)!;
    expect(serialized.early.slots).has.lengthOf(BLACK_MARKET_ROW_SLOT_COUNT);
    expect(serialized.early.sold).has.lengthOf(BLACK_MARKET_ROW_SLOT_COUNT);
    expect(serialized.mid).is.undefined;
    expect(serialized.late).is.undefined;

    const deserialized = BlackMarket.deserialize(serialized)!;
    expect(deserialized.early.sold).deep.eq(data.early.sold);
    expect(deserialized.early.slots.map((s) => s === undefined ? undefined : {designIndex: s.designIndex, variantIndex: s.variantIndex, name: s.card.name}))
      .deep.eq(data.early.slots.map((s) => s === undefined ? undefined : {designIndex: s.designIndex, variantIndex: s.variantIndex, name: s.card.name}));
    expect(deserialized.mid).is.undefined;
    expect(deserialized.late).is.undefined;
  });

  it('serialize/deserialize round-trips an unlocked mid row too, including sold flags', () => {
    game.generation = 4;
    BlackMarket.onGenerationStart(game);
    const data = game.blackMarketData!;
    data.mid!.sold[0] = true;

    const serialized = BlackMarket.serialize(data)!;
    expect(serialized.mid).is.not.undefined;

    const deserialized = BlackMarket.deserialize(serialized)!;
    expect(deserialized.mid!.sold).deep.eq(data.mid!.sold);
    expect(deserialized.mid!.slots.map((s) => s?.card.name)).deep.eq(data.mid!.slots.map((s) => s?.card.name));
  });

  it('describePrice formats a mixed M€ + non-M€ bundle straight off the card', () => {
    expect(BlackMarket.describePrice(new CounterfeitCertificates())).to.eq('2 M€, 1 heat');
  });
});
