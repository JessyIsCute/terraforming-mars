import {expect} from 'chai';
import {testGame} from '../../TestGame';
import {OvercrowdedColony} from '../../../src/server/cards/sillyfication/OvercrowdedColony';
import {SelectColony} from '../../../src/server/inputs/SelectColony';
import {ColonyName} from '../../../src/common/colonies/ColonyName';
import {IGame} from '../../../src/server/IGame';
import {IColony} from '../../../src/server/colonies/IColony';
import {cast} from '@/common/utils/utils';
import {TestPlayer} from '../../TestPlayer';

describe('OvercrowdedColony', () => {
  let card: OvercrowdedColony;
  let player: TestPlayer;
  let player2: TestPlayer;
  let game: IGame;
  let ganymede: IColony;

  beforeEach(() => {
    card = new OvercrowdedColony();
    [game, player, player2] = testGame(2, {
      coloniesExtension: true,
      customColoniesList: [
        ColonyName.GANYMEDE,
        ColonyName.LUNA,
        ColonyName.PLUTO,
        ColonyName.TITAN,
        ColonyName.TRITON],
    });
    ganymede = game.colonies.find((c) => c.name === ColonyName.GANYMEDE)!;
  });

  it('cannot be played when no colony tile is full', () => {
    ganymede.colonies = [player2.id, player2.id];
    expect(card.canPlay(player)).is.false;
  });

  it('can be played once a colony tile has 3 colonies', () => {
    ganymede.colonies = [player2.id, player2.id, player2.id];
    expect(card.canPlay(player)).is.true;
  });

  it('adds a fourth colony with no placement bonus', () => {
    ganymede.colonies = [player2.id, player2.id, player2.id];
    const plantsBefore = player.production.plants;

    const selectColony = cast(card.play(player), SelectColony);
    expect(selectColony.colonies).deep.eq([ganymede]);
    selectColony.cb(ganymede);

    expect(ganymede.colonies).deep.eq([player2.id, player2.id, player2.id, player.id]);
    expect(player.production.plants).eq(plantsBefore);
  });
});
