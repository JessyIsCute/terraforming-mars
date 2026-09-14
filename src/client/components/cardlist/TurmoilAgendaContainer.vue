<template>
  <div class="container" @click="showDescription = !showDescription">
  <TurmoilAgenda :id="agendaId" :morePartiesExpansion="morePartiesExpansion" />
  <div class="line1">{{ agendaId }}</div>
  <div class="line2">
    {{ $t(agenda.name) }} {{ $t(agenda.type) }} {{ agenda.num }}
  </div>
  <div class="description" v-if="showDescription">{{ $t(description) }}</div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {agendaInfoById, AgendaInfo, BonusId, PolicyId} from '@/common/turmoil/Types';
import {AGENDA_DESCRIPTIONS, MORE_PARTIES_AGENDA_DESCRIPTIONS} from '@/common/turmoil/AgendaDescriptions';
import TurmoilAgenda from '@/client/components/turmoil/TurmoilAgenda.vue';


const props = defineProps({
  agendaId: {
    type: String as () => BonusId | PolicyId,
    required: true,
  },
  morePartiesExpansion: {
    type: Boolean,
    default: false,
  },
});

const agenda = computed<AgendaInfo>(() => agendaInfoById(props.agendaId));
const showDescription = ref(false);
const description = computed<string>(() => {
  if (props.morePartiesExpansion) {
    const override = MORE_PARTIES_AGENDA_DESCRIPTIONS[props.agendaId];
    if (override !== undefined) {
      return override;
    }
  }
  return AGENDA_DESCRIPTIONS[props.agendaId] ?? `Unknown agenda ${props.agendaId}`;
});
</script>

<style scoped lang="less">
.container {
  padding: 12px;
  background-image: linear-gradient(#9c602d, #25170a);
  border-radius: 8px;
  min-height: 120px;
  width: 250px;
  margin: 0 5px;
  cursor: pointer;

  :deep(.policy-top-margin) {
    margin-top: 0 !important;
  }

  :deep(.scientists-requisite) {
    margin-top: 0 !important;
    margin-left: 80px !important;
  }

  // :deep() because TurmoilAgenda's root is no longer a single element (it has a sibling
  // <Teleport> for its hover tooltip), so Vue can't tag it with this component's scope
  // attribute the way it does for an ordinary single-root child component -- an unqualified
  // `> div:first-child` silently stops matching once that scope-id requirement can't be met.
  > :deep(div:first-child) {
    text-align: center;
    height: 50px;
  }

  .line1, .line2 {
    text-align: center;
    font-size: 18px;
  }

  .description {
    color: #e6d8c3;
    font-size: 13px;
    text-align: center;
    padding-top: 8px;
    line-height: 1.3;
  }
}
</style>
