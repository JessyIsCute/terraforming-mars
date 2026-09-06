<template>
  <div class="mutation-market-project-slot" :class="entranceClass">
    <template v-if="marketSlot !== undefined">
      <Card :card="marketSlot.card" :autoTall="true" />
      <div v-if="marketSlot.auction !== undefined" class="mutation-market-auction-badge" :class="`board-cube--${marketSlot.auction.highBidderColor}`">
        {{ marketSlot.auction.highBid }} M€
      </div>
      <div v-if="!marketSlot.active" class="mutation-market-inactive-overlay"></div>
    </template>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import Card from '@/client/components/card/Card.vue';
import {MutationMarketProjectSlotModel} from '@/common/models/MutationMarketModel';

const ENTRANCE_ANIMATION_MS = 700;

export default defineComponent({
  name: 'MutationMarketProjectSlot',
  components: {
    Card,
  },
  props: {
    marketSlot: {
      type: Object as PropType<MutationMarketProjectSlotModel>,
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
      return this.entering ? 'mutation-market-slot--entering-right' : '';
    },
  },
  watch: {
    // Project cards enter the market from the right. Only a genuine replacement (a new
    // card name sliding into a previously-different slot) should animate -- not the
    // component's initial mount, which `watch` (unlike an `immediate` watcher) skips.
    'marketSlot.card.name'(newName: string | undefined, oldName: string | undefined) {
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
