<template>
  <div class="map-editor">
    <h1 v-i18n>Custom Map Editor</h1>

    <div class="map-editor-layout">
      <div class="map-editor-controls">
        <label class="map-editor-field">
          <span v-i18n>Name</span>
          <input type="text" v-model="name" :maxlength="MAX_CUSTOM_NAME_LENGTH">
        </label>

        <label class="map-editor-field">
          <span v-i18n>Rows</span>
          <button type="button" @click="changeRows(-2)" :disabled="rows <= MIN_CUSTOM_ROWS">−</button>
          <span>{{ rows }}</span>
          <button type="button" @click="changeRows(2)" :disabled="rows >= MAX_CUSTOM_ROWS">+</button>
        </label>

        <fieldset class="map-editor-tools">
          <legend v-i18n>Terrain</legend>
          <label v-for="t in terrainTools" :key="t.key" :title="t.description">
            <input type="radio" name="tool" :value="t.key" v-model="tool">
            <span>{{ t.label }}</span>
          </label>
        </fieldset>

        <fieldset class="map-editor-tools">
          <legend v-i18n>Markers</legend>
          <label v-for="t in markerTools" :key="t.key" :title="t.description">
            <input type="radio" name="tool" :value="t.key" v-model="tool">
            <span>{{ t.label }}</span>
          </label>
        </fieldset>

        <fieldset class="map-editor-tools">
          <legend v-i18n>Placement bonuses</legend>
          <p class="map-editor-tools-note" v-i18n>Click a hex to add this bonus — bonuses stack, so click twice for two plants. Right-click a hex to remove its last bonus.</p>
          <label :title="'Remove every placement bonus from the hex you click.'">
            <input type="radio" name="tool" value="bonus:clear" v-model="tool">
            <i class="map-editor-bonus-icon map-editor-bonus-icon--clear">∅</i>
            <span v-i18n>Clear bonuses</span>
          </label>
          <label v-for="t in bonusTools" :key="t.key" :title="t.description">
            <input type="radio" name="tool" :value="t.key" v-model="tool">
            <i class="map-editor-bonus-icon" :class="'board-space-bonus--' + t.css"></i>
            <span>{{ t.label }}</span>
          </label>
        </fieldset>

        <p class="map-editor-tool-hint">{{ currentToolHint }}</p>

        <fieldset class="map-editor-ma">
          <legend v-i18n>Milestones (0 or 5)</legend>
          <label v-for="m in milestoneNames" :key="m">
            <input type="checkbox" :value="m" v-model="milestones" :disabled="!milestones.includes(m) && milestones.length >= 5"> {{ m }}
          </label>
        </fieldset>
        <fieldset class="map-editor-ma">
          <legend v-i18n>Awards (0 or 5)</legend>
          <label v-for="a in awardNames" :key="a">
            <input type="checkbox" :value="a" v-model="awards" :disabled="!awards.includes(a) && awards.length >= 5"> {{ a }}
          </label>
        </fieldset>

        <fieldset class="map-editor-params">
          <legend>
            <label>
              <input type="checkbox" v-model="customParams">
              <span v-i18n>Custom global parameters</span>
            </label>
            <span class="map-editor-early-testing" v-i18n>(Early testing &mdash; not finished)</span>
          </legend>
          <template v-if="customParams">
            <div v-for="key in trackKeys" :key="key" class="map-editor-track">
              <strong>{{ key }}</strong>
              min <input type="number" v-model.number="params[key].min">
              max <input type="number" v-model.number="params[key].max">
              step <input type="number" v-model.number="params[key].step" min="1">
              <div v-for="(bonus, i) in params[key].bonuses" :key="i" class="map-editor-bump">
                @<input type="number" v-model.number="bonus.value">
                <select v-model="bonus.kind">
                  <option v-for="k in bonusKinds" :key="k" :value="k">{{ k }}</option>
                </select>
                <input v-if="bonusHasAmount(bonus.kind)" type="number" v-model.number="bonus.amount" min="1">
                <button type="button" @click="params[key].bonuses.splice(i, 1)">✕</button>
              </div>
              <button type="button" @click="params[key].bonuses.push({value: 0, kind: 'ocean'})" v-i18n>+ bump</button>
            </div>
            <label>ocean tiles max <input type="number" v-model.number="params.oceans.max"></label>
            <label>heat per temperature step <input type="number" v-model.number="params.heatForTemperature" min="1"></label>
          </template>
        </fieldset>

        <fieldset class="map-editor-params">
          <legend v-i18n>Placement bonus costs</legend>
          <p class="map-editor-tools-note" v-i18n>What placing a tile on an ocean/temperature/colony bonus space costs, in M€. Only matters if you've painted that bonus onto a hex.</p>
          <label :title="'Cost of the ocean placement bonus (Hellas is 6).'">
            <span v-i18n>Ocean bonus</span>
            <input type="number" v-model.number="bonusCostOcean" min="0">
          </label>
          <label :title="'Cost of the temperature placement bonus (Vastitas Borealis is 3).'">
            <span v-i18n>Temperature bonus</span>
            <input type="number" v-model.number="bonusCostTemperature" min="0">
          </label>
          <label :title="'Cost of the colony placement bonus (Terra Cimmeria Nova is 5).'">
            <span v-i18n>Colony bonus</span>
            <input type="number" v-model.number="bonusCostColony" min="0">
          </label>
        </fieldset>
      </div>

      <div class="map-editor-canvas">
        <div class="map-editor-grid" :style="gridStyle">
          <button
            v-for="cell in cells"
            :key="cell.x + ',' + cell.y"
            type="button"
            class="map-editor-hex"
            :class="hexClass(cell)"
            :style="hexStyle(cell)"
            @click="paint(cell)"
            @contextmenu.prevent="removeLastBonus(cell)"
            :title="cell.x + ',' + cell.y"
          >
            <span class="map-editor-hex-bonuses" v-if="cell.space">
              <i
                v-for="(item, i) in groupedBonus(cell.space.bonus)"
                :key="i"
                class="map-editor-hex-bonus"
                :class="'board-space-bonus--' + bonusCss(item.bonus)"
              ><b v-if="item.bonus === SpaceBonus.MEGACREDITS" class="map-editor-hex-bonus-count">{{ item.count }}</b></i>
            </span>
          </button>
        </div>

        <div v-if="warnings.length" class="map-editor-warnings">
          <div v-for="(w, i) in warnings" :key="i">⚠ {{ w }}</div>
        </div>

        <label class="map-editor-code">
          <span v-i18n>Map code</span>
          <textarea readonly rows="3" :value="code" @focus="($event.target as HTMLTextAreaElement).select()"></textarea>
        </label>
        <div class="map-editor-actions">
          <button type="button" @click="copyCode" v-i18n>Copy code</button>
          <input type="text" v-model="loadInput" placeholder="Paste a TMB3… code" class="map-editor-load-input">
          <button type="button" @click="loadCode" v-i18n>Load</button>
          <button type="button" class="map-editor-play" @click="play" v-i18n>Play with this map</button>
        </div>
        <div v-if="loadError" class="map-editor-error">{{ loadError }}</div>
      </div>
    </div>

    <div class="map-editor-preview">
      <h3 v-i18n>Preview</h3>
      <Board
        :spaces="previewSpaces"
        :expansions="expansions"
        :venusScaleLevel="0"
        :boardName="BoardName.CUSTOM"
        :globalParameters="definition.globalParameters"
        :customBoardRows="rows"
        tileView="show"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import Board from '@/client/components/Board.vue';
