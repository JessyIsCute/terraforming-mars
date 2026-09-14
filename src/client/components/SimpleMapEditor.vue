<template>
  <div class="simple-map-editor">
    <h1 v-i18n>{{ title }}</h1>
    <div class="simple-map-editor-board-nav">
      <a :href="paths.MAP_EDITOR" v-i18n>Mars Map Editor</a>
      <a :href="paths.MAP_EDITOR + (boardType === 'moon' ? '?board=venus' : '?board=moon')" v-i18n>
        {{ boardType === 'moon' ? 'Venus Phase 2 Map Editor' : 'Moon Map Editor' }}
      </a>
    </div>
    <p class="simple-map-editor-note" v-i18n>
      {{ boardType === 'moon' ? 'The Luna Trade Station and Momentum Virium reserved spots' : 'The Stratopolis and Maxwell Base reserved spots' }}
      shown in the preview below are placed automatically by the game and can't be painted here.
    </p>

    <div class="simple-map-editor-layout">
      <div class="simple-map-editor-controls">
        <label class="simple-map-editor-field">
          <span v-i18n>Name</span>
          <input type="text" v-model="name" :maxlength="MAX_SIMPLE_BOARD_NAME_LENGTH">
        </label>

        <fieldset class="simple-map-editor-tools">
          <legend v-i18n>Terrain</legend>
          <label v-for="t in terrainTools" :key="t.key" :title="t.description">
            <input type="radio" name="tool" :value="t.key" v-model="tool">
            <i class="simple-map-editor-swatch" :class="'simple-map-editor-swatch--' + t.spaceType"></i>
            <span>{{ t.label }}</span>
          </label>
        </fieldset>

        <fieldset v-if="bonusTools.length > 0" class="simple-map-editor-tools">
          <legend v-i18n>Bonuses</legend>
          <p class="simple-map-editor-tools-note" v-i18n>Click a hex to add this bonus — bonuses stack. Right-click a hex to remove its last bonus.</p>
          <label :title="'Remove every bonus from the hex you click.'">
            <input type="radio" name="tool" value="bonus:clear" v-model="tool">
            <i class="simple-map-editor-bonus-icon simple-map-editor-bonus-icon--clear">∅</i>
            <span v-i18n>Clear bonuses</span>
          </label>
          <label v-for="t in bonusTools" :key="t.key" :title="t.description">
            <input type="radio" name="tool" :value="t.key" v-model="tool">
            <i class="simple-map-editor-bonus-icon" :class="'board-space-bonus--' + t.css"></i>
            <span>{{ t.label }}</span>
          </label>
        </fieldset>

        <p class="simple-map-editor-tool-hint">{{ currentToolHint }}</p>
      </div>

      <div class="simple-map-editor-canvas">
        <div class="simple-map-editor-grid-wrap">
          <div class="simple-map-editor-grid" :style="gridStyle">
            <button
              v-for="(cell, i) in grid"
              :key="i"
              type="button"
              class="simple-map-editor-hex"
              :class="'simple-map-editor-swatch--' + cell.spaceType"
              :style="hexStyle(cell)"
              @click="paint(i)"
              @contextmenu.prevent="removeLastBonus(i)"
              :title="cell.x + ',' + cell.y"
            >
              <span class="simple-map-editor-hex-bonuses" v-if="cell.bonus.length > 0">
                <i
                  v-for="(item, bi) in groupedBonus(cell.bonus)"
                  :key="bi"
                  class="simple-map-editor-hex-bonus"
                  :class="'board-space-bonus--' + bonusCss(item.bonus)"
                ></i>
              </span>
            </button>
          </div>
        </div>

        <label class="simple-map-editor-code">
          <span v-i18n>Map code</span>
          <textarea readonly rows="3" :value="code" @focus="($event.target as HTMLTextAreaElement).select()"></textarea>
        </label>
        <div class="simple-map-editor-actions">
          <button type="button" @click="copyCode" v-i18n>Copy code</button>
          <input type="text" v-model="loadInput" placeholder="Paste a TMBS1… code" class="simple-map-editor-load-input">
          <button type="button" @click="loadCode" v-i18n>Load</button>
          <button type="button" class="simple-map-editor-play" @click="play" v-i18n>Play with this map</button>
        </div>
        <div v-if="loadError" class="simple-map-editor-error">{{ loadError }}</div>

        <details class="simple-map-editor-export">
          <summary v-i18n>Copy as default board source</summary>
          <p class="simple-map-editor-tools-note" v-i18n>
            Paste this into {{ boardType === 'moon' ? 'MoonBoard.ts' : 'VenusSurfaceBoard.ts' }}'s own hard-coded default layout, replacing the existing b.row(...) calls.
          </p>
          <textarea readonly rows="8" :value="exportSource" @focus="($event.target as HTMLTextAreaElement).select()"></textarea>
        </details>
      </div>
    </div>

    <div class="simple-map-editor-preview">
      <h3 v-i18n>Preview</h3>
      <div class="simple-map-editor-preview-zoom">
        <VenusSurfaceBoard v-if="boardType === 'venusPhase2'" :model="previewModel" tileView="show"/>
        <MoonBoard v-else :model="previewMoonModel" tileView="show"/>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import VenusSurfaceBoard from '@/client/components/venusPhase2/VenusSurfaceBoard.vue';
