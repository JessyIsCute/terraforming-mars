import {expect} from 'chai';
import {MicroEnergies} from '../../../src/server/cards/sillyfication/MicroEnergies';
import {MicroSteels} from '../../../src/server/cards/sillyfication/MicroSteels';
import {MicroPlants} from '../../../src/server/cards/sillyfication/MicroPlants';
import {MicroTitaniums} from '../../../src/server/cards/sillyfication/MicroTitaniums';
import {testGame} from '../../TestGame';

describe('Micro resource cards', () => {
  it('Micro Energies raises energy production 1 step', () => {
    const [/* game */, player] = testGame(2);
    new MicroEnergies().play(player);
    expect(player.production.energy).to.eq(1);
  });

  it('Micro Steels raises steel production 1 step', () => {
    const [/* game */, player] = testGame(2);
    new MicroSteels().play(player);
    expect(player.production.steel).to.eq(1);
  });

  it('Micro Plants raises plant production 1 step', () => {
    const [/* game */, player] = testGame(2);
    new MicroPlants().play(player);
    expect(player.production.plants).to.eq(1);
  });

  it('Micro Titaniums raises titanium production 1 step', () => {
    const [/* game */, player] = testGame(2);
    new MicroTitaniums().play(player);
    expect(player.production.titanium).to.eq(1);
  });
});
