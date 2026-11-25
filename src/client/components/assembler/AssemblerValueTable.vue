<template>
  <div class="assembler-values">
    <div v-if="error !== ''" class="assembler-values-error">{{ error }}</div>
    <div v-else-if="table === undefined" class="assembler-values-loading" v-i18n>Loading the value table…</div>
    <template v-else>
      <nav class="assembler-values-index">
        <a v-for="(s, i) in table.sections" :key="i" :href="'#values-' + i">{{ $t(s.title) }}</a>
      </nav>
      <section v-for="(s, i) in table.sections" :key="i" :id="'values-' + i" class="assembler-values-section">
        <h2>{{ $t(s.title) }}</h2>
        <p v-if="s.intro !== undefined" class="assembler-values-intro">{{ $t(s.intro) }}</p>
        <div class="assembler-values-scroll">
          <table class="assembler-values-table">
            <thead>
              <tr>
                <th v-for="(c, j) in s.columns" :key="j" :class="{'assembler-values-num': s.numeric[j]}">{{ $t(c) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, r) in s.rows" :key="r">
                <td v-for="(cell, j) in row" :key="j" :class="{'assembler-values-num': s.numeric[j], 'assembler-values-neg': s.numeric[j] && cell.startsWith('−')}">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {paths} from '@/common/app/paths';
import {AssemblerValueTableModel} from '@/common/assembler/AssemblerValueTable';

/** Assembler (fan): what every part of a generated card is worth, as a set of clean tables. */
export default defineComponent({
  name: 'AssemblerValueTable',
  data() {
    return {
      table: undefined as AssemblerValueTableModel | undefined,
      error: '',
    };
  },
  async mounted() {
    try {
      const response = await fetch(paths.API_ASSEMBLER_VALUES);
      if (!response.ok) {
        this.error = 'Could not load the value table.';
        return;
      }
      this.table = await response.json();
    } catch (e) {
      this.error = 'Could not reach the server.';
    }
  },
});

</script>

<style scoped lang="less">
.assembler-values {
  max-width: 1100px;
}

.assembler-values-index {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-bottom: 16px;
  font-size: 13px;

  a { color: #e0a060; }
}

.assembler-values-section {
  margin-bottom: 28px;

  h2 {
    color: #fff;
    font-size: 18px;
    margin: 0 0 4px;
  }
}

.assembler-values-intro {
  margin: 0 0 8px;
  font-size: 13px;
  color: #aaa;
}

.assembler-values-scroll {
  overflow-x: auto;
}

.assembler-values-table {
  border-collapse: collapse;
  font-size: 13px;
  min-width: 420px;

  th, td {
    padding: 5px 12px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid #3a3a3a;
  }

  th {
    color: #e0a060;
    font-weight: bold;
    border-bottom: 2px solid #9a5a24;
    white-space: nowrap;
  }

  tbody tr:nth-child(even) { background-color: rgba(255, 255, 255, 0.04); }
  tbody tr:hover { background-color: rgba(224, 160, 96, 0.12); }

  .assembler-values-num {
    text-align: right;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .assembler-values-neg { color: #e08080; }
}

.assembler-values-error {
  padding: 8px 12px;
  border: 1px solid #b04040;
  border-radius: 4px;
  background-color: #3a1a1a;
}
</style>
