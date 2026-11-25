import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import AssemblerRater from '@/client/components/assembler/AssemblerRater.vue';
import {CardModel} from '@/common/models/CardModel';
import {AssemblerPreviewResponse} from '@/common/assembler/AssemblerPreview';
import {ASSEMBLER_VOTES_STORAGE_KEY, AssemblerVote} from '@/common/assembler/AssemblerVotes';
import {CardName} from '@/common/cards/CardName';

function card(i: number): CardModel {
  return {
    name: `Assembled preview-7-${i}` as CardName,
    combinedDisplayName: `Card ${i}`,
    calculatedCost: 10 + i,
    assembled: {
      complexity: 'low',
      value: 13 + i,
      breakdown: [{text: 'Increase your steel production 2 steps.', value: 11 + i, category: 'metal'}, {text: 'Tags: building', value: 2}],
    },
  };
}

describe('AssemblerRater', () => {
  let originalFetch: typeof global.fetch;
  let requested: Array<string>;
  let batch = 0;

  beforeEach(() => {
    localStorage.clear();
    originalFetch = global.fetch;
    requested = [];
    batch = 0;
    global.fetch = ((url: string) => {
      requested.push(url);
      const b = batch++;
      const ok: AssemblerPreviewResponse = {seed: 7, cards: [1, 2, 3].map((i) => card(b * 3 + i))};
      return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve(ok)} as Response);
    }) as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    localStorage.clear();
  });

  async function settle() {
    for (let i = 0; i < 3; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  async function mountReady() {
    const wrapper = mount(AssemblerRater, {...globalConfig, global: {...globalConfig.global, stubs: {Card: true}}});
    await settle();
    await wrapper.vm.$nextTick();
    return wrapper;
  }

  function stored(): Array<AssemblerVote> {
    return JSON.parse(localStorage.getItem(ASSEMBLER_VOTES_STORAGE_KEY) ?? '[]');
  }

  it('asks for a batch of cards and shows one with the five verdicts', async () => {
    const wrapper = await mountReady();
    expect(requested[0]).eq('api/assembler?count=6');
    expect(wrapper.findAll('.rater-verdict')).length(5);
    expect(wrapper.text()).contains('0');
  });

  it('records a vote, moves on to the next card and keeps it in the browser', async () => {
    const wrapper = await mountReady();
    await wrapper.find('.rater-verdict--too-expensive').trigger('click');
    expect(stored()).length(1);
    expect(stored()[0]).to.include({card: 'Assembled preview-7-1', cost: 11, verdict: 'too-expensive'});
    expect(wrapper.find('.rater-last').text()).contains('Card 1');
    await wrapper.find('.rater-verdict--fair').trigger('click');
    expect(stored().map((v) => v.card)).deep.eq(['Assembled preview-7-1', 'Assembled preview-7-2']);
  });

  it('votes with the number keys and skips with S', async () => {
    const wrapper = await mountReady();
    window.dispatchEvent(new KeyboardEvent('keydown', {key: 's'}));
    window.dispatchEvent(new KeyboardEvent('keydown', {key: '1'}));
    await wrapper.vm.$nextTick();
    expect(stored()).length(1);
    expect(stored()[0]).to.include({card: 'Assembled preview-7-2', verdict: 'much-too-cheap'});
  });

  it('fetches more cards before running out', async () => {
    const wrapper = await mountReady();
    await wrapper.find('.rater-verdict--fair').trigger('click');
    await wrapper.find('.rater-verdict--fair').trigger('click');
    await settle();
    expect(requested).length(2);
  });

  it('undo removes the last vote', async () => {
    const wrapper = await mountReady();
    await wrapper.find('.rater-verdict--fair').trigger('click');
    await wrapper.find('.rater-last a').trigger('click');
    expect(stored()).length(0);
  });

  it('shows which kinds of effect you think are too expensive', async () => {
    const wrapper = await mountReady();
    for (let i = 0; i < 3; i++) {
      await wrapper.find('.rater-verdict--much-too-expensive').trigger('click');
      await settle();
    }
    const rows = wrapper.findAll('.rater-leans tbody tr').map((r) => r.text());
    expect(rows[0]).contains('Metal');
    expect(rows[0]).contains('too expensive');
  });

  it('picks up votes from an earlier visit', async () => {
    const wrapper = await mountReady();
    await wrapper.find('.rater-verdict--fair').trigger('click');
    wrapper.unmount();
    const again = await mountReady();
    expect(again.find('h3').text()).contains('1');
  });
});
