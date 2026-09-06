import {expect} from 'chai';
import {MutationMarkets} from '../../src/server/mutationmarkets/MutationMarkets';
import {MutationMarketData} from '../../src/server/mutationmarkets/MutationMarketData';
import {MutationName} from '../../src/common/mutationmarkets/MutationName';
import {IGame} from '../../src/server/IGame';
import {testGame} from '../TestGame';

describe('MutationMarkets', () => {
  let game: IGame;

  beforeEach(() => {
    [game] = testGame(2, {mutationMarketsExpansion: true});
  });

  it('initialize deals 6 distinct project cards and fills both mutation rows', () => {
    const data = game.mutationMarketData!;
    expect(data).is.not.undefined;

    expect(data.projectSlots).has.lengthOf(6);
    expect(data.projectSlots.every((slot) => slot !== undefined)).is.true;
    const names = data.projectSlots.map((slot) => slot!.name);
    expect(new Set(names).size).to.eq(6);

    expect(data.alignedRow).has.lengthOf(3);
    expect(data.alignedRow.every((slot) => slot !== undefined)).is.true;
    expect(data.offsetRow).has.lengthOf(4);
    expect(data.offsetRow.every((slot) => slot !== undefined)).is.true;

    expect(data.offsetRowIsTop).is.false;
  });

  it('isProjectSlotActive flags only slots 0 and 5 as inactive', () => {
    expect(MutationMarkets.isProjectSlotActive(0)).is.false;
    expect(MutationMarkets.isProjectSlotActive(1)).is.true;
    expect(MutationMarkets.isProjectSlotActive(2)).is.true;
    expect(MutationMarkets.isProjectSlotActive(3)).is.true;
    expect(MutationMarkets.isProjectSlotActive(4)).is.true;
    expect(MutationMarkets.isProjectSlotActive(5)).is.false;
  });

  it('isMutationSlotActive flags any mutation touching slot 0 or 5 as inactive', () => {
    const data = game.mutationMarketData!;

    // alignedRow: (0,1) inactive, (2,3) active, (4,5) inactive.
    expect(MutationMarkets.isMutationSlotActive('alignedRow', 0, data)).is.false;
    expect(MutationMarkets.isMutationSlotActive('alignedRow', 1, data)).is.true;
    expect(MutationMarkets.isMutationSlotActive('alignedRow', 2, data)).is.false;

    // offsetRow: half-card over 0 (inactive), (1,2) active, (3,4) active, half-card over 5 (inactive).
    expect(MutationMarkets.isMutationSlotActive('offsetRow', 0, data)).is.false;
    expect(MutationMarkets.isMutationSlotActive('offsetRow', 1, data)).is.true;
    expect(MutationMarkets.isMutationSlotActive('offsetRow', 2, data)).is.true;
    expect(MutationMarkets.isMutationSlotActive('offsetRow', 3, data)).is.false;
  });

  it('claimProjectSlot removes the target, slides the rest toward it, and deals one fresh card', () => {
    const data = game.mutationMarketData!;
    const before = data.projectSlots.map((slot) => slot!.name);

    const claimed = MutationMarkets.claimProjectSlot(game, 2);

    expect(claimed.name).to.eq(before[2]);
    expect(data.projectSlots).has.lengthOf(6);
    expect(data.projectSlots[2]!.name).to.eq(before[3]);
    expect(data.projectSlots[3]!.name).to.eq(before[4]);
    expect(data.projectSlots[4]!.name).to.eq(before[5]);
    expect(data.projectSlots[5]).is.not.undefined;
    expect(data.projectSlots[0]!.name).to.eq(before[0]);
    expect(data.projectSlots[1]!.name).to.eq(before[1]);
  });

  it('claimMutationSlot removes the target, slides earlier mutations toward it, and deals one fresh mutation from the left', () => {
    const data = game.mutationMarketData!;
    const before = data.alignedRow.map((slot) => slot!.mutation);

    const claimed = MutationMarkets.claimMutationSlot(game, 'alignedRow', 2);

    expect(claimed).to.eq(before[2]);
    expect(data.alignedRow).has.lengthOf(3);
    expect(data.alignedRow[2]!.mutation).to.eq(before[1]);
    expect(data.alignedRow[1]!.mutation).to.eq(before[0]);
    expect(data.alignedRow[0]).is.not.undefined;
  });

  it('onGenerationEnd shifts the project row by 3 and each mutation row by the summed steps of only its active mutations', () => {
    const data = game.mutationMarketData!;
    const projectNamesBefore = data.projectSlots.map((slot) => slot!.name);

    // alignedRow: position 0 (inactive, touches slot 0) has steps 2 -- must not count.
    // position 1 (active) has steps 1 -- the only contributor, so the row shifts by 1.
    // position 2 (inactive, touches slot 5) has steps 1 -- must not count.
    data.alignedRow = [
      {mutation: MutationName.GREENERY_KEEPER}, // steps 2, inactive
      {mutation: MutationName.CITY_PLANNER}, // steps 1, active
      {mutation: MutationName.SCIENCE_PATRON}, // steps 1, inactive
    ];
    // offsetRow: only position 1 (active) is populated, with steps 1 -- the row shifts by 1.
    data.offsetRow = [
      undefined,
      {mutation: MutationName.TAG_DIVERSIFIER}, // steps 1, active
      undefined,
      undefined,
    ];
    data.mutationDrawPile = [MutationName.HEAT_BANKER, MutationName.OCEAN_SURVEYOR];
    data.mutationDiscardPile = [];

    MutationMarkets.onGenerationEnd(game);

    // Project row: drop the exiting 3, slide the remaining 3 down, deal 3 fresh from the right.
    expect(data.projectSlots[0]!.name).to.eq(projectNamesBefore[3]);
    expect(data.projectSlots[1]!.name).to.eq(projectNamesBefore[4]);
    expect(data.projectSlots[2]!.name).to.eq(projectNamesBefore[5]);
    expect(data.projectSlots[3]).is.not.undefined;
    expect(data.projectSlots[4]).is.not.undefined;
    expect(data.projectSlots[5]).is.not.undefined;

    // alignedRow shifted by 1: GREENERY_KEEPER (steps 2, but inactive) is excluded from the
    // sum, so only CITY_PLANNER's steps (1) counted -- a 1-step shift, not 2 or 3.
    expect(data.alignedRow[0]!.mutation).to.eq(MutationName.OCEAN_SURVEYOR);
    expect(data.alignedRow[1]!.mutation).to.eq(MutationName.GREENERY_KEEPER);
    expect(data.alignedRow[2]!.mutation).to.eq(MutationName.CITY_PLANNER);
    expect(data.mutationDiscardPile).to.include(MutationName.SCIENCE_PATRON);

    // offsetRow shifted by 1 (only TAG_DIVERSIFIER, steps 1, was active).
    expect(data.offsetRow[0]!.mutation).to.eq(MutationName.HEAT_BANKER);
    expect(data.offsetRow[1]).is.undefined;
    expect(data.offsetRow[2]!.mutation).to.eq(MutationName.TAG_DIVERSIFIER);
    expect(data.offsetRow[3]).is.undefined;

    expect(data.offsetRowIsTop).is.true;
  });

  it('reshuffles the mutation discard pile into the draw pile once it runs dry', () => {
    const data = game.mutationMarketData!;
    data.mutationDrawPile = [];
    data.mutationDiscardPile = [MutationName.STEEL_BARON];

    const dealt = MutationMarkets.claimMutationSlot(game, 'alignedRow', 0);
    expect(dealt).is.not.undefined;
    expect(data.alignedRow[0]).is.not.undefined;
    expect(data.mutationDiscardPile).has.lengthOf(0);
  });

  it('serializes and deserializes without losing market state', () => {
    const original = game.mutationMarketData!;
    const projectNames = original.projectSlots.map((slot) => slot!.name);

    const serialized = MutationMarkets.serialize(original)!;
    expect(serialized.projectSlots).to.deep.eq(projectNames);

    const restored: MutationMarketData = MutationMarkets.deserialize(serialized)!;
    expect(restored.projectSlots.map((slot) => slot!.name)).to.deep.eq(projectNames);
    expect(restored.alignedRow).to.deep.eq(original.alignedRow);
    expect(restored.offsetRow).to.deep.eq(original.offsetRow);
    expect(restored.offsetRowIsTop).to.eq(original.offsetRowIsTop);
    expect(restored.mutationDrawPile).to.deep.eq(original.mutationDrawPile);
    expect(restored.mutationDiscardPile).to.deep.eq(original.mutationDiscardPile);
  });

  it('MutationMarkets.serialize/deserialize handle an undefined market (expansion off)', () => {
    expect(MutationMarkets.serialize(undefined)).is.undefined;
    expect(MutationMarkets.deserialize(undefined)).is.undefined;
  });
});