import MoonBoard from '@/client/components/moon/MoonBoard.vue';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceBonus} from '@/common/boards/SpaceBonus';
import {SpaceModel} from '@/common/models/SpaceModel';
import {VenusPhase2Model} from '@/common/models/VenusPhase2Model';
import {MoonModel} from '@/common/models/MoonModel';
import {
  MAX_SIMPLE_BOARD_NAME_LENGTH,
  SIMPLE_BOARD_SPACE_TYPES,
  SimpleBoardType,
  SimpleCustomBoardDefinition,
  SimpleCustomSpaceDef,
  blankSimpleBoard,
} from '@/common/boards/SimpleCustomBoardDefinition';
import {decodeSimpleBoard, encodeSimpleBoard} from '@/common/boards/simpleBoardCodec';
import {customSpaceId, customSpacePixel, customBoardPixelSize} from '@/common/boards/CustomBoardDefinition';
import {NamedMoonSpaces} from '@/common/moon/NamedMoonSpaces';
import {SpaceId, isSpaceId, safeCast} from '@/common/Types';
import {paths} from '@/common/app/paths';
import {groupSpaceBonuses, GroupedSpaceBonus} from '@/client/utils/spaceBonusIcon';

// Mirrors src/server/venusPhase2/VenusSurfaceBoard.ts's own VENUS_STRATOPOLIS/VENUS_MAXWELL_BASE
// constants -- duplicated here (as literal ids, not an import) because that file is server-only;
// this client component only needs the ids to build stub preview entries, never the board logic.
const VENUS_STRATOPOLIS: SpaceId = safeCast('298', isSpaceId);
const VENUS_MAXWELL_BASE: SpaceId = safeCast('299', isSpaceId);

type BonusTool = {key: string, bonus: SpaceBonus, css: string, label: string, description: string};

const MOON_BONUS_TOOLS: Array<BonusTool> = [
  {key: 'bonus:' + SpaceBonus.STEEL, bonus: SpaceBonus.STEEL, css: 'steel', label: 'Steel', description: 'Gain 1 steel when you place a tile on this space.'},
  {key: 'bonus:' + SpaceBonus.TITANIUM, bonus: SpaceBonus.TITANIUM, css: 'titanium', label: 'Titanium', description: 'Gain 1 titanium when you place a tile on this space.'},
  {key: 'bonus:' + SpaceBonus.DRAW_CARD, bonus: SpaceBonus.DRAW_CARD, css: 'card', label: 'Card', description: 'Draw 1 card when you place a tile on this space.'},
];

