import {expect} from 'chai';
import {GivePatent} from '../../../../src/server/cards/conglomerates/teamActions/GivePatent';
import {Ants} from '../../../../src/server/cards/base/Ants';
import {Birds} from '../../../../src/server/cards/base/Birds';
import {testGame} from '../../../TestGame';
import {TestPlayer} from '../../../TestPlayer';
import {cast} from '../../../../src/common/utils/utils';
import {SelectCard} from '../../../../src/server/inputs/SelectCard';
import {ConglomeratesExpansion} from '../../../../src/server/conglomerates/ConglomeratesExpansion';

describe('GivePatent', () => {
  let card: GivePatent;
  let player: TestPlayer;
  let teammate: TestPlayer;

  beforeEach(() => {
    card = new GivePatent();
    [, player, , teammate] = testGame(4, {conglomeratesExpansion: true});
    player.cardsInHand = [new Ants()];
    teammate.cardsInHand = [new Birds()];
  });

  it('cannot act without a teammate', () => {
    const [, solo] = testGame(4);
    solo.cardsInHand = [new Ants()];
    solo.conglomeratesData.coordination = 5;
    expect(card.canAct(solo)).is.false;
  });

  it('cannot act without enough coordination', () => {
    player.conglomeratesData.coordination = 1;
    expect(card.canAct(player)).is.false;
  });

  it('cannot act with an empty hand', () => {
    player.conglomeratesData.coordination = 5;
    player.cardsInHand = [];
    expect(card.canAct(player)).is.false;
  });

  it('gives a card to the teammate and spends coordination', () => {
    player.conglomeratesData.coordination = 5;
    expect(card.canAct(player)).is.true;

    const action = card.action(player);
    cast(action, SelectCard).cb([player.cardsInHand[0]]);

    expect(player.cardsInHand).is.empty;
    expect(teammate.cardsInHand.map((c) => c.name)).to.deep.eq(['Birds', 'Ants']);
    expect(player.conglomeratesData.coordination).to.eq(3);
  });

  it('escalates its cost after use, for both teammates', () => {
    player.conglomeratesData.coordination = 5;
    const action = card.action(player);
    cast(action, SelectCard).cb([player.cardsInHand[0]]);

    expect(ConglomeratesExpansion.getTeamActionCost(player, 'givePatent')).to.eq(3);
    expect(ConglomeratesExpansion.getTeamActionCost(teammate, 'givePatent')).to.eq(3);
  });
});
