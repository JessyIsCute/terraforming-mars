<template>
  <div class="mutation-sim">
    <h1 v-i18n>Mutation/Infection Simulator</h1>
    <p class="mutation-sim-intro" v-i18n>
      Pick any card, then check off any number of Mutations and/or Infections to preview -- see
      exactly how they change the card's cost, tags, and victory points, side by side with the
      unmodified original.
    </p>

    <label class="mutation-sim-field mutation-sim-card-field">
      <span v-i18n>Card</span>
      <select v-model="selectedCardName">
        <option v-for="name in cardNames" :key="name" :value="name">{{ name }}</option>
      </select>
    </label>

    <div class="mutation-sim-controls">
      <fieldset class="mutation-sim-fieldset">
        <legend v-i18n>Mutations</legend>
        <label v-for="name in mutationNames" :key="name" class="mutation-sim-check">
          <input type="checkbox" :value="name" v-model="selectedMutations">
          <span>{{ mutationLabel(name) }}</span>
        </label>
        <button v-if="hasRandomTagMutation" type="button" class="mutation-sim-reroll" @click="rerollTag" v-i18n>Reroll tag</button>
      </fieldset>

      <fieldset class="mutation-sim-fieldset">
        <legend v-i18n>Infections</legend>
        <label v-for="name in infectionNames" :key="name" class="mutation-sim-check">
          <input type="checkbox" :value="name" v-model="selectedInfections">
          <span>{{ infectionLabel(name) }}</span>
        </label>
      </fieldset>
    </div>

    <div class="mutation-sim-preview">
      <div class="mutation-sim-preview-column">
        <h3 v-i18n>Original</h3>
        <Card :card="originalCardModel" :key="'original-' + selectedCardName" auto-tall/>
      </div>
      <div class="mutation-sim-preview-column">
        <h3 v-i18n>With mutations/infections applied</h3>
        <Card :card="previewCardModel" :key="'preview-' + selectedCardName" auto-tall/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import Card from '@/client/components/card/Card.vue';
import {CardModel} from '@/common/models/CardModel';
import {CardName} from '@/common/cards/CardName';
import {Tag} from '@/common/cards/Tag';
import {getCard, getCards} from '@/client/cards/ClientCardManifest';
import {MutationName} from '@/common/mutationmarkets/MutationName';
import {MUTATION_DEFINITIONS} from '@/common/mutationmarkets/MutationDefinitions';
import {describeMutationEffect} from '@/common/mutationmarkets/describeMutation';
import {InfectionName} from '@/common/mutationmarkets/InfectionName';
import {INFECTION_DEFINITIONS} from '@/common/mutationmarkets/InfectionDefinitions';
import {describeInfectionEffect} from '@/common/mutationmarkets/describeInfection';
import {previewMutations, previewInfections} from '@/client/utils/mutationInfectionPreview';

export default defineComponent({
  name: 'MutationInfectionSimulator',
  components: {
    Card,
  },
  data() {
    return {
      selectedCardName: CardName.ASTEROID_MINING as CardName,
      selectedMutations: [] as Array<MutationName>,
      selectedInfections: [] as Array<InfectionName>,
      // Bumped to force a fresh previewMutations() call (and thus a new random tag pick)
      // when the user clicks "Reroll tag" without otherwise changing the selection.
      rerollSeed: 0,
    };
  },
  computed: {
    cardNames(): Array<CardName> {
      return getCards(() => true).map((card) => card.name).sort();
    },
    // Enum iteration order, not selection order -- a stable, deterministic order for
    // both the checkbox list and the combined display name's prefixes.
    mutationNames(): Array<MutationName> {
      return Object.values(MutationName);
    },
    infectionNames(): Array<InfectionName> {
      return Object.values(InfectionName);
    },
    baseCost(): number {
      return getCard(this.selectedCardName)?.cost ?? 0;
    },
    baseTags(): ReadonlyArray<Tag> {
      return getCard(this.selectedCardName)?.tags ?? [];
    },
    hasRandomTagMutation(): boolean {
      return this.selectedMutations.some((name) => MUTATION_DEFINITIONS[name].effect.kind === 'addRandomTag');
    },
    originalCardModel(): CardModel {
      return {name: this.selectedCardName};
    },
    previewCardModel(): CardModel {
      // Read (but otherwise unused) purely so this computed re-runs -- and re-rolls the
      // random tag pick -- when "Reroll tag" is clicked without changing any selection.
      void this.rerollSeed;

      const model: CardModel = {name: this.selectedCardName};
      const namePrefixes: Array<string> = [];
      let cost = this.baseCost;

      if (this.selectedMutations.length > 0) {
        const preview = previewMutations(this.selectedMutations, this.baseCost, this.baseTags);
        model.mutationNames = this.selectedMutations;
        model.mutationAddedTag = preview.chosenTag;
        model.mutationHighlight = preview.highlight;
        if (preview.victoryPoints !== 0) {
          model.mutationVictoryPoints = preview.victoryPoints;
        }
        namePrefixes.push(...this.selectedMutations.map((name) => MUTATION_DEFINITIONS[name].prefix));
        cost = preview.cost;
      }

      if (this.selectedInfections.length > 0) {
        const preview = previewInfections(this.selectedInfections, cost);
        model.infectionNames = this.selectedInfections;
        model.infectionAddedTag = Tag.INFECTED;
        model.infectionHighlight = preview.highlight;
        if (preview.victoryPoints !== 0) {
          model.infectionVictoryPoints = preview.victoryPoints;
        }
        namePrefixes.push(...this.selectedInfections.map((name) => INFECTION_DEFINITIONS[name].prefix));
        cost = preview.cost;
      }

      if (namePrefixes.length > 0) {
        model.combinedDisplayName = [...namePrefixes, this.selectedCardName].join(' ');
      }
      if (cost !== this.baseCost) {
        model.calculatedCost = cost;
      }
      return model;
    },
  },
  methods: {
    mutationLabel(name: MutationName): string {
      const definition = MUTATION_DEFINITIONS[name];
      return `${definition.prefix} (${name}): ${describeMutationEffect(definition.effect)}`;
    },
    infectionLabel(name: InfectionName): string {
      const definition = INFECTION_DEFINITIONS[name];
      return `${definition.prefix} (${name}): ${describeInfectionEffect(definition.effect)}`;
    },
    rerollTag(): void {
      this.rerollSeed++;
    },
  },
});

</script>

<style scoped lang="less">
.mutation-sim {
  padding: 20px;
  color: #ddd;

  h1 { color: #fff; }

  .mutation-sim-intro {
    max-width: 800px;
    font-size: 13px;
    color: #aaa;
  }

  .mutation-sim-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    select { font-family: inherit; min-width: 220px; }
  }

  .mutation-sim-card-field {
    margin-bottom: 16px;
  }

  .mutation-sim-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-bottom: 20px;
  }

  .mutation-sim-fieldset {
    border: 1px solid #444;
    border-radius: 4px;
    padding: 8px 12px;
    min-width: 320px;
    max-width: 480px;
    legend { padding: 0 4px; }
  }

  .mutation-sim-check {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 12px;
    padding: 3px 0;
    input { margin-top: 2px; }
  }

  .mutation-sim-reroll {
    font-size: 11px;
    padding: 2px 8px;
    margin-top: 6px;
  }

  .mutation-sim-preview {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  .mutation-sim-preview-column {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    h3 { color: #fff; margin: 0; }
  }
}
</style>
