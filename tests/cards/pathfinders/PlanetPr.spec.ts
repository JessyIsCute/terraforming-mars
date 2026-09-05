import {expect} from 'chai';
import {PlanetPr} from '../../../src/server/cards/pathfinders/PlanetPr';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';
import {IGame} from '../../../src/server/IGame';
import {DeclareCloneTag} from '../../../src/server/pathfinders/DeclareCloneTag';
import {PathfindersExpansion} from '../../../src/server/pathfinders/PathfindersExpansion';
import {OrOptions} from '../../../src/server/inputs/OrOptions';
import {Tag} from '../../../src/common/cards/Tag';
import {cast} from '../../../src/common/utils/utils';
import {runAllActions} from '../../TestingUtils';

describe('PlanetPr', () => {
  let card: PlanetPr;
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    card = new PlanetPr();
    [game, player] = testGame(1, {pathfindersExpansion: true, venusNextExtension: true});
    player.playedCards.push(card);
  });

  it('starts with a clone tag', () => {
    expect(card.tags).deep.eq([Tag.CLONE]);
  });

  it('initialAction declares a tag, raises its track by 2 (1 base + 1 Planet PR bonus), and draws a matching card', () => {
    const cardsBefore = player.cardsInHand.length;

    card.initialAction(player);

    const action = cast(game.deferredActions.pop(), DeclareCloneTag);
    const options = cast(action.execute(), OrOptions);
    // [venus, earth, mars, jovian] are available (no moon expansion here).
    const marsOption = options.options.find((o) => o.title.toString().match(/mars/i));
    marsOption!.cb();
    runAllActions(game);

    expect(card.tags).deep.eq([Tag.MARS]);
    expect(game.pathfindersData!.mars).to.eq(2);
    expect(player.cardsInHand.length).to.eq(cardsBefore + 1);
    expect(player.cardsInHand[player.cardsInHand.length - 1].tags).to.include(Tag.MARS);
  });

  it('grants 2 M€ when triggering the Earth track bonus (space 3, nothing crossed before it)', () => {
    player.megaCredits = 0;
    // 0 -> 3 (1 requested + 1 Planet PR step): crosses only space 3, which has a risingPlayer reward.
    PathfindersExpansion.raiseTrack(Tag.EARTH, player, 2);

    expect(game.pathfindersData!.earth).to.eq(3);
    expect(player.megaCredits).to.eq(2);
  });

  it('grants 1 steel when triggering the Mars track bonus (space 5, starting past space 2)', () => {
    game.pathfindersData!.mars = 3;
    player.steel = 0;
    // 3 -> 5 (1 requested + 1 Planet PR step): crosses only space 5, which grants 1 steel via
    // its own "everyone" reward (solo game: everyone is just this player) plus 1 more from the
    // Planet PR bonus (steel_production, the other reward there, doesn't touch steel stock).
    PathfindersExpansion.raiseTrack(Tag.MARS, player, 1);

    expect(game.pathfindersData!.mars).to.eq(5);
    expect(player.steel).to.eq(2);
  });

  it('grants 1 titanium when triggering the Jovian track bonus (space 5, starting past space 2)', () => {
    game.pathfindersData!.jovian = 3;
    player.titanium = 0;
    // 3 -> 5 (1 requested + 1 Planet PR step): crosses only space 5, which has a risingPlayer reward.
    PathfindersExpansion.raiseTrack(Tag.JOVIAN, player, 1);

    expect(game.pathfindersData!.jovian).to.eq(5);
    expect(player.titanium).to.eq(1);
  });

  it('does not grant a bonus when the (bonus-extended) raise lands on an empty space', () => {
    game.pathfindersData!.mars = 2;
    player.steel = 0;
    // 2 -> 4 (1 requested + 1 Planet PR step): spaces 3 and 4 carry no rewards at all.
    PathfindersExpansion.raiseTrack(Tag.MARS, player, 1);

    expect(game.pathfindersData!.mars).to.eq(4);
    expect(player.steel).to.eq(0);
  });

  it('does not add an extra step or grant a bonus for a player without Planet PR', () => {
    const [otherGame, otherPlayer] = testGame(1, {pathfindersExpansion: true});
    otherGame.pathfindersData!.mars = 2;
    otherPlayer.steel = 0;
    // No Planet PR: a plain 2-step raise from 2 lands on 4, same empty spaces as above.
    PathfindersExpansion.raiseTrack(Tag.MARS, otherPlayer, 2);

    expect(otherGame.pathfindersData!.mars).to.eq(4);
    expect(otherPlayer.steel).to.eq(0);
  });
});
