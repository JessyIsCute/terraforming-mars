import {expect} from 'chai';
import {BlackMarket} from '@/server/blackmarket/BlackMarket';
import {BLACK_MARKET_SLOT_COUNT} from '@/server/blackmarket/BlackMarketData';
import {BLACK_MARKET_DESIGNS} from '@/server/cards/blackmarket/BlackMarketCardManifest';
import {SmuggledReactorCore, SmuggledReactorCoreII, SmuggledReactorCoreIII} from '@/server/cards/blackmarket/SmuggledReactorCore';
import {CounterfeitCertificates} from '@/server/cards/blackmarket/CounterfeitCertificates';
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

describe('BlackMarket', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2, {blackMarketExpansion: true});
  });

  it('initialize deals 5 distinct designs, each showing its cheapest printing', () => {
    const data = game.blackMarketData!;
    expect(data).is.not.undefined;
    expect(data.slots).has.lengthOf(BLACK_MARKET_SLOT_COUNT);
    expect(data.slots.every((slot) => slot !== undefined)).is.true;
    expect(new Set(data.slots.map((slot) => slot!.designIndex)).size).to.eq(BLACK_MARKET_SLOT_COUNT);
    expect(data.slots.every((slot) => slot!.variantIndex === 0)).is.true;
  });

  it('excludes the Underground Casino design (Crime tag) when Underworld is not enabled', () => {
    const data = game.blackMarketData!;
    const activeDesigns = [...data.slots.map((s) => s?.designIndex), ...data.designQueue];
    expect(activeDesigns).to.not.include(UNDERGROUND_CASINO_DESIGN);
  });

  it('includes the Underground Casino design when Underworld is enabled', () => {
    const [underworldGame] = testGame(2, {blackMarketExpansion: true, underworldExpansion: true});
    const data = underworldGame.blackMarketData!;
    const activeDesigns = [...data.slots.map((s) => s?.designIndex), ...data.designQueue];
    expect(activeDesigns).to.include(UNDERGROUND_CASINO_DESIGN);
  });

  it('buy deducts the card\'s own printed price via the normal play pipeline, adds it to the tableau, and reveals the same design\'s next printing', () => {
    const data = game.blackMarketData!;
    data.slots[0] = {card: new SmuggledReactorCore(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 0};
    player.titanium = 2;

    BlackMarket.buy(game, player, 0);

    expect(player.titanium).to.eq(0);
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE)).is.true;

    const next = data.slots[0]!;
    expect(next.designIndex).to.eq(SMUGGLED_REACTOR_CORE_DESIGN);
    expect(next.variantIndex).to.eq(1);
    expect(next.card.name).to.eq(CardName.SMUGGLED_REACTOR_CORE_II);
  });

  it('a fixed-price design\'s price escalates by variant (2 / 3 / 4 titanium)', () => {
    expect(new SmuggledReactorCore().reserveUnits).to.deep.include({titanium: 2});
    expect(new SmuggledReactorCoreII().reserveUnits).to.deep.include({titanium: 3});
    expect(new SmuggledReactorCoreIII().reserveUnits).to.deep.include({titanium: 4});
  });

  it('doing the whole stack (3 printings) never collides, then rotates to a new design', () => {
    const data = game.blackMarketData!;
    data.slots[0] = {card: new SmuggledReactorCore(), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 0};
    // Only this design is left in the queue, so the slot goes empty once its stack (3 printings) is exhausted.
    data.designQueue = [];
    player.titanium = 100;

    expect(() => {
      BlackMarket.buy(game, player, 0); // variant 0 -> 1
      BlackMarket.buy(game, player, 0); // variant 1 -> 2
      BlackMarket.buy(game, player, 0); // variant 2 -> stack exhausted, no design left
    }).to.not.throw();

    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE)).is.true;
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE_II)).is.true;
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE_III)).is.true;
    expect(data.slots[0]).is.undefined;
  });

  it('rotates to a fresh design once a stack empties, if one remains in the queue', () => {
    const data = game.blackMarketData!;
    data.slots[0] = {card: new SmuggledReactorCore(CardName.SMUGGLED_REACTOR_CORE_III, 4), designIndex: SMUGGLED_REACTOR_CORE_DESIGN, variantIndex: 2};
    data.designQueue = [COUNTERFEIT_CERTIFICATES_DESIGN];
    player.titanium = 4;

    BlackMarket.buy(game, player, 0);

    const next = data.slots[0]!;
    expect(next.designIndex).to.eq(COUNTERFEIT_CERTIFICATES_DESIGN);
    expect(next.variantIndex).to.eq(0);
    expect(data.designQueue).has.lengthOf(0);
  });

  it('serialize/deserialize round-trips the slots and design queue', () => {
    const data = game.blackMarketData!;
    const serialized = BlackMarket.serialize(data)!;
    expect(serialized.slots).has.lengthOf(BLACK_MARKET_SLOT_COUNT);
    expect(serialized.designQueue).deep.eq(data.designQueue);

    const deserialized = BlackMarket.deserialize(serialized)!;
    expect(deserialized.slots.map((s) => s === undefined ? undefined : {designIndex: s.designIndex, variantIndex: s.variantIndex, name: s.card.name}))
      .deep.eq(data.slots.map((s) => s === undefined ? undefined : {designIndex: s.designIndex, variantIndex: s.variantIndex, name: s.card.name}));
    expect(deserialized.designQueue).deep.eq(data.designQueue);
  });

  it('describePrice formats a mixed M€ + non-M€ bundle straight off the card', () => {
    expect(BlackMarket.describePrice(new CounterfeitCertificates())).to.eq('2 M€, 1 heat');
  });
});
