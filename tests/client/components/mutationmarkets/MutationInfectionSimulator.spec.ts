import {mount, shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import MutationInfectionSimulator from '@/client/components/mutationmarkets/MutationInfectionSimulator.vue';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';
import {CardName} from '@/common/cards/CardName';

describe('MutationInfectionSimulator', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(MutationInfectionSimulator, {...globalConfig});
    expect(wrapper.exists()).to.be.true;
  });

  it('actually swaps the rendered card (not just its displayed name) when a different card is picked', async () => {
    // Regression test: Card.vue resolves its own face data (cost/tags/icons) once, in
    // data(), from the `card.name` prop at mount time -- it does NOT reactively re-derive
    // that if the prop's name later changes on the same component instance. A plain
    // v-model-driven card switch (no :key) would silently keep showing the FIRST card's
    // cost/art forever, with only text that reads `card.name` directly (the title) any
    // different. Needs a full `mount` (not shallowMount) since the bug lives inside
    // Card.vue's own internals, invisible to a stubbed child.
    const wrapper = mount(MutationInfectionSimulator, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.selectedCardName = CardName.ASTEROID_MINING;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.card-asteroid-mining .card-cost').text()).to.eq('30');

    vm.selectedCardName = CardName.BUSHES;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.card-bushes .card-cost').text()).to.eq('10');
    expect(wrapper.find('.card-asteroid-mining').exists()).to.be.false;
  });

  it('the original preview carries no mutation/infection at all', () => {
    const wrapper = shallowMount(MutationInfectionSimulator, {...globalConfig});
    const vm = wrapper.vm as any;
    expect(vm.originalCardModel.mutationNames).to.be.undefined;
    expect(vm.originalCardModel.infectionNames).to.be.undefined;
  });

  it('selecting a mutation carries it into the preview model, with a combined display name', async () => {
    const wrapper = shallowMount(MutationInfectionSimulator, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.selectedMutations = [MutationName.GIGANTIC_UNDERTAKINGS];
    await wrapper.vm.$nextTick();

    expect(vm.previewCardModel.mutationNames).to.deep.eq([MutationName.GIGANTIC_UNDERTAKINGS]);
    expect(vm.previewCardModel.combinedDisplayName).to.contain(vm.selectedCardName);
    expect(vm.previewCardModel.mutationHighlight).to.deep.eq({cost: true, vp: true});
  });

  it('selecting an infection carries it into the preview model', async () => {
    const wrapper = shallowMount(MutationInfectionSimulator, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.selectedInfections = [InfectionName.COST_INFLATION];
    await wrapper.vm.$nextTick();

    expect(vm.previewCardModel.infectionNames).to.deep.eq([InfectionName.COST_INFLATION]);
    expect(vm.previewCardModel.calculatedCost).to.eq(vm.baseCost + 4);
  });

  it('applies both a mutation and an infection at once, composing their cost effects', async () => {
    const wrapper = shallowMount(MutationInfectionSimulator, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.selectedMutations = [MutationName.GIGANTIC_UNDERTAKINGS];
    vm.selectedInfections = [InfectionName.COST_INFLATION];
    await wrapper.vm.$nextTick();

    const model = vm.previewCardModel;
    expect(model.mutationNames).to.deep.eq([MutationName.GIGANTIC_UNDERTAKINGS]);
    expect(model.infectionNames).to.deep.eq([InfectionName.COST_INFLATION]);
    expect(model.mutationVictoryPoints).to.be.greaterThan(0);
    // Gigantic Undertakings' cost increase is applied to baseCost first, then Cost
    // Inflation's flat +4 on top -- matches Card.ts's
    // InfectionEffects.applyCost(MutationEffects.applyCost(...)) composition order. The
    // exact clamped delta amounts are covered precisely in mutationInfectionPreview.spec.ts;
    // here it's enough to confirm both effects actually stack rather than one overwriting
    // the other.
    expect(model.calculatedCost).to.be.greaterThan(vm.baseCost + 4);
  });

  it('allows multiple mutations and infections to be selected and applied together', async () => {
    const wrapper = shallowMount(MutationInfectionSimulator, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.selectedMutations = [MutationName.GIGANTIC_UNDERTAKINGS, MutationName.MINI_MUTATION];
    vm.selectedInfections = [InfectionName.COST_INFLATION, InfectionName.VALUE_SIPHON];
    await wrapper.vm.$nextTick();

    const model = vm.previewCardModel;
    expect(model.mutationNames).to.deep.eq([MutationName.GIGANTIC_UNDERTAKINGS, MutationName.MINI_MUTATION]);
    expect(model.infectionNames).to.deep.eq([InfectionName.COST_INFLATION, InfectionName.VALUE_SIPHON]);
    expect(model.infectionVictoryPoints).to.eq(-1);
    expect(model.combinedDisplayName).to.eq(
      `Gigantic Mini Overpriced Siphoned ${vm.selectedCardName}`,
    );
  });

  it('hasRandomTagMutation is true only when an addRandomTag-kind mutation is selected', async () => {
    const wrapper = shallowMount(MutationInfectionSimulator, {...globalConfig});
    const vm = wrapper.vm as any;

    vm.selectedMutations = [MutationName.SCIENCE_PATRON];
    await wrapper.vm.$nextTick();
    expect(vm.hasRandomTagMutation).to.be.true;

    vm.selectedMutations = [MutationName.GIGANTIC_UNDERTAKINGS];
    await wrapper.vm.$nextTick();
    expect(vm.hasRandomTagMutation).to.be.false;
  });

  it('rerollTag bumps rerollSeed', () => {
    const wrapper = shallowMount(MutationInfectionSimulator, {...globalConfig});
    const vm = wrapper.vm as any;
    const before = vm.rerollSeed;
    vm.rerollTag();
    expect(vm.rerollSeed).to.eq(before + 1);
  });
});