import {BoardName} from '@/common/boards/BoardName';
import {DEFAULT_EXPANSIONS} from '@/common/cards/GameModule';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceBonus} from '@/common/boards/SpaceBonus';
import {SpaceModel} from '@/common/models/SpaceModel';
import {milestoneNames, MilestoneName} from '@/common/ma/MilestoneName';
import {awardNames, AwardName} from '@/common/ma/AwardName';
import {DEFAULT_GLOBAL_PARAMETERS, GlobalParametersConfig, ParameterBonus} from '@/common/GlobalParameterConfig';
import {
  CustomBoardDefinition,
  CustomSpaceDef,
  MAX_CUSTOM_NAME_LENGTH,
  MAX_CUSTOM_ROWS,
  MIN_CUSTOM_ROWS,
  customSpaceId,
  customSpacePixel,
  hexRowLayout,
} from '@/common/boards/CustomBoardDefinition';
import {decodeCustomBoard, encodeCustomBoard, validateCustomBoard} from '@/common/boards/customBoardCodec';
import {paths} from '@/common/app/paths';
import {HELLAS_BONUS_OCEAN_COST, VASTITAS_BOREALIS_BONUS_TEMPERATURE_COST, TERRA_CIMMERIA_COLONY_COST} from '@/common/constants';
import {groupSpaceBonuses, GroupedSpaceBonus} from '@/client/utils/spaceBonusIcon';

