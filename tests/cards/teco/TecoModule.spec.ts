import {expect} from 'chai';
import {GameCards} from '../../../src/server/GameCards';
import {CardName} from '../../../src/common/cards/CardName';
import {DEFAULT_GAME_OPTIONS, GameOptions} from '../../../src/server/game/GameOptions';
import {toName} from '../../../src/common/utils/utils';

describe('Teco module', () => {
  it('only offers Teco cards when tecoExpansion is on', () => {
    const off: GameOptions = {...DEFAULT_GAME_OPTIONS, corporateEra: true, preludeExtension: true, tecoExpansion: false};
    const on: GameOptions = {...DEFAULT_GAME_OPTIONS, corporateEra: true, preludeExtension: true, tecoExpansion: true};

    const offPool = [
      ...new GameCards(off).getProjectCards().map(toName),
      ...new GameCards(off).getPreludeCards().map(toName),
    ];
    const onPool = [
      ...new GameCards(on).getProjectCards().map(toName),
      ...new GameCards(on).getPreludeCards().map(toName),
    ];

    expect(offPool).to.not.contain(CardName.CATS);
    expect(offPool).to.not.contain(CardName.MARS_HOMESTEAD_ACT);
    expect(onPool).to.contain(CardName.CATS);
    expect(onPool).to.contain(CardName.TAG_TAXER);
    expect(onPool).to.contain(CardName.GENEROUS_REDISTRIBUTION);
    expect(onPool).to.contain(CardName.MARS_HOMESTEAD_ACT);
  });

  it('only offers Market Crash (a Crime-tagged prelude) when underworldExpansion is on', () => {
    const withoutUnderworld: GameOptions = {...DEFAULT_GAME_OPTIONS, corporateEra: true, preludeExtension: true, tecoExpansion: true, underworldExpansion: false};
    const withUnderworld: GameOptions = {...DEFAULT_GAME_OPTIONS, corporateEra: true, preludeExtension: true, tecoExpansion: true, underworldExpansion: true};

    expect(new GameCards(withoutUnderworld).getPreludeCards().map(toName)).to.not.contain(CardName.MARKET_CRASH);
    expect(new GameCards(withUnderworld).getPreludeCards().map(toName)).to.contain(CardName.MARKET_CRASH);
  });
});
