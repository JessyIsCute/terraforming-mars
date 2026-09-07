import {expect} from 'chai';
import {DonationAction} from '../../../../src/server/cards/conglomerates/teamActions/DonationAction';
import {testGame} from '../../../TestGame';
import {TestPlayer} from '../../../TestPlayer';
import {cast} from '../../../../src/common/utils/utils';
import {OrOptions} from '../../../../src/server/inputs/OrOptions';

describe('DonationAction', () => {
  let card: DonationAction;
  let player: TestPlayer;
  let teammate: TestPlayer;

  beforeEach(() => {
    card = new DonationAction();
    [, player, , teammate] = testGame(4, {conglomeratesExpansion: true});
    player.conglomeratesData.coordination = 5;
    player.megaCredits = 10;
    player.steel = 3;
  });

  it('cannot act without a teammate', () => {
    const [, solo] = testGame(4);
    solo.conglomeratesData.coordination = 5;
    solo.megaCredits = 10;
    solo.steel = 3;
    expect(card.canAct(solo)).is.false;
  });

  it('cannot act without enough MC', () => {
    player.megaCredits = 3;
    expect(card.canAct(player)).is.false;
  });

  it('cannot act without at least 2 of some standard resource', () => {
    player.steel = 1;
    expect(card.canAct(player)).is.false;
  });

  it('cannot act without enough coordination', () => {
    player.conglomeratesData.coordination = 0;
    expect(card.canAct(player)).is.false;
  });

  it('sends 4 MC and 2 of the chosen resource to the teammate', () => {
    expect(card.canAct(player)).is.true;

    // Only steel is donatable here, so the choice collapses straight to that action.
    card.action(player);

    expect(player.megaCredits).to.eq(6);
    expect(player.steel).to.eq(1);
    expect(teammate.megaCredits).to.eq(4);
    expect(teammate.steel).to.eq(2);
    expect(player.conglomeratesData.coordination).to.eq(4);
  });

  it('offers a choice when multiple resources are donatable', () => {
    player.titanium = 2;
    const result = cast(card.action(player), OrOptions);
    expect(result.options).to.have.length(2);
  });
});
