<template>
  <div class="assembler-rater">
    <p class="assembler-intro" v-i18n>
      Say whether things are priced right. Rate single numbers from the value table, or whole
      generated cards. Use the buttons or the keys 1 to 5 (S skips). Your votes stay in this
      browser; download them to help tune the value table.
    </p>

    <div class="rater-options">
      <div class="rater-modes">
        <a href="#" class="rater-mode" :class="{'rater-mode--on': mode === 'values'}" @click.prevent="mode = 'values'" v-i18n>Rate values</a>
        <a href="#" class="rater-mode" :class="{'rater-mode--on': mode === 'cards'}" @click.prevent="mode = 'cards'" v-i18n>Rate cards</a>
      </div>
      <label v-if="mode === 'cards'" class="rater-option">
        <span v-i18n>Complexity</span>
        <select v-model="complexity" @change="restart">
          <option value="">{{ $t('Random') }}</option>
          <option v-for="n in 8" :key="n" :value="String(n)">{{ n }}</option>
        </select>
      </label>
      <label class="rater-option" :title="$t('Some prices are moved on purpose. If you call those wrong too, the votes can be trusted.')">
        <input type="checkbox" v-model="spread" @change="restart">
        <span v-i18n>Mix in deliberately wrong prices</span>
      </label>
    </div>

    <div class="rater-layout">
      <div class="rater-stage">
        <div v-if="error !== ''" class="assembler-error">{{ error }}</div>

        <template v-if="mode === 'values'">
          <div v-if="currentValue !== undefined" class="rater-value-card">
            <div class="rater-value-group">{{ $t(currentValue.item.group) }}</div>
            <div class="rater-value-label">{{ $t(currentValue.item.label) }}</div>
            <div class="rater-value-number">= {{ currentValue.shown }} M€</div>
          </div>
          <div v-else-if="error === ''" class="rater-loading" v-i18n>Loading the value table…</div>
        </template>
        <template v-else>
          <Card v-if="currentCard !== undefined" :card="blind(currentCard)" auto-tall :key="currentCard.name"/>
          <div v-else-if="error === ''" class="rater-loading" v-i18n>Assembling cards…</div>
        </template>

        <div v-if="ready" class="rater-buttons">
          <button v-for="v in VERDICTS" :key="v" type="button" class="rater-verdict" :class="'rater-verdict--' + v" @click="rate(v)">
            <span class="rater-key">{{ INFO[v].key }}</span> {{ $t(mode === 'values' ? INFO[v].valueLabel : INFO[v].label) }}
          </button>
          <button type="button" class="rater-skip" @click="skip"><span class="rater-key">S</span> {{ $t('Skip') }}</button>
        </div>

        <div v-if="mode === 'values' && lastValue !== undefined" class="rater-last">
          <span v-i18n>Last</span>: {{ lastValue.label }} = {{ lastValue.shown }} M€ — {{ $t(INFO[lastValue.verdict].valueLabel) }}<template v-if="lastValue.shown !== lastValue.real"> ({{ $t('the table says') }} {{ lastValue.real }})</template>
          <a href="#" @click.prevent="undo" v-i18n>undo</a>
        </div>
        <div v-if="mode === 'cards' && lastCard !== undefined" class="rater-last">
          <span v-i18n>Last card</span>: {{ lastCard.title }} ({{ lastCard.cost }} M€) — {{ $t(INFO[lastCard.verdict].label) }}<template v-if="(lastCard.shift ?? 0) !== 0"> ({{ $t('real price') }} {{ lastCard.cost - (lastCard.shift ?? 0) }} M€)</template>
          <a href="#" @click.prevent="undo" v-i18n>undo</a>
        </div>
      </div>

      <div class="rater-stats">
        <h3><span v-i18n>Your votes</span>: {{ valueVotes.length + votes.length }}</h3>
        <div class="rater-bar">
          <div v-for="v in VERDICTS" :key="v" class="rater-bar-part" :class="'rater-verdict--' + v" :style="{flexGrow: tally[v]}" :title="$t(INFO[v].label) + ': ' + tally[v]"></div>
        </div>

        <template v-if="mode === 'values'">
          <table v-if="valueSummary.length > 0" class="rater-leans rater-values">
            <thead><tr><th v-i18n>Value</th><th v-i18n>Votes</th><th v-i18n>Table</th><th v-i18n>You say</th></tr></thead>
            <tbody>
              <tr v-for="r in valueSummary" :key="r.key">
                <td>{{ $t(r.label) }}</td>
                <td>{{ r.count }}</td>
                <td>{{ r.real }}</td>
                <td :class="leanClass(r.suggested - r.real, 0.05 * Math.abs(r.real) + 0.1)">{{ r.suggested }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="assembler-hint" v-i18n>Rate a few values to see what you'd change.</p>
        </template>
        <template v-else>
          <table v-if="leans.length > 0" class="rater-leans">
            <thead><tr><th v-i18n>Cards with</th><th v-i18n>Votes</th><th v-i18n>Your verdict</th></tr></thead>
            <tbody>
              <tr v-for="l in leans" :key="l.group">
                <td>{{ $t(l.label) }}</td>
                <td>{{ l.count }}</td>
                <td :class="leanClass(l.lean, 0.25)">{{ $t(leanText(l.lean)) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="assembler-hint" v-i18n>Rate a few cards at their real price to see which kinds of effect you think are priced too high or too low.</p>
        </template>

        <template v-if="check.some((c) => c.count > 0)">
          <h4 v-i18n>Check: did you notice the wrong prices?</h4>
          <table class="rater-leans rater-check">
            <thead><tr><th v-i18n>Shown price</th><th v-i18n>Votes</th><th v-i18n>Your verdict</th></tr></thead>
            <tbody>
              <tr v-for="c in check" :key="c.label">
                <td>{{ $t(c.label) }}</td>
                <td>{{ c.count }}</td>
                <td :class="c.count > 0 ? leanClass(c.lean, 0.25) : ''">{{ c.count > 0 ? $t(leanText(c.lean)) : '–' }}</td>
              </tr>
            </tbody>
          </table>
          <p class="assembler-hint" v-i18n>Prices moved down should read as cheap and prices moved up as expensive. If they don't, the votes are mostly noise.</p>
        </template>

        <div class="rater-actions">
          <button type="button" class="btn btn-primary" :disabled="votes.length + valueVotes.length === 0" @click="download" v-i18n>Download votes</button>
          <button type="button" class="btn" :disabled="votes.length + valueVotes.length === 0" @click="clear" v-i18n>Clear votes</button>
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
import {AssemblerValueTableModel, RateableValue} from '@/common/assembler/AssemblerValueTable';
import {EFFECT_CATEGORY_INFO} from '@/common/assembler/EffectCategory';
import {
  ASSEMBLER_VALUE_VOTES_STORAGE_KEY, ASSEMBLER_VOTES_STORAGE_KEY, AssemblerValueVote, AssemblerVote, AssemblerVoteFile, PriceGroup,
  VERDICTS, VERDICT_INFO, Verdict, isVerdict, priceGroup, shiftTableValue, votedTableValue,
} from '@/common/assembler/AssemblerVotes';

/** Fetch more cards when fewer than this are waiting. */
const REFILL_AT = 4;
const BATCH = 6;
/** A kind of effect needs this many votes before it shows in the table. */
const MIN_VOTES = 3;

type Mode = 'values' | 'cards';
type Lean = {group: PriceGroup, label: string, count: number, lean: number};
type ValueRow = {key: string, label: string, count: number, real: number, suggested: number};
type CheckRow = {label: string, count: number, lean: number};
type ShownValue = {item: RateableValue, shown: number};

type DataModel = {
  mode: Mode,
  complexity: string,
  spread: boolean,
  queue: Array<CardModel>,
  table: ReadonlyArray<RateableValue>,
  valueQueue: Array<ShownValue>,
  votes: Array<AssemblerVote>,
  valueVotes: Array<AssemblerValueVote>,
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

function load<T>(key: string): Array<T> {
  try {
    const raw = storage()?.getItem(key);
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

function average(ns: ReadonlyArray<number>): number {
  return ns.reduce((s, n) => s + n, 0) / Math.max(1, ns.length);
}

function shuffled<T>(items: ReadonlyArray<T>): Array<T> {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Assembler (fan): rate table values or generated cards one by one to see whether prices feel right. */
export default defineComponent({
  name: 'AssemblerRater',
  components: {
    Card,
  },
  data(): DataModel {
    return {
      mode: 'values',
      complexity: '',
      spread: true,
      queue: [],
      table: [],
      valueQueue: [],
      votes: load<AssemblerVote>(ASSEMBLER_VOTES_STORAGE_KEY),
      valueVotes: load<AssemblerValueVote>(ASSEMBLER_VALUE_VOTES_STORAGE_KEY),
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
    currentCard(): CardModel | undefined {
      return this.queue[0];
    },
    currentValue(): ShownValue | undefined {
      return this.valueQueue[0];
    },
    ready(): boolean {
      return this.mode === 'values' ? this.currentValue !== undefined : this.currentCard !== undefined;
    },
    lastCard(): AssemblerVote | undefined {
      return this.votes[this.votes.length - 1];
    },
    lastValue(): AssemblerValueVote | undefined {
      return this.valueVotes[this.valueVotes.length - 1];
    },
    tally(): Record<Verdict, number> {
      const tally = Object.fromEntries(VERDICTS.map((v) => [v, 0])) as Record<Verdict, number>;
      for (const vote of this.mode === 'values' ? this.valueVotes : this.votes) {
        tally[vote.verdict]++;
      }
      return tally;
    },
    /** Per kind of effect, on cards shown at their real price: the average verdict (+2 way too cheap … −2 way too expensive). */
    leans(): Array<Lean> {
      const sums = new Map<PriceGroup, Array<number>>();
      for (const vote of this.votes.filter((v) => (v.shift ?? 0) === 0)) {
        for (const g of new Set(vote.assembled.breakdown.map(priceGroup))) {
          sums.set(g, [...(sums.get(g) ?? []), VERDICT_INFO[vote.verdict].steps]);
        }
      }
      return [...sums]
        .filter(([, s]) => s.length >= MIN_VOTES)
        .map(([group, s]) => ({group, label: groupLabel(group), count: s.length, lean: average(s)}))
        .sort((a, b) => Math.abs(b.lean) - Math.abs(a.lean));
    },
    /** Per table value: what your votes say it should be. */
    valueSummary(): Array<ValueRow> {
      const byKey = new Map<string, Array<AssemblerValueVote>>();
      for (const v of this.valueVotes) {
        byKey.set(v.key, [...(byKey.get(v.key) ?? []), v]);
      }
      const off = (r: ValueRow) => Math.abs(r.suggested - r.real) / Math.max(0.5, r.real);
      return [...byKey.values()].map((vs) => {
        const latest = vs[vs.length - 1];
        const suggested = Math.round(average(vs.map(votedTableValue)) * 10) / 10;
        return {key: latest.key, label: latest.label, count: vs.length, real: latest.real, suggested};
      }).sort((a, b) => off(b) - off(a));
    },
    /** Verdicts split by how the shown price was moved: the check on the votes themselves. */
    check(): Array<CheckRow> {
      const items: Array<{shift: number, steps: number}> = this.mode === 'values' ?
        this.valueVotes.map((v) => ({shift: v.shown - v.real, steps: VERDICT_INFO[v.verdict].steps})) :
        this.votes.filter((v) => v.shift !== undefined).map((v) => ({shift: v.shift ?? 0, steps: VERDICT_INFO[v.verdict].steps}));
      const row = (label: string, keep: (shift: number) => boolean): CheckRow => {
        const steps = items.filter((i) => keep(i.shift)).map((i) => i.steps);
        return {label, count: steps.length, lean: average(steps)};
      };
      return [
        row('Moved down (cheaper than real)', (s) => s < 0),
        row('Real price', (s) => s === 0),
        row('Moved up (pricier than real)', (s) => s > 0),
      ];
    },
  },
  watch: {
    mode() {
      this.error = '';
      this.refill();
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
    /** The card without its price breakdown, so the vote isn't anchored on it (or on a moved price). */
    blind(card: CardModel): CardModel {
      return {...card, assembled: undefined};
    },
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
    leanClass(lean: number, threshold: number): string {
      return lean >= threshold ? 'rater-lean--cheap' : lean <= -threshold ? 'rater-lean--expensive' : '';
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
      if (this.mode === 'values') {
        const v = this.currentValue;
        if (v === undefined) {
          return;
        }
        this.valueVotes.push({key: v.item.key, label: v.item.label, shown: v.shown, real: v.item.value, verdict, at: Date.now()});
      } else {
        const card = this.currentCard;
        if (card === undefined || card.assembled === undefined) {
          return;
        }
        this.votes.push({
          card: card.name,
          title: card.combinedDisplayName ?? card.name,
          cost: card.calculatedCost ?? 0,
          verdict,
          assembled: card.assembled,
          // Only cards asked for with the spread can have a deliberate shift.
          ...(this.spread ? {shift: card.assembled.costAdjust ?? 0} : {}),
          at: Date.now(),
        });
      }
      this.save();
      this.next();
    },
    skip() {
      if (this.ready) {
        this.next();
      }
    },
    undo() {
      if (this.mode === 'values') {
        this.valueVotes.pop();
      } else {
        this.votes.pop();
      }
      this.save();
    },
    next() {
      if (this.mode === 'values') {
        this.valueQueue.shift();
      } else {
        this.queue.shift();
      }
      this.refill();
    },
    restart() {
      this.queue = [];
      this.valueQueue = [];
      this.refill();
    },
    save() {
      try {
        storage()?.setItem(ASSEMBLER_VOTES_STORAGE_KEY, JSON.stringify(this.votes));
        storage()?.setItem(ASSEMBLER_VALUE_VOTES_STORAGE_KEY, JSON.stringify(this.valueVotes));
      } catch (e) {
        this.error = 'Could not save your votes in this browser. Download them before you leave.';
      }
    },
    clear() {
      if (window.confirm(this.$t('Delete all your votes from this browser? Download them first if you want to keep them.'))) {
        this.votes = [];
        this.valueVotes = [];
        this.save();
      }
    },
    download() {
      const file: AssemblerVoteFile = {version: 1, votes: this.votes, valueVotes: this.valueVotes};
      const blob = new Blob([JSON.stringify(file, null, 1)], {type: 'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `assembler-votes-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    },
    refill(): Promise<void> {
      return this.mode === 'values' ? this.refillValues() : this.refillCards();
    },
    async refillValues(): Promise<void> {
      if (this.valueQueue.length > 0) {
        return;
      }
      if (this.table.length === 0) {
        if (this.loading) {
          return;
        }
        this.loading = true;
        try {
          const response = await fetch(paths.API_ASSEMBLER_VALUES);
          if (!response.ok) {
            this.error = 'Could not load the value table.';
            return;
          }
          const model: AssemblerValueTableModel = await response.json();
          this.table = model.rateable;
        } catch (e) {
          this.error = 'Could not reach the server.';
          return;
        } finally {
          this.loading = false;
        }
      }
      // Every value once, in a random order, then again.
      this.valueQueue = shuffled(this.table).map((item) => ({item, shown: this.spread ? shiftTableValue(item.value, Math.random) : item.value}));
    },
    async refillCards(): Promise<void> {
      if (this.loading || this.queue.length >= REFILL_AT) {
        return;
      }
      this.loading = true;
      const options = `${this.complexity}|${this.spread}`;
      try {
        const params = new URLSearchParams({count: String(BATCH)});
        if (this.complexity !== '') {
          params.set('complexity', this.complexity);
        }
        if (this.spread) {
          params.set('spread', '1');
        }
        const response = await fetch(`${paths.API_ASSEMBLER}?${params}`);
        if (!response.ok) {
          this.error = response.status === 429 ? 'Too many requests. Wait a minute and try again.' : (await response.text()).replace(/^Bad request: /, '');
          return;
        }
        const result: AssemblerPreviewResponse = await response.json();
        // Options changed while this batch was on its way: it's for the old options.
        if (options === `${this.complexity}|${this.spread}`) {
          this.error = '';
          this.queue.push(...result.cards.filter((c) => c.assembled !== undefined));
        }
      } catch (e) {
        this.error = 'Could not reach the server.';
      } finally {
        this.loading = false;
      }
      if (options !== `${this.complexity}|${this.spread}` && this.mode === 'cards') {
        await this.refillCards();
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
  flex-wrap: wrap;
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

.rater-modes {
  display: flex;
  gap: 4px;
}

.rater-mode {
  padding: 3px 10px;
  border: 1px solid #555;
  border-radius: 12px;
  color: #aaa;
  text-decoration: none;

  &:hover { color: #fff; }
}

.rater-mode--on {
  color: #fff;
  background-color: rgba(224, 160, 96, 0.25);
  border-color: #e0a060;
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

.rater-value-card {
  width: 340px;
  max-width: 100%;
  padding: 20px;
  border: 1px solid #555;
  border-radius: 8px;
  background-color: #262626;
  text-align: center;
}

.rater-value-group {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.rater-value-label {
  margin: 10px 0;
  font-size: 17px;
  color: #fff;
}

.rater-value-number {
  font-size: 28px;
  font-weight: bold;
  color: #e0a060;
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
  width: 380px;
  max-width: 100%;
  font-size: 13px;

  h3 { margin: 0 0 8px; color: #fff; }
  h4 { margin: 12px 0 6px; color: #ddd; font-size: 13px; }
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
