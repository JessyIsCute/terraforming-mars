import {expect} from 'chai';
import {Blockhouse} from '../../../src/server/cards/teco/Blockhouse';
import {CityStandardProject} from '../../../src/server/cards/base/standardProjects/CityStandardProject';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('Blockhouse', () => {
  let card: Blockhouse;
  let player: TestPlayer;

  beforeEach(() => {
    card = new Blockhouse();
    [/* game */, player] = testGame(2);
  });

  it('increases steel value by 2, and reverts it on discard', () => {
    const before = player.getSteelValue();
    card.play(player);
    expect(player.getSteelValue()).to.eq(before + 2);

    card.onDiscard(player);
    expect(player.getSteelValue()).to.eq(before + 1);
  });

  it('allows steel to pay for the City standard project', () => {
    const sp = new CityStandardProject();
    expect(sp.canPayWith(player)).to.deep.eq({});

    player.playedCards.push(card);
    expect(sp.canPayWith(player)).to.deep.eq({steel: true});
  });
});