const BONUS_TOOLS_BY_BOARD: Record<SimpleBoardType, Array<BonusTool>> = {
  moon: MOON_BONUS_TOOLS,
  venusPhase2: [],
};

const TERRAIN_LABELS: Record<SpaceType, {label: string, description: string}> = {
  [SpaceType.LAND]: {label: 'Land', description: 'Open surface.'},
  [SpaceType.LUNAR_MINE]: {label: 'Mine', description: 'Only mine tiles may be placed here.'},
  [SpaceType.GASLIGHT]: {label: 'Gaslight', description: 'Only Gas Mine tiles may be placed here.'},
} as Record<SpaceType, {label: string, description: string}>;

const MAX_HEX_BONUSES = 8;

export default defineComponent({
  name: 'SimpleMapEditor',
  components: {VenusSurfaceBoard, MoonBoard},
  props: {
    boardType: {
      type: String as PropType<SimpleBoardType>,
      required: true,
    },
  },
  data() {
    const def = blankSimpleBoard(this.boardType, this.boardType === 'moon' ? 'My Moon' : 'My Venus');
    return {
      name: def.name,
      grid: def.spaces,
      tool: 'type:' + SIMPLE_BOARD_SPACE_TYPES[this.boardType][0],
      loadInput: '',
      loadError: '',
      MAX_SIMPLE_BOARD_NAME_LENGTH,
    };
  },
  computed: {
    paths: () => paths,
    title(): string {
      return this.boardType === 'moon' ? 'Moon Map Editor' : 'Venus Phase 2 Map Editor';
    },
    terrainTools(): Array<{key: string, spaceType: SpaceType, label: string, description: string}> {
      return SIMPLE_BOARD_SPACE_TYPES[this.boardType].map((spaceType) => ({
        key: 'type:' + spaceType,
        spaceType,
        ...TERRAIN_LABELS[spaceType],
      }));
    },
    bonusTools(): Array<BonusTool> {
      return BONUS_TOOLS_BY_BOARD[this.boardType];
    },
    currentToolHint(): string {
      if (this.tool === 'bonus:clear') {
        return 'Remove every bonus from the hex you click.';
      }
      const all = [...this.terrainTools, ...this.bonusTools];
      return all.find((t) => t.key === this.tool)?.description ?? '';
    },
    definition(): SimpleCustomBoardDefinition {
      return {
        version: 1,
        boardType: this.boardType,
        name: this.name.slice(0, MAX_SIMPLE_BOARD_NAME_LENGTH),
        spaces: this.grid,
      };
    },
    code(): string {
      return encodeSimpleBoard(this.definition);
    },
    previewModel(): VenusPhase2Model {
      // The reserved Stratopolis/Maxwell Base spots are always present in a real game (gated by
      // the Venus expansion, not by this editable definition) -- included here as fixed stubs
      // purely so the preview looks like a real board; VenusSurfaceBoard.vue itself renders them
      // generically (filtered by SpaceType.COLONY), so this is optional for it not to crash,
      // unlike Moon's reserved spaces below.
      const reserved: Array<SpaceModel> = [
        {id: VENUS_STRATOPOLIS, x: -1, y: -1, spaceType: SpaceType.COLONY, bonus: []},
        {id: VENUS_MAXWELL_BASE, x: -1, y: -1, spaceType: SpaceType.COLONY, bonus: []},
      ];
      return {spaces: [...reserved, ...this.grid.map((s, i): SpaceModel => this.toSpaceModel(s, i))]};
    },
    previewMoonModel(): MoonModel {
      // Unlike VenusSurfaceBoard.vue, MoonBoard.vue's own template unconditionally looks up
      // 'm01'/'m37' by id -- it crashes without these two stub reserved spaces present, since
      // they're always there in a real game regardless of this editable definition.
      const reserved: Array<SpaceModel> = [
        {id: NamedMoonSpaces.LUNA_TRADE_STATION, x: -1, y: -1, spaceType: SpaceType.COLONY, bonus: []},
        {id: NamedMoonSpaces.MOMENTUM_VIRIUM, x: -1, y: -1, spaceType: SpaceType.COLONY, bonus: []},
      ];
      return {
        spaces: [...reserved, ...this.grid.map((s, i): SpaceModel => this.toSpaceModel(s, i))],
        habitatRate: 0,
        miningRate: 0,
        logisticRate: 0,
      };
    },
    gridStyle(): Record<string, string> {
      const maxY = Math.max(...this.grid.map((s) => s.y));
      const maxX = Math.max(...this.grid.map((s) => s.x));
      const {width, height} = customBoardPixelSize(maxX, maxY);
      return {width: `${width}px`, height: `${height}px`};
    },
    exportSource(): string {
      const maxY = Math.max(...this.grid.map((s) => s.y));
      const rows: Array<Array<SimpleCustomSpaceDef>> = [];
      for (let y = 0; y <= maxY; y++) {
        rows.push(this.grid.filter((s) => s.y === y));
      }
      const tool = (space: SimpleCustomSpaceDef): string => {
        const method = space.spaceType === SpaceType.LAND ? 'land' :
          space.spaceType === SpaceType.LUNAR_MINE ? 'mine' : 'gaslight';
        const bonusArgs = space.bonus.map((b) => `SpaceBonus.${SpaceBonus[b]}`).join(', ');
        return `.${method}(${bonusArgs})`;
      };
      const lines = rows.map((row) => {
        const startX = row.length > 0 ? row[0].x : 0;
        return `b.row(${startX})${row.map(tool).join('')};`;
      });
      return lines.join('\n');
    },
  },
  methods: {
    toSpaceModel(s: SimpleCustomSpaceDef, i: number): SpaceModel {
      return {id: customSpaceId(i), x: s.x, y: s.y, spaceType: s.spaceType, bonus: s.bonus};
    },
    paint(index: number): void {
      const space = this.grid[index];
      if (this.tool.startsWith('type:')) {
        space.spaceType = this.tool.slice(5) as SpaceType;
      } else if (this.tool === 'bonus:clear') {
        space.bonus = [];
      } else if (this.tool.startsWith('bonus:')) {
        if (space.bonus.length < MAX_HEX_BONUSES) {
          space.bonus.push(Number(this.tool.slice(6)) as SpaceBonus);
        }
      }
      this.grid = [...this.grid];
    },
    removeLastBonus(index: number): void {
      const space = this.grid[index];
      if (space.bonus.length === 0) {
        return;
      }
      space.bonus.pop();
      this.grid = [...this.grid];
    },
    hexStyle(cell: SimpleCustomSpaceDef): Record<string, string> {
      const maxY = Math.max(...this.grid.map((s) => s.y));
      const p = customSpacePixel(cell.x, cell.y, maxY);
      return {left: `${p.left}px`, top: `${p.top}px`};
    },
    bonusCss(bonus: SpaceBonus): string {
      return this.bonusTools.find((t) => t.bonus === bonus)?.css ?? '';
    },
    groupedBonus(bonus: Array<SpaceBonus>): Array<GroupedSpaceBonus> {
      return groupSpaceBonuses(bonus);
    },
    copyCode(): void {
      navigator.clipboard?.writeText(this.code);
    },
    loadCode(): void {
      this.loadError = '';
      try {
        const def = decodeSimpleBoard(this.loadInput.trim());
        if (def.boardType !== this.boardType) {
          throw new Error(`That code is for ${def.boardType}, not ${this.boardType}.`);
        }
        this.name = def.name;
        this.grid = def.spaces.map((s) => ({...s, bonus: [...s.bonus]}));
        this.loadInput = '';
      } catch (e) {
        this.loadError = e instanceof Error ? e.message : String(e);
      }
    },
    play(): void {
      const key = this.boardType === 'moon' ? 'customMoonBoardCode' : 'customVenusSurfaceBoardCode';
      try {
        window.localStorage?.setItem(key, this.code);
      } catch (e) {
        // localStorage may be unavailable; fall through -- CreateGameForm.vue's own field lets
        // the code be pasted in manually instead.
      }
      window.location.href = `${paths.NEW_GAME}?${key}=1`;
    },
  },
});
</script>

