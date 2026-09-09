import {mount, shallowMount} from '@vue/test-utils';
import {expect} from 'chai';
import {globalConfig} from '../getLocalVue';
import CardTags from '@/client/components/card/CardTags.vue';
import {Tag} from '@/common/cards/Tag';

describe('CardTags', () => {
  it('mounts without errors', () => {
    const wrapper = shallowMount(CardTags, {
      ...globalConfig,
      props: {
        tags: [Tag.SPACE, Tag.SCIENCE],
      },
    });
    expect(wrapper.exists()).to.be.true;
  });

  it('renders only the printed tags when there is no mutation-added tag', () => {
    const wrapper = mount(CardTags, {
      ...globalConfig,
      props: {
        tags: [Tag.SPACE, Tag.SCIENCE],
      },
    });
    expect(wrapper.findAll('.card-tag')).to.have.lengthOf(2);
    expect(wrapper.find('.mutation-tag-glow').exists()).to.be.false;
  });

  it('renders the mutation-added tag as one more tag in the same row, glowing', () => {
    const wrapper = mount(CardTags, {
      ...globalConfig,
      props: {
        tags: [Tag.SPACE, Tag.SCIENCE],
        mutationAddedTag: Tag.ANIMAL,
      },
    });
    const tags = wrapper.findAll('.card-tag');
    expect(tags).to.have.lengthOf(3);
    expect(tags[2].classes()).to.include('mutation-tag-glow');
    expect(tags[2].classes()).to.include('tag-animal');
    // The printed tags themselves aren't marked -- only the added one glows.
    expect(tags[0].classes()).to.not.include('mutation-tag-glow');
    expect(tags[1].classes()).to.not.include('mutation-tag-glow');
  });

  it('falls back to the asterisk overflow tag once 4 printed tags plus the added one exceeds the cap', () => {
    const wrapper = mount(CardTags, {
      ...globalConfig,
      props: {
        tags: [Tag.SPACE, Tag.SCIENCE, Tag.EARTH, Tag.BUILDING],
        mutationAddedTag: Tag.ANIMAL,
      },
    });
    expect(wrapper.findAll('.card-tag')).to.have.lengthOf(1);
    expect(wrapper.find('.tag-asterisk').exists()).to.be.true;
  });
});
