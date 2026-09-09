<template>
  <div class="card-container filterDiv hover-hide-res" :class="cardClasses">
      <div class="card-content-wrapper" v-i18n @mouseover="hovering = true" @mouseleave="hovering = false">
          <div v-if="!isStandardProject" class="card-cost-and-tags">
              <div :class="{'mutation-cost-glow': mutationHighlight?.cost, 'infection-cost-glow': infectionHighlight?.cost}"><CardCost :amount="cost" :newCost="reducedCost" /></div>
              <div v-if="showPlayerCube" :class="playerCubeClass"></div>
              <CardHelp v-if="hasHelpText" :name="card.name" :hovering="hovering" />
              <CardTags :tags="tags" :mutationAddedTag="card.mutationAddedTag" />
          </div>
          <CardTitle :title="card.name" :type="cardType" :displayTitle="card.combinedDisplayName" :mutated="mutated"/>
          <CardContent
              :metadata="cardMetadata"
              :requirements="cardRequirements"
              :isCorporation="isCorporationCard"
              :bottomPadding="bottomPadding"
              :mutationText="mutationEffectText"
              :infectionText="infectionEffectText" />
      </div>
      <div v-if="infected" class="infected-label">Infected</div>
      <CardExpansion :expansion="cardExpansion" :isCorporation="isCorporationCard" :isResourceCard="isResourceCard" :compatibility="cardCompatibility" />
      <CardResourceCounter v-if="hasResourceType" :amount="resourceAmount" :type="resourceType" />
      <CardVictoryPoints
        v-if="cardMetadata.victoryPoints !== undefined || combinedVictoryPointsBonus !== 0"
        :victoryPoints="cardMetadata.victoryPoints"
        :bonus="combinedVictoryPointsBonus" />
      <CardExtraContent :card="card" />
      <slot></slot>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';

import {CardModel} from '@/common/models/CardModel';
import {CARD_HELP_TEXT} from '@/client/cards/CardHelpText';
import CardTitle from './CardTitle.vue';
import CardResourceCounter from './CardResourceCounter.vue';
import CardCost from './CardCost.vue';
import CardExtraContent from './CardExtraContent.vue';
import CardExpansion from './CardExpansion.vue';
import CardTags from './CardTags.vue';
import CardVictoryPoints from './CardVictoryPoints.vue';
import CardContent from './CardContent.vue';
import CardHelp from './CardHelp.vue';
import {CardType} from '@/common/cards/CardType';
import {CardMetadata} from '@/common/cards/CardMetadata';
import {Tag} from '@/common/cards/Tag';
import {getPreferences} from '@/client/utils/PreferencesManager';
import {CardResource} from '@/common/CardResource';
import {getCard} from '@/client/cards/ClientCardManifest';
import {buildClientCardFromCustom} from '@/client/cards/CustomCardAdapter';
import {Color} from '@/common/Color';
import {CardRequirementDescriptor} from '@/common/cards/CardRequirementDescriptor';
import {GameModule} from '@/common/cards/GameModule';
import {MUTATION_DEFINITIONS} from '@/common/mutationmarkets/MutationDefinitions';
import {describeMutationEffect} from '@/common/mutationmarkets/describeMutation';
import {MutationEffect} from '@/common/mutationmarkets/MutationEffect';
import {mergeMutationGrantIntoRenderData} from '@/client/utils/mergeMutationGrantIntoRenderData';
import {INFECTION_DEFINITIONS} from '@/common/mutationmarkets/InfectionDefinitions';
import {describeInfectionEffect} from '@/common/mutationmarkets/describeInfection';


