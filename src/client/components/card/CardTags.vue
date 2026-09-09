<template>
  <div class="card-tags">
    <template v-if="allTags.length <= 4">
      <CardTag v-for="(cardTag, index) in allTags" :key="index" :index="index" :type="cardTag" :class="glowClass(cardTag)"/>
    </template>
    <template v-else>
      <CardTag :key="0" :index="0" type="asterisk"/>
    </template>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import CardTag from '@/client/components/card/CardTag.vue';
import {Tag} from '@/common/cards/Tag';

export default defineComponent({
  name: 'CardTags',
  props: {
    tags: {
      type: Array as () => Array<Tag>,
      required: true,
    },
    // MutationMarkets: an extra tag granted by a mutation (e.g. Tag Diversifier).
    // Rendered as one more tag in this same row -- not a separate flex item elsewhere in
    // Card.vue -- so it reflows naturally with the printed tags instead of shifting them
    // by adding an extra top-level slot to `.card-cost-and-tags`'s space-between layout.
    mutationAddedTag: {
      type: String as () => Tag | undefined,
      default: undefined,
    },
  },
  components: {
    CardTag,
  },
  computed: {
    allTags(): Array<Tag> {
      if (this.mutationAddedTag === undefined) {
        return this.tags;
      }
      return [...this.tags, this.mutationAddedTag];
    },
  },
  methods: {
    // chooseRandomTag (server) never picks a tag the card already has, so a plain value
    // match unambiguously identifies the one added tag among the printed ones.
    glowClass(tag: Tag): string {
      return tag === this.mutationAddedTag ? 'mutation-tag-glow' : '';
    },
  },
});

</script>

