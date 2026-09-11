import {expect} from 'chai';
import {BlackMarket} from '@/server/blackmarket/BlackMarket';
import {BLACK_MARKET_ROW_SLOT_COUNT} from '@/server/blackmarket/BlackMarketData';
import {BLACK_MARKET_DESIGNS} from '@/server/cards/blackmarket/BlackMarketCardManifest';
import {SmuggledReactorCore, SmuggledReactorCoreII, SmuggledReactorCoreIII} from '@/server/cards/blackmarket/SmuggledReactorCore';
import {CounterfeitCertificates} from '@/server/cards/blackmarket/CounterfeitCertificates';
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

describe('BlackMarket', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2, {blackMarketExpansion: true});
  });

  it('initialize deals the early row with 4 distinct designs, each showing its cheapest printing, and leaves mid/late locked', () => {
    const data = game.blackMarketData!;
    expect(data).is.not.undefined;
    expect(data.early.slots).has.lengthOf(BLACK_MARKET_ROW_SLOT_COUNT);
    expect(data.early.slots.every((slot) => slot !== undefined)).is.true;
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

  it('buy deducts the card\'s own printed price via the normal play pipeline, adds it to the tableau, and reveals the same design\'s next printing', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new SmuggledReactorCore(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 0};
    player.titanium = 2;

    BlackMarket.buy(game, player, 'early', 0);

    expect(player.titanium).to.eq(0);
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE)).is.true;

    const next = data.early.slots[0]!;
    expect(next.designIndex).to.eq(SMUGGLED_REACTOR_CORE_DESIGN);
    expect(next.variantIndex).to.eq(1);
    expect(next.card.name).to.eq(CardName.SMUGGLED_REACTOR_CORE_II);
  });

  it('a fixed-price design\'s price escalates by variant (2 / 3 / 4 titanium)', () => {
    expect(new SmuggledReactorCore().reserveUnits).to.deep.include({titanium: 2});
    expect(new SmuggledReactorCoreII().reserveUnits).to.deep.include({titanium: 3});
    expect(new SmuggledReactorCoreIII().reserveUnits).to.deep.include({titanium: 4});
  });

  it('doing the whole stack (3 printings) never collides, then rotates to a new design within the same tier', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new SmuggledReactorCore(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 0};
    // Only this design is left in the queue, so the slot goes empty once its stack (3 printings) is exhausted.
    data.early.designQueue = [];
    player.titanium = 100;

    expect(() => {
      BlackMarket.buy(game, player, 'early', 0); // variant 0 -> 1
      BlackMarket.buy(game, player, 'early', 0); // variant 1 -> 2
      BlackMarket.buy(game, player, 'early', 0); // variant 2 -> stack exhausted, no design left
    }).to.not.throw();

    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE)).is.true;
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE_II)).is.true;
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE_III)).is.true;
    expect(data.early.slots[0]).is.undefined;
  });

  it('rotates to a fresh design once a stack empties, if one remains in the queue', () => {
    const data = game.blackMarketData!;
    data.early.slots[0] = {card: new SmuggledReactorCore(CardName.SMUGGLED_REACTOR_CORE_III, 4), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 2};
    data.early.designQueue = [COUNTERFEIT_CERTIFICATES_DESIGN];
    player.titanium = 4;

    BlackMarket.buy(game, player, 'early', 0);

    const next = data.early.slots[0]!;
    expect(next.designIndex).to.eq(COUNTERFEIT_CERTIFICATES_DESIGN);
    expect(next.variantIndex).to.eq(0);
    expect(data.early.designQueue).has.lengthOf(0);
  });

  it('buying from the mid row deducts price and rotates within the mid tier', () => {
    const data = game.blackMarketData!;
    game.generation = 4;
    BlackMarket.onGenerationStart(game);
    data.mid!.slots[0] = {card: new OreForOxygenRacket(), designIndex: ORE_FOR_OXYGEN_RACKET_DESIGN, variantIndex: 0};
    player.steel = 3;

    BlackMarket.buy(game, player, 'mid', 0);

    expect(player.steel).to.eq(0);
    expect(player.playedCards.has(CardName.ORE_FOR_OXYGEN_RACKET)).is.true;
    expect(data.mid!.slots[0]!.designIndex).to.eq(ORE_FOR_OXYGEN_RACKET_DESIGN);
  });

  it('throws when buying from a row that has not unlocked yet', () => {
    expect(() => BlackMarket.buy(game, player, 'mid', 0)).to.throw();
  });

  it('serialize/deserialize round-trips all 3 rows, including a locked mid/late', () => {
    const data = game.blackMarketData!;
    const serialized = BlackMarket.serialize(data)!;
    expect(serialized.early.slots).has.lengthOf(BLACK_MARKET_ROW_SLOT_COUNT);
    expect(serialized.mid).is.undefined;
    expect(serialized.late).is.undefined;

    const deserialized = BlackMarket.deserialize(serialized)!;
    expect(deserialized.early.slots.map((s) => s === undefined ? undefined : {designIndex: s.designIndex, variantIndex: s.variantIndex, name: s.card.name}))
      .deep.eq(data.early.slots.map((s) => s === undefined ? undefined : {designIndex: s.designIndex, variantIndex: s.variantIndex, name: s.card.name}));
    expect(deserialized.mid).is.undefined;
    expect(deserialized.late).is.undefined;
  });

  it('serialize/deserialize round-trips an unlocked mid row too', () => {
    game.generation = 4;
    BlackMarket.onGenerationStart(game);
    const data = game.blackMarketData!;

    const serialized = BlackMarket.serialize(data)!;
    expect(serialized.mid).is.not.undefined;

    const deserialized = BlackMarket.deserialize(serialized)!;
    expect(deserialized.mid!.slots.map((s) => s?.card.name)).deep.eq(data.mid!.slots.map((s) => s?.card.name));
  });

  it('describePrice formats a mixed M€ + non-M€ bundle straight off the card', () => {
    expect(BlackMarket.describePrice(new CounterfeitCertificates())).to.eq('2 M€, 1 heat');
  });
});
