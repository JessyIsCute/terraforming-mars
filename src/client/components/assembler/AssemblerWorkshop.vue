<template>
  <div class="assembler-workshop">
    <h1 v-i18n>Assembler card generator</h1>
    <p class="assembler-intro" v-i18n>
      Generate random Assembler cards, the way the Assembler expansion makes them during a game.
      Every card is priced from what it does. Pick a complexity, guarantee effects, tags or a
      cost range, or leave everything on random.
    </p>
    <p class="assembler-intro" v-i18n>
      A card's name comes from its effects: the strongest benefit names the thing, the next effect
      describes it ("Cooled Reactor" makes energy but costs heat), and complex cards get an ending.
    </p>

    <div class="assembler-tabs">
      <a href="#" class="assembler-tab" :class="{'assembler-tab--on': view === 'generator'}" @click.prevent="show('generator')" v-i18n>Generator</a>
      <a href="#values" class="assembler-tab" :class="{'assembler-tab--on': view === 'values'}" @click.prevent="show('values')" v-i18n>Value table</a>
      <a href="#rate" class="assembler-tab" :class="{'assembler-tab--on': view === 'rate'}" @click.prevent="show('rate')" v-i18n>Rate prices</a>
    </div>

    <AssemblerValueTable v-if="view === 'values'"/>
    <AssemblerRater v-else-if="view === 'rate'"/>
    <div v-else class="assembler-layout">
      <form class="assembler-controls" @submit.prevent="generate">
        <fieldset class="assembler-fieldset">
          <legend v-i18n>Cards</legend>
          <label class="assembler-field">
            <span v-i18n>How many</span>
            <select v-model.number="count">
              <option v-for="n in LIMITS.MAX_COUNT" :key="n" :value="n">{{ n }}</option>
            </select>
          </label>
          <label class="assembler-field">
            <span v-i18n>Complexity</span>
            <select v-model="complexity">
              <option value="">{{ $t('Random') }}</option>
              <option value="low">{{ $t('Low: one effect') }}</option>
              <option value="mid">{{ $t('Mid: a few effects') }}</option>
              <option value="high">{{ $t('High: many effects and a drawback') }}</option>
            </select>
          </label>
          <label class="assembler-field">
            <span v-i18n>Card type</span>
            <select v-model="type">
              <option value="">{{ $t('Any') }}</option>
              <option value="automated">{{ $t('Automated (green)') }}</option>
              <option value="active">{{ $t('Active (blue)') }}</option>
              <option value="event">{{ $t('Event (red)') }}</option>
            </select>
          </label>
          <label class="assembler-field">
            <span v-i18n>Seed (empty: random)</span>
            <input type="number" v-model="seedInput" min="1" :max="LIMITS.MAX_SEED" placeholder="random">
          </label>
        </fieldset>

        <fieldset class="assembler-fieldset">
          <legend v-i18n>Guaranteed effects</legend>
          <p class="assembler-hint" v-i18n>Each card has at least one effect of every kind you tick.</p>
          <div class="assembler-group-title" v-i18n>Benefits</div>
          <div class="assembler-chips">
            <label v-for="c in boons" :key="c" class="assembler-chip" :class="{'assembler-chip--on': categories.includes(c)}" :title="$t(INFO[c].description)">
              <input type="checkbox" :value="c" v-model="categories">{{ $t(INFO[c].label) }}
            </label>
          </div>
          <div class="assembler-group-title" v-i18n>Drawbacks and sabotage</div>
          <div class="assembler-chips">
            <label v-for="c in banes" :key="c" class="assembler-chip assembler-chip--bane" :class="{'assembler-chip--on': categories.includes(c)}" :title="$t(INFO[c].description)">
              <input type="checkbox" :value="c" v-model="categories">{{ $t(INFO[c].label) }}
            </label>
          </div>
        </fieldset>

        <fieldset class="assembler-fieldset">
          <legend v-i18n>Tags</legend>
          <div class="assembler-chips">
            <label v-for="t in TAGS" :key="t" class="assembler-chip" :class="{'assembler-chip--on': tags.includes(t)}">
              <input type="checkbox" :value="t" v-model="tags">{{ $t(tagLabel(t)) }}
            </label>
          </div>
          <label class="assembler-field">
            <span v-i18n>Exact number of tags</span>
            <select v-model="tagCount">
              <option value="">{{ $t('Any') }}</option>
              <option v-for="n in LIMITS.MAX_TAG_COUNT" :key="n" :value="String(n)">{{ n }}</option>
            </select>
          </label>
        </fieldset>

        <fieldset class="assembler-fieldset">
          <legend v-i18n>Cost and requirement</legend>
          <div class="assembler-row">
            <label class="assembler-field">
              <span v-i18n>Lowest cost</span>
              <input type="number" v-model="minCost" min="0" :max="LIMITS.MAX_COST">
            </label>
            <label class="assembler-field">
              <span v-i18n>Highest cost</span>
              <input type="number" v-model="maxCost" min="0" :max="LIMITS.MAX_COST">
            </label>
            <label class="assembler-field">
              <span v-i18n>Cost change</span>
              <input type="number" v-model="costAdjust" :min="-LIMITS.MAX_COST_ADJUST" :max="LIMITS.MAX_COST_ADJUST" placeholder="0">
            </label>
          </div>
          <label class="assembler-field assembler-field--inline">
            <input type="checkbox" v-model="requirement">
            <span v-i18n>Always has a requirement</span>
          </label>
        </fieldset>

        <div class="assembler-buttons">
          <button type="submit" class="btn btn-primary" :disabled="loading" v-i18n>Generate</button>
          <button type="button" class="btn" @click="reset" v-i18n>Reset options</button>
        </div>
      </form>

      <div class="assembler-results">
        <div v-if="error !== ''" class="assembler-error">{{ error }}</div>
        <div v-if="failed > 0" class="assembler-warning">
          {{ $t('Cards that could not be made with these options:') }} {{ failed }}. <span v-i18n>Busy cards at a high cost often don't fit on a card; try a wider cost range or a lower complexity.</span>
        </div>
        <div v-if="seed !== undefined" class="assembler-seed">
          <span v-i18n>Seed</span> {{ seed }} · <a :href="shareUrl" v-i18n>link to these cards</a>
        </div>
        <div class="assembler-cards">
          <div v-for="card in cards" :key="card.name" class="assembler-card">
            <Card :card="card" auto-tall/>
            <div v-if="card.assembled !== undefined" class="assembler-score">
              <div class="assembler-score-head">
                <span class="assembler-complexity" :class="'assembler-complexity--' + card.assembled.complexity" :title="$t('1 per effect, drawback and requirement, plus 1 per tag after the first')">{{ complexityText(card) }}</span>
                <span><span v-i18n>value</span> {{ card.assembled.value }}</span>
              </div>
              <div class="assembler-score-effects">
                <span v-for="c in effectsOf(card)" :key="c" class="assembler-chip assembler-chip--small" :class="{'assembler-chip--bane': INFO[c].bane}">{{ $t(INFO[c].label) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import Card from '@/client/components/card/Card.vue';
import AssemblerValueTable from '@/client/components/assembler/AssemblerValueTable.vue';
import AssemblerRater from '@/client/components/assembler/AssemblerRater.vue';
import {CardModel} from '@/common/models/CardModel';
import {paths} from '@/common/app/paths';
import {EFFECT_CATEGORIES, EFFECT_CATEGORY_INFO, EffectCategory} from '@/common/assembler/EffectCategory';
import {ASSEMBLER_PREVIEW_LIMITS, ASSEMBLER_PREVIEW_TAGS, AssemblerPreviewResponse} from '@/common/assembler/AssemblerPreview';

/** The page's options, as query parameters (see src/common/assembler/AssemblerPreview.ts). */
const KEYS = ['count', 'complexity', 'type', 'seed', 'categories', 'tags', 'tagCount', 'minCost', 'maxCost', 'costAdjust', 'requirement'] as const;

type View = 'generator' | 'values' | 'rate';

function viewFromHash(hash: string): View {
  // #values (or a section link inside it) opens the value table.
  return hash.startsWith('#values') ? 'values' : hash === '#rate' ? 'rate' : 'generator';
}

type DataModel = {
  view: View,
  count: number,
  complexity: string,
  type: string,
  seedInput: string,
  categories: Array<EffectCategory>,
  tags: Array<string>,
  tagCount: string,
  minCost: string,
  maxCost: string,
  costAdjust: string,
  requirement: boolean,
  cards: ReadonlyArray<CardModel>,
  seed: number | undefined,
  failed: number,
  error: string,
  loading: boolean,
};

function defaults() {
  return {
    count: ASSEMBLER_PREVIEW_LIMITS.DEFAULT_COUNT,
    complexity: '',
    type: '',
    seedInput: '',
    categories: [] as Array<EffectCategory>,
    tags: [] as Array<string>,
    tagCount: '',
    minCost: '',
    maxCost: '',
    costAdjust: '',
    requirement: false,
  };
}

/** Assembler (fan): a page that generates assembled cards with chosen options. */
export default defineComponent({
  name: 'AssemblerWorkshop',
  components: {
    Card,
    AssemblerValueTable,
    AssemblerRater,
  },
  data(): DataModel {
    return {
      ...defaults(),
      view: viewFromHash(window.location.hash),
      cards: [],
      seed: undefined,
      failed: 0,
      error: '',
      loading: false,
    };
  },
  computed: {
    LIMITS(): typeof ASSEMBLER_PREVIEW_LIMITS {
      return ASSEMBLER_PREVIEW_LIMITS;
    },
    TAGS(): ReadonlyArray<string> {
      return ASSEMBLER_PREVIEW_TAGS;
    },
    INFO(): typeof EFFECT_CATEGORY_INFO {
      return EFFECT_CATEGORY_INFO;
    },
    boons(): ReadonlyArray<EffectCategory> {
      return EFFECT_CATEGORIES.filter((c) => !EFFECT_CATEGORY_INFO[c].bane);
    },
    banes(): ReadonlyArray<EffectCategory> {
      return EFFECT_CATEGORIES.filter((c) => EFFECT_CATEGORY_INFO[c].bane);
    },
    shareUrl(): string {
      return `${paths.ASSEMBLER}?${this.query(this.seed)}`;
    },
  },
  mounted() {
    // A shared link opens with its options filled in and generates straight away.
    const params = new URLSearchParams(window.location.search);
    if (KEYS.some((k) => params.has(k))) {
      this.fromQuery(params);
    }
    if (this.view === 'generator') {
      this.generate();
    }
  },
  methods: {
    show(view: View) {
      this.view = view;
      if (view === 'generator' && this.cards.length === 0 && !this.loading) {
        this.generate();
      }
      history.replaceState(null, '', view === 'generator' ? window.location.pathname + window.location.search : '#' + view);
    },
    tagLabel(tag: string): string {
      return tag.charAt(0).toUpperCase() + tag.slice(1);
    },
    complexityText(card: CardModel): string {
      const info = card.assembled;
      if (info === undefined) {
        return '';
      }
      return info.score !== undefined ? `${this.$t('Complexity')} ${info.score}` : this.$t(this.complexityLabel(info.complexity));
    },
    complexityLabel(c: string): string {
      return c === 'low' ? 'Low complexity' : c === 'mid' ? 'Mid complexity' : 'High complexity';
    },
    effectsOf(card: CardModel): Array<EffectCategory> {
      const all = (card.assembled?.breakdown ?? []).map((l) => l.category).filter((c): c is EffectCategory => c !== undefined);
      return [...new Set(all)];
    },
    query(seed: number | undefined): string {
      const params = new URLSearchParams();
      const set = (key: string, value: string) => {
        if (value !== '') {
          params.set(key, value);
        }
      };
      set('count', String(this.count));
      set('complexity', this.complexity);
      set('type', this.type);
      set('seed', seed !== undefined ? String(seed) : String(this.seedInput));
      set('categories', this.categories.join(','));
      set('tags', this.tags.join(','));
      set('tagCount', this.tagCount);
      set('minCost', String(this.minCost));
      set('maxCost', String(this.maxCost));
      set('costAdjust', String(this.costAdjust));
      set('requirement', this.requirement ? '1' : '');
      return params.toString();
    },
    fromQuery(params: URLSearchParams) {
      const get = (key: string) => params.get(key) ?? '';
      const count = Number(get('count'));
      if (Number.isInteger(count) && count >= 1 && count <= ASSEMBLER_PREVIEW_LIMITS.MAX_COUNT) {
        this.count = count;
      }
      this.complexity = get('complexity');
      this.type = get('type');
      this.seedInput = get('seed');
      this.categories = get('categories').split(',').filter((c): c is EffectCategory => (EFFECT_CATEGORIES as ReadonlyArray<string>).includes(c));
      this.tags = get('tags').split(',').filter((t) => (ASSEMBLER_PREVIEW_TAGS as ReadonlyArray<string>).includes(t));
      this.tagCount = get('tagCount');
      this.minCost = get('minCost');
      this.maxCost = get('maxCost');
      this.costAdjust = get('costAdjust');
      this.requirement = get('requirement') === '1';
    },
    reset() {
      Object.assign(this, defaults());
    },
    async generate() {
      this.loading = true;
      this.error = '';
      try {
        const response = await fetch(`${paths.API_ASSEMBLER}?${this.query(undefined)}`);
        if (!response.ok) {
          const text = await response.text();
          this.error = response.status === 429 ? 'Too many requests. Wait a minute and try again.' : text.replace(/^Bad request: /, '');
          return;
        }
        const result: AssemblerPreviewResponse = await response.json();
        this.cards = result.cards;
        this.seed = result.seed;
        this.failed = result.failed ?? 0;
      } catch (e) {
        this.error = 'Could not reach the server.';
      } finally {
        this.loading = false;
      }
    },
  },
});

</script>

<style scoped lang="less">
.assembler-workshop {
  padding: 20px;
  color: #ddd;

  h1 { color: #fff; }
}

.assembler-tabs {
  display: flex;
  gap: 4px;
  margin: 12px 0 16px;
  border-bottom: 1px solid #444;
}

.assembler-tab {
  padding: 6px 16px;
  color: #aaa;
  text-decoration: none;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 4px 4px 0 0;

  &:hover { color: #fff; }
}

.assembler-tab--on {
  color: #fff;
  border-color: #444;
  background-color: rgba(224, 160, 96, 0.15);
}

.assembler-intro {
  max-width: 800px;
  font-size: 13px;
  color: #aaa;
}

.assembler-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.assembler-controls {
  width: 420px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

fieldset.assembler-fieldset {
  border: 1px solid #444;
  border-radius: 4px;
  padding: 8px;

  legend { padding: 0 4px; }
}

.assembler-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  margin-bottom: 8px;

  input, select { font-family: inherit; }
}

.assembler-field--inline {
  flex-direction: row;
  align-items: center;
}

.assembler-row {
  display: flex;
  gap: 8px;

  .assembler-field { flex: 1; }
  input { width: 100%; }
}

.assembler-hint {
  margin: 0 0 6px;
  font-size: 12px;
  color: #999;
}

.assembler-group-title {
  font-size: 12px;
  color: #aaa;
  margin: 6px 0 4px;
}

.assembler-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 6px;
}

.assembler-chip {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid #5a7a5a;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  user-select: none;

  input { display: none; }
}

.assembler-chip--bane { border-color: #8a5a3a; }
.assembler-chip--on { background-color: #3d6b3d; color: #fff; }
.assembler-chip--bane.assembler-chip--on { background-color: #8a4a24; }

.assembler-chip--small {
  cursor: default;
  font-size: 11px;
  padding: 0 6px;
}

.assembler-buttons {
  display: flex;
  gap: 8px;
}

.assembler-results {
  flex: 1;
  min-width: 300px;
}

.assembler-error {
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid #b04040;
  border-radius: 4px;
  background-color: #3a1a1a;
}

.assembler-warning {
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid #9a7a24;
  border-radius: 4px;
  background-color: #3a3018;
  font-size: 13px;
}

.assembler-seed {
  font-size: 13px;
  margin-bottom: 8px;
  color: #aaa;

  a { color: #e0a060; }
}

.assembler-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.assembler-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assembler-score {
  width: 248px;
  font-size: 12px;
}

.assembler-score-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.assembler-score-effects {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.assembler-complexity {
  padding: 0 6px;
  border-radius: 8px;
  color: #fff;
}

.assembler-complexity--low { background-color: #4a7a4a; }
.assembler-complexity--mid { background-color: #9a7a24; }
.assembler-complexity--high { background-color: #9a3a3a; }
</style>
