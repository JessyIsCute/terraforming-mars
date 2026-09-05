import {mount, shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardMaker from '@/client/components/cardmaker/CardMaker.vue';
import {decodeCustomCard, encodeCustomCard} from '@/common/cards/customCardCodec';
import {blankCustomCard} from '@/common/cards/CustomCardDefinition';
import {CardType} from '@/common/cards/CardType';
import {Tag} from '@/common/cards/Tag';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {ICardRenderItem} from '@/common/cards/render/Types';
import {CustomCardLibraryEntry} from '@/common/cards/CustomCardLibraryEntry';

describe('CardMaker', () => {
  let originalFetch: typeof global.fetch;
  beforeEach(() => {
    originalFetch = global.fetch;
  });
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('mounts without errors', () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    expect(wrapper.exists()).to.be.true;
  });

  it('builds a decodable code from the basic fields', async () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.cardName = 'My Card';
    vm.cost = 12;
    vm.tags = [Tag.SPACE];
    await wrapper.vm.$nextTick();

    const decoded = decodeCustomCard(vm.code);
    expect(decoded.cardName).eq('My Card');
    expect(decoded.cost).eq(12);
    expect(decoded.tags).deep.eq([Tag.SPACE]);
  });

  it('a curated stock effect becomes part of the behavior', async () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.fx.useStock = true;
    vm.fx.stock.steel = 3;
    await wrapper.vm.$nextTick();
    expect(vm.definition.behavior).to.deep.eq({stock: {steel: 3}});
  });

  it('a curated global-parameter effect becomes part of the behavior', async () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.fx.useGlobal = true;
    vm.fx.temperature = 2;
    await wrapper.vm.$nextTick();
    expect(vm.definition.behavior).to.deep.eq({global: {temperature: 2}});
  });

  it('has no behavior when no curated effect is toggled and no free text is given', async () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    expect(vm.definition.behavior).is.undefined;
    expect(vm.warnings).to.include('The card has no effect and no effect description -- it cannot be approved as-is.');
  });

  it('adding a resource icon appends a curated item to renderData', async () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.rowDrafts[0].kind = 'item';
    vm.rowDrafts[0].itemType = CardRenderItemType.STEEL;
    vm.rowDrafts[0].amount = 4;
    vm.addItemToRow(0);
    await wrapper.vm.$nextTick();

    expect(vm.renderData.rows).to.deep.eq([[{is: 'item', type: CardRenderItemType.STEEL, amount: 4, size: 'M'}]]);
  });

  it('adding a text icon appends a plain string to renderData', async () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.rowDrafts[0].kind = 'text';
    vm.rowDrafts[0].text = 'max 4';
    vm.addItemToRow(0);
    await wrapper.vm.$nextTick();

    expect(vm.renderData.rows).to.deep.eq([['max 4']]);
  });

  it('adding a row is capped at MAX_CUSTOM_CARD_RENDER_ROWS', async () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    for (let i = 0; i < 10; i++) {
      vm.addRow();
    }
    expect(vm.rows.length).eq(vm.MAX_CUSTOM_CARD_RENDER_ROWS);
  });

  it('round-trips a loaded code back into the editable fields', async () => {
    const def = blankCustomCard('Loaded Card');
    def.type = CardType.ACTIVE;
    def.tags = [Tag.VENUS];
    def.cost = 15;
    def.victoryPoints = 2;
    def.behavior = {stock: {plants: 2}, drawCard: 1};
    def.renderData = {is: 'root', rows: [[{is: 'item', type: CardRenderItemType.PLANTS, amount: 2} as ICardRenderItem]]};

    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.loadInput = encodeCustomCard(def);
    vm.loadCode();
    await wrapper.vm.$nextTick();

    expect(vm.cardName).eq('Loaded Card');
    expect(vm.type).eq(CardType.ACTIVE);
    expect(vm.tags).deep.eq([Tag.VENUS]);
    expect(vm.cost).eq(15);
    expect(vm.hasVictoryPoints).is.true;
    expect(vm.victoryPointsInput).eq(2);
    expect(vm.fx.useStock).is.true;
    expect(vm.fx.stock.plants).eq(2);
    expect(vm.fx.useDrawCard).is.true;
    expect(vm.fx.drawCardCount).eq(1);
    expect(vm.definition.behavior).to.deep.eq({stock: {plants: 2}, drawCard: 1});
  });

  it('shows a load error for a garbage code', async () => {
    const wrapper = mount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.loadInput = 'not a real code';
    vm.loadCode();
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.card-maker-error').exists()).is.true;
  });

  it('shows a warning instead of crashing when loading a non-curated (admin-set) behavior', async () => {
    const def = blankCustomCard('Advanced Card');
    def.behavior = {or: {behaviors: []}} as any;
    def.effectDescription = 'An admin-authored effect.';

    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.loadInput = encodeCustomCard(def);
    vm.loadCode();
    await wrapper.vm.$nextTick();

    expect(vm.loadWarning).to.contain('advanced');
    expect(vm.definition.behavior).is.undefined;
    expect(vm.effectDescription).eq('An admin-authored effect.');
  });

  it('renders the card name in the live preview', () => {
    const wrapper = mount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.cardName = 'Preview Card';
    return wrapper.vm.$nextTick().then(() => {
      expect(wrapper.text()).to.contain('Preview Card');
    });
  });

  it('posts the definition and submittedBy, and shows the resulting entry id', async () => {
    const createdEntry: CustomCardLibraryEntry = {
      id: 'c1',
      definition: blankCustomCard('Submitted Card'),
      shareCode: 'TMC1xyz',
      submittedBy: 'me',
      status: 'submitted',
      createdAt: 1,
    };
    let sentBody: any;
    global.fetch = ((_url: string, init: any) => {
      sentBody = JSON.parse(init.body);
      return Promise.resolve({ok: true, status: 200, json: () => Promise.resolve({entry: createdEntry, warnings: []})} as Response);
    }) as typeof fetch;

    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.cardName = 'Submitted Card';
    vm.submittedBy = 'me';
    await vm.submit();

    expect(sentBody.submittedBy).eq('me');
    expect(sentBody.definition.cardName).eq('Submitted Card');
    expect(vm.submittedEntry).to.deep.eq(createdEntry);
  });

  it('shows a clear message when rate-limited', async () => {
    global.fetch = (() => Promise.resolve({ok: false, status: 429} as Response)) as typeof fetch;
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.cardName = 'x';
    await vm.submit();
    expect(vm.submitError).to.contain('too quickly');
  });

  it('newCard resets the form back to blank', async () => {
    const wrapper = shallowMount(CardMaker, {...globalConfig});
    const vm = wrapper.vm as any;
    vm.cardName = 'Something';
    vm.tags = [Tag.MARS];
    vm.rows = [[{kind: 'text', text: 'x'}]];
    await wrapper.vm.$nextTick();
    vm.newCard();
    await wrapper.vm.$nextTick();
    expect(vm.cardName).eq('');
    expect(vm.tags).deep.eq([]);
    expect(vm.rows).deep.eq([[]]);
  });
});
