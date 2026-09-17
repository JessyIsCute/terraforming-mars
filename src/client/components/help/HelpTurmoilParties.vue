<template>
    <div class="help-turmoil-parties-container">
      <h2 v-i18n>Political Parties</h2>
      <p v-i18n>The ruling party's bonus is granted to every player at the end of each generation (scaled by how well each player matches it); its policy applies for the whole generation it rules.</p>

      <div class="help-party-block" v-for="party in parties" :key="party.name">
        <div class="help-party-label">
          <div :class="'party-name party-name--'+partyNameToCss(party.name)" v-i18n>{{party.name}}</div>
          <div v-if="party.requiresMoreParties" class="help-party-note" v-i18n>Requires the "More Parties" fan expansion</div>
        </div>

        <div class="help-party-section">
          <h4 v-i18n>Ruling Bonus</h4>
          <ul>
            <li v-for="description in party.bonusDescriptions" :key="description" v-i18n>{{description}}</li>
          </ul>
        </div>

        <div class="help-party-section">
          <h4 v-i18n>Policy</h4>
          <ul>
            <li v-for="description in party.policyDescriptions" :key="description" v-i18n>{{description}}</li>
          </ul>
        </div>
      </div>
    </div>
</template>
<script lang="ts">

import {defineComponent} from 'vue';
import {PartyName} from '@/common/turmoil/PartyName';
import {getAgendaDescription, getPartyAgendaIds} from '@/client/turmoil/ClientAgendaManifest';

type PartyHelpEntry = {
  name: PartyName;
  bonusDescriptions: Array<string>;
  policyDescriptions: Array<string>;
  requiresMoreParties: boolean;
};

const MORE_PARTIES: ReadonlyArray<PartyName> = [
  PartyName.POPULISTS,
  PartyName.SPOME,
  PartyName.EMPOWER,
  PartyName.BUREAUCRATS,
  PartyName.CENTRISTS,
  PartyName.TRANSHUMANISTS,
];

export default defineComponent({
  name: 'HelpTurmoilParties',
  computed: {
    parties(): Array<PartyHelpEntry> {
      return Object.values(PartyName).map((name) => {
        const ids = getPartyAgendaIds(name);
        return {
          name,
          bonusDescriptions: ids.bonuses.map((id) => getAgendaDescription(id)),
          policyDescriptions: ids.policies.map((id) => getAgendaDescription(id)),
          requiresMoreParties: MORE_PARTIES.includes(name),
        };
      });
    },
  },
  methods: {
    partyNameToCss(party: PartyName): string {
      return party.toLowerCase().split(' ').join('_');
    },
  },
});
</script>
