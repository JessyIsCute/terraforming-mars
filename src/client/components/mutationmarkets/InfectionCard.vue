<template>
  <div class="mutation-market-mutation-slot mutation-card-standalone infection-card-standalone">
    <div class="infection-market-mutation-label">infection</div>
    <div class="mutation-market-mutation-name">{{ infection }}</div>
    <div class="mutation-market-mutation-detail">
      <span>Prefix: "{{ definition.prefix }}"</span>
      <span v-if="effectText" class="infection-glow">{{ effectText }}</span>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';
import {InfectionDefinition} from '@/common/mutationmarkets/InfectionDefinition';
import {INFECTION_DEFINITIONS} from '@/common/mutationmarkets/InfectionDefinitions';
import {describeInfectionEffect} from '@/common/mutationmarkets/describeInfection';

export default defineComponent({
  name: 'InfectionCard',
  props: {
    infection: {
      type: String as PropType<InfectionName>,
      required: true,
    },
  },
  computed: {
    definition(): InfectionDefinition {
      return INFECTION_DEFINITIONS[this.infection];
    },
    effectText(): string {
      return describeInfectionEffect(this.definition.effect);
    },
  },
});

</script>
