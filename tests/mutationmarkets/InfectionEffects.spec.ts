import {expect} from 'chai';
import {InfectionEffects} from '../../src/server/mutationmarkets/InfectionEffects';
import {InfectionName} from '../../src/common/mutationmarkets/InfectionName';
import {Tag} from '../../src/common/cards/Tag';
import {fakeCard} from '../TestingUtils';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';

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

    it('marks neither for Power Drain (a pure on-play effect)', () => {
      const card = fakeCard({infections: [{infection: InfectionName.POWER_DRAIN}]});
      expect(InfectionEffects.highlightsFor(card)).to.deep.eq({});
    });
  });

  describe('applyOnPlayEffects', () => {
    let player: TestPlayer;
    beforeEach(() => {
      [/* game */, player] = testGame(2);
    });

    it('drains the full amount when the player has enough', () => {
      player.energy = 5;
      const card = fakeCard({infections: [{infection: InfectionName.POWER_DRAIN}]});
      InfectionEffects.applyOnPlayEffects(player, card);
      expect(player.energy).to.eq(3); // Power Drain: -2 Energy
    });

    it('caps the drain at what the player actually has, without going negative', () => {
      player.energy = 1;
      const card = fakeCard({infections: [{infection: InfectionName.POWER_DRAIN}]});
      InfectionEffects.applyOnPlayEffects(player, card);
      expect(player.energy).to.eq(0);
    });

    it('does nothing for a card with no infections', () => {
      player.energy = 5;
      const card = fakeCard({});
      InfectionEffects.applyOnPlayEffects(player, card);
      expect(player.energy).to.eq(5);
    });

    it('does nothing for cost/VP-only infections (no on-play resource effect)', () => {
      player.megaCredits = 10;
      const card = fakeCard({infections: [{infection: InfectionName.COST_INFLATION}, {infection: InfectionName.VALUE_SIPHON}]});
      InfectionEffects.applyOnPlayEffects(player, card);
      expect(player.megaCredits).to.eq(10);
    });
  });

  describe('apply', () => {
    it('builds a plain AppliedInfection with no randomized outcome', () => {
      expect(InfectionEffects.apply(InfectionName.POWER_DRAIN)).to.deep.eq({infection: InfectionName.POWER_DRAIN});
    });
  });
});
