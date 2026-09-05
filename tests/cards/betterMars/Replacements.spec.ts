import {expect} from 'chai';
import {GameCards} from '../../../src/server/GameCards';
import {CardName} from '../../../src/common/cards/CardName';
import {DEFAULT_GAME_OPTIONS, GameOptions} from '../../../src/server/game/GameOptions';
import {toName} from '../../../src/common/utils/utils';
import {Tag} from '../../../src/common/cards/Tag';
import {newCard} from '../../../src/server/createCard';
import {LunarBeamBetterMars} from '../../../src/server/cards/betterMars/LunarBeamBetterMars';
import {LunaMetropolisBetterMars} from '../../../src/server/cards/betterMars/LunaMetropolisBetterMars';
import {LunarExportsBetterMars} from '../../../src/server/cards/betterMars/LunarExportsBetterMars';
import {MarsUniversityBetterMars} from '../../../src/server/cards/betterMars/MarsUniversityBetterMars';
import {MeatIndustryBetterMars} from '../../../src/server/cards/betterMars/MeatIndustryBetterMars';
import {Fish} from '../../../src/server/cards/base/Fish';
import {runAllActions} from '../../TestingUtils';
import {testGame} from '../../TestGame';

const MOON_SWAPS: ReadonlyArray<[CardName, ReadonlyArray<Tag>]> = [
  [CardName.LUNAR_BEAM_BETTER_MARS, [Tag.MOON, Tag.POWER]],
  [CardName.LUNA_METROPOLIS_BETTER_MARS, [Tag.CITY, Tag.SPACE, Tag.MOON]],
  [CardName.LUNAR_EXPORTS_BETTER_MARS, [Tag.EARTH, Tag.SPACE, Tag.MOON]],
];

const MARS_ADDS: ReadonlyArray<CardName> = [
  CardName.PRISTAR_BETTER_MARS,
  CardName.EARLY_SETTLEMENT_BETTER_MARS,
  CardName.SELF_SUFFICIENT_SETTLEMENT_BETTER_MARS,
  CardName.EOS_CHASMA_NATIONAL_PARK_BETTER_MARS,
  CardName.IMMIGRATION_SHUTTLES_BETTER_MARS,
  CardName.MARTIAN_RAILS_BETTER_MARS,
  CardName.NOCTIS_CITY_BETTER_MARS,
  CardName.NOCTIS_FARMING_BETTER_MARS,
  CardName.PROTECTED_VALLEY_BETTER_MARS,
  CardName.MARS_UNIVERSITY_BETTER_MARS,
  CardName.PROTECTED_HABITATS_BETTER_MARS,
  CardName.TROPICAL_RESORT_BETTER_MARS,
  CardName.MARTIAN_MEDIA_CENTER_BETTER_MARS,
];

const ALL_REPLACEMENTS: ReadonlyArray<[CardName, CardName]> = [
  [CardName.LUNAR_BEAM_BETTER_MARS, CardName.LUNAR_BEAM],
  [CardName.LUNA_METROPOLIS_BETTER_MARS, CardName.LUNA_METROPOLIS],
  [CardName.LUNAR_EXPORTS_BETTER_MARS, CardName.LUNAR_EXPORTS],
  [CardName.PRISTAR_BETTER_MARS, CardName.PRISTAR],
  [CardName.EARLY_SETTLEMENT_BETTER_MARS, CardName.EARLY_SETTLEMENT],
  [CardName.SELF_SUFFICIENT_SETTLEMENT_BETTER_MARS, CardName.SELF_SUFFICIENT_SETTLEMENT],
  [CardName.EOS_CHASMA_NATIONAL_PARK_BETTER_MARS, CardName.EOS_CHASMA_NATIONAL_PARK],
  [CardName.IMMIGRATION_SHUTTLES_BETTER_MARS, CardName.IMMIGRATION_SHUTTLES],
  [CardName.MARTIAN_RAILS_BETTER_MARS, CardName.MARTIAN_RAILS],
  [CardName.NOCTIS_CITY_BETTER_MARS, CardName.NOCTIS_CITY],
  [CardName.NOCTIS_FARMING_BETTER_MARS, CardName.NOCTIS_FARMING],
  [CardName.PROTECTED_VALLEY_BETTER_MARS, CardName.PROTECTED_VALLEY],
  [CardName.MARS_UNIVERSITY_BETTER_MARS, CardName.MARS_UNIVERSITY],
  [CardName.PROTECTED_HABITATS_BETTER_MARS, CardName.PROTECTED_HABITATS],
  [CardName.TROPICAL_RESORT_BETTER_MARS, CardName.TROPICAL_RESORT],
  [CardName.MARTIAN_MEDIA_CENTER_BETTER_MARS, CardName.MARTIAN_MEDIA_CENTER],
  [CardName.MEAT_INDUSTRY_BETTER_MARS, CardName.MEAT_INDUSTRY],
];

