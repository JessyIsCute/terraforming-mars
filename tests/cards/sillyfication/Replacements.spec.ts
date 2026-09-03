import {expect} from 'chai';
import {GameCards} from '../../../src/server/GameCards';
import {CardName} from '../../../src/common/cards/CardName';
import {DEFAULT_GAME_OPTIONS, GameOptions} from '../../../src/server/game/GameOptions';
import {toName} from '../../../src/common/utils/utils';
import {Tag} from '../../../src/common/cards/Tag';
import {newCard} from '../../../src/server/createCard';
import {LunarBeamSilly} from '../../../src/server/cards/sillyfication/replacements/LunarBeamSilly';
import {LunaMetropolisSilly} from '../../../src/server/cards/sillyfication/replacements/LunaMetropolisSilly';
import {LunarExportsSilly} from '../../../src/server/cards/sillyfication/replacements/LunarExportsSilly';
import {MarsUniversitySilly} from '../../../src/server/cards/sillyfication/replacements/MarsUniversitySilly';
import {testGame} from '../../TestGame';

const MOON_SWAPS: ReadonlyArray<[CardName, ReadonlyArray<Tag>]> = [
  [CardName.LUNAR_BEAM_SILLY, [Tag.MOON, Tag.POWER]],
  [CardName.LUNA_METROPOLIS_SILLY, [Tag.CITY, Tag.SPACE, Tag.MOON]],
  [CardName.LUNAR_EXPORTS_SILLY, [Tag.EARTH, Tag.SPACE, Tag.MOON]],
];

const MARS_ADDS: ReadonlyArray<[CardName, Tag]> = [
  [CardName.PRISTAR_SILLY, Tag.MARS],
  [CardName.EARLY_SETTLEMENT_SILLY, Tag.MARS],
  [CardName.SELF_SUFFICIENT_SETTLEMENT_SILLY, Tag.MARS],
  [CardName.EOS_CHASMA_NATIONAL_PARK_SILLY, Tag.MARS],
  [CardName.IMMIGRATION_SHUTTLES_SILLY, Tag.MARS],
  [CardName.MARTIAN_RAILS_SILLY, Tag.MARS],
  [CardName.NOCTIS_CITY_SILLY, Tag.MARS],
  [CardName.NOCTIS_FARMING_SILLY, Tag.MARS],
  [CardName.PROTECTED_VALLEY_SILLY, Tag.MARS],
  [CardName.MARS_UNIVERSITY_SILLY, Tag.MARS],
  [CardName.PROTECTED_HABITATS_SILLY, Tag.MARS],
  [CardName.TROPICAL_RESORT_SILLY, Tag.MARS],
  [CardName.MARTIAN_MEDIA_CENTER_SILLY, Tag.MARS],
];

const ALL_REPLACEMENTS: ReadonlyArray<[CardName, CardName]> = [
  [CardName.LUNAR_BEAM_SILLY, CardName.LUNAR_BEAM],
  [CardName.LUNA_METROPOLIS_SILLY, CardName.LUNA_METROPOLIS],
  [CardName.LUNAR_EXPORTS_SILLY, CardName.LUNAR_EXPORTS],
  [CardName.PRISTAR_SILLY, CardName.PRISTAR],
  [CardName.EARLY_SETTLEMENT_SILLY, CardName.EARLY_SETTLEMENT],
  [CardName.SELF_SUFFICIENT_SETTLEMENT_SILLY, CardName.SELF_SUFFICIENT_SETTLEMENT],
  [CardName.EOS_CHASMA_NATIONAL_PARK_SILLY, CardName.EOS_CHASMA_NATIONAL_PARK],
  [CardName.IMMIGRATION_SHUTTLES_SILLY, CardName.IMMIGRATION_SHUTTLES],
  [CardName.MARTIAN_RAILS_SILLY, CardName.MARTIAN_RAILS],
  [CardName.NOCTIS_CITY_SILLY, CardName.NOCTIS_CITY],
  [CardName.NOCTIS_FARMING_SILLY, CardName.NOCTIS_FARMING],
  [CardName.PROTECTED_VALLEY_SILLY, CardName.PROTECTED_VALLEY],
  [CardName.MARS_UNIVERSITY_SILLY, CardName.MARS_UNIVERSITY],
  [CardName.PROTECTED_HABITATS_SILLY, CardName.PROTECTED_HABITATS],
  [CardName.TROPICAL_RESORT_SILLY, CardName.TROPICAL_RESORT],
  [CardName.MARTIAN_MEDIA_CENTER_SILLY, CardName.MARTIAN_MEDIA_CENTER],
];