<style scoped lang="less">
.simple-map-editor {
  padding: 20px;
  color: #ddd;

  h1 { color: #fff; }
  .simple-map-editor-board-nav {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
    a {
      color: #cfc9e6;
      font-size: 13px;
      text-decoration: underline;
      &:hover { color: #fff; }
    }
  }
  .simple-map-editor-note { font-size: 12px; color: #999; max-width: 640px; }

  .simple-map-editor-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .simple-map-editor-controls {
    width: 260px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .simple-map-editor-field {
    display: flex;
    align-items: center;
    gap: 8px;
    input[type=text] { flex: 1; }
  }

  fieldset {
    border: 1px solid #444;
    border-radius: 4px;
    padding: 8px;
    legend { padding: 0 4px; }
    label { display: block; font-size: 13px; }
  }

  .simple-map-editor-tools label {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 1px 0;
    cursor: help;
  }
  .simple-map-editor-tools-note {
    margin: 2px 0 6px;
    font-size: 11px;
    color: #999;
  }
  .simple-map-editor-tool-hint {
    min-height: 30px;
    margin: 0;
    padding: 6px 8px;
    font-size: 12px;
    color: #cfc9e6;
    background: #2a2733;
    border-radius: 4px;
  }

  .simple-map-editor-swatch {
    display: inline-block;
    width: 16px;
    height: 16px;
    border-radius: 3px;
    flex: 0 0 16px;
  }
  .simple-map-editor-swatch--land { background: #8a6d3b; }
  .simple-map-editor-swatch--lunar_mine { background: #6b6b78; }
  .simple-map-editor-swatch--gaslight { background: #e6be28; }

  .simple-map-editor-bonus-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: contain !important;
  }
  .simple-map-editor-bonus-icon--clear {
    font-style: normal;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: #e74c3c;
  }

  .simple-map-editor-canvas {
    flex: 1;
    min-width: 420px;
  }

  .simple-map-editor-grid-wrap {
    display: flex;
    justify-content: center;
    background: #15131f;
    border-radius: 6px;
    overflow: auto;
    max-height: 60vh;
    padding: 20px;
  }
  .simple-map-editor-grid {
    position: relative;
    flex: 0 0 auto;
  }

  .simple-map-editor-hex {
    position: absolute;
    width: 46px;
    height: 51px;
    border: none;
    padding: 0;
    cursor: pointer;
    clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);
    &:hover { filter: brightness(1.25); }
  }

  .simple-map-editor-hex-bonuses {
    display: flex;
    flex-wrap: wrap;
    place-content: center;
    gap: 1px;
    width: 100%;
    height: 100%;
  }
  .simple-map-editor-hex-bonus {
    display: inline-block;
    width: 13px;
    height: 13px;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: contain !important;
  }

  .simple-map-editor-code {
    display: block;
    margin-top: 12px;
    textarea { width: 100%; font-family: monospace; }
  }

  .simple-map-editor-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
    .simple-map-editor-load-input { flex: 1; min-width: 160px; }
    .simple-map-editor-play { margin-left: auto; font-weight: bold; }
  }

  .simple-map-editor-error { color: #e74c3c; margin-top: 6px; }

  .simple-map-editor-export {
    margin-top: 12px;
    textarea { width: 100%; font-family: monospace; margin-top: 6px; }
  }

  .simple-map-editor-preview {
    margin-top: 24px;
    h3 { color: #fff; }
  }
  .simple-map-editor-preview-zoom {
    zoom: 1.6;
    width: fit-content;
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>
