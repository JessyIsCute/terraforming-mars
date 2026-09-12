import {expect} from 'chai';
import {AssistedGrowthPlants} from '../../../src/server/cards/corporatebetterments/AssistedGrowthPlants';
import {TestPlayer} from '../../TestPlayer';
import {IGame} from '../../../src/server/IGame';
import {testGame} from '../../TestGame';
import {runAllActions, setOxygenLevel} from '../../TestingUtils';
import {cast} from '../../../src/common/utils/utils';
import {SelectSpace} from '../../../src/server/inputs/SelectSpace';

describe('AssistedGrowthPlants', () => {
  let card: AssistedGrowthPlants;
  let game: IGame;
  let player: TestPlayer;

  beforeEach(() => {
    card = new AssistedGrowthPlants();
    [game, player] = testGame(2);
  });

  it('requires oxygen at maximum', () => {
    setOxygenLevel(game, 13);
    expect(card.canPlay(player)).is.false;
    setOxygenLevel(game, 14);
    expect(card.canPlay(player)).is.true;
  });

  it('places 3 greenery tiles', () => {
    setOxygenLevel(game, 14);

    card.play(player);

    for (let i = 0; i < 3; i++) {
      const selectSpace = cast(game.deferredActions.pop()?.execute(), SelectSpace);
      selectSpace.cb(selectSpace.spaces[0]);
    }
    runAllActions(game);

    expect(game.board.getGreeneries(player)).has.lengthOf(3);
  });
});
