<template>
  <div v-if="victoryPoints !== undefined && typeof victoryPoints !== 'number'" :class="classes">
    <template v-if="victoryPoints.targetOneOrMore">
       <!-- This is the Search for Life special case. -->
      <div class="card-points-item-first">
        <CardRenderItemComponent v-if="victoryPoints.item !== undefined" :item="victoryPoints.item" data-test="item"/>
        *:3
      </div>
    </template>
    <template v-else-if="victoryPoints.vermin">
      10
      <CardRenderItemComponent :item="animal"/>
      : -1/
      <CardRenderItemComponent :item="city"/>
      *
    </template>
    <template v-else>
      <div>{{ points }}</div>
      <CardRenderItemComponent v-if="victoryPoints.item !== undefined" :item="victoryPoints.item" data-test="item"/>
    </template>
    <div v-if="victoryPoints.asterisk === true">*</div>
  </div>
  <div v-else :class="numberClasses">{{ totalNumber }}</div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import CardRenderItemComponent from '@/client/components/card/CardRenderItemComponent.vue';
import {CardRenderDynamicVictoryPoints} from '@/common/cards/render/CardRenderDynamicVictoryPoints';
import {CardRenderItemType} from '@/common/cards/render/CardRenderItemType';
import {CardResource} from '@/common/CardResource';
import {ICardRenderItem} from '@/common/cards/render/Types';
import {Size} from '@/common/cards/render/Size';

export default defineComponent({
  name: 'CardVictoryPoints',
  props: {
    victoryPoints: {
      type: [Number, Object as () => CardRenderDynamicVictoryPoints],
      default: undefined,
    },
    // MutationMarkets: extra VP a mutation grants and/or an infection penalizes, on top
    // of the card's own printed formula (the two are summed into one net value if both
    // apply). Folded into the displayed number (not shown as a separate badge) so the
    // VP shown is always the card's actual current value; glows green if positive, red
    // if negative.
    bonus: {
      type: Number,
      default: 0,
    },
  },
  components: {
    CardRenderItemComponent,
  },
  computed: {
    classes(): string {
      if (this.victoryPoints === undefined || typeof this.victoryPoints === 'number') {
        return '';
      }
      const classes: string[] = ['card-points'];
      if (this.victoryPoints.vermin) {
        classes.push('card-points-normal');
        classes.push('card-points-vermin');
        classes.push('red-outline');
      } else if (this.victoryPoints.anyPlayer) {
        classes.push('card-points-big');
        classes.push('red-outline');
      } else {
        classes.push('card-points-normal');
      }
      if (this.bonus > 0) {
        classes.push('mutation-glow');
      } else if (this.bonus < 0) {
        classes.push('infection-glow');
      }
      return classes.join(' ');
    },
    points(): string {
      if (this.victoryPoints === undefined || typeof this.victoryPoints === 'number') {
        return '';
      }
      const vps = this.victoryPoints;
      if (vps.item === undefined && vps.points === 0 && vps.target === 0) {
        return '?';
      }
      if (vps.item === undefined) {
        return `${vps.points + this.bonus}`;
      }
      if (vps.target === vps.points || vps.target === 1) {
        return `${vps.points}/`;
      }
      if (vps.asFraction) {
        if (vps.target ===3 && vps.points === 1) {
          return '⅓';
        }
      }
      return `${vps.points}/${vps.target}`;
    },
    // The plain-number branch (no dynamic formula): printed VP (if any) plus the
    // mutation bonus (if any) -- the card's one true current VP value.
    totalNumber(): number {
      const base = typeof this.victoryPoints === 'number' ? this.victoryPoints : 0;
      return base + this.bonus;
    },
    numberClasses(): string {
      const classes = ['card-points', 'card-points-big'];
      if (this.bonus > 0) {
        classes.push('mutation-glow');
      } else if (this.bonus < 0) {
        classes.push('infection-glow');
      }
      return classes.join(' ');
    },
    animal(): ICardRenderItem {
      return {is: 'item', type: CardRenderItemType.RESOURCE, resource: CardResource.ANIMAL, size: Size.SMALL, amount: 1};
    },
    city(): ICardRenderItem {
      return {is: 'item', type: CardRenderItemType.CITY, size: Size.SMALL, amount: 1};
    },
  },
});

</script>