type Cell = {x: number, y: number, space: CustomSpaceDef | null};

type EditableBonus = {value: number, kind: ParameterBonus['kind'], amount?: number};
type EditableTrack = {min: number, max: number, step: number, bonuses: Array<EditableBonus>};
type EditableParams = {
  temperature: EditableTrack,
  oxygen: EditableTrack,
  venus: EditableTrack,
  oceans: {max: number},
  heatForTemperature: number,
};

function toEditableParams(config: GlobalParametersConfig): EditableParams {
  const track = (t: GlobalParametersConfig['temperature']): EditableTrack => ({
    min: t.min, max: t.max, step: t.step,
    bonuses: t.bonuses.map((b) => ({value: b.value, kind: b.kind, amount: 'amount' in b ? b.amount : undefined})),
  });
  return {
    temperature: track(config.temperature),
    oxygen: track(config.oxygen),
    venus: track(config.venus),
    oceans: {max: config.oceans.max},
    heatForTemperature: config.heatForTemperature,
  };
}

function toParametersConfig(p: EditableParams): GlobalParametersConfig {
  const track = (t: EditableTrack): GlobalParametersConfig['temperature'] => ({
    min: t.min, max: t.max, step: t.step,
    bonuses: t.bonuses.map((b): ParameterBonus =>
      (b.kind === 'ocean' || b.kind === 'temperature') ?
        {value: b.value, kind: b.kind} :
        {value: b.value, kind: b.kind, amount: b.amount ?? 1}),
  });
  return {
    temperature: track(p.temperature),
    oxygen: track(p.oxygen),
    venus: track(p.venus),
    oceans: {max: p.oceans.max},
    heatForTemperature: p.heatForTemperature,
  };
}

type Tool = {key: string, label: string, description: string};
type BonusTool = Tool & {bonus: SpaceBonus, css: string};

const TERRAIN_TOOLS: Array<Tool> = [
  {key: 'type:' + SpaceType.LAND, label: 'Land', description: 'Ordinary ground. Cities, greeneries and most special tiles go here.'},
  {key: 'type:' + SpaceType.OCEAN, label: 'Ocean', description: 'Only ocean tiles may be placed here, and they count toward the ocean track.'},
  {key: 'type:' + SpaceType.COVE, label: 'Cove', description: 'Counts as both a land space and an ocean space (Pathfinders).'},
  {key: 'type:' + SpaceType.DEFLECTION_ZONE, label: 'Deflection zone', description: 'Behaves as land, and is tracked separately for the Hollandia deflection-zone rule.'},
];

