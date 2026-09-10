<template>
  <div v-if="market !== undefined" class="black-market">
    <BlackMarketSlot
      v-for="(slot, index) in market.slots"
      :key="index"
      :marketSlot="slot" />
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
