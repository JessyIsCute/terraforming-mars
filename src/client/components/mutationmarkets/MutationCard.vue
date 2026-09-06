<template>
  <div class="mutation-market-mutation-slot mutation-card-standalone">
    <div class="mutation-market-mutation-label">mutation</div>
    <div class="mutation-market-mutation-name">{{ mutation }}</div>
    <div class="mutation-market-mutation-detail">
      <span>Prefix: "{{ definition.prefix }}"</span>
      <span>Needs: {{ requirementText }}</span>
      <span>Reward: {{ rewardText }}</span>
      <span v-if="effectText" class="mutation-glow">{{ effectText }}</span>
    </div>
    <div class="mutation-market-mutation-footer">Min bid: {{ definition.minimumBid }} M€ &middot; {{ definition.steps }} step{{ definition.steps > 1 ? 's' : '' }}</div>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {MutationDefinition} from '@/common/mutationmarkets/MutationDefinition';
import {MUTATION_DEFINITIONS} from '@/common/mutationmarkets/MutationDefinitions';
import {describeMutationRequirement, describeMutationReward, describeMutationEffect} from '@/common/mutationmarkets/describeMutation';

export default defineComponent({
  name: 'MutationCard',
  props: {
    mutation: {
      type: String as PropType<MutationName>,
      required: true,
    },
  },
  computed: {
    definition(): MutationDefinition {
      return MUTATION_DEFINITIONS[this.mutation];
    },
    requirementText(): string {
      return describeMutationRequirement(this.definition.requirement);
    },
    rewardText(): string {
      return describeMutationReward(this.definition.reward);
    },
    effectText(): string {
      return describeMutationEffect(this.definition.effect);
    },
  },
});

</script>
