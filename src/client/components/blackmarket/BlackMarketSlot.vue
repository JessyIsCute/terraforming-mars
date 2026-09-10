<template>
  <div class="black-market-slot" :class="entranceClass">
    <div v-if="card !== undefined" class="black-market-card-theme black-market-card-scale-wrapper">
      <Card :card="card" :autoTall="true" />
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import Card from '@/client/components/card/Card.vue';
import {CardModel} from '@/common/models/CardModel';

const ENTRANCE_ANIMATION_MS = 700;

export default defineComponent({
  name: 'BlackMarketSlot',
  components: {
    Card,
  },
  props: {
    card: {
      type: Object as PropType<CardModel | undefined>,
      default: undefined,
    },
  },
  data() {
    return {
      entering: false,
    };
  },
  computed: {
    entranceClass(): string {
      return this.entering ? 'black-market-slot--entering-right' : '';
    },
  },
  watch: {
    // A bought card is replaced by a fresh one (same design's next printing, or a new
    // design once its stack is exhausted) -- only a genuine replacement (a new card name
    // sliding into a previously-different slot) should animate, not the component's
    // initial mount (`watch`, unlike `immediate`, skips that).
    'card.name'(newName: string | undefined, oldName: string | undefined) {
      if (newName !== undefined && oldName !== undefined && newName !== oldName) {
        this.entering = true;
        setTimeout(() => {
          this.entering = false;
        }, ENTRANCE_ANIMATION_MS);
      }
    },
  },
});

</script>
