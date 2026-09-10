import {expect} from 'chai';
import {InfectionEffects} from '../../src/server/mutationmarkets/InfectionEffects';
import {InfectionName} from '../../src/common/mutationmarkets/InfectionName';
import {Tag} from '../../src/common/cards/Tag';
import {Units} from '../../src/common/Units';
import {fakeCard} from '../TestingUtils';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';
import {PowerPlant} from '../../src/server/cards/base/PowerPlant';

describe('InfectionEffects', () => {
  describe('applyCost', () => {
    it('leaves an uninfected card untouched', () => {
      const card = fakeCard({cost: 14});
      expect(InfectionEffects.applyCost(card, 14)).to.eq(14);
    });

    it('Cost Inflation adds a flat 4 M€, no clamp math', () => {
      const card = fakeCard({cost: 14, infections: [{infection: InfectionName.COST_INFLATION}]});
      expect(InfectionEffects.applyCost(card, 14)).to.eq(18);
    });

    it('never drops cost below 0', () => {
      // Not reachable with the current infection catalog (costIncrease is always positive),
      // but applyCost still floors at 0 defensively, mirroring MutationEffects.applyCost.
      const card = fakeCard({cost: 0, infections: [{infection: InfectionName.COST_INFLATION}]});
      expect(InfectionEffects.applyCost(card, 0)).to.eq(4);
    });
  });

  describe('applyTags', () => {
    it('leaves tags untouched with no infections', () => {
      const card = fakeCard({tags: [Tag.SCIENCE]});
      expect(InfectionEffects.applyTags(card, [Tag.SCIENCE])).to.deep.eq([Tag.SCIENCE]);
    });

    it('adds Tag.INFECTED when the card has any infection', () => {
      const card = fakeCard({tags: [Tag.SCIENCE], infections: [{infection: InfectionName.VALUE_SIPHON}]});
      expect(InfectionEffects.applyTags(card, [Tag.SCIENCE])).to.deep.eq([Tag.SCIENCE, Tag.INFECTED]);
    });

    it('does not duplicate Tag.INFECTED for a card with multiple infections', () => {
      const card = fakeCard({
        tags: [Tag.SCIENCE],
        infections: [{infection: InfectionName.VALUE_SIPHON}, {infection: InfectionName.COST_INFLATION}],
      });
      expect(InfectionEffects.applyTags(card, [Tag.SCIENCE])).to.deep.eq([Tag.SCIENCE, Tag.INFECTED]);
    });
  });

  describe('victoryPointsBonus', () => {
    it('is 0 with no infections', () => {
      const card = fakeCard({});
      expect(InfectionEffects.victoryPointsBonus(card)).to.eq(0);
    });

    it('Value Siphon costs 1 VP', () => {
      const card = fakeCard({infections: [{infection: InfectionName.VALUE_SIPHON}]});
      expect(InfectionEffects.victoryPointsBonus(card)).to.eq(-1);
    });

    it('sums multiple victoryPointPenalty infections (only one exists today, so this proves the loop, not stacking of distinct kinds)', () => {
      const card = fakeCard({infections: [{infection: InfectionName.VALUE_SIPHON}, {infection: InfectionName.COST_INFLATION}]});
      // Cost Inflation carries no VP penalty -- only Value Siphon's -1 counts.
      expect(InfectionEffects.victoryPointsBonus(card)).to.eq(-1);
    });
  });

  describe('namePrefixes', () => {
    it('returns each infection\'s prefix in order', () => {
      expect(InfectionEffects.namePrefixes([InfectionName.COST_INFLATION, InfectionName.VALUE_SIPHON])).to.deep.eq(['Overpriced', 'Siphoned']);
    });

    it('has a distinct prefix for every infection, including the resource-drain set', () => {
      const prefixes = InfectionEffects.namePrefixes(Object.values(InfectionName));
      expect(new Set(prefixes).size).to.eq(Object.values(InfectionName).length);
    });

    it('returns an empty array for no infections', () => {
      expect(InfectionEffects.namePrefixes([])).to.deep.eq([]);
    });
  });

  describe('highlightsFor', () => {
    it('returns undefined with no infections', () => {
      expect(InfectionEffects.highlightsFor(fakeCard({}))).is.undefined;
    });

    it('marks cost for Cost Inflation', () => {
      const card = fakeCard({infections: [{infection: InfectionName.COST_INFLATION}]});
      expect(InfectionEffects.highlightsFor(card)).to.deep.eq({cost: true});
    });

    it('marks vp for Value Siphon', () => {
      const card = fakeCard({infections: [{infection: InfectionName.VALUE_SIPHON}]});
      expect(InfectionEffects.highlightsFor(card)).to.deep.eq({vp: true});
    });

    it('marks neither for Power Drain (a mandatory resource cost, not a cost/VP change)', () => {
      const card = fakeCard({infections: [{infection: InfectionName.POWER_DRAIN}]});
      expect(InfectionEffects.highlightsFor(card)).to.deep.eq({});
    });
  });

  describe('applyReserveUnits', () => {
    it('leaves reserveUnits untouched with no infections', () => {
      const card = fakeCard({});
      expect(InfectionEffects.applyReserveUnits(card, Units.EMPTY)).to.deep.eq(Units.EMPTY);
    });

    it('adds Power Drain\'s energy requirement on top of the card\'s own reserveUnits', () => {
      const card = fakeCard({infections: [{infection: InfectionName.POWER_DRAIN}]});
      const result = InfectionEffects.applyReserveUnits(card, Units.of({titanium: 1}));
      expect(result).to.deep.eq(Units.of({titanium: 1, energy: 2}));
    });

    it('does nothing for cost/VP-only infections (no resource requirement)', () => {
      const card = fakeCard({infections: [{infection: InfectionName.COST_INFLATION}, {infection: InfectionName.VALUE_SIPHON}]});
      expect(InfectionEffects.applyReserveUnits(card, Units.EMPTY)).to.deep.eq(Units.EMPTY);
    });

    for (const {infection, field, amount} of [
      {infection: InfectionName.PLANT_ROT, field: 'plants' as const, amount: 2},
      {infection: InfectionName.STEEL_RUST, field: 'steel' as const, amount: 2},
      {infection: InfectionName.TITANIUM_CORROSION, field: 'titanium' as const, amount: 1},
      {infection: InfectionName.HEAT_LOSS, field: 'heat' as const, amount: 2},
    ]) {
      it(`${infection} requires and costs ${amount} ${field} to play`, () => {
        const card = fakeCard({infections: [{infection}]});
        const result = InfectionEffects.applyReserveUnits(card, Units.EMPTY);
        expect(result[field]).to.eq(amount);
      });
    }

    it('sums resource costs from multiple infections on the same resource', () => {
      const card = fakeCard({infections: [{infection: InfectionName.STEEL_RUST}, {infection: InfectionName.STEEL_RUST}]});
      const result = InfectionEffects.applyReserveUnits(card, Units.EMPTY);
      expect(result.steel).to.eq(4);
    });
  });

  // Integration coverage using a real Card subclass (fakeCard's canPlay/play are hand-rolled
  // stubs that don't go through Card.ts's actual reserveUnits getter or its play()'s
  // player.stock.deductUnits(MoonExpansion.adjustedReserveCosts(...)) call -- Power Plant is
  // a plain, requirement-free, no-reserveUnits base card, so its own printed properties add
  // no confounding variables to what's actually under test here.
  describe('reserveUnits gates and pays for playing an infected card, via the same mechanism as a Moon reserve cost', () => {
    let player: TestPlayer;
    beforeEach(() => {
      [/* game */, player] = testGame(2);
      player.megaCredits = 20;
    });

    it('is unplayable without enough of the required resource', () => {
      const card = new PowerPlant();
      card.infections = [{infection: InfectionName.POWER_DRAIN}];
      player.energy = 1;
      expect(player.canPlay(card)).is.false;
    });

    it('becomes playable, and play() deducts the resource, once the player has enough', () => {
      const card = new PowerPlant();
      card.infections = [{infection: InfectionName.POWER_DRAIN}];
      player.energy = 2;
      expect(player.canPlay(card)).is.true;
      card.play(player);
      expect(player.energy).to.eq(0);
    });
  });

  describe('apply', () => {
    it('builds a plain AppliedInfection with no randomized outcome', () => {
      expect(InfectionEffects.apply(InfectionName.POWER_DRAIN)).to.deep.eq({infection: InfectionName.POWER_DRAIN});
    });
  });
});