const MARKER_TOOLS: Array<Tool> = [
  {key: 'flag:volcanic', label: 'Volcanic', description: 'Toggles the volcanic flag: volcanic-only placements (Lava Flows, etc.) may go here.'},
  {key: 'flag:reserved', label: 'Reserve for Noctis City', description: 'Marks the space that the Noctis City card places its city on; excluded from all other tile placement.'},
  {key: 'flag:void', label: 'Void (no hex)', description: 'Removes the hex from the board entirely — use it to carve the outline or punch a hole. (This replaces the old "restricted" type for practical purposes.)'},
];

const BONUS_TOOLS: Array<BonusTool> = ([
  {bonus: SpaceBonus.MEGACREDITS, css: 'megacredit', label: 'M€', description: 'Gain 1 M€ when you place a tile on this space.'},
  {bonus: SpaceBonus.PLANT, css: 'plant', label: 'Plant', description: 'Gain 1 plant when you place a tile on this space.'},
  {bonus: SpaceBonus.STEEL, css: 'steel', label: 'Steel', description: 'Gain 1 steel when you place a tile on this space.'},
  {bonus: SpaceBonus.TITANIUM, css: 'titanium', label: 'Titanium', description: 'Gain 1 titanium when you place a tile on this space.'},
  {bonus: SpaceBonus.DRAW_CARD, css: 'card', label: 'Card', description: 'Draw 1 card when you place a tile on this space.'},
  {bonus: SpaceBonus.HEAT, css: 'heat', label: 'Heat', description: 'Gain 1 heat when you place a tile on this space.'},
  {bonus: SpaceBonus.ENERGY, css: 'energy', label: 'Energy', description: 'Gain 1 energy when you place a tile on this space.'},
  {bonus: SpaceBonus.MICROBE, css: 'microbe', label: 'Microbe', description: 'Add 1 microbe to a card when you place a tile on this space (Arabia Terra).'},
  {bonus: SpaceBonus.ANIMAL, css: 'animal', label: 'Animal', description: 'Add 1 animal to a card when you place a tile on this space (Amazonis).'},
  {bonus: SpaceBonus.DATA, css: 'data', label: 'Data', description: 'Add 1 data to a card when you place a tile on this space (Arabia Terra).'},
  {bonus: SpaceBonus.SCIENCE, css: 'science', label: 'Science', description: 'Add 1 science resource to a card when you place a tile on this space (Arabia Terra).'},
  {bonus: SpaceBonus.ENERGY_PRODUCTION, css: 'energy-production', label: 'Energy prod.', description: 'Increase your energy production 1 step when you place a tile on this space.'},
  {bonus: SpaceBonus.DELEGATE, css: 'delegate', label: 'Delegate', description: 'Add 1 delegate from the reserve when you place a tile on this space (Vastitas Borealis Nova).'},
  {bonus: SpaceBonus.OCEAN, css: 'bonusocean', label: 'Ocean', description: 'Place an ocean tile (paying its M€ cost) when you place a tile on this space — the Hellas south-pole bonus.'},
  {bonus: SpaceBonus.TEMPERATURE, css: 'bonustemperature', label: 'Temperature', description: 'Raise the temperature 1 step (paying an M€ cost) when you place a tile on this space (Vastitas Borealis).'},
  {bonus: SpaceBonus.COLONY, css: 'colony', label: 'Colony', description: 'Build a colony (paying an M€ cost) when you place a tile on this space (Terra Cimmeria Nova).'},
] as Array<Omit<BonusTool, 'key'>>).map((t) => ({...t, key: 'bonus:' + t.bonus}));

const BONUS_CSS: Partial<Record<SpaceBonus, string>> = Object.fromEntries(BONUS_TOOLS.map((t) => [t.bonus, t.css]));

/** Guard against a runaway click-fest; real boards never exceed a handful. */
const MAX_HEX_BONUSES = 8;

