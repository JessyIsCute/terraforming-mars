<template>
  <div class="venus-board-cont">
    <div class="board board--venus" :style="boardStyle" id="venus_board">
      <BoardSpace
        v-for="curSpace in gridSpaces"
        :key="curSpace.id"
        :space="curSpace"
        :aresExtension="false"
        :tileView="tileView"
        :pixel="pixelFor(curSpace)"
        data-test="venus-board-space"
      />
    </div>
    <div v-if="outerSpaces.length > 0" id="venus_board_outer_spaces" class="venus-board-outer-spaces">
      <BoardSpace
        v-for="curSpace in outerSpaces"
        :key="curSpace.id"
        :space="curSpace"
        :aresExtension="false"
        :tileView="tileView"
        :text="outerSpaceText(curSpace.id)"
      />
    </div>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import {VenusPhase2Model} from '@/common/models/VenusPhase2Model';
import {SpaceModel} from '@/common/models/SpaceModel';
import {SpaceType} from '@/common/boards/SpaceType';
import {SpaceId} from '@/common/Types';
import BoardSpace from '@/client/components/BoardSpace.vue';
import {TileView} from '../board/TileView';
import {customBoardPixelSize, customSpacePixel} from '@/common/boards/CustomBoardDefinition';

// Kept in sync with src/server/venusPhase2/VenusSurfaceBoard.ts's own VENUS_STRATOPOLIS/
// VENUS_MAXWELL_BASE constants -- fixed ids, distinct from the Mars board's SpaceName.STRATOPOLIS/
// MAXWELL_BASE ('72'/'73'), since this is a genuinely separate board.
const OUTER_SPACE_TEXT: Partial<Record<SpaceId, string>> = {
  '298': 'Stratopolis',
  '299': 'Maxwell Base',
};

export default defineComponent({
  name: 'VenusSurfaceBoard',
  props: {
    model: {
      type: Object as () => VenusPhase2Model,
      required: true,
    },
    tileView: {
      type: String as () => TileView,
      default: 'show',
    },
  },
  components: {
    BoardSpace,
  },
  computed: {
    gridSpaces(): Array<SpaceModel> {
      return this.model.spaces.filter((space) => space.spaceType !== SpaceType.COLONY);
    },
    outerSpaces(): Array<SpaceModel> {
      return this.model.spaces.filter((space) => space.spaceType === SpaceType.COLONY);
    },
    maxY(): number {
      return this.gridSpaces.reduce((max, space) => Math.max(max, space.y), 0);
    },
    maxX(): number {
      return this.gridSpaces.reduce((max, space) => Math.max(max, space.x), 0);
    },
    boardStyle(): Record<string, string> {
      const {width, height} = customBoardPixelSize(this.maxX, this.maxY);
      return {width: `${width}px`, height: `${height}px`};
    },
  },
  methods: {
    pixelFor(space: SpaceModel): {left: number, top: number} {
      return customSpacePixel(space.x, space.y, this.maxY);
    },
    outerSpaceText(id: SpaceId): string | undefined {
      return OUTER_SPACE_TEXT[id];
    },
  },
});
</script>
