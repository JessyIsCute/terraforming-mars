import {expect} from 'chai';
import {BlackMarket} from '@/server/blackmarket/BlackMarket';
import {BLACK_MARKET_SLOT_COUNT} from '@/server/blackmarket/BlackMarketData';
import {SmuggledReactorCore, SmuggledReactorCoreII} from '@/server/cards/blackmarket/SmuggledReactorCore';
import {CounterfeitCertificates} from '@/server/cards/blackmarket/CounterfeitCertificates';
import {CardName} from '@/common/cards/CardName';
import {IGame} from '@/server/IGame';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';

describe('BlackMarket', () => {
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    [game, player] = testGame(2, {blackMarketExpansion: true});
  });

  it('initialize deals 5 distinct cards', () => {
    const data = game.blackMarketData!;
    expect(data).is.not.undefined;
    expect(data.slots).has.lengthOf(BLACK_MARKET_SLOT_COUNT);
    expect(data.slots.every((slot) => slot !== undefined)).is.true;
    const names = data.slots.map((slot) => slot!.name);
    expect(new Set(names).size).to.eq(BLACK_MARKET_SLOT_COUNT);
  });

  it('excludes Underground Casino (Crime tag) when Underworld is not enabled', () => {
    const data = game.blackMarketData!;
    const wholePool = [...data.slots.map((c) => c?.name), ...data.drawPile];
    expect(wholePool).to.not.include(CardName.UNDERGROUND_CASINO);
  });

  it('includes Underground Casino when Underworld is enabled', () => {
    const [underworldGame] = testGame(2, {blackMarketExpansion: true, underworldExpansion: true});
    const data = underworldGame.blackMarketData!;
    const wholePool = [...data.slots.map((c) => c?.name), ...data.drawPile];
    expect(wholePool).to.include(CardName.UNDERGROUND_CASINO);
  });

  it('buy deducts the price via the normal play pipeline, adds the card to the tableau, and refills the slot', () => {
    const data = game.blackMarketData!;
    // Force a known, fixed-price card into slot 0 regardless of what was randomly dealt.
    data.slots[0] = new SmuggledReactorCore();
    player.titanium = 2;

    BlackMarket.buy(game, player, 0);

    expect(player.titanium).to.eq(0);
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE)).is.true;
    expect(data.slots[0]).is.not.undefined;
  });

  it('a player can buy 2 printings of the same design without the "already exists" collision', () => {
    const data = game.blackMarketData!;
    data.slots[0] = new SmuggledReactorCore();
    data.slots[1] = new SmuggledReactorCoreII();
    player.titanium = 4;

    expect(() => {
      BlackMarket.buy(game, player, 0);
      BlackMarket.buy(game, player, 1);
    }).to.not.throw();

    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE)).is.true;
    expect(player.playedCards.has(CardName.SMUGGLED_REACTOR_CORE_II)).is.true;
  });

  it('leaves a slot empty once the draw pile is exhausted', () => {
    const data = game.blackMarketData!;
    data.slots[0] = new SmuggledReactorCore();
    data.drawPile = [];
    player.titanium = 2;

    BlackMarket.buy(game, player, 0);

    expect(data.slots[0]).is.undefined;
  });

  it('serialize/deserialize round-trips the slots and draw pile', () => {
    const data = game.blackMarketData!;
    const serialized = BlackMarket.serialize(data)!;
    expect(serialized.slots).has.lengthOf(BLACK_MARKET_SLOT_COUNT);
    expect(serialized.drawPile).deep.eq(data.drawPile);

    const deserialized = BlackMarket.deserialize(serialized)!;
    expect(deserialized.slots.map((c) => c?.name)).deep.eq(data.slots.map((c) => c?.name));
    expect(deserialized.drawPile).deep.eq(data.drawPile);
  });

  it('describePrice formats a mixed M€ + non-M€ bundle', () => {
    expect(BlackMarket.describePrice(new CounterfeitCertificates())).to.eq('2 M€, 1 heat');
  });
});
