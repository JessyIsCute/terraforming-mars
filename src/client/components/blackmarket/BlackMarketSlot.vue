<template>
  <div class="black-market-slot" :class="entranceClass">
    <template v-if="marketSlot !== undefined">
      <div class="black-market-card-theme black-market-card-scale-wrapper">
        <Card :card="marketSlot.card" :autoTall="true" />
      </div>
      <div class="black-market-price-badge">{{ priceText }}</div>
    </template>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import Card from '@/client/components/card/Card.vue';
import {BlackMarketSlotModel} from '@/common/models/BlackMarketModel';
import {describeBlackMarketPrice} from '@/common/blackmarket/BlackMarketPrice';

const ENTRANCE_ANIMATION_MS = 700;

export default defineComponent({
  name: 'BlackMarketSlot',
  components: {
    Card,
  },
  props: {
    marketSlot: {
      type: Object as PropType<BlackMarketSlotModel>,
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
    priceText(): string {
      return this.marketSlot === undefined ? '' : describeBlackMarketPrice(this.marketSlot.price);
    },
  },
  watch: {
    // A bought card is replaced by a fresh one (same design's next printing, or a new
    // design once its stack is exhausted) -- only a genuine replacement (a new card name
    // sliding into a previously-different slot) should animate, not the component's
    // initial mount (`watch`, unlike `immediate`, skips that).
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
