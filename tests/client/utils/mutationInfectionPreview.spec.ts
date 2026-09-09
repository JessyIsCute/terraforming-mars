import {expect} from 'chai';
import {pickRandomTag, previewMutation, previewInfection} from '@/client/utils/mutationInfectionPreview';
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

  describe('previewMutation', () => {
    it('addRandomTag (Science Patron): sets the tag highlight and a chosen tag, leaves cost/VP untouched', () => {
      const result = previewMutation(MutationName.SCIENCE_PATRON, 20, [Tag.SCIENCE]);
      expect(result.highlight).to.deep.eq({tag: true});
      expect(result.chosenTag).to.not.be.undefined;
      expect(result.chosenTag).to.not.eq(Tag.SCIENCE);
      expect(result.cost).to.eq(20);
      expect(result.victoryPoints).to.eq(0);
    });

    it('costPercent with a VP bonus (Gigantic Undertakings): +50% cost (clamped 3..12) and +1 VP per 3 M€ of that increase', () => {
      const result = previewMutation(MutationName.GIGANTIC_UNDERTAKINGS, 20, []);
      expect(result.highlight).to.deep.eq({cost: true, vp: true});
      expect(result.cost).to.eq(30); // 20 + round(20*0.5)=10, clamped within [3,12]
      expect(result.victoryPoints).to.eq(3); // floor(10 / 3)
      expect(result.chosenTag).to.be.undefined;
    });

    it('costPercent with no VP bonus (Mini Mutation): discounts cost, no VP, no vp highlight', () => {
      const result = previewMutation(MutationName.MINI_MUTATION, 20, []);
      expect(result.highlight).to.deep.eq({cost: true});
      expect(result.cost).to.eq(14); // 20 - round(20*0.3)=6, clamped within [3,12]
      expect(result.victoryPoints).to.eq(0);
    });

    it('clamps the cost delta to maxAbsDelta on an expensive card', () => {
      const result = previewMutation(MutationName.GIGANTIC_UNDERTAKINGS, 100, []);
      // round(100*0.5)=50, clamped down to maxAbsDelta=12
      expect(result.cost).to.eq(112);
      expect(result.victoryPoints).to.eq(4); // floor(12 / 3)
    });

    it('grantResourceOnPlay (Greenery Keeper): no highlight, no cost/VP change -- the grant only fires when actually played', () => {
      const result = previewMutation(MutationName.GREENERY_KEEPER, 20, []);
      expect(result.highlight).to.deep.eq({});
      expect(result.cost).to.eq(20);
      expect(result.victoryPoints).to.eq(0);
    });

    it('convertType (Building Mogul): no highlight at all, matching MutationEffects.highlightsFor', () => {
      const result = previewMutation(MutationName.BUILDING_MOGUL, 20, []);
      expect(result.highlight).to.deep.eq({});
    });

    it('nestedCopy (Nested Mutation): sets the nested highlight, no cost/VP change on this card itself', () => {
      const result = previewMutation(MutationName.NESTED_MUTATION, 20, []);
      expect(result.highlight).to.deep.eq({nested: true});
      expect(result.cost).to.eq(20);
    });
  });

  describe('previewInfection', () => {
    it('costIncrease (Cost Inflation): flat +4 M€, cost highlight, no VP', () => {
      const result = previewInfection(InfectionName.COST_INFLATION, 20);
      expect(result.highlight).to.deep.eq({cost: true});
      expect(result.cost).to.eq(24);
      expect(result.victoryPoints).to.eq(0);
    });

    it('victoryPointPenalty (Value Siphon): -1 VP, vp highlight, no cost change', () => {
      const result = previewInfection(InfectionName.VALUE_SIPHON, 20);
      expect(result.highlight).to.deep.eq({vp: true});
      expect(result.victoryPoints).to.eq(-1);
      expect(result.cost).to.eq(20);
    });

    it('resourceDrainOnPlay (Power Drain): no highlight, no cost/VP change -- the drain only fires when actually played', () => {
      const result = previewInfection(InfectionName.POWER_DRAIN, 20);
      expect(result.highlight).to.deep.eq({});
      expect(result.cost).to.eq(20);
      expect(result.victoryPoints).to.eq(0);
    });
  });

  it('never lets a mutation discount push cost below 0 on a cheap card', () => {
    // Mini Mutation: -30%, clamped to [-12, -3] -- on a cost-2 card that's a flat -3,
    // which would go negative without the Math.max(cost, 0) clamp.
    const result = previewMutation(MutationName.MINI_MUTATION, 2, []);
    expect(result.cost).to.eq(0);
  });
});
