import {expect} from 'chai';
import {createMutationMarketModel} from '../../src/server/models/MutationMarketModel';
import {MutationName} from '../../src/common/mutationmarkets/MutationName';
import {InfectionName} from '../../src/common/mutationmarkets/InfectionName';
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

  it('reports the active covering mutations for each project slot, split by physical row', () => {
    const data = game.mutationMarketData!;
    data.offsetRowIsTop = false; // aligned row is physically "above", offset row "below".
    data.alignedRow = [undefined, {kind: 'mutation', mutation: MutationName.TAG_DIVERSIFIER}, undefined];
    data.offsetRow = [
      undefined,
      {kind: 'mutation', mutation: MutationName.GIGANTIC_UNDERTAKINGS},
      {kind: 'mutation', mutation: MutationName.MINI_MUTATION},
      undefined,
    ];

    const model = createMutationMarketModel(game)!;

    // slot 0/5: inactive previews, no card-covering info needed either way.
    // slot 1: only offsetRow[1] (Gigantic, below) covers it -- alignedRow[0] touches slot 0, inactive.
    expect(model.projectSlots[1]!.coveringMutationsAbove).to.deep.eq([]);
    expect(model.projectSlots[1]!.coveringMutationsBelow).to.deep.eq([{kind: 'mutation', mutation: MutationName.GIGANTIC_UNDERTAKINGS}]);
    // slot 2: alignedRow[1] (Tag Diversifier, above) AND offsetRow[1] (Gigantic, below).
    expect(model.projectSlots[2]!.coveringMutationsAbove).to.deep.eq([{kind: 'mutation', mutation: MutationName.TAG_DIVERSIFIER}]);
    expect(model.projectSlots[2]!.coveringMutationsBelow).to.deep.eq([{kind: 'mutation', mutation: MutationName.GIGANTIC_UNDERTAKINGS}]);
    // slot 3: alignedRow[1] (Tag Diversifier, above) AND offsetRow[2] (Mini Mutation, below).
    expect(model.projectSlots[3]!.coveringMutationsAbove).to.deep.eq([{kind: 'mutation', mutation: MutationName.TAG_DIVERSIFIER}]);
    expect(model.projectSlots[3]!.coveringMutationsBelow).to.deep.eq([{kind: 'mutation', mutation: MutationName.MINI_MUTATION}]);
    // slot 4: only offsetRow[2] (Mini Mutation, below) -- alignedRow[2] touches slot 5, inactive.
    expect(model.projectSlots[4]!.coveringMutationsAbove).to.deep.eq([]);
    expect(model.projectSlots[4]!.coveringMutationsBelow).to.deep.eq([{kind: 'mutation', mutation: MutationName.MINI_MUTATION}]);
  });

  it('previews the combined effect of both covering mutations on a doubly-covered slot', () => {
    const data = game.mutationMarketData!;
    data.projectSlots[2] = fakeCard({cost: 14});
    data.alignedRow = [undefined, {kind: 'mutation', mutation: MutationName.GIGANTIC_UNDERTAKINGS}, undefined];
    data.offsetRow = [undefined, {kind: 'mutation', mutation: MutationName.MINI_MUTATION}, undefined, undefined];

    const model = createMutationMarketModel(game)!;
    const preview = model.projectSlots[2]!.card;

    // Gigantic: +round(14*0.5)=+7 (within [3,12]). Mini: -round(14*0.3)=-4 (within [3,12]).
    expect(preview.calculatedCost).to.eq(14 + 7 - 4);
    expect(preview.mutationHighlight).to.deep.eq({cost: true, vp: true});
    expect(preview.mutationVictoryPoints).to.eq(2); // floor(7 / 3), Gigantic's vpPerAbsDelta
  });

  it('previews an infection covering a slot: no bidding requirement, cost/VP penalty visible, combined with a mutation on the same slot', () => {
    const data = game.mutationMarketData!;
    data.projectSlots[2] = fakeCard({cost: 14});
    data.alignedRow = [undefined, {kind: 'mutation', mutation: MutationName.GIGANTIC_UNDERTAKINGS}, undefined];
    data.offsetRow = [undefined, {kind: 'infection', infection: InfectionName.VALUE_SIPHON}, undefined, undefined];

    const model = createMutationMarketModel(game)!;
    const preview = model.projectSlots[2]!.card;

    expect(preview.mutationNames).to.deep.eq([MutationName.GIGANTIC_UNDERTAKINGS]);
    expect(preview.infectionNames).to.deep.eq([InfectionName.VALUE_SIPHON]);
    expect(preview.mutationHighlight).to.deep.eq({cost: true, vp: true});
    expect(preview.infectionHighlight).to.deep.eq({vp: true});
    expect(preview.mutationVictoryPoints).to.eq(2); // floor(7 / 3)
    expect(preview.infectionVictoryPoints).to.eq(-1); // Value Siphon
    expect(preview.combinedDisplayName).to.eq(`Gigantic Siphoned ${data.projectSlots[2]!.name}`);
  });

  it('reports the fixed, position-based minimum bid for each active project slot', () => {
    const model = createMutationMarketModel(game)!;
    expect(model.projectSlots[1]!.minimumBid).to.eq(4);
    expect(model.projectSlots[2]!.minimumBid).to.eq(3);
    expect(model.projectSlots[3]!.minimumBid).to.eq(2);
    expect(model.projectSlots[4]!.minimumBid).to.eq(1);
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

  it('mutationSlotModel returns an infection slot with no playerProgress', () => {
    const data = game.mutationMarketData!;
    data.alignedRow = [{kind: 'infection', infection: InfectionName.POWER_DRAIN}, undefined, undefined];

    const model = createMutationMarketModel(game)!;

    expect(model.alignedRow[0]).to.deep.eq({kind: 'infection', infection: InfectionName.POWER_DRAIN, active: false});
  });
});
