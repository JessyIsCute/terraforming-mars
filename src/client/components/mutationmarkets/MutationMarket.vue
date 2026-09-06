<template>
  <div v-if="market !== undefined" class="mutation-market">
    <div class="mutation-market-row mutation-market-mutation-row">
      <MutationMarketMutationSlot
        v-for="(slot, index) in topRow"
        :key="index"
        :marketSlot="slot"
        :gridColumn="mutationGridColumn(index, topRow.length)" />
    </div>
    <div class="mutation-market-row mutation-market-project-row">
      <MutationMarketProjectSlot
        v-for="(slot, index) in market.projectSlots"
        :key="index"
        :marketSlot="slot" />
    </div>
    <div class="mutation-market-row mutation-market-mutation-row">
      <MutationMarketMutationSlot
        v-for="(slot, index) in bottomRow"
        :key="index"
        :marketSlot="slot"
        :gridColumn="mutationGridColumn(index, bottomRow.length)" />
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import {MutationMarketModel, MutationMarketMutationSlotModel} from '@/common/models/MutationMarketModel';
import MutationMarketProjectSlot from './MutationMarketProjectSlot.vue';
import MutationMarketMutationSlot from './MutationMarketMutationSlot.vue';

export default defineComponent({
  name: 'MutationMarket',
  components: {
    MutationMarketProjectSlot,
    MutationMarketMutationSlot,
  },
  props: {
    market: {
      type: Object as PropType<MutationMarketModel | undefined>,
      default: undefined,
    },
  },
  computed: {
    // Both rows always span the same 4 slot positions client-side -- which row is
    // physically "top" swaps each generation (see MutationMarketData.offsetRowIsTop),
    // but the row shown on top is always the offset row when true, else the aligned row.
    topRow(): ReadonlyArray<MutationMarketMutationSlotModel> {
      if (this.market === undefined) {
        return [];
      }
      return this.market.offsetRowIsTop ? this.market.offsetRow : this.market.alignedRow;
    },
    bottomRow(): ReadonlyArray<MutationMarketMutationSlotModel> {
      if (this.market === undefined) {
        return [];
      }
      return this.market.offsetRowIsTop ? this.market.alignedRow : this.market.offsetRow;
    },
  },
  methods: {
    // Which project-slot columns a mutation-row position spans, purely a function of
    // which row it's in (3 entries = the aligned row, 4 = the offset row) and its index.
    // Mirrors MutationMarkets.linkedProjectSlots (src/server/mutationmarkets/MutationMarkets.ts).
    mutationGridColumn(index: number, rowLength: number): string {
      if (rowLength === 3) {
        return `${index * 2 + 1} / span 2`;
      }
      switch (index) {
      case 0: return '1 / span 1';
      case 1: return '2 / span 2';
      case 2: return '4 / span 2';
      case 3: return '6 / span 1';
      default: throw new Error(`invalid offset row index ${index}`);
      }
    },
  },
});

</script>
