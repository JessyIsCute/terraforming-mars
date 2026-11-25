import {mount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardAssembledInfo from '@/client/components/card/CardAssembledInfo.vue';
import {AssembledCardInfo} from '@/common/models/CardModel';

const info: AssembledCardInfo = {
  complexity: 3,
  value: 15,
  breakdown: [
    {text: 'Increase your plant production 1 step', value: 8},
    {text: 'Gain 7 M€', value: 7},
  ],
  costAdjust: -10,
};

describe('CardAssembledInfo', () => {
  it('shows the price breakdown when clicked', async () => {
    const wrapper = mount(CardAssembledInfo, {
      ...globalConfig,
      props: {info, title: 'Hydro Works', hovering: true},
      attachTo: document.body,
    });
    expect(document.body.querySelector('.card-assembled-info')).is.null;

    await wrapper.find('.card-assembled-icon').trigger('click');
    const popup = document.body.querySelector('.card-assembled-info');
    expect(popup).is.not.null;
    const text = popup!.textContent ?? '';
    expect(text).contains('Increase your plant production 1 step');
    expect(text).contains('+8');
    expect(text).contains('Complexity 3');
    expect(text).contains('12'); // cost = value - 3
    expect(text).contains('−10');
    const lastRow = popup!.querySelector('tr:last-child')!.textContent ?? '';
    expect(lastRow).contains('2'); // 12 - 10
  });
});
