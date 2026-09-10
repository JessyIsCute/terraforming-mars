import {mount, shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import Card from '@/client/components/card/Card.vue';
import {CardName} from '@/common/cards/CardName';
import {FakeLocalStorage} from '../FakeLocalStorage';
import {CardType} from '@/common/cards/CardType';
import {CustomCardModel} from '@/common/models/CardModel';
import {ICardRenderItem, ICardRenderRoot} from '@/common/cards/render/Types';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';
import {Tag} from '@/common/cards/Tag';

describe('Card', () => {
  let localStorage: FakeLocalStorage;

  beforeEach(() => {
    localStorage = new FakeLocalStorage();
    FakeLocalStorage.register(localStorage);
  });

  afterEach(() => {
    FakeLocalStorage.deregister(localStorage);
  });

  it('mounts without errors', () => {
    const wrapper = shallowMount(Card, {
      ...globalConfig,
      props: {
        card: {name: CardName.ECOLINE},
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders a Custom Card Maker card via the customCard wire fallback', () => {
    const customCard: CustomCardModel = {
      type: CardType.AUTOMATED,
      cost: 12,
      tags: [],
      requirements: [],
      metadata: {description: 'Does a custom thing.', renderData: {is: 'root', rows: []} as ICardRenderRoot},
      module: 'customCards',
      compatibility: [],
    };
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {name: 'My Custom Card' as CardName, customCard},
      },
    });
    expect(wrapper.exists()).to.be.true;
    expect(wrapper.text()).to.contain('My Custom Card');
  });

  it('renders a mutated card\'s display name, Mutated ribbon, and glowing effect description', () => {
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {
          name: CardName.ADAPTED_LICHEN,
          combinedDisplayName: 'Verdant Adapted Lichen',
          mutationNames: [MutationName.GREENERY_KEEPER],
        },
      },
    });
    expect(wrapper.text()).to.contain('Verdant Adapted Lichen');
    expect(wrapper.find('.mutated-label').exists()).to.be.true;
    const description = wrapper.find('.mutation-glow.card-description');
    expect(description.exists()).to.be.true;
    expect(description.text()).to.eq('Gain 2 Plants on play');
  });

  it('renders a mutation-added tag as a full-size tag among the card\'s real tags, glowing', () => {
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {
          name: CardName.ADAPTED_LICHEN,
          mutationNames: [MutationName.TAG_DIVERSIFIER],
          mutationAddedTag: Tag.ANIMAL,
        },
      },
    });
    const addedTag = wrapper.find('.tag-animal');
    expect(addedTag.exists()).to.be.true;
    expect(addedTag.classes()).to.include('mutation-tag-glow');
    // Rendered inside the same .card-tags row as the printed tags (not a separate,
    // independently-sized wrapper elsewhere in the card) -- regression coverage for a
    // bug where a standalone wrapper both shrank the added tag and shifted the real
    // tags leftward.
    expect(addedTag.element.closest('.card-tags')).to.not.be.null;
  });

  it('renders no tag icon for an infected card\'s infectionAddedTag -- only the Infected ribbon indicates it', () => {
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {
          name: CardName.ADAPTED_LICHEN,
          infectionNames: [InfectionName.POWER_DRAIN],
          infectionAddedTag: Tag.INFECTED,
        },
      },
    });
    expect(wrapper.find('.infected-label').exists()).to.be.true;
    expect(wrapper.find('.tag-infected').exists()).to.be.false;
    expect(wrapper.find('.infection-tag-glow').exists()).to.be.false;
  });

  it('merges a resource grant into a matching icon the card already shows, instead of a separate description line', () => {
    const customCard: CustomCardModel = {
      type: CardType.AUTOMATED,
      cost: 12,
      tags: [],
      requirements: [],
      metadata: {
        description: 'Gain plants.',
        renderData: {
          is: 'root',
          rows: [[{is: 'item', type: CardRenderItemType.PLANTS, amount: 1} as ICardRenderItem]],
        } as ICardRenderRoot,
      },
      module: 'customCards',
      compatibility: [],
    };
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {
          name: 'My Custom Card' as CardName,
          customCard,
          mutationNames: [MutationName.GREENERY_KEEPER], // grants +2 plants on play
        },
      },
    });
    // The existing "1 plant" icon's amount is bumped to 3 (1 + 2), glowing -- no
    // separate "Gain 2 Plants on play" line is added on top of it.
    expect(wrapper.find('.mutation-icon-glow').exists()).to.be.true;
    expect(wrapper.find('.mutation-glow.card-description').exists()).to.be.false;
    expect(wrapper.text()).to.not.contain('Gain 2 Plants on play');
  });

  it('renders an unmutated card with no Mutated ribbon or extra description', () => {
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {name: CardName.ADAPTED_LICHEN},
      },
    });
    expect(wrapper.find('.mutated-label').exists()).to.be.false;
    expect(wrapper.find('.mutation-glow.card-description').exists()).to.be.false;
  });

  it('renders an infected card\'s display name, Infected ribbon, glowing red cost, and glowing effect description', () => {
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {
          name: CardName.ADAPTED_LICHEN,
          combinedDisplayName: 'Drained Adapted Lichen',
          infectionNames: [InfectionName.POWER_DRAIN],
          infectionHighlight: {},
        },
      },
    });
    expect(wrapper.text()).to.contain('Drained Adapted Lichen');
    expect(wrapper.find('.infected-label').exists()).to.be.true;
    expect(wrapper.find('.mutated-label').exists()).to.be.false;
    const description = wrapper.find('.infection-glow.card-description');
    expect(description.exists()).to.be.true;
    expect(description.text()).to.eq('Costs 2 Energy to play (can\'t be played without it)');
  });

  it('renders red cost glow for an infection with a cost highlight', () => {
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {
          name: CardName.ADAPTED_LICHEN,
          infectionNames: [InfectionName.COST_INFLATION],
          infectionHighlight: {cost: true},
        },
      },
    });
    expect(wrapper.find('.infection-cost-glow').exists()).to.be.true;
  });

  it('renders both Mutated and Infected ribbons, and both description lines, when a card carries both', () => {
    const wrapper = mount(Card, {
      ...globalConfig,
      props: {
        card: {
          name: CardName.ADAPTED_LICHEN,
          combinedDisplayName: 'Drained Verdant Adapted Lichen',
          mutationNames: [MutationName.GREENERY_KEEPER],
          infectionNames: [InfectionName.POWER_DRAIN],
        },
      },
    });
    expect(wrapper.text()).to.contain('Drained Verdant Adapted Lichen');
    expect(wrapper.find('.mutated-label').exists()).to.be.true;
    expect(wrapper.find('.infected-label').exists()).to.be.true;
    expect(wrapper.find('.mutation-glow.card-description').text()).to.eq('Gain 2 Plants on play');
    expect(wrapper.find('.infection-glow.card-description').text()).to.eq('Costs 2 Energy to play (can\'t be played without it)');
  });

  it('throws if a card is neither in the static manifest nor carries customCard fallback data', () => {
    expect(() => mount(Card, {
      ...globalConfig,
      props: {
        card: {name: 'Not A Real Card' as CardName},
      },
    })).to.throw('card not found');
  });
});
