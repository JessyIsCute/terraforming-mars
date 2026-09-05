import {expect} from 'chai';
import {Blockhouse} from '../../../src/server/cards/sillyfication/Blockhouse';
import {CorporateStronghold} from '../../../src/server/cards/base/CorporateStronghold';
import {SmeltingPods} from '../../../src/server/cards/sillyfication/SmeltingPods';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {Payment} from '../../../src/common/inputs/Payment';

describe('Blockhouse', () => {
  let card: Blockhouse;
  let player: TestPlayer;

  beforeEach(() => {
    card = new Blockhouse();
    [/* game */, player] = testGame(2);
  });

  it('allows steel to pay for the City standard project', () => {
    const sp = new CityStandardProject();
    expect(sp.canPayWith(player)).to.deep.eq({});

    player.playedCards.push(card);
    expect(sp.canPayWith(player)).to.deep.eq({steel: true});
  });

  it('makes steel worth 2 M€ extra when paying for a City-tagged card', () => {
    player.playedCards.push(card);
    const cityCard = new CorporateStronghold(); // City+Building, cost 11
    player.steel = 3;
    player.megaCredits = 0;

    // 3 steel at the boosted value (2 base + 2 bonus = 4 each = 12) covers the cost of 11;
    // at the un-boosted value (2 each = 6) it would not.
    expect(() => player.checkPaymentAndPlayCard(cityCard, Payment.of({steel: 3}))).to.not.throw();
  });

  it('does not boost steel for a City-tagged card without Blockhouse in play', () => {
    const cityCard = new CorporateStronghold();
    player.steel = 3;
    player.megaCredits = 0;

    expect(() => player.checkPaymentAndPlayCard(cityCard, Payment.of({steel: 3}))).to.throw();
  });

  it('does not boost steel for a Building-only card, even with Blockhouse in play', () => {
    player.playedCards.push(card);
    const buildingCard = new SmeltingPods(); // Building only, cost 15
    player.steel = 5;
    player.megaCredits = 0;

    // At the boosted value (4 each = 20) this would cover the cost of 15; at the
    // un-boosted value (2 each = 10) it should not.
    expect(() => player.checkPaymentAndPlayCard(buildingCard, Payment.of({steel: 5}))).to.throw();
  });
});
