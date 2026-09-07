import {expect} from 'chai';
import {MutationMarkets} from '../../src/server/mutationmarkets/MutationMarkets';
import {MutationEffects} from '../../src/server/mutationmarkets/MutationEffects';
import {MutationName} from '../../src/common/mutationmarkets/MutationName';
import {CardType} from '../../src/common/cards/CardType';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {fakeCard} from '../TestingUtils';

describe('MutationMarkets on-play effects (grantResourceOnPlay / grantProductionOnPlay / convertType)', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [/* game */, player] = testGame(2);
  });

  it('grants a flat resource on play (Greenery Keeper / Animal Warden / Space Visionary style)', () => {
    const card = fakeCard({mutations: [{mutation: MutationName.GREENERY_KEEPER}]});
    player.plants = 0;
    MutationMarkets.applyOnPlayEffects(player, card);
    expect(player.plants).to.eq(2);
  });

  it('grants a production step on play (Ocean Surveyor / Steel Baron style)', () => {
    const card = fakeCard({mutations: [{mutation: MutationName.STEEL_BARON}]});
    const before = player.production.steel;
    MutationMarkets.applyOnPlayEffects(player, card);
    expect(player.production.steel).to.eq(before + 1);
  });

  it('grants a M€ rebate on play when convertType lands on an Active card', () => {
    // applyOnPlayEffects reads `baseType` (the printed type), not `type` (which the
    // convertType effect's own getter override would otherwise flip) -- setting both to
    // ACTIVE here since a real Card.ts instance would report the same for an Active card.
    const card = fakeCard({type: CardType.ACTIVE, baseType: CardType.ACTIVE, cost: 20, baseCost: 20, mutations: [{mutation: MutationName.BUILDING_MOGUL}]});
    const before = player.megaCredits;
    MutationMarkets.applyOnPlayEffects(player, card);
    // rebateAmount(20): round(20*0.3)=6, clamped to [3,12] -> 6.
    expect(player.megaCredits).to.eq(before + 6);
  });

  it('grants no rebate on play when convertType lands on an Automated or Event card (the type flip is the whole effect)', () => {
    const automated = fakeCard({type: CardType.AUTOMATED, baseType: CardType.AUTOMATED, cost: 20, baseCost: 20, mutations: [{mutation: MutationName.BUILDING_MOGUL}]});
    const before = player.megaCredits;
    MutationMarkets.applyOnPlayEffects(player, automated);
    expect(player.megaCredits).to.eq(before);
  });

  it('does nothing for a card with no mutations', () => {
    const card = fakeCard();
    const beforePlants = player.plants;
    const beforeMc = player.megaCredits;
    MutationMarkets.applyOnPlayEffects(player, card);
    expect(player.plants).to.eq(beforePlants);
    expect(player.megaCredits).to.eq(beforeMc);
  });
});

describe('MutationEffects.applyType', () => {
  it('flips Automated to Event and vice versa when convertType is applied', () => {
    const card = fakeCard({mutations: [{mutation: MutationName.BUILDING_MOGUL}]});
    expect(MutationEffects.applyType(card, CardType.AUTOMATED)).to.eq(CardType.EVENT);
    expect(MutationEffects.applyType(card, CardType.EVENT)).to.eq(CardType.AUTOMATED);
  });

  it('leaves Active (and any other type) unchanged -- the flip only applies to Automated/Event', () => {
    const card = fakeCard({mutations: [{mutation: MutationName.BUILDING_MOGUL}]});
    expect(MutationEffects.applyType(card, CardType.ACTIVE)).to.eq(CardType.ACTIVE);
  });

  it('leaves the type unchanged for a card with no convertType mutation applied', () => {
    const card = fakeCard({mutations: [{mutation: MutationName.MINI_MUTATION}]});
    expect(MutationEffects.applyType(card, CardType.AUTOMATED)).to.eq(CardType.AUTOMATED);
  });

  it('leaves the type unchanged for a card with no mutations at all', () => {
    const card = fakeCard();
    expect(MutationEffects.applyType(card, CardType.AUTOMATED)).to.eq(CardType.AUTOMATED);
  });
});

describe('MutationEffects.rebateAmount', () => {
  it('is 30% of base cost, clamped to [3, 12]', () => {
    expect(MutationEffects.rebateAmount(20)).to.eq(6); // round(20*0.3)=6
    expect(MutationEffects.rebateAmount(4)).to.eq(3); // round(4*0.3)=1 -> clamped up to 3
    expect(MutationEffects.rebateAmount(60)).to.eq(12); // round(60*0.3)=18 -> clamped down to 12
  });
});