describe('BetterMars replacement cards', () => {
  it('moon-swap cards carry a Moon tag', () => {
    for (const [name, tags] of MOON_SWAPS) {
      expect(newCard(name).tags, name).to.deep.eq(tags);
    }
    expect(newCard(CardName.LUNAR_BEAM_BETTER_MARS).tags).to.not.contain(Tag.EARTH);
    expect(newCard(CardName.LUNA_METROPOLIS_BETTER_MARS).tags).to.not.contain(Tag.EARTH);
    expect(newCard(CardName.LUNAR_EXPORTS_BETTER_MARS).tags).to.contain(Tag.EARTH);
  });

  it('mars-add cards gain a Mars tag on top of the original tags', () => {
    for (const name of MARS_ADDS) {
      expect(newCard(name).tags, name).to.contain(Tag.MARS);
    }
  });

  it('cost bumps: Lunar Exports +1, Mars University +2, Meat Industry +1', () => {
    expect(new LunarExportsBetterMars().cost).to.eq(20);
    expect(new MarsUniversityBetterMars().cost).to.eq(10);
    expect(new MeatIndustryBetterMars().cost).to.eq(6);
  });

  it('each replacement has a unique BetterMars card number', () => {
    const numbers = ALL_REPLACEMENTS.map(([name]) => newCard(name).metadata.cardNumber);
    expect(new Set(numbers).size).to.eq(numbers.length);
    numbers.forEach((n) => expect(n).to.match(/^X\d+$/));
  });

  it('Luna Metropolis:bm counts Moon tags for its M€ production', () => {
    expect(JSON.stringify(new LunaMetropolisBetterMars().behavior)).to.contain(Tag.MOON);
    expect(JSON.stringify(new LunaMetropolisBetterMars().behavior)).to.not.contain(Tag.EARTH);
  });

  it('with BetterMars on, base cards are swapped out for the replacements', () => {
    const gameOptions: GameOptions = {
      ...DEFAULT_GAME_OPTIONS,
      corporateEra: true,
      preludeExtension: true,
      venusNextExtension: true,
      coloniesExtension: true,
      turmoilExtension: true,
      promoCardsOption: true,
      betterMarsExpansion: true,
    };
    const cards = new GameCards(gameOptions);
    const pool = [
      ...cards.getProjectCards().map(toName),
      ...cards.getPreludeCards().map(toName),
      ...cards.getCorporationCards().map(toName),
    ];
    for (const [replacement, base] of ALL_REPLACEMENTS) {
      expect(pool, `${base} removed`).to.not.contain(base);
      expect(pool, `${replacement} present`).to.contain(replacement);
    }
  });

  it('with BetterMars off, the base cards are untouched', () => {
    const gameOptions: GameOptions = {
      ...DEFAULT_GAME_OPTIONS,
      corporateEra: true,
      preludeExtension: true,
      venusNextExtension: true,
      coloniesExtension: true,
      turmoilExtension: true,
      promoCardsOption: true,
      betterMarsExpansion: false,
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

  it('Meat Industry:bm has an Animal tag and gains 1 M€ per animal (was 2)', () => {
    const card = new MeatIndustryBetterMars();
    expect(card.tags).to.deep.eq([Tag.BUILDING, Tag.ANIMAL]);

    const [game, player] = testGame(2);
    player.playedCards.push(card);

    const fish = new Fish();
    player.playedCards.push(fish);
    fish.action(player);
    runAllActions(game);

    expect(fish.resourceCount).to.eq(1);
    expect(player.megaCredits).to.eq(1);
  });

  it('Lunar Beam:bm still works like Lunar Beam', () => {
    const [/* game */, player] = testGame(2);
    const card = new LunarBeamBetterMars();
    player.production.override({megacredits: 3});
    card.play(player);
    expect(player.production.heat).to.eq(2);
    expect(player.production.energy).to.eq(2);
    expect(player.production.megacredits).to.eq(1);
  });
});
