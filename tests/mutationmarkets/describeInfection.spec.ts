import {expect} from 'chai';
import {describeInfectionEffect} from '../../src/common/mutationmarkets/describeInfection';
import {Resource} from '../../src/common/Resource';

describe('describeInfection', () => {
  it('describes effects', () => {
    expect(describeInfectionEffect({kind: 'costIncrease', amount: 4})).to.eq('Cost +4 M€');
    expect(describeInfectionEffect({kind: 'victoryPointPenalty', amount: 1})).to.eq('-1 VP');
    expect(describeInfectionEffect({kind: 'resourceCostOnPlay', resource: Resource.ENERGY, amount: 2}))
      .to.eq('Costs 2 Energy to play (can\'t be played without it)');
  });
});
