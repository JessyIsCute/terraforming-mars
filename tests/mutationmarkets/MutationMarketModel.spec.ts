import {expect} from 'chai';
import {createMutationMarketModel} from '../../src/server/models/MutationMarketModel';
import {MutationName} from '../../src/common/mutationmarkets/MutationName';
import {IGame} from '../../src/server/IGame';
import {testGame} from '../TestGame';
import {fakeCard} from '../TestingUtils';

describe('createMutationMarketModel', () => {
  let game: IGame;

  beforeEach(() => {
    [game] = testGame(2, {mutationMarketsExpansion: true});
  });

  it('returns undefined when the expansion is off', () => {
    const [offGame] = testGame(2);
    expect(createMutationMarketModel(offGame)).is.undefined;
  });

  it('reports the active covering mutations for each project slot', () => {
    const data = game.mutationMarketData!;
    data.alignedRow = [undefined, {mutation: MutationName.TAG_DIVERSIFIER}, undefined];
    data.offsetRow = [undefined, {mutation: MutationName.GIGANTIC_UNDERTAKINGS}, {mutation: MutationName.MINI_MUTATION}, undefined];

    const model = createMutationMarketModel(game)!;

    // slot 0/5: inactive previews, no card-covering info needed either way.
    // slot 1: only offsetRow[1] (Gigantic) covers it -- alignedRow[0] touches slot 0, inactive.
    expect(model.projectSlots[1]!.coveringMutations).to.deep.eq([MutationName.GIGANTIC_UNDERTAKINGS]);
    // slot 2: alignedRow[1] (Tag Diversifier) AND offsetRow[1] (Gigantic) both cover it.
    expect(model.projectSlots[2]!.coveringMutations).to.have.members([MutationName.TAG_DIVERSIFIER, MutationName.GIGANTIC_UNDERTAKINGS]);
    // slot 3: alignedRow[1] (Tag Diversifier) AND offsetRow[2] (Mini Mutation).
    expect(model.projectSlots[3]!.coveringMutations).to.have.members([MutationName.TAG_DIVERSIFIER, MutationName.MINI_MUTATION]);
    // slot 4: only offsetRow[2] (Mini Mutation) -- alignedRow[2] touches slot 5, inactive.
    expect(model.projectSlots[4]!.coveringMutations).to.deep.eq([MutationName.MINI_MUTATION]);
  });

  it('previews the combined effect of both covering mutations on a doubly-covered slot', () => {
    const data = game.mutationMarketData!;
    data.projectSlots[2] = fakeCard({cost: 14});
    data.alignedRow = [undefined, {mutation: MutationName.GIGANTIC_UNDERTAKINGS}, undefined];
    data.offsetRow = [undefined, {mutation: MutationName.MINI_MUTATION}, undefined, undefined];

    const model = createMutationMarketModel(game)!;
    const preview = model.projectSlots[2]!.card;

    // Gigantic: +round(14*0.5)=+7 (within [3,12]). Mini: -round(14*0.3)=-4 (within [3,12]).
    expect(preview.calculatedCost).to.eq(14 + 7 - 4);
    expect(preview.mutationHighlight).to.deep.eq({cost: true, vp: true});
    expect(preview.mutationVictoryPoints).to.eq(2); // floor(7 / 3), Gigantic's vpPerAbsDelta
  });

  it('previews nothing extra for a slot no active mutation covers', () => {
    const data = game.mutationMarketData!;
    const card = data.projectSlots[1]!;
    data.alignedRow = [undefined, undefined, undefined];
    data.offsetRow = [undefined, undefined, undefined, undefined];

    const model = createMutationMarketModel(game)!;
    const preview = model.projectSlots[1]!.card;

    expect(preview.calculatedCost).to.eq(card.cost);
    expect(preview.mutationHighlight).is.undefined;
    expect(preview.mutationVictoryPoints).is.undefined;
  });
});
