import {expect} from 'chai';
import {AcidRefluxIndustries} from '../../../src/server/cards/sillyfication/AcidRefluxIndustries';
import {MicroCredits} from '../../../src/server/cards/sillyfication/MicroCredits';
import {VenusianSubsidiary} from '../../../src/server/cards/sillyfication/VenusianSubsidiary';
import {IGame} from '../../../src/server/IGame';
import {Payment} from '../../../src/common/inputs/Payment';
import {TestPlayer} from '../../TestPlayer';
import {runAllActions} from '../../TestingUtils';
import {testGame} from '../../TestGame';

describe('AcidRefluxIndustries', () => {
  let card: AcidRefluxIndustries;
  let player: TestPlayer;
  let game: IGame;

  beforeEach(() => {
    card = new AcidRefluxIndustries();
    [game, player] = testGame(2, {venusNextExtension: true});
    player.playedCards.push(card);
  });

  it('has two Venus tags', () => {
    expect(card.tags.filter((t) => t === 'venus')).to.have.length(2);
  });

  it('all cards cost 1 M€ more', () => {
    expect(card.getCardDiscount(player, new MicroCredits())).to.eq(-1);
    expect(card.getCardDiscount(player, new VenusianSubsidiary())).to.eq(-1);
  });

  it('adds 2 floaters on play and when a Venus-tag card is played', () => {
    card.play(player);
    runAllActions(game);
    expect(card.resourceCount).to.eq(2);

    card.onCardPlayed(player, new VenusianSubsidiary());
    runAllActions(game);
    expect(card.resourceCount).to.eq(4);
  });

  it('does not add floaters for a non-Venus card', () => {
    card.onCardPlayed(player, new MicroCredits());
    runAllActions(game);
    expect(card.resourceCount).to.eq(0);
  });

  it('its floaters count as spendable floaters', () => {
    player.addResourceTo(card, 4);
    expect(player.getSpendable('floaters')).to.eq(4);
  });

  it('paying with floaters drains them from this card', () => {
    player.addResourceTo(card, 4);
    player.pay(Payment.of({floaters: 3}));
    runAllActions(game);
    expect(card.resourceCount).to.eq(1);
  });

  it('action removes floaters for 2 M€ each', () => {
    expect(card.canAct()).is.false;
    player.addResourceTo(card, 5);
    player.megaCredits = 0;

    expect(card.canAct()).is.true;
    const selectAmount = card.action(player);
    selectAmount.cb(3);
    runAllActions(game);

    expect(card.resourceCount).to.eq(2);
    expect(player.megaCredits).to.eq(6);
  });
});
