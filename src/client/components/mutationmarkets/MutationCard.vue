<template>
  <div class="mutation-market-mutation-slot mutation-card-standalone">
    <div class="mutation-market-mutation-label">mutation</div>
    <div class="mutation-market-mutation-name">{{ mutation }}</div>
    <div class="mutation-market-mutation-detail">
      <span>Prefix: "{{ definition.prefix }}"</span>
      <span>Needs: {{ requirementText }}</span>
      <span v-if="effectText" class="mutation-glow">{{ effectText }}</span>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {MutationDefinition} from '@/common/mutationmarkets/MutationDefinition';
import {MUTATION_DEFINITIONS} from '@/common/mutationmarkets/MutationDefinitions';
import {describeMutationRequirement, describeMutationEffect} from '@/common/mutationmarkets/describeMutation';

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
    effectText(): string {
      return describeMutationEffect(this.definition.effect);
    },
  },
});

</script>
