import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import AssemblerValueTable from '@/client/components/assembler/AssemblerValueTable.vue';
import {AssemblerValueTableModel} from '@/common/assembler/AssemblerValueTable';

const table: AssemblerValueTableModel = {
  sections: [{
    title: 'Resources',
    intro: 'Losing is negative.',
    columns: ['Resource', '1 in stock'],
    numeric: [false, true],
    rows: [['Steel', '2'], ['Debt', '−4']],
  }],
};

describe('AssemblerValueTable', () => {
  let originalFetch: typeof global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  async function mountWith(response: Partial<Response>) {
    originalFetch = global.fetch;
    global.fetch = (() => Promise.resolve(response as Response)) as typeof fetch;
    const wrapper = mount(AssemblerValueTable, {...globalConfig});
    await new Promise((resolve) => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();
    return wrapper;
  }

  it('renders each section as a table', async () => {
    const wrapper = await mountWith({ok: true, json: () => Promise.resolve(table)});
    expect(wrapper.find('h2').text()).eq('Resources');
    expect(wrapper.find('.assembler-values-intro').text()).eq('Losing is negative.');
    const cells = wrapper.findAll('tbody td');
    expect(cells.map((c) => c.text())).deep.eq(['Steel', '2', 'Debt', '−4']);
    expect(cells[1].classes()).includes('assembler-values-num');
    expect(cells[3].classes()).includes('assembler-values-neg');
  });

  it('says so when the table can\'t load', async () => {
    const wrapper = await mountWith({ok: false});
    expect(wrapper.find('.assembler-values-error').text()).eq('Could not load the value table.');
  });
});
