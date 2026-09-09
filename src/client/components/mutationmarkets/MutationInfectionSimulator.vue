<template>
  <div class="mutation-sim">
    <h1 v-i18n>Mutation/Infection Simulator</h1>
    <p class="mutation-sim-intro" v-i18n>
      Pick any card, then pick a Mutation and/or Infection to preview -- see exactly how it changes
      the card's cost, tags, and victory points, side by side with the unmodified original.
    </p>

    <div class="mutation-sim-controls">
      <label class="mutation-sim-field">
        <span v-i18n>Card</span>
        <select v-model="selectedCardName">
          <option v-for="name in cardNames" :key="name" :value="name">{{ name }}</option>
        </select>
      </label>

      <label class="mutation-sim-field">
        <span v-i18n>Mutation</span>
        <select v-model="selectedMutation">
          <option :value="undefined" v-i18n>(none)</option>
          <option v-for="name in mutationNames" :key="name" :value="name">{{ mutationLabel(name) }}</option>
        </select>
      </label>
      <p v-if="selectedMutation !== undefined" class="mutation-sim-effect-text">
        {{ mutationEffectDescription }}
        <button v-if="mutationEffectIsRandomTag" type="button" class="mutation-sim-reroll" @click="rerollTag" v-i18n>Reroll tag</button>
      </p>

      <label class="mutation-sim-field">
        <span v-i18n>Infection</span>
        <select v-model="selectedInfection">
          <option :value="undefined" v-i18n>(none)</option>
          <option v-for="name in infectionNames" :key="name" :value="name">{{ infectionLabel(name) }}</option>
        </select>
      </label>
      <p v-if="selectedInfection !== undefined" class="mutation-sim-effect-text">{{ infectionEffectDescription }}</p>
    </div>

    <div class="mutation-sim-preview">
      <div class="mutation-sim-preview-column">
        <h3 v-i18n>Original</h3>
        <Card :card="originalCardModel" auto-tall/>
      </div>
      <div class="mutation-sim-preview-column">
        <h3 v-i18n>With mutation/infection applied</h3>
        <Card :card="previewCardModel" auto-tall/>
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
import {previewMutation, previewInfection} from '@/client/utils/mutationInfectionPreview';

export default defineComponent({
  name: 'MutationInfectionSimulator',
  components: {
    Card,
  },
  data() {
    return {
      selectedCardName: CardName.ASTEROID_MINING as CardName,
      selectedMutation: undefined as MutationName | undefined,
      selectedInfection: undefined as InfectionName | undefined,
      // Bumped to force a fresh previewMutation() call (and thus a new random tag pick)
      // when the user clicks "Reroll tag" without otherwise changing the selection.
      rerollSeed: 0,
    };
  },
  computed: {
    cardNames(): Array<CardName> {
      return getCards(() => true).map((card) => card.name).sort();
    },
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
    mutationEffectIsRandomTag(): boolean {
      return this.selectedMutation !== undefined && MUTATION_DEFINITIONS[this.selectedMutation].effect.kind === 'addRandomTag';
    },
    mutationEffectDescription(): string {
      if (this.selectedMutation === undefined) {
        return '';
      }
      const definition = MUTATION_DEFINITIONS[this.selectedMutation];
      return `${definition.prefix}: ${describeMutationEffect(definition.effect)}`;
    },
    infectionEffectDescription(): string {
      if (this.selectedInfection === undefined) {
        return '';
      }
      const definition = INFECTION_DEFINITIONS[this.selectedInfection];
      return `${definition.prefix}: ${describeInfectionEffect(definition.effect)}`;
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

      if (this.selectedMutation !== undefined) {
        const preview = previewMutation(this.selectedMutation, this.baseCost, this.baseTags);
        model.mutationNames = [this.selectedMutation];
        model.mutationAddedTag = preview.chosenTag;
        model.mutationHighlight = preview.highlight;
        if (preview.victoryPoints !== 0) {
          model.mutationVictoryPoints = preview.victoryPoints;
        }
        namePrefixes.push(MUTATION_DEFINITIONS[this.selectedMutation].prefix);
        cost = preview.cost;
      }

      if (this.selectedInfection !== undefined) {
        const preview = previewInfection(this.selectedInfection, cost);
        model.infectionNames = [this.selectedInfection];
        model.infectionAddedTag = Tag.INFECTED;
        model.infectionHighlight = preview.highlight;
        if (preview.victoryPoints !== 0) {
          model.infectionVictoryPoints = preview.victoryPoints;
        }
        namePrefixes.push(INFECTION_DEFINITIONS[this.selectedInfection].prefix);
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
      return `${MUTATION_DEFINITIONS[name].prefix}: ${name}`;
    },
    infectionLabel(name: InfectionName): string {
      return `${INFECTION_DEFINITIONS[name].prefix}: ${name}`;
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

  .mutation-sim-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 20px;
    margin-bottom: 20px;
  }

  .mutation-sim-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 13px;
    select { font-family: inherit; min-width: 220px; }
  }

  .mutation-sim-effect-text {
    flex-basis: 100%;
    margin: -4px 0 0 0;
    font-size: 12px;
    color: #9c9;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mutation-sim-reroll {
    font-size: 11px;
    padding: 2px 8px;
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
