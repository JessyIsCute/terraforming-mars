<template>
  <div class="mutation-market-mutation-slot" :class="entranceClass" :style="{gridColumn}">
    <div v-if="isVoid" class="mutation-market-void"></div>
    <template v-else-if="marketSlot !== undefined">
      <div class="mutation-market-mutation-label">mutation</div>
      <div class="mutation-market-mutation-name">{{ marketSlot.mutation }}</div>
      <div class="mutation-market-mutation-detail">
        <span>Needs: {{ requirementText }}</span>
        <span>Reward: {{ rewardText }}</span>
        <span v-if="effectText" class="mutation-glow">{{ effectText }}</span>
      </div>
      <div v-if="marketSlot.playerProgress" class="ma-scores player_home_block--milestones-and-awards-scores">
        <template v-for="progress in marketSlot.playerProgress" :key="progress.color">
          <p
            v-if="playerSymbol(progress.color).length > 0"
            class="ma-score"
            :class="`player_bg_color_${progress.color}`"
            v-text="playerSymbol(progress.color)"
          ></p>
          <p class="ma-score" :class="`player_bg_color_${progress.color}`" v-text="progress.score"></p>
        </template>
      </div>
      <div class="mutation-market-mutation-footer">Min bid: {{ marketSlot.minimumBid }} M€ &middot; {{ steps }} step{{ steps > 1 ? 's' : '' }}</div>
      <div v-if="!marketSlot.active" class="mutation-market-inactive-overlay"></div>
    </template>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import {MutationMarketMutationSlotModel} from '@/common/models/MutationMarketModel';
import {MUTATION_DEFINITIONS} from '@/common/mutationmarkets/MutationDefinitions';
import {describeMutationRequirement, describeMutationReward, describeMutationEffect} from '@/common/mutationmarkets/describeMutation';
import {Color} from '@/common/Color';
import {playerSymbol} from '@/client/utils/playerSymbol';

const ENTRANCE_ANIMATION_MS = 700;

export default defineComponent({
  name: 'MutationMarketMutationSlot',
  props: {
    marketSlot: {
      type: Object as PropType<MutationMarketMutationSlotModel>,
      default: undefined,
    },
    // CSS grid-column shorthand (e.g. "1 / span 2"), computed by the parent from this
    // slot's position -- see MutationMarket.vue's mutationGridColumn.
    gridColumn: {
      type: String,
      required: true,
    },
    // True for the two offset-row positions that only ever half-overlap a real project
    // slot (the other half would need a slot past the edge of the board) -- see
    // MutationMarket.vue's isVoidPosition.
    isVoid: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      entering: false,
    };
  },
  computed: {
    entranceClass(): string {
      return this.entering ? 'mutation-market-slot--entering-left' : '';
    },
    steps(): number {
      return this.marketSlot === undefined ? 0 : MUTATION_DEFINITIONS[this.marketSlot.mutation].steps;
    },
    requirementText(): string {
      return this.marketSlot === undefined ? '' : describeMutationRequirement(MUTATION_DEFINITIONS[this.marketSlot.mutation].requirement);
    },
    rewardText(): string {
      return this.marketSlot === undefined ? '' : describeMutationReward(MUTATION_DEFINITIONS[this.marketSlot.mutation].reward);
    },
    effectText(): string {
      return this.marketSlot === undefined ? '' : describeMutationEffect(MUTATION_DEFINITIONS[this.marketSlot.mutation].effect);
    },
  },
  watch: {
    // Mutation cards enter the market from the left. Only a genuine replacement should
    // animate, not the component's initial mount (which a non-immediate `watch` skips).
    'marketSlot.mutation'(newMutation: string | undefined, oldMutation: string | undefined) {
      if (newMutation !== undefined && oldMutation !== undefined && newMutation !== oldMutation) {
        this.entering = true;
        setTimeout(() => {
          this.entering = false;
        }, ENTRANCE_ANIMATION_MS);
      }
    },
  },
  methods: {
    playerSymbol(color: Color): string {
      return playerSymbol(color);
    },
  },
});

</script>
