<template>
  <div class="card-assembled-icon" v-show="hovering" @click.stop="open" :title="$t('How this card was priced')"><a>⚙</a></div>
  <Teleport to="body">
    <PopupPanel v-if="showPopup" @close="close">
      <template #header>
        <h2>{{ title }}</h2>
      </template>
      <div class="card-assembled-info">
        <p><span v-i18n>Assembled during this game</span> · {{ $t(complexityLabel) }}</p>
        <table><tbody>
          <tr v-for="(line, i) in info.breakdown" :key="i">
            <td>{{ line.text }} <span v-if="line.category !== undefined" class="card-assembled-category">{{ $t(categoryLabel(line.category)) }}</span></td>
            <td class="card-assembled-value">{{ signed(line.value) }}</td>
          </tr>
          <tr class="card-assembled-total">
            <td v-i18n>Value</td>
            <td class="card-assembled-value">{{ info.value }}</td>
          </tr>
          <tr>
            <td v-i18n>Cost (value − 3)</td>
            <td class="card-assembled-value">{{ pricedCost }}</td>
          </tr>
          <tr v-if="info.costAdjust !== undefined">
            <td v-i18n>Preset adjustment</td>
            <td class="card-assembled-value">{{ signed(info.costAdjust) }}</td>
          </tr>
          <tr v-if="info.costAdjust !== undefined" class="card-assembled-total">
            <td v-i18n>Cost</td>
            <td class="card-assembled-value">{{ Math.max(0, pricedCost + info.costAdjust) }}</td>
          </tr>
        </tbody></table>
      </div>
    </PopupPanel>
  </Teleport>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {AssembledCardInfo} from '@/common/models/CardModel';
import {EFFECT_CATEGORY_INFO, EffectCategory} from '@/common/assembler/EffectCategory';
import PopupPanel from '@/client/components/common/PopupPanel.vue';

/** Assembler (fan): a hover button on a generated card that shows how the card was priced. */
export default defineComponent({
  name: 'CardAssembledInfo',
  components: {
    PopupPanel,
  },
  props: {
    info: {
      type: Object as () => AssembledCardInfo,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    hovering: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      showPopup: false,
    };
  },
  computed: {
    complexityLabel(): string {
      if (this.info.score !== undefined) {
        return `${this.$t('Complexity')} ${this.info.score}`;
      }
      return {low: 'Low complexity', mid: 'Mid complexity', high: 'High complexity'}[this.info.complexity];
    },
    pricedCost(): number {
      return Math.round(this.info.value - 3);
    },
  },
  methods: {
    categoryLabel(category: EffectCategory): string {
      return EFFECT_CATEGORY_INFO[category].label;
    },
    signed(n: number): string {
      return n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0';
    },
    open() {
      this.showPopup = true;
    },
    close() {
      this.showPopup = false;
    },
  },
});

</script>
