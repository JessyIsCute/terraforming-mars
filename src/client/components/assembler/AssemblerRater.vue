<template>
  <div class="assembler-rater">
    <p class="assembler-intro" v-i18n>
      Rate generated cards one at a time: is the cost right for what the card does? Use the buttons
      or the keys 1 to 5 (S skips). Your votes stay in this browser. Download them to help tune the
      value table.
    </p>

    <div class="rater-options">
      <label class="rater-option">
        <span v-i18n>Complexity</span>
        <select v-model="complexity" @change="restart">
          <option value="">{{ $t('Random') }}</option>
          <option value="low">{{ $t('Low') }}</option>
          <option value="mid">{{ $t('Mid') }}</option>
          <option value="high">{{ $t('High') }}</option>
        </select>
      </label>
      <label class="rater-option rater-option--inline">
        <input type="checkbox" v-model="showValue">
        <span v-i18n>Show the value before I vote</span>
      </label>
    </div>

    <div class="rater-layout">
      <div class="rater-stage">
        <div v-if="error !== ''" class="assembler-error">{{ error }}</div>
        <template v-if="current !== undefined">
          <Card :card="current" auto-tall :key="current.name"/>
          <div v-if="showValue && current.assembled !== undefined" class="rater-value">
            <span v-i18n>value</span> {{ current.assembled.value }} · <span v-i18n>cost</span> {{ current.calculatedCost }}
          </div>
          <div class="rater-buttons">
            <button v-for="v in VERDICTS" :key="v" type="button" class="rater-verdict" :class="'rater-verdict--' + v" @click="rate(v)">
              <span class="rater-key">{{ INFO[v].key }}</span> {{ $t(INFO[v].label) }}
            </button>
            <button type="button" class="rater-skip" @click="skip"><span class="rater-key">S</span> {{ $t('Skip') }}</button>
          </div>
        </template>
        <div v-else-if="error === ''" class="rater-loading" v-i18n>Assembling cards…</div>
        <div v-if="last !== undefined" class="rater-last">
          <span v-i18n>Last card</span>: {{ last.title }} ({{ last.cost }} M€) — {{ $t(INFO[last.verdict].label) }}
          <a href="#" @click.prevent="undo" v-i18n>undo</a>
        </div>
      </div>

      <div class="rater-stats">
        <h3><span v-i18n>Your votes</span>: {{ votes.length }}</h3>
        <div class="rater-bar">
          <div v-for="v in VERDICTS" :key="v" class="rater-bar-part" :class="'rater-verdict--' + v" :style="{flexGrow: tally[v]}" :title="$t(INFO[v].label) + ': ' + tally[v]"></div>
        </div>
        <table v-if="leans.length > 0" class="rater-leans">
          <thead><tr><th v-i18n>Cards with</th><th v-i18n>Votes</th><th v-i18n>Your verdict</th></tr></thead>
          <tbody>
            <tr v-for="l in leans" :key="l.group">
              <td>{{ $t(l.label) }}</td>
              <td>{{ l.count }}</td>
              <td :class="leanClass(l.lean)">{{ $t(leanText(l.lean)) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="assembler-hint" v-i18n>Rate a few cards to see which kinds of effect you think are priced too high or too low.</p>
        <div class="rater-actions">
          <button type="button" class="btn btn-primary" :disabled="votes.length === 0" @click="download" v-i18n>Download votes</button>
          <button type="button" class="btn" :disabled="votes.length === 0" @click="clear" v-i18n>Clear votes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import Card from '@/client/components/card/Card.vue';
import {CardModel} from '@/common/models/CardModel';
import {paths} from '@/common/app/paths';
import {AssemblerPreviewResponse} from '@/common/assembler/AssemblerPreview';
import {EFFECT_CATEGORY_INFO} from '@/common/assembler/EffectCategory';
import {ASSEMBLER_VOTES_STORAGE_KEY, AssemblerVote, AssemblerVoteFile, PriceGroup, VERDICTS, VERDICT_INFO, Verdict, isVerdict, priceGroup} from '@/common/assembler/AssemblerVotes';

/** Fetch more cards when fewer than this are waiting. */
const REFILL_AT = 4;
const BATCH = 6;
/** A kind of effect needs this many votes before it shows in the table. */
const MIN_VOTES = 3;

type Lean = {group: PriceGroup, label: string, count: number, lean: number};

type DataModel = {
  complexity: string,
  showValue: boolean,
  queue: Array<CardModel>,
  votes: Array<AssemblerVote>,
  error: string,
  loading: boolean,
};

function storage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch (e) {
    return undefined;
  }
}

function loadVotes(): Array<AssemblerVote> {
  try {
    const raw = storage()?.getItem(ASSEMBLER_VOTES_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => isVerdict(v?.verdict)) : [];
  } catch (e) {
    return [];
  }
}

function groupLabel(group: PriceGroup): string {
  switch (group) {
  case 'tags': return 'Tags';
  case 'requirement': return 'A requirement';
  case 'payment': return 'Steel/titanium payment';
  default: return EFFECT_CATEGORY_INFO[group].label;
  }
}

/** Assembler (fan): rate generated cards one by one to see whether their prices feel right. */
export default defineComponent({
  name: 'AssemblerRater',
  components: {
    Card,
  },
  data(): DataModel {
    return {
      complexity: '',
      showValue: false,
      queue: [],
      votes: loadVotes(),
      error: '',
      loading: false,
    };
  },
  computed: {
    VERDICTS(): ReadonlyArray<Verdict> {
      return VERDICTS;
    },
    INFO(): typeof VERDICT_INFO {
      return VERDICT_INFO;
    },
    current(): CardModel | undefined {
      return this.queue[0];
    },
    last(): AssemblerVote | undefined {
      return this.votes[this.votes.length - 1];
    },
    tally(): Record<Verdict, number> {
      const tally = Object.fromEntries(VERDICTS.map((v) => [v, 0])) as Record<Verdict, number>;
      for (const vote of this.votes) {
        tally[vote.verdict]++;
      }
      return tally;
    },
    /** Per kind of effect: the average verdict on cards that have it (+2 way too cheap … −2 way too expensive). */
    leans(): Array<Lean> {
      const sums = new Map<PriceGroup, {count: number, steps: number}>();
      for (const vote of this.votes) {
        const groups = new Set(vote.assembled.breakdown.map(priceGroup));
        for (const g of groups) {
          const s = sums.get(g) ?? {count: 0, steps: 0};
          s.count++;
          s.steps += VERDICT_INFO[vote.verdict].steps;
          sums.set(g, s);
        }
      }
      return [...sums]
        .filter(([, s]) => s.count >= MIN_VOTES)
        .map(([group, s]) => ({group, label: groupLabel(group), count: s.count, lean: s.steps / s.count}))
        .sort((a, b) => Math.abs(b.lean) - Math.abs(a.lean));
    },
  },
  mounted() {
    window.addEventListener('keydown', this.onKey);
    this.refill();
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey);
  },
  methods: {
    leanText(lean: number): string {
      if (lean >= 0.75) {
        return 'too cheap';
      }
      if (lean >= 0.25) {
        return 'a bit cheap';
      }
      if (lean > -0.25) {
        return 'about right';
      }
      if (lean > -0.75) {
        return 'a bit expensive';
      }
      return 'too expensive';
    },
    leanClass(lean: number): string {
      return lean >= 0.25 ? 'rater-lean--cheap' : lean <= -0.25 ? 'rater-lean--expensive' : '';
    },
    onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      const verdict = VERDICTS.find((v) => VERDICT_INFO[v].key === e.key);
      if (verdict !== undefined) {
        this.rate(verdict);
      } else if (e.key === 's' || e.key === 'S') {
        this.skip();
      }
    },
    rate(verdict: Verdict) {
      const card = this.current;
      if (card === undefined || card.assembled === undefined) {
        return;
      }
      this.votes.push({
        card: card.name,
        title: card.combinedDisplayName ?? card.name,
        cost: card.calculatedCost ?? 0,
        verdict,
        assembled: card.assembled,
        at: Date.now(),
      });
      this.save();
      this.next();
    },
    skip() {
      if (this.current !== undefined) {
        this.next();
      }
    },
    undo() {
      this.votes.pop();
      this.save();
    },
    next() {
      this.queue.shift();
      this.refill();
    },
    restart() {
      this.queue = [];
      this.refill();
    },
    save() {
      try {
        storage()?.setItem(ASSEMBLER_VOTES_STORAGE_KEY, JSON.stringify(this.votes));
      } catch (e) {
        this.error = 'Could not save your votes in this browser. Download them before you leave.';
      }
    },
    clear() {
      if (window.confirm(this.$t('Delete all your votes from this browser? Download them first if you want to keep them.'))) {
        this.votes = [];
        this.save();
      }
    },
    download() {
      const file: AssemblerVoteFile = {version: 1, votes: this.votes};
      const blob = new Blob([JSON.stringify(file, null, 1)], {type: 'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `assembler-votes-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    async refill() {
      if (this.loading || this.queue.length >= REFILL_AT) {
        return;
      }
      this.loading = true;
      const complexity = this.complexity;
      try {
        const params = new URLSearchParams({count: String(BATCH)});
        if (complexity !== '') {
          params.set('complexity', complexity);
        }
        const response = await fetch(`${paths.API_ASSEMBLER}?${params}`);
        if (!response.ok) {
          this.error = response.status === 429 ? 'Too many requests. Wait a minute and try again.' : (await response.text()).replace(/^Bad request: /, '');
          return;
        }
        const result: AssemblerPreviewResponse = await response.json();
        // Options changed while this batch was on its way: it's for the old options.
        if (complexity === this.complexity) {
          this.error = '';
          this.queue.push(...result.cards.filter((c) => c.assembled !== undefined));
        }
      } catch (e) {
        this.error = 'Could not reach the server.';
      } finally {
        this.loading = false;
      }
      if (complexity !== this.complexity) {
        this.refill();
      }
    },
  },
});

</script>

<style scoped lang="less">
.assembler-intro {
  max-width: 800px;
  font-size: 13px;
  color: #aaa;
}

.assembler-hint {
  font-size: 12px;
  color: #999;
}

.assembler-error {
  padding: 8px 12px;
  margin-bottom: 12px;
  border: 1px solid #b04040;
  border-radius: 4px;
  background-color: #3a1a1a;
}

.rater-options {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
}

.rater-option {
  display: flex;
  gap: 6px;
  align-items: center;
}

.rater-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.rater-stage {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  min-width: 260px;
}

.rater-value {
  font-size: 13px;
  color: #ccc;
}

.rater-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: 560px;
}