describe('Sillyfication replacement cards', () => {
  it('moon-swap cards carry a Moon tag', () => {
    for (const [name, tags] of MOON_SWAPS) {
      expect(newCard(name).tags, name).to.deep.eq(tags);
    }
    // Lunar Beam / Luna Metropolis drop Earth entirely; Lunar Exports keeps it and adds Moon.
    expect(newCard(CardName.LUNAR_BEAM_SILLY).tags).to.not.contain(Tag.EARTH);
    expect(newCard(CardName.LUNA_METROPOLIS_SILLY).tags).to.not.contain(Tag.EARTH);
    expect(newCard(CardName.LUNAR_EXPORTS_SILLY).tags).to.contain(Tag.EARTH);
  });

  it('mars-add cards gain a Mars tag on top of the original tags', () => {
    for (const [name, tag] of MARS_ADDS) {
      expect(newCard(name).tags, name).to.contain(tag);
    }
  });

  it('cost bumps: Lunar Exports +1, Mars University +2', () => {
    expect(new LunarExportsSilly().cost).to.eq(20);
    expect(new MarsUniversitySilly().cost).to.eq(10);
  });

  it('each replacement has a unique sillyfication card number', () => {
    const numbers = ALL_REPLACEMENTS.map(([name]) => newCard(name).metadata.cardNumber);
    expect(new Set(numbers).size).to.eq(numbers.length);
    numbers.forEach((n) => expect(n).to.match(/^X\d+$/));
  });

  it('with Sillyfication on, base cards are swapped out for the replacements', () => {
    const gameOptions: GameOptions = {
      ...DEFAULT_GAME_OPTIONS,
      corporateEra: true,
      preludeExtension: true,
      venusNextExtension: true,
      coloniesExtension: true,
      turmoilExtension: true,
      sillyficationExpansion: true,
    };
    const cards = new GameCards(gameOptions);
    const projects = cards.getProjectCards().map(toName);
    const preludes = cards.getPreludeCards().map(toName);
    const corps = cards.getCorporationCards().map(toName);
    const pool = [...projects, ...preludes, ...corps];

    for (const [replacement, base] of ALL_REPLACEMENTS) {
      expect(pool, `${base} removed`).to.not.contain(base);
      expect(pool, `${replacement} present`).to.contain(replacement);
    }
  });

  it('with Sillyfication off, the base cards are untouched', () => {
    const gameOptions: GameOptions = {
      ...DEFAULT_GAME_OPTIONS,
      corporateEra: true,
      preludeExtension: true,
      venusNextExtension: true,
      coloniesExtension: true,
      turmoilExtension: true,
      sillyficationExpansion: false,
    };
    const cards = new GameCards(gameOptions);
    const pool = [
      ...cards.getProjectCards().map(toName),
      ...cards.getPreludeCards().map(toName),
      ...cards.getCorporationCards().map(toName),
    ];
    for (const [replacement, base] of ALL_REPLACEMENTS) {
      expect(pool, `${base} present`).to.contain(base);
      expect(pool, `${replacement} absent`).to.not.contain(replacement);
    }
  });

  it('Lunar Beam:s still works like Lunar Beam', () => {
    const [game, player] = testGame(2);
    const card = new LunarBeamSilly();
    player.production.override({megacredits: 3});
    card.play(player);
    expect(player.production.heat).to.eq(2);
    expect(player.production.energy).to.eq(2);
    expect(player.production.megacredits).to.eq(1);
  });

  it('Luna Metropolis:s counts Moon tags for its M€ production', () => {
    const card = new LunaMetropolisSilly();
    // The countable now keys off the Moon tag rather than Earth.
    expect(JSON.stringify(card.behavior)).to.contain(Tag.MOON);
    expect(JSON.stringify(card.behavior)).to.not.contain(Tag.EARTH);
  });
});
