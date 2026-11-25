import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import AssemblerWorkshop from '@/client/components/assembler/AssemblerWorkshop.vue';
import {CardModel} from '@/common/models/CardModel';
import {AssemblerPreviewResponse} from '@/common/assembler/AssemblerPreview';
import {CardName} from '@/common/cards/CardName';

const card: CardModel = {
  name: 'Assembled preview-7-1' as CardName,
  combinedDisplayName: 'Cooled Reactor',
  assembled: {
    complexity: 'mid',
    value: 20,
    breakdown: [
      {text: 'Increase your energy production 2 steps.', value: 15, category: 'energy'},
      {text: 'Decrease your heat production 1 step.', value: -4, category: 'cooling'},
      {text: 'Tags: power', value: 2},
    ],
  },
};

describe('AssemblerWorkshop', () => {
  let originalFetch: typeof global.fetch;
  let requested: Array<string>;
  let reply: () => Response;

  beforeEach(() => {
    originalFetch = global.fetch;
    requested = [];
    const ok: AssemblerPreviewResponse = {seed: 7, cards: [card]};
    reply = () => ({ok: true, status: 200, json: () => Promise.resolve(ok)} as Response);
    global.fetch = ((url: string) => {
      requested.push(url);
      return Promise.resolve(reply());
    }) as typeof fetch;
    history.pushState({}, '', '/assembler');
  });

  afterEach(() => {
    global.fetch = originalFetch;
    history.pushState({}, '', '/');
  });

  async function mountReady() {
    // Card.vue needs a full card face; the page's own parts are what's under test.
    const wrapper = mount(AssemblerWorkshop, {...globalConfig, global: {...globalConfig.global, stubs: {Card: true}}});
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    return wrapper;
  }

  it('generates cards on open and shows their complexity, value and effects', async () => {
    const wrapper = await mountReady();
    expect(requested).deep.eq(['api/assembler?count=6']);
    expect(wrapper.text()).contains('Seed 7');
    expect(wrapper.find('.assembler-complexity--mid').exists()).is.true;
    expect(wrapper.find('.assembler-score').text()).contains('20');
    const effects = wrapper.findAll('.assembler-score-effects .assembler-chip').map((c) => c.text());
    expect(effects).deep.eq(['Energy', 'Cooling']);
  });

  it('sends the chosen options', async () => {
    const wrapper = await mountReady();
    await wrapper.find('input[value=cooling]').setValue(true);
    await wrapper.find('input[value=science]').setValue(true);
    await wrapper.find('form').trigger('submit');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(requested[1]).eq('api/assembler?count=6&categories=cooling&tags=science');
  });

  it('opens a shared link with its options', async () => {
    history.pushState({}, '', '/assembler?count=2&complexity=high&seed=99&categories=water');
    await mountReady();
    expect(requested).deep.eq(['api/assembler?count=2&complexity=high&seed=99&categories=water']);
  });

  it('shows why no card could be made', async () => {
    reply = () => ({ok: false, status: 400, text: () => Promise.resolve('Bad request: The lowest cost is above the highest cost.')} as Response);
    const wrapper = await mountReady();
    expect(wrapper.find('.assembler-error').text()).eq('The lowest cost is above the highest cost.');
  });
});
