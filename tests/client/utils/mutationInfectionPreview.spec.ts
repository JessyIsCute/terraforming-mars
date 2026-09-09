import {expect} from 'chai';
import {pickRandomTag, previewMutations, previewInfections} from '@/client/utils/mutationInfectionPreview';
import {Tag, ALL_TAGS} from '@/common/cards/Tag';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';

describe('mutationInfectionPreview', () => {
  describe('pickRandomTag', () => {
    it('never picks Wild, Event, or Infected', () => {
      for (let i = 0; i < 30; i++) {
        const tag = pickRandomTag([]);
        expect(tag).to.not.eq(Tag.WILD);
        expect(tag).to.not.eq(Tag.EVENT);
        expect(tag).to.not.eq(Tag.INFECTED);
      }
    });

    it('never picks a tag the card already has', () => {
      const existing = ALL_TAGS.filter((t) => t !== Tag.WILD && t !== Tag.EVENT && t !== Tag.INFECTED && t !== Tag.PLANT);
      // Every non-excluded tag except Plant is already on the card, so Plant is the only
      // possible outcome -- run it enough times that a bug (ignoring `existing`) would show up.
      for (let i = 0; i < 10; i++) {
        expect(pickRandomTag(existing)).to.eq(Tag.PLANT);
      }
    });
  });

  describe('previewMutations', () => {
    it('addRandomTag (Science Patron): sets the tag highlight and a chosen tag, leaves cost/VP untouched', () => {
      const result = previewMutations([MutationName.SCIENCE_PATRON], 20, [Tag.SCIENCE]);
      expect(result.highlight).to.deep.eq({tag: true});
      expect(result.chosenTag).to.not.be.undefined;
      expect(result.chosenTag).to.not.eq(Tag.SCIENCE);
      expect(result.cost).to.eq(20);
      expect(result.victoryPoints).to.eq(0);
    });

    it('costPercent with a VP bonus (Gigantic Undertakings): +50% cost (clamped 3..12) and +1 VP per 3 M€ of that increase', () => {
      const result = previewMutations([MutationName.GIGANTIC_UNDERTAKINGS], 20, []);
      expect(result.highlight).to.deep.eq({cost: true, vp: true});
      expect(result.cost).to.eq(30); // 20 + round(20*0.5)=10, clamped within [3,12]
      expect(result.victoryPoints).to.eq(3); // floor(10 / 3)
      expect(result.chosenTag).to.be.undefined;
    });

    it('costPercent with no VP bonus (Mini Mutation): discounts cost, no VP, no vp highlight', () => {
      const result = previewMutations([MutationName.MINI_MUTATION], 20, []);
      expect(result.highlight).to.deep.eq({cost: true});
      expect(result.cost).to.eq(14); // 20 - round(20*0.3)=6, clamped within [3,12]
      expect(result.victoryPoints).to.eq(0);
    });

    it('clamps the cost delta to maxAbsDelta on an expensive card', () => {
      const result = previewMutations([MutationName.GIGANTIC_UNDERTAKINGS], 100, []);
      // round(100*0.5)=50, clamped down to maxAbsDelta=12
      expect(result.cost).to.eq(112);
      expect(result.victoryPoints).to.eq(4); // floor(12 / 3)
    });

    it('grantResourceOnPlay (Greenery Keeper): no highlight, no cost/VP change -- the grant only fires when actually played', () => {
      const result = previewMutations([MutationName.GREENERY_KEEPER], 20, []);
      expect(result.highlight).to.deep.eq({});
      expect(result.cost).to.eq(20);
      expect(result.victoryPoints).to.eq(0);
    });

    it('convertType (Building Mogul): no highlight at all, matching MutationEffects.highlightsFor', () => {
      const result = previewMutations([MutationName.BUILDING_MOGUL], 20, []);
      expect(result.highlight).to.deep.eq({});
    });

    it('nestedCopy (Nested Mutation): sets the nested highlight, no cost/VP change on this card itself', () => {
      const result = previewMutations([MutationName.NESTED_MUTATION], 20, []);
      expect(result.highlight).to.deep.eq({nested: true});
      expect(result.cost).to.eq(20);
    });

    it('an empty list changes nothing', () => {
      const result = previewMutations([], 20, []);
      expect(result.highlight).to.deep.eq({});
      expect(result.cost).to.eq(20);
      expect(result.victoryPoints).to.eq(0);
      expect(result.chosenTag).to.be.undefined;
    });

    it('sums cost deltas and VP across multiple selected mutations, each computed against the original base cost', () => {
      // Gigantic Undertakings (+50%, clamped 3..12 => +10 on a 20-cost card, +1 VP per 3)
      // and Mini Mutation (-30%, clamped 3..12 => -6) together: 20 + 10 - 6 = 24.
      const result = previewMutations([MutationName.GIGANTIC_UNDERTAKINGS, MutationName.MINI_MUTATION], 20, []);
      expect(result.highlight).to.deep.eq({cost: true, vp: true});
      expect(result.cost).to.eq(24);
      expect(result.victoryPoints).to.eq(3); // only Gigantic Undertakings has a vpPerAbsDelta
    });

    it('only the first addRandomTag-kind mutation in the list gets a chosen tag badge', () => {
      // Tag Diversifier and Science Patron are both addRandomTag -- matches
      // ModelUtils.ts's cardsToModel(), which surfaces only the first match via
      // card.mutations.find(...) even when more than one mutation could set chosenTag.
      const result = previewMutations([MutationName.TAG_DIVERSIFIER, MutationName.SCIENCE_PATRON], 20, []);
      expect(result.chosenTag).to.not.be.undefined;
      expect(result.highlight).to.deep.eq({tag: true});
    });
  });

  describe('previewInfections', () => {
    it('costIncrease (Cost Inflation): flat +4 M€, cost highlight, no VP', () => {
      const result = previewInfections([InfectionName.COST_INFLATION], 20);
      expect(result.highlight).to.deep.eq({cost: true});
      expect(result.cost).to.eq(24);
      expect(result.victoryPoints).to.eq(0);
    });

    it('victoryPointPenalty (Value Siphon): -1 VP, vp highlight, no cost change', () => {
      const result = previewInfections([InfectionName.VALUE_SIPHON], 20);
      expect(result.highlight).to.deep.eq({vp: true});
      expect(result.victoryPoints).to.eq(-1);
      expect(result.cost).to.eq(20);
    });

    it('resourceDrainOnPlay (Power Drain): no highlight, no cost/VP change -- the drain only fires when actually played', () => {
      const result = previewInfections([InfectionName.POWER_DRAIN], 20);
      expect(result.highlight).to.deep.eq({});
      expect(result.cost).to.eq(20);
      expect(result.victoryPoints).to.eq(0);
    });

    it('sums flat cost increases and VP penalties across multiple selected infections', () => {
      const result = previewInfections([InfectionName.COST_INFLATION, InfectionName.VALUE_SIPHON], 20);
      expect(result.highlight).to.deep.eq({cost: true, vp: true});
      expect(result.cost).to.eq(24);
      expect(result.victoryPoints).to.eq(-1);
    });

    it('an empty list changes nothing', () => {
      const result = previewInfections([], 20);
      expect(result.highlight).to.deep.eq({});
      expect(result.cost).to.eq(20);
      expect(result.victoryPoints).to.eq(0);
    });
  });

  it('never lets a mutation discount push cost below 0 on a cheap card', () => {
    // Mini Mutation: -30%, clamped to [-12, -3] -- on a cost-2 card that's a flat -3,
    // which would go negative without the Math.max(cost, 0) clamp.
    const result = previewMutations([MutationName.MINI_MUTATION], 2, []);
    expect(result.cost).to.eq(0);
  });
});