export default defineComponent({
  name: 'Card',
  components: {
    CardTitle,
    CardHelp,
    CardResourceCounter,
    CardCost,
    CardExtraContent,
    CardExpansion,
    CardTags,
    CardContent,
    CardVictoryPoints,
  },
  props: {
    card: {
      type: Object as () => CardModel,
      required: true,
    },
    actionUsed: {
      type: Boolean,
      required: false,
      default: false,
    },
    robotCard: {
      type: Object as () => CardModel | undefined,
      required: false,
    },
    // Cube is only shown when actionUsed is true.
    cubeColor: {
      type: String as () => Color,
      required: false,
      default: 'neutral',
    },
    // When true, the card is automatically sized regardless of hover.
    autoTall: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    const cardName = this.card.name;
    // A card not in the compiled static manifest is always a Custom Card Maker card -- its
    // face-of-card data instead came over the wire in `card.customCard` (see CustomCardModel's
    // doc comment). Fail loudly (matching getCardOrThrow's old behavior) if somehow neither
    // resolves -- that's a server-side bug, not something to silently paper over here.
    const staticCard = getCard(cardName);
    const card = staticCard ?? (this.card.customCard && buildClientCardFromCustom(cardName, this.card.customCard));
    if (card === undefined || card === null) {
      throw new Error(`card not found ${cardName}`);
    }

    return {
      cardInstance: card,
      hovering: false,
    };
  },
  computed: {
    cardExpansion(): GameModule {
      return this.cardInstance.module;
    },
    cardCompatibility(): Array<GameModule> {
      return this.cardInstance.compatibility;
    },
    isResourceCard(): boolean {
      if (this.cardInstance.resourceType !== undefined) {
        return true;
      } else {
        return false;
      }
    },
    tags(): Array<Tag> {
      const type = this.cardType;
      const tags = [...this.cardInstance.tags || []];
      tags.forEach((tag, idx) => {
        // Clone are changed on card implementations but that's not passed down directly through the
        // model, however, it sends down the `cloneTag` field. So this function does the substitution.
        if (tag === Tag.CLONE && this.card.cloneTag !== undefined) {
          tags[idx] = this.card.cloneTag;
        }
      });
      if (type === CardType.EVENT) {
        tags.push(Tag.EVENT);
      }
      return tags;
    },
    cost(): number | undefined {
      return this.isProjectCard ? this.cardInstance.cost : undefined;
    },
    reducedCost(): number | undefined {
      return this.isProjectCard ? this.card.calculatedCost : undefined;
    },
    mutationHighlight(): CardModel['mutationHighlight'] {
      return this.card.mutationHighlight;
    },
    infectionHighlight(): CardModel['infectionHighlight'] {
      return this.card.infectionHighlight;
    },
    mutated(): boolean {
      return (this.card.mutationNames?.length ?? 0) > 0;
    },
    infected(): boolean {
      return (this.card.infectionNames?.length ?? 0) > 0;
    },
    combinedVictoryPointsBonus(): number {
      return (this.card.mutationVictoryPoints ?? 0) + (this.card.infectionVictoryPoints ?? 0);
    },
    // Infections don't get the render-tree "merge into an existing icon" treatment
    // mutations do (see mergeMutationGrantIntoRenderData) -- resourceDrainOnPlay always
    // shows as its own description line. costIncrease/victoryPointPenalty need no line
    // at all, same reasoning as mutations' costPercent: already visible via the glowing
    // cost number and VP badge (infectionHighlight.cost/vp).
    infectionEffectText(): string {
      return (this.card.infectionNames ?? [])
        .map((name) => INFECTION_DEFINITIONS[name].effect)
        .filter((effect) => effect.kind === 'resourceDrainOnPlay')
        .map((effect) => describeInfectionEffect(effect))
        .filter((text) => text !== '')
        .join('; ');
    },
    // For each applied mutation, either fold its effect into the card's own renderData
    // (a resource/production grant that matches an icon the card already shows -- see
    // mergeMutationGrantIntoRenderData) or fall back to a separate description line.
    // costPercent needs neither: its cost/VP change is already visible via the glowing
    // cost number and VP badge (mutationHighlight.cost/vp) -- it's still described
    // normally in the market/catalog view, via describeMutationEffect there directly.
    mutationEffectMerge(): {renderData: CardMetadata['renderData'], remainingEffects: Array<MutationEffect>} {
      let renderData: CardMetadata['renderData'];
      const remainingEffects: Array<MutationEffect> = [];
      for (const name of this.card.mutationNames ?? []) {
        const effect = MUTATION_DEFINITIONS[name].effect;
        if (effect.kind === 'costPercent') {
          continue;
        }
        if (effect.kind === 'grantResourceOnPlay' || effect.kind === 'grantProductionOnPlay') {
          const merged = mergeMutationGrantIntoRenderData(renderData ?? this.cardInstance.metadata.renderData, effect);
          if (merged !== undefined) {
            renderData = merged;
            continue;
          }
        }
        remainingEffects.push(effect);
      }
      return {renderData, remainingEffects};
    },
    mutationEffectText(): string {
      return this.mutationEffectMerge.remainingEffects
        .map((effect) => describeMutationEffect(effect))
        .filter((text) => text !== '')
        .join('; ');
    },
    cardType(): CardType {
      return this.cardInstance.type;
    },
    cardClasses(): string {
      const classes = [];
      classes.push('card-' + this.card.name.toLowerCase().replaceAll(' ', '-'));

      if (this.card.isDisabled) {
        classes.push('card-unavailable');
      } else if (!getPreferences().experimental_ui && this.actionUsed) {
        classes.push('card-unavailable');
      }

      if (this.isStandardProject) {
        classes.push('card-standard-project');
      }
      if (this.autoTall) {
        classes.push('card-auto-tall');
      } else if (getPreferences().experimental_ui) {
        classes.push('card-hover-tall');
      }
      const learnerModeOff = !getPreferences().learner_mode;
      if (learnerModeOff && this.isStandardProject && this.card.isDisabled) {
        classes.push('card-hide');
      }
      return classes.join(' ');
    },
    cardMetadata(): CardMetadata {
      const {renderData} = this.mutationEffectMerge;
      if (renderData === undefined) {
        return this.cardInstance.metadata;
      }
      return {...this.cardInstance.metadata, renderData};
    },
    cardRequirements(): ReadonlyArray<CardRequirementDescriptor> | undefined {
      return this.cardInstance.requirements;
    },
    resourceAmount(): number {
      return this.card.resources || this.robotCard?.resources || 0;
    },
    isCorporationCard() : boolean {
      return this.cardType === CardType.CORPORATION;
    },
    isProjectCard(): boolean {
      const type = this.cardType;
      return type === CardType.AUTOMATED || type === CardType.ACTIVE || type === CardType.EVENT;
    },
    isStandardProject() : boolean {
      return this.cardType === CardType.STANDARD_PROJECT || this.cardType === CardType.STANDARD_ACTION;
    },
    hasResourceType(): boolean {
      return this.card.isSelfReplicatingRobotsCard === true || this.cardInstance.resourceType !== undefined || this.robotCard !== undefined;
    },
    resourceType(): CardResource {
      if (this.robotCard !== undefined || this.card.isSelfReplicatingRobotsCard === true) {
        return CardResource.RESOURCE_CUBE;
      }
      // This last RESOURCE_CUBE is functionally unnecessary and serves to satisfy the type contract.
      return this.cardInstance.resourceType ?? CardResource.RESOURCE_CUBE;
    },
    bottomPadding(): string {
      if (this.cardMetadata.victoryPoints !== undefined || this.combinedVictoryPointsBonus !== 0) {
        return 'long';
      }
      if (this.hasResourceType) {
        return 'short';
      }
      return '';
    },
    hasHelpText(): boolean {
      return CARD_HELP_TEXT[this.card.name] !== undefined;
    },
    showPlayerCube(): boolean {
      return getPreferences().experimental_ui && this.actionUsed;
    },
    playerCubeClass(): string {
      return `board-cube board-cube--${this.cubeColor}`;
    },
  },
});

</script>
