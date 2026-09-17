<template>
    <div class="help-turmoil-parties-container">
      <h2 v-i18n>Political Parties</h2>
      <p v-i18n>The ruling party's bonus is granted to every player at the end of each generation (scaled by how well each player matches it); its policy applies for the whole generation it rules.</p>

      <div class="help-parties-grid">
        <div class="help-party-card" v-for="party in parties" :key="party.name">
          <div class="help-party-label">
            <div :class="'card-party card-party--'+partyLogoSlug(party.name)"></div>
            <div :class="'party-name party-name--'+partyNameToCss(party.name)" v-i18n>{{party.name}}</div>
          </div>
          <div v-if="party.requiresMoreParties" class="help-party-note" v-i18n>Requires the "More Parties" fan expansion</div>

          <div class="help-agenda-row" v-for="id in party.bonusIds" :key="id">
            <TurmoilAgenda :id="id" :morePartiesExpansion="party.requiresMoreParties" />
            <div class="help-agenda-description" v-i18n>{{ agendaDescription(id, party.requiresMoreParties) }}</div>
          </div>

          <div class="help-agenda-divider"></div>

          <div class="help-agenda-row" v-for="id in party.policyIds" :key="id">
            <TurmoilAgenda :id="id" :morePartiesExpansion="party.requiresMoreParties" />
            <div class="help-agenda-description" v-i18n>{{ agendaDescription(id, party.requiresMoreParties) }}</div>
          </div>
        </div>
      </div>
    </div>
</template>
<script lang="ts">

import {defineComponent} from 'vue';
import {PartyName} from '@/common/turmoil/PartyName';
import {BonusId, PolicyId} from '@/common/turmoil/Types';
import {getAgendaOrThrow, getPartyAgendaIds} from '@/client/turmoil/ClientAgendaManifest';
import TurmoilAgenda from '@/client/components/turmoil/TurmoilAgenda.vue';

type PartyHelpEntry = {
  name: PartyName;
  bonusIds: ReadonlyArray<BonusId>;
  policyIds: ReadonlyArray<PolicyId>;
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
  components: {
    TurmoilAgenda,
  },
  computed: {
    parties(): Array<PartyHelpEntry> {
      return Object.values(PartyName).map((name) => {
        const ids = getPartyAgendaIds(name);
        return {
          name,
          bonusIds: ids.bonuses,
          policyIds: ids.policies,
          requiresMoreParties: MORE_PARTIES.includes(name),
        };
      });
    },
  },
  methods: {
    agendaDescription(id: BonusId | PolicyId, morePartiesExpansion: boolean): string {
      return getAgendaOrThrow(id, morePartiesExpansion).description;
    },
    partyNameToCss(party: PartyName): string {
      return party.toLowerCase().split(' ').join('_');
    },
    // The real .card-party--<slug> party logo images (cards_v2.less's @parties list) use
    // hyphens, unlike every other party-slug class on this page (party-name--mars_first etc,
    // which use underscores) - the only place that differs is "mars-first" vs "mars_first".
    partyLogoSlug(party: PartyName): string {
      return this.partyNameToCss(party).replace('_', '-');
    },
  },
});
</script>
