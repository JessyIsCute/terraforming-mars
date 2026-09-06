import {expect} from 'chai';
import {ZetaTollkeeper} from '../../../src/server/cards/sillyfication/ZetaTollkeeper';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {IGame} from '../../../src/server/IGame';
import {TestPlayer} from '../../TestPlayer';

describe('ZetaTollkeeper', () => {
  let card: ZetaTollkeeper;
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    card = new ZetaTollkeeper();
    [game, player] = testGame(1, {deltaProjectExpansion: true});
  });

  it('has no tags', () => {
    expect(card.tags).to.deep.eq([]);
  });

  it('starts with 72 M€ and -3 M€ production', () => {
    player.playCorporationCard(card);
    runAllActions(game);

    expect(player.megaCredits).eq(72);
    expect(player.production.megacredits).eq(-3);
  });
});