export default defineComponent({
  name: 'MapEditor',
  components: {Board},
  data() {
    const rows = 9;
    return {
      name: 'My Map',
      rows,
      grid: buildGrid(rows, null),
      tool: 'type:ocean',
      milestones: [] as Array<MilestoneName>,
      awards: [] as Array<AwardName>,
      customParams: false,
      params: toEditableParams(DEFAULT_GLOBAL_PARAMETERS),
      bonusCostOcean: HELLAS_BONUS_OCEAN_COST,
      bonusCostTemperature: VASTITAS_BOREALIS_BONUS_TEMPERATURE_COST,
      bonusCostColony: TERRA_CIMMERIA_COLONY_COST,
      loadInput: '',
      loadError: '',
      expansions: DEFAULT_EXPANSIONS,
      MAX_CUSTOM_NAME_LENGTH,
      MAX_CUSTOM_ROWS,
      MIN_CUSTOM_ROWS,
      terrainTools: TERRAIN_TOOLS,
      markerTools: MARKER_TOOLS,
      bonusTools: BONUS_TOOLS,
      bonusKinds: ['ocean', 'temperature', 'heatProduction', 'card', 'tr'] as Array<ParameterBonus['kind']>,
      milestoneNames,
      awardNames,
    };
  },
  computed: {
    BoardName(): typeof BoardName {
      return BoardName;
    },
    SpaceBonus(): typeof SpaceBonus {
      return SpaceBonus;
    },
    trackKeys(): Array<'temperature' | 'oxygen' | 'venus'> {
      return ['temperature', 'oxygen', 'venus'];
    },
    currentToolHint(): string {
      if (this.tool === 'bonus:clear') {
        return 'Remove every placement bonus from the hex you click.';
      }
      const all: Array<Tool> = [...TERRAIN_TOOLS, ...MARKER_TOOLS, ...BONUS_TOOLS];
      return all.find((t) => t.key === this.tool)?.description ?? '';
    },
    cells(): Array<Cell> {
      const out: Array<Cell> = [];
      for (const row of hexRowLayout(this.rows)) {
        for (let i = 0; i < row.width; i++) {
          const x = row.xOffset + i;
          out.push({x, y: row.y, space: this.grid.get(`${x},${row.y}`) ?? null});
        }
      }
      return out;
    },
    definition(): CustomBoardDefinition {
      const spaces: Array<CustomSpaceDef> = [];
      for (const cell of this.cells) {
        if (cell.space === null) {
          continue;
        }
        spaces.push({...cell.space, id: customSpaceId(spaces.length), x: cell.x, y: cell.y, bonus: [...cell.space.bonus]});
      }
      const def: CustomBoardDefinition = {
        version: 1,
        name: this.name.slice(0, MAX_CUSTOM_NAME_LENGTH),
        rows: this.rows,
        spaces,
        milestones: [...this.milestones],
        awards: [...this.awards],
      };
      if (this.customParams) {
        def.globalParameters = toParametersConfig(this.params);
      }
      // Only carry costs that differ from the official defaults, so an unmodified map's code
      // matches blankCustomBoard() exactly.
      if (this.bonusCostOcean !== HELLAS_BONUS_OCEAN_COST ||
          this.bonusCostTemperature !== VASTITAS_BOREALIS_BONUS_TEMPERATURE_COST ||
          this.bonusCostColony !== TERRA_CIMMERIA_COLONY_COST) {
        def.placementBonusCosts = {
          ocean: this.bonusCostOcean,
          temperature: this.bonusCostTemperature,
          colony: this.bonusCostColony,
        };
      }
      return def;
    },
    code(): string {
      return encodeCustomBoard(this.definition);
    },
    warnings(): Array<string> {
      return validateCustomBoard(this.definition);
    },
    previewSpaces(): Array<SpaceModel> {
      return this.definition.spaces.map((s) => ({
        id: s.id,
        x: s.x,
        y: s.y,
        spaceType: s.spaceType,
        bonus: s.bonus,
        color: undefined,
        highlight: s.reserved ? 'noctis' : undefined,
        tileType: undefined,
      }));
    },
    gridStyle(): Record<string, string> {
      const maxY = this.rows - 1;
      let minL = Infinity;
      let minT = Infinity;
      let maxL = -Infinity;
      let maxT = -Infinity;
      for (const row of hexRowLayout(this.rows)) {
        for (let i = 0; i < row.width; i++) {
          const p = customSpacePixel(row.xOffset + i, row.y, maxY);
          minL = Math.min(minL, p.left);
          minT = Math.min(minT, p.top);
          maxL = Math.max(maxL, p.left);
          maxT = Math.max(maxT, p.top);
        }
      }
      // Scale/position mars-without-venus.png (620x600) so its painted diamond -- hex box
      // [6,444]x[34,413] within #main_board, offset (93,85) in the image -- lands under the
      // editor's hex bounding box, so the backdrop lines up with the hexes as in the preview.
      const img = {left: 99, top: 119, width: 438, height: 379};
      const sx = ((maxL - minL) + 46) / img.width;
      const sy = ((maxT - minT) + 51) / img.height;
      const bgX = (minL - img.left * sx).toFixed(1);
      const bgY = (minT - img.top * sy).toFixed(1);
      return {
        width: `${maxL + 90}px`,
        height: `${maxT + 90}px`,
        background:
          'linear-gradient(rgba(21, 19, 31, 0.55), rgba(21, 19, 31, 0.55)) local, ' +
          `url("/assets/board/mars-without-venus.png") local no-repeat ${bgX}px ${bgY}px / ${(620 * sx).toFixed(1)}px ${(600 * sy).toFixed(1)}px, ` +
          '#15131f',
      };
    },
  },
  methods: {
    changeRows(delta: number): void {
      const next = this.rows + delta;
      if (next < MIN_CUSTOM_ROWS || next > MAX_CUSTOM_ROWS) {
        return;
      }
      this.rows = next;
      this.grid = buildGrid(next, this.grid);
    },
    paint(cell: Cell): void {
      const key = `${cell.x},${cell.y}`;
      if (this.tool === 'flag:void') {
        this.grid.set(key, cell.space === null ? blankSpace(cell.x, cell.y) : null);
        return;
      }
      let space = cell.space;
      if (space === null) {
        space = blankSpace(cell.x, cell.y);
        this.grid.set(key, space);
      }
      if (this.tool.startsWith('type:')) {
        space.spaceType = this.tool.slice(5) as SpaceType;
      } else if (this.tool === 'flag:volcanic') {
        space.volcanic = !space.volcanic;
      } else if (this.tool === 'flag:reserved') {
        space.reserved = !space.reserved;
      } else if (this.tool === 'bonus:clear') {
        space.bonus = [];
      } else if (this.tool.startsWith('bonus:')) {
        // Bonuses stack: each click appends. Any combination is allowed, up to a sane cap.
        if (space.bonus.length < MAX_HEX_BONUSES) {
          space.bonus.push(Number(this.tool.slice(6)) as SpaceBonus);
        }
      }
      // Force reactivity for the nested object mutation.
      this.grid = new Map(this.grid);
    },
    removeLastBonus(cell: Cell): void {
      if (cell.space === null || cell.space.bonus.length === 0) {
        return;
      }
      cell.space.bonus.pop();
      this.grid = new Map(this.grid);
    },
    hexClass(cell: Cell): Record<string, boolean> {
      const space = cell.space;
      if (space === null) {
        return {'map-editor-hex--void': true};
      }
      const isCove = space.spaceType === SpaceType.COVE;
      const volcanicLand = space.volcanic === true && !isCove && space.spaceType !== SpaceType.OCEAN;
      return {
        // Reuse the real board sprites (board.less) so terrain reads the same as in a game.
        'board-space-type-ocean': space.spaceType === SpaceType.OCEAN && space.volcanic !== true,
        'board-space-type-volcanic-cove': isCove && space.volcanic === true,
        'board-space-type-cove': isCove && space.volcanic !== true,
        'board-space-type-deflection-zone': space.spaceType === SpaceType.DEFLECTION_ZONE,
        // The land-volcanic sprite is an overlay used together with land, as on the real board.
        'board-space-type-land': (space.spaceType === SpaceType.LAND && space.volcanic !== true) || volcanicLand,
        'board-space-type-land-volcanic': volcanicLand,
        'map-editor-hex--restricted': space.spaceType === SpaceType.RESTRICTED,
        'map-editor-hex--reserved': space.reserved === true,
      };
    },
    hexStyle(cell: Cell): Record<string, string> {
      const maxY = this.rows - 1;
      const p = customSpacePixel(cell.x, cell.y, maxY);
      return {left: `${p.left}px`, top: `${p.top}px`};
    },
    bonusCss(bonus: SpaceBonus): string {
      return BONUS_CSS[bonus] ?? '';
    },
    groupedBonus(bonus: Array<SpaceBonus>): Array<GroupedSpaceBonus> {
      return groupSpaceBonuses(bonus);
    },
    bonusHasAmount(kind: ParameterBonus['kind']): boolean {
      return kind === 'heatProduction' || kind === 'card' || kind === 'tr';
    },
    copyCode(): void {
      navigator.clipboard?.writeText(this.code);
    },
    loadCode(): void {
      this.loadError = '';
      try {
        this.applyDefinition(decodeCustomBoard(this.loadInput.trim()));
        this.loadInput = '';
      } catch (e) {
        this.loadError = e instanceof Error ? e.message : String(e);
      }
    },
    applyDefinition(def: CustomBoardDefinition): void {
      this.name = def.name;
      this.rows = def.rows;
      // Start every bounding-hexagon cell as a void; only the cells the code lists are filled.
      const grid = new Map<string, CustomSpaceDef | null>();
      for (const row of hexRowLayout(def.rows)) {
        for (let i = 0; i < row.width; i++) {
          grid.set(`${row.xOffset + i},${row.y}`, null);
        }
      }
      for (const s of def.spaces) {
        grid.set(`${s.x},${s.y}`, {...s, bonus: [...s.bonus]});
      }
      this.grid = grid;
      this.milestones = [...def.milestones];
      this.awards = [...def.awards];
      this.customParams = def.globalParameters !== undefined;
      this.params = toEditableParams(def.globalParameters ?? DEFAULT_GLOBAL_PARAMETERS);
      this.bonusCostOcean = def.placementBonusCosts?.ocean ?? HELLAS_BONUS_OCEAN_COST;
      this.bonusCostTemperature = def.placementBonusCosts?.temperature ?? VASTITAS_BOREALIS_BONUS_TEMPERATURE_COST;
      this.bonusCostColony = def.placementBonusCosts?.colony ?? TERRA_CIMMERIA_COLONY_COST;
    },
    play(): void {
      try {
        window.localStorage?.setItem('customBoardCode', this.code);
      } catch (e) {
        // localStorage may be unavailable; fall through to the query param.
      }
      window.location.href = `${paths.NEW_GAME}?customBoard=1`;
    },
  },
});

