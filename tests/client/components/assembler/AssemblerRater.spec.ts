import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import AssemblerRater from '@/client/components/assembler/AssemblerRater.vue';
import {CardModel} from '@/common/models/CardModel';
import {AssemblerPreviewResponse} from '@/common/assembler/AssemblerPreview';
import {AssemblerValueTableModel} from '@/common/assembler/AssemblerValueTable';
import {ASSEMBLER_VALUE_VOTES_STORAGE_KEY, ASSEMBLER_VOTES_STORAGE_KEY, AssemblerValueVote, AssemblerVote} from '@/common/assembler/AssemblerVotes';
import {CardName} from '@/common/cards/CardName';

function card(i: number, costAdjust?: number): CardModel {
  return {
    name: `Assembled preview-7-${i}` as CardName,
    combinedDisplayName: `Card ${i}`,
    calculatedCost: 10 + i + (costAdjust ?? 0),
    assembled: {
      complexity: 'low',
      value: 13 + i,
      breakdown: [{text: 'Increase your steel production 2 steps.', value: 11 + i, category: 'metal'}, {text: 'Tags: building', value: 2}],
      costAdjust,
    },
  };
}

const table: AssemblerValueTableModel = {
  sections: [],
  rateable: [
    {key: 'stock.steel', label: 'Gain 1 steel', value: 2, group: 'Resources'},
    {key: 'tr', label: 'Raise your TR 1 step', value: 7, group: 'One-off effects'},
  ],
};

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
      if (url === 'api/assembler/values') {
        return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve(table)} as Response);
      }
      const b = batch++;
      // The first card of every batch is shown 3 M€ too expensive.
      const ok: AssemblerPreviewResponse = {seed: 7, cards: [1, 2, 3].map((i) => card(b * 3 + i, i === 1 ? 3 : undefined))};
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

  async function mountReady(mode: 'values' | 'cards' = 'values') {
    const wrapper = mount(AssemblerRater, {...globalConfig, global: {...globalConfig.global, stubs: {Card: true}}});
    await settle();
    if (mode === 'cards') {
      await wrapper.findAll('.rater-mode')[1].trigger('click');
      await settle();
    }
    await wrapper.vm.$nextTick();
    return wrapper;
  }

  function storedCards(): Array<AssemblerVote> {
    return JSON.parse(localStorage.getItem(ASSEMBLER_VOTES_STORAGE_KEY) ?? '[]');
  }
  function storedValues(): Array<AssemblerValueVote> {
    return JSON.parse(localStorage.getItem(ASSEMBLER_VALUE_VOTES_STORAGE_KEY) ?? '[]');
  }

  describe('rate values', () => {
    it('opens on a value from the table with "worth more / less" buttons', async () => {
      const wrapper = await mountReady();
      expect(requested).deep.eq(['api/assembler/values']);
      expect(wrapper.find('.rater-value-label').text()).to.be.oneOf(['Gain 1 steel', 'Raise your TR 1 step']);
      expect(wrapper.findAll('.rater-verdict').map((b) => b.text())).contains('4 Worth less');
    });

    it('records the shown and the real number, and walks through every value', async () => {
      const wrapper = await mountReady();
      const first = wrapper.find('.rater-value-label').text();
      await wrapper.find('.rater-verdict--too-expensive').trigger('click');
      const second = wrapper.find('.rater-value-label').text();
      expect(second).not.eq(first);
      const [vote] = storedValues();
      expect(vote.label).eq(first);
      expect(vote.verdict).eq('too-expensive');
      expect(vote.real).eq(first === 'Gain 1 steel' ? 2 : 7);
      expect(vote.shown).gt(0);
    });

    it('without the spread, shows the real numbers', async () => {
      const wrapper = await mountReady();
      await wrapper.find('.rater-option input[type=checkbox]').setValue(false);
      await settle();
      for (let i = 0; i < 4; i++) {
        await wrapper.find('.rater-verdict--fair').trigger('click');
        await settle();
      }
      expect(storedValues()).length(4);
      for (const v of storedValues()) {
        expect(v.shown).eq(v.real);
      }
    });

    it('sums up what you would change', async () => {
      const wrapper = await mountReady();
      await wrapper.find('.rater-option input[type=checkbox]').setValue(false);
      await settle();
      for (let i = 0; i < 2; i++) {
        const isSteel = wrapper.find('.rater-value-label').text() === 'Gain 1 steel';
        await wrapper.find(isSteel ? '.rater-verdict--much-too-expensive' : '.rater-verdict--fair').trigger('click');
      }
      const rows = wrapper.findAll('.rater-values tbody tr').map((r) => r.findAll('td').map((td) => td.text()));
      expect(rows[0]).deep.eq(['Gain 1 steel', '1', '2', '1.4']);
      expect(rows[1]).deep.eq(['Raise your TR 1 step', '1', '7', '7']);
    });
  });

  describe('rate cards', () => {
    it('asks for cards with the spread and hides the price breakdown', async () => {
      const wrapper = await mountReady('cards');
      expect(requested[1]).eq('api/assembler?count=6&spread=1');
      const shown = wrapper.findComponent({name: 'Card'});
      expect(shown.props('card').assembled).is.undefined;
      expect(wrapper.findAll('.rater-verdict')).length(5);
    });

    it('records a vote with the shift and moves on', async () => {
      const wrapper = await mountReady('cards');
      await wrapper.find('.rater-verdict--too-expensive').trigger('click');
      expect(storedCards()[0]).to.include({card: 'Assembled preview-7-1', cost: 14, verdict: 'too-expensive', shift: 3});
      expect(wrapper.find('.rater-last').text()).contains('real price 11 M€');
      await wrapper.find('.rater-verdict--fair').trigger('click');
      expect(storedCards()[1]).to.include({card: 'Assembled preview-7-2', shift: 0});
    });

    it('votes with the number keys and skips with S', async () => {
      const wrapper = await mountReady('cards');
      window.dispatchEvent(new KeyboardEvent('keydown', {key: 's'}));
      window.dispatchEvent(new KeyboardEvent('keydown', {key: '1'}));
      await wrapper.vm.$nextTick();
      expect(storedCards()).length(1);
      expect(storedCards()[0]).to.include({card: 'Assembled preview-7-2', verdict: 'much-too-cheap'});
    });

    it('fetches more cards before running out', async () => {
      const wrapper = await mountReady('cards');
      await wrapper.find('.rater-verdict--fair').trigger('click');
      await settle();
      expect(requested.filter((u) => u.startsWith('api/assembler?'))).length(2);
    });

    it('undo removes the last vote', async () => {
      const wrapper = await mountReady('cards');
      await wrapper.find('.rater-verdict--fair').trigger('click');
      await wrapper.find('.rater-last a').trigger('click');
      expect(storedCards()).length(0);
    });

    it('shows the check: did you notice the moved prices?', async () => {
      const wrapper = await mountReady('cards');
      for (let i = 0; i < 3; i++) {
        // cards 1 (moved up), 2, 3 (real)
        await wrapper.find(i === 0 ? '.rater-verdict--much-too-expensive' : '.rater-verdict--fair').trigger('click');
        await settle();
      }
      const rows = wrapper.findAll('.rater-check tbody tr').map((r) => r.text());
      expect(rows[1]).contains('2').and.contains('about right');
      expect(rows[2]).contains('1').and.contains('too expensive');
    });

    it('per-effect verdicts use only cards at their real price', async () => {
      const wrapper = await mountReady('cards');
      for (let i = 0; i < 6; i++) {
        await wrapper.find('.rater-verdict--much-too-expensive').trigger('click');
        await settle();
      }
      // 6 votes, 2 of them on moved cards: Metal shows 4.
      const metal = wrapper.findAll('.rater-leans tbody tr').map((r) => r.text()).find((t) => t.includes('Metal'));
      expect(metal).contains('4');
    });
  });

  it('keeps both kinds of votes for the next visit', async () => {
    const wrapper = await mountReady('cards');
    await wrapper.find('.rater-verdict--fair').trigger('click');
    await wrapper.findAll('.rater-mode')[0].trigger('click');
    await settle();
    await wrapper.find('.rater-verdict--fair').trigger('click');
    wrapper.unmount();
    const again = await mountReady();
    expect(again.find('h3').text()).contains('2');
  });
});
