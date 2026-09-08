import {expect} from 'chai';
import {cardsToModel} from '../../src/server/models/ModelUtils';
import {MutationName} from '../../src/common/mutationmarkets/MutationName';
import {InfectionName} from '../../src/common/mutationmarkets/InfectionName';
import {Tag} from '../../src/common/cards/Tag';
import {fakeCard} from '../TestingUtils';
import {TestPlayer} from '../TestPlayer';
import {testGame} from '../TestGame';

describe('cardsToModel', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [/* game */, player] = testGame(2);
  });

  it('combines mutation and infection prefixes into one combinedDisplayName when both apply', () => {
    const card = fakeCard({
      cost: 21,
      baseCost: 14,
      mutations: [{mutation: MutationName.GIGANTIC_UNDERTAKINGS}],
      infections: [{infection: InfectionName.VALUE_SIPHON}],
    });

    const [model] = cardsToModel(player, [card]);

    expect(model.combinedDisplayName).to.eq(`Gigantic Siphoned ${card.name}`);
    expect(model.mutationNames).to.deep.eq([MutationName.GIGANTIC_UNDERTAKINGS]);
    expect(model.infectionNames).to.deep.eq([InfectionName.VALUE_SIPHON]);
  });

  it('reports both mutation and infection highlights independently when both apply', () => {
    const card = fakeCard({
      cost: 21,
      baseCost: 14,
      mutations: [{mutation: MutationName.GIGANTIC_UNDERTAKINGS}], // cost + vp
      infections: [{infection: InfectionName.VALUE_SIPHON}], // vp only
    });

    const [model] = cardsToModel(player, [card]);

    expect(model.mutationHighlight).to.deep.eq({cost: true, vp: true});
    expect(model.infectionHighlight).to.deep.eq({vp: true});
  });

  it('sums mutation and infection VP contributions independently (they are combined client-side, not here)', () => {
    const card = fakeCard({
      cost: 21,
      baseCost: 14,
      mutations: [{mutation: MutationName.GIGANTIC_UNDERTAKINGS}], // +2 VP (floor(7/3))
      infections: [{infection: InfectionName.VALUE_SIPHON}], // -1 VP
    });

    const [model] = cardsToModel(player, [card]);

    expect(model.mutationVictoryPoints).to.eq(2);
    expect(model.infectionVictoryPoints).to.eq(-1);
  });

  it('adds Tag.INFECTED to the card\'s tags alongside any mutation-added tag', () => {
    const card = fakeCard({
      tags: [Tag.SCIENCE],
      mutations: [{mutation: MutationName.TAG_DIVERSIFIER, chosenTag: Tag.PLANT}],
      infections: [{infection: InfectionName.POWER_DRAIN}],
    });

    const [model] = cardsToModel(player, [card]);

    expect(model.mutationAddedTag).to.eq(Tag.PLANT);
    expect(model.infectionAddedTag).to.eq(Tag.INFECTED);
  });

  it('reports only mutation fields when there are no infections', () => {
    const card = fakeCard({mutations: [{mutation: MutationName.TAG_DIVERSIFIER, chosenTag: Tag.PLANT}]});

    const [model] = cardsToModel(player, [card]);

    expect(model.combinedDisplayName).to.eq(`Diverse ${card.name}`);
    expect(model.infectionNames).is.undefined;
    expect(model.infectionHighlight).is.undefined;
  });

  it('reports only infection fields when there are no mutations', () => {
    const card = fakeCard({infections: [{infection: InfectionName.COST_INFLATION}]});

    const [model] = cardsToModel(player, [card]);

    expect(model.combinedDisplayName).to.eq(`Overpriced ${card.name}`);
    expect(model.mutationNames).is.undefined;
    expect(model.mutationHighlight).is.undefined;
  });

  it('sets no combinedDisplayName for an unaffected card', () => {
    const card = fakeCard({});

    const [model] = cardsToModel(player, [card]);

    expect(model.combinedDisplayName).is.undefined;
  });
});
