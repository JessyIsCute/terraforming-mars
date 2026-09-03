import {expect} from 'chai';
import {CallistoTimeshare} from '../../../src/server/cards/sillyfication/CallistoTimeshare';
import {testGame} from '../../TestGame';

describe('CallistoTimeshare', () => {
  it('raises M€ production 2 steps and scores 1 VP', () => {
    const card = new CallistoTimeshare();
    const [/* game */, player] = testGame(2);

    card.play(player);

    expect(player.production.megacredits).to.eq(2);
    expect(card.getVictoryPoints(player)).to.eq(1);
  });
});
