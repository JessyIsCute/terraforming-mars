import {expect} from 'chai';
import {PartyName} from '../../src/common/turmoil/PartyName';
import {Turmoil} from '../../src/server/turmoil/Turmoil';
import {GameCards} from '../../src/server/GameCards';
import {CardName} from '../../src/common/cards/CardName';
import {DEFAULT_GAME_OPTIONS, GameOptions} from '../../src/server/game/GameOptions';
import {toName} from '../../src/common/utils/utils';
import {testGame} from '../TestGame';

// Populists, Spome, Empower, Bureaucrats, Centrists and Transhumanists are placeholder Turmoil
// parties added for idesOfMars/robAntilles cards that reference them. They're gated behind
// their own "More Parties" fan expansion rather than idesOfMars/robAntilles directly, and any
// card that requires one of them is registered as needing moreParties too, so a game can't end
// up with a card whose required party doesn't exist.
describe('More Parties expansion', () => {
  it('the 6 placeholder parties only exist when morePartiesExpansion is on', () => {
    const [withoutIt] = testGame(1, {turmoilExtension: true, idesOfMarsExpansion: true, robAntillesExpansion: true});
    const namesWithout = Turmoil.getTurmoil(withoutIt).parties.map((p) => p.name);
    expect(namesWithout).to.not.contain(PartyName.BUREAUCRATS);
    expect(namesWithout).to.not.contain(PartyName.TRANSHUMANISTS);

    const [withIt] = testGame(1, {turmoilExtension: true, morePartiesExpansion: true});
    const namesWith = Turmoil.getTurmoil(withIt).parties.map((p) => p.name);
    expect(namesWith).to.contain(PartyName.BUREAUCRATS);
    expect(namesWith).to.contain(PartyName.TRANSHUMANISTS);
  });

  it('cards requiring a placeholder party are excluded unless moreParties is also enabled', () => {
    const withoutMoreParties: GameOptions = {
      ...DEFAULT_GAME_OPTIONS,
      corporateEra: true,
      turmoilExtension: true,
      idesOfMarsExpansion: true,
      robAntillesExpansion: true,
      morePartiesExpansion: false,
    };
    let pool = new GameCards(withoutMoreParties).getProjectCards().map(toName);
    expect(pool).to.not.contain(CardName.TERRAFORMING_OFFICE);
    expect(pool).to.not.contain(CardName.TAX_THE_RICH);

    const withMoreParties: GameOptions = {
      ...withoutMoreParties,
      morePartiesExpansion: true,
    };
    pool = new GameCards(withMoreParties).getProjectCards().map(toName);
    expect(pool).to.contain(CardName.TERRAFORMING_OFFICE);
    expect(pool).to.contain(CardName.TAX_THE_RICH);
  });
});
