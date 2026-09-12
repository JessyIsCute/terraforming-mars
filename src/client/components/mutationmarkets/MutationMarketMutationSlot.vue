<template>
  <div
    class="mutation-market-mutation-slot"
    :class="[entranceClass, {'infection-card-standalone': marketSlot?.kind === 'infection'}]"
    :style="{gridColumn}">
    <div v-if="isVoid" class="mutation-market-void"></div>
    <template v-else-if="marketSlot">
      <div :class="marketSlot.kind === 'infection' ? 'infection-market-mutation-label' : 'mutation-market-mutation-label'">{{ marketSlot.kind }}</div>
      <div class="mutation-market-mutation-name">{{ slotName }}</div>
      <div class="mutation-market-mutation-detail">
        <span v-if="requirementText">Needs: {{ requirementText }}</span>
        <span v-if="effectText" :class="glowClass">{{ effectText }}</span>
      </div>
      <div v-if="marketSlot.playerProgress" class="mutation-market-player-scores">
        <template v-for="progress in marketSlot.playerProgress" :key="progress.color">
          <p
            v-if="playerSymbol(progress.color).length > 0"
            class="mutation-market-player-score"
            :class="`player_bg_color_${progress.color}`"
            v-text="playerSymbol(progress.color)"
          ></p>
          <p class="mutation-market-player-score" :class="`player_bg_color_${progress.color}`" v-text="progress.score"></p>
        </template>
      </div>
      <div v-if="!marketSlot.active" class="mutation-market-inactive-overlay"></div>
    </template>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import {MutationMarketMutationSlotModel} from '@/common/models/MutationMarketModel';
import {MUTATION_DEFINITIONS} from '@/common/mutationmarkets/MutationDefinitions';
import {describeMutationRequirement, describeMutationEffect} from '@/common/mutationmarkets/describeMutation';
import {INFECTION_DEFINITIONS} from '@/common/mutationmarkets/InfectionDefinitions';
import {describeInfectionEffect} from '@/common/mutationmarkets/describeInfection';
import {Color} from '@/common/Color';
import {playerSymbol} from '@/client/utils/playerSymbol';

const ENTRANCE_ANIMATION_MS = 700;

export default defineComponent({
  name: 'MutationMarketMutationSlot',
  props: {
    // `undefined` server-side, but an empty array slot travels over JSON as `null`
    // (JSON.stringify turns an `undefined` array element into `null`) -- accept both.
    marketSlot: {
      type: Object as PropType<MutationMarketMutationSlotModel | null>,
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
    // Mutation or infection's display name -- whichever this slot holds.
    slotName(): string {
      if (!this.marketSlot) {
        return '';
      }
      return this.marketSlot.kind === 'mutation' ? this.marketSlot.mutation : this.marketSlot.infection;
    },
    // Infections have no bidding requirement at all, so there's nothing to show here.
    requirementText(): string {
      if (!this.marketSlot || this.marketSlot.kind !== 'mutation') {
        return '';
      }
      return describeMutationRequirement(MUTATION_DEFINITIONS[this.marketSlot.mutation].requirement);
    },
    effectText(): string {
      if (!this.marketSlot) {
        return '';
      }
      return this.marketSlot.kind === 'mutation' ?
        describeMutationEffect(MUTATION_DEFINITIONS[this.marketSlot.mutation].effect) :
        describeInfectionEffect(INFECTION_DEFINITIONS[this.marketSlot.infection].effect);
    },
    glowClass(): string {
      return this.marketSlot?.kind === 'infection' ? 'infection-glow' : 'mutation-glow';
    },
  },
  watch: {
    // Mutation/infection cards enter the market from the left. Only a genuine replacement
    // should animate, not the component's initial mount (which a non-immediate `watch`
    // skips). Watches the computed `slotName` rather than a raw prop path so it fires
    // correctly regardless of which kind replaces which.
    slotName(newName: string, oldName: string) {
      if (newName !== '' && oldName !== '' && newName !== oldName) {
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