.rater-key {
  display: inline-block;
  min-width: 14px;
  padding: 0 3px;
  margin-right: 2px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  font-size: 11px;
}

.rater-verdict,
.rater-skip {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;

  &:hover { filter: brightness(1.2); }
  &:active { transform: translateY(1px); }
}

.rater-skip { background-color: #333; }

.rater-verdict--much-too-cheap { background-color: #2f6f3a; }
.rater-verdict--too-cheap { background-color: #4f8a4a; }
.rater-verdict--fair { background-color: #5a5a6a; }
.rater-verdict--too-expensive { background-color: #a0603a; }
.rater-verdict--much-too-expensive { background-color: #9a3a3a; }

.rater-last {
  font-size: 12px;
  color: #aaa;

  a { color: #e0a060; margin-left: 6px; }
}

.rater-loading {
  font-size: 13px;
  color: #aaa;
}

.rater-stats {
  width: 340px;
  max-width: 100%;
  font-size: 13px;

  h3 { margin: 0 0 8px; color: #fff; }
}

.rater-bar {
  display: flex;
  height: 10px;
  border-radius: 5px;
  overflow: hidden;
  background-color: #333;
  margin-bottom: 12px;
}

.rater-bar-part {
  flex-basis: 0;
}

.rater-leans {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;

  th, td {
    padding: 3px 6px;
    border-bottom: 1px solid #3a3a3a;
    text-align: left;
  }

  th { color: #aaa; font-weight: normal; }
}

.rater-lean--cheap { color: #7fd17f; }
.rater-lean--expensive { color: #e08a6a; }

.rater-actions {
  display: flex;
  gap: 8px;
}
</style>