function blankSpace(x: number, y: number): CustomSpaceDef {
  return {id: customSpaceId(0), x, y, spaceType: SpaceType.LAND, bonus: []};
}

function buildGrid(rows: number, previous: Map<string, CustomSpaceDef | null> | null): Map<string, CustomSpaceDef | null> {
  const grid = new Map<string, CustomSpaceDef | null>();
  for (const row of hexRowLayout(rows)) {
    for (let i = 0; i < row.width; i++) {
      const x = row.xOffset + i;
      const key = `${x},${row.y}`;
      const prior = previous?.get(key);
      grid.set(key, prior === undefined ? blankSpace(x, row.y) : prior);
    }
  }
  return grid;
}
</script>

<style scoped lang="less">
.map-editor {
  padding: 20px;
  color: #ddd;

  h1 { color: #fff; }

  .map-editor-layout {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .map-editor-controls {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .map-editor-field {
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

  .map-editor-tools label {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 1px 0;
    cursor: help;
  }
  .map-editor-params {
    legend { display: flex; align-items: baseline; gap: 6px; }
    label { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    input[type=number] { width: 60px; }
  }
  .map-editor-early-testing {
    font-size: 11px;
    font-weight: normal;
    font-style: italic;
    color: #d9822b;
  }
  .map-editor-tools-note {
    margin: 2px 0 6px;
    font-size: 11px;
    color: #999;
  }
  .map-editor-tool-hint {
    min-height: 30px;
    margin: 0;
    padding: 6px 8px;
    font-size: 12px;
    color: #cfc9e6;
    background: #2a2733;
    border-radius: 4px;
  }

  // Reuse the real board bonus sprites (board.less) at palette / hex sizes.
  .map-editor-bonus-icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    flex: 0 0 20px;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: contain !important;
  }
  .map-editor-bonus-icon--clear {
    font-style: normal;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: #e74c3c;
  }

  .map-editor-ma {
    max-height: 160px;
    overflow-y: auto;
  }

  .map-editor-track {
    margin-bottom: 8px;
    input[type=number] { width: 52px; }
  }
  .map-editor-bump { margin-left: 12px; font-size: 12px; }

  .map-editor-canvas {
    flex: 1;
    min-width: 480px;
  }

  .map-editor-grid {
    position: relative;
    // The Mars backdrop is set inline (gridStyle) so it aligns with the hexes; this is a fallback.
    background: #15131f;
    border-radius: 6px;
    overflow: auto;
    max-height: 60vh;
  }

  // The hex's fill comes from the real board-space-type-* sprites (global, from board.less);
  // only layout, the void state and the reserved marker are styled here.
  .map-editor-hex {
    position: absolute;
    width: 46px;
    height: 51px;
    border: none;
    padding: 0;
    cursor: pointer;
    background-repeat: no-repeat;
    background-size: 46px 51px;
    clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);

    &:hover { filter: brightness(1.25); }

    // A void is an absence: nothing painted, so the dark grid shows straight through.
    // (No box-shadow here -- box-shadow is not clipped by clip-path and would draw a
    // square outline around the hex.)
    &--void {
      background: transparent;
      cursor: cell;
      &:hover { filter: none; background: rgba(255, 255, 255, 0.06); }
    }

    // RESTRICTED has no board sprite of its own.
    &--restricted { background-color: rgba(70, 70, 78, 0.85); }

    // Tint (not box-shadow, which isn't clipped) to mark a reserved space over its terrain.
    &--reserved { background-color: rgba(241, 196, 15, 0.55); }
  }

  .map-editor-hex-bonuses {
    display: flex;
    flex-wrap: wrap;
    place-content: center;
    gap: 1px;
    width: 100%;
    height: 100%;
  }
  .map-editor-hex-bonus {
    position: relative;
    display: inline-block;
    width: 13px;
    height: 13px;
    background-repeat: no-repeat !important;
    background-position: center !important;
    background-size: contain !important;
  }
  // Sits directly on top of the coin icon (matching Bonus.vue's board-space-bonus-count),
  // rather than as a corner badge.
  .map-editor-hex-bonus-count {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    line-height: 1;
    font-style: normal;
    font-weight: bold;
    color: black;
    text-shadow: 0 0 2px white, 0 0 2px white;
  }

  .map-editor-warnings {
    margin-top: 8px;
    color: #f1c40f;
    font-size: 13px;
  }

  .map-editor-code {
    display: block;
    margin-top: 12px;
    textarea { width: 100%; font-family: monospace; }
  }

  .map-editor-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
    .map-editor-load-input { flex: 1; min-width: 160px; }
    .map-editor-play { margin-left: auto; font-weight: bold; }
  }

  .map-editor-error { color: #e74c3c; margin-top: 6px; }

  .map-editor-preview {
    margin-top: 24px;
    h3 { color: #fff; }
  }
}
</style>
