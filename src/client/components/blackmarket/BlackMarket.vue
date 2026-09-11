<template>
  <div v-if="market !== undefined" class="black-market">
    <div class="black-market-row">
      <div class="black-market-row-label">Early Game</div>
      <div class="black-market-row-slots">
        <BlackMarketSlot v-for="(slot, index) in market.early" :key="'early-' + index" :card="slot" />
      </div>
    </div>
    <div v-if="market.mid !== undefined" class="black-market-row">
      <div class="black-market-row-label">Mid Game</div>
      <div class="black-market-row-slots">
        <BlackMarketSlot v-for="(slot, index) in market.mid" :key="'mid-' + index" :card="slot" />
      </div>
    </div>
    <div v-if="market.late !== undefined" class="black-market-row">
      <div class="black-market-row-label">Late Game</div>
      <div class="black-market-row-slots">
        <BlackMarketSlot v-for="(slot, index) in market.late" :key="'late-' + index" :card="slot" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import {BlackMarketModel} from '@/common/models/BlackMarketModel';
import BlackMarketSlot from './BlackMarketSlot.vue';

export default defineComponent({
  name: 'BlackMarket',
  components: {
    BlackMarketSlot,
  },
  props: {
    market: {
      type: Object as PropType<BlackMarketModel | undefined>,
      default: undefined,
    },
  },
});

</script>
