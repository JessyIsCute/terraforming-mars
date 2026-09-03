import {expect} from 'chai';
import {UranusSeaCreatures} from '../../../src/server/cards/sillyfication/UranusSeaCreatures';
import {WaterImportFromEuropa} from '../../../src/server/cards/base/WaterImportFromEuropa';
import {GanymedeColony} from '../../../src/server/cards/base/GanymedeColony';
import {MicroCredits} from '../../../src/server/cards/sillyfication/MicroCredits';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('UranusSeaCreatures', () => {
  let card: UranusSeaCreatures;
  let player: TestPlayer;

  beforeEach(() => {
    card = new UranusSeaCreatures();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
  });

  it('requires 3 Jovian tags', () => {
    player.tagsForTest = {jovian: 2};
    expect(card.canPlay(player)).is.false;
    player.tagsForTest = {jovian: 3};
    expect(card.canPlay(player)).is.true;
  });

  it('adds an animal per Jovian tag played', () => {
    card.onCardPlayed(player, new GanymedeColony()); // 1 jovian tag
    expect(card.resourceCount).to.eq(1);

    card.onCardPlayed(player, new WaterImportFromEuropa()); // 1 jovian tag
    expect(card.resourceCount).to.eq(2);

    card.onCardPlayed(player, new MicroCredits()); // no jovian tag
    expect(card.resourceCount).to.eq(2);
  });

  it('scores 1 VP per animal', () => {
    player.addResourceTo(card, 5);
    expect(card.getVictoryPoints(player)).to.eq(5);
  });
});
