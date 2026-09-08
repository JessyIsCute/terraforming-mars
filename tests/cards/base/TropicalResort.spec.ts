import {expect} from 'chai';
import {TropicalResort} from '../../../src/server/cards/base/TropicalResort';
import {Resource} from '../../../src/common/Resource';
import {Units} from '../../../src/common/Units';
import {testGame} from '../../TestGame';
import {runAllActions} from '../../TestingUtils';
import {SelectProductionToLose} from '../../../src/server/inputs/SelectProductionToLose';
import {cast} from '@/common/utils/utils';

describe('TropicalResort', () => {
  it('increases M€ production 3 steps, then offers a choice of 2 units of production to lose', () => {
    const card = new TropicalResort();
    const [game, player] = testGame(1);
    player.production.add(Resource.HEAT, 2);
    player.production.add(Resource.ENERGY, 2);

    card.play(player);
    runAllActions(game);

    expect(player.production.megacredits).to.eq(3);

    const input = cast(player.getWaitingFor(), SelectProductionToLose);
    expect(input.unitsToLose).to.eq(2);

    // A mixture across two different production types is allowed.
    input.cb(Units.of({heat: 1, energy: 1}));

    expect(player.production.heat).to.eq(1);
    expect(player.production.energy).to.eq(1);
  });

  it('also allows putting both units into a single production type', () => {
    const card = new TropicalResort();
    const [game, player] = testGame(1);
    player.production.add(Resource.HEAT, 2);

    card.play(player);
    runAllActions(game);

    const input = cast(player.getWaitingFor(), SelectProductionToLose);
    input.cb(Units.of({heat: 2}));

    expect(player.production.heat).to.eq(0);
  });

  it('is worth 2 VP', () => {
    const card = new TropicalResort();
    const [/* game */, player] = testGame(1);
    expect(card.getVictoryPoints(player)).to.eq(2);
  });
});
