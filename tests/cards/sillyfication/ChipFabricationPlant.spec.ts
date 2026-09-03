import {expect} from 'chai';
import {ChipFabricationPlant} from '../../../src/server/cards/sillyfication/ChipFabricationPlant';
import {SelectAmount} from '../../../src/server/inputs/SelectAmount';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {cast} from '../../../src/common/utils/utils';

describe('ChipFabricationPlant', () => {
  let card: ChipFabricationPlant;
  let player: TestPlayer;

  beforeEach(() => {
    card = new ChipFabricationPlant();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
  });

  it('cannot be played with more than 1 plant tag', () => {
    player.tagsForTest = {plant: 2};
    expect(card.canPlay(player)).is.false;
    player.tagsForTest = {plant: 1};
    expect(card.canPlay(player)).is.true;
  });

  it('cannot act without building tags or M€', () => {
    player.megaCredits = 10;
    expect(card.canAct(player)).is.false;
    player.tagsForTest = {building: 3};
    expect(card.canAct(player)).is.true;
    player.megaCredits = 0;
    expect(card.canAct(player)).is.false;
  });

  it('converts M€ to titanium, capped by building tags', () => {
    player.tagsForTest = {building: 3};
    player.megaCredits = 10;
    player.titanium = 0;

    const selectAmount = cast(card.action(player), SelectAmount);
    expect(selectAmount.max).to.eq(3);
    selectAmount.cb(3);

    expect(player.megaCredits).to.eq(7);
    expect(player.titanium).to.eq(3);
  });
});
