<template>
  <div class="map-thumbnail">
    <div class="map-thumbnail-inner" :style="innerStyle">
      <div
        v-for="space in spaces"
        :key="space.id"
        class="map-thumbnail-hex"
        :class="hexClass(space)"
        :style="hexStyle(space)"
      ></div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import {CustomBoardDefinition, CustomSpaceDef, customBoardPixelSize, customSpacePixel} from '@/common/boards/CustomBoardDefinition';
import {SpaceType} from '@/common/boards/SpaceType';

// Cheap, non-interactive preview reusing MapEditor.vue's own hex-grid math and the real board
// sprites (board.less) -- a full <Board> is too heavy to mount once per row in a list.
const THUMB_WIDTH = 140;
const THUMB_HEIGHT = 110;

export default defineComponent({
  name: 'MapThumbnail',
  props: {
    definition: {type: Object as PropType<CustomBoardDefinition>, required: true},
  },
  computed: {
    spaces(): Array<CustomSpaceDef> {
      return this.definition.spaces;
    },
    maxY(): number {
      return Math.max(this.definition.rows - 1, 0);
    },
    naturalSize(): {width: number, height: number} {
      const maxX = this.spaces.reduce((m, s) => Math.max(m, s.x), 0);
      return customBoardPixelSize(maxX, this.maxY);
    },
    scale(): number {
      if (this.naturalSize.width === 0 || this.naturalSize.height === 0) {
        return 1;
      }
      return Math.min(THUMB_WIDTH / this.naturalSize.width, THUMB_HEIGHT / this.naturalSize.height);
    },
    innerStyle(): Record<string, string> {
      return {
        width: `${this.naturalSize.width}px`,
        height: `${this.naturalSize.height}px`,
        transform: `scale(${this.scale})`,
      };
    },
  },
  methods: {
    hexStyle(space: CustomSpaceDef): Record<string, string> {
      const p = customSpacePixel(space.x, space.y, this.maxY);
      return {left: `${p.left}px`, top: `${p.top}px`};
    },
    hexClass(space: CustomSpaceDef): Record<string, boolean> {
      const isCove = space.spaceType === SpaceType.COVE;
      const volcanicLand = space.volcanic === true && !isCove && space.spaceType !== SpaceType.OCEAN;
      return {
        'board-space-type-ocean': space.spaceType === SpaceType.OCEAN && space.volcanic !== true,
        'board-space-type-volcanic-cove': isCove && space.volcanic === true,
        'board-space-type-cove': isCove && space.volcanic !== true,
        'board-space-type-deflection-zone': space.spaceType === SpaceType.DEFLECTION_ZONE,
        'board-space-type-land': (space.spaceType === SpaceType.LAND && space.volcanic !== true) || volcanicLand,
        'board-space-type-land-volcanic': volcanicLand,
        'map-thumbnail-hex--restricted': space.spaceType === SpaceType.RESTRICTED,
        'map-thumbnail-hex--reserved': space.reserved === true,
      };
    },
  },
});
</script>

<style scoped lang="less">
.map-thumbnail {
  width: 140px;
  height: 110px;
  overflow: hidden;
  position: relative;
  background: #15131f;
  border-radius: 4px;
  flex: 0 0 auto;
}
.map-thumbnail-inner {
  position: relative;
  transform-origin: top left;
}
.map-thumbnail-hex {
  position: absolute;
  width: 46px;
  height: 51px;
  background-repeat: no-repeat;
  background-size: 46px 51px;
  clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%);

  &--restricted { background-color: rgba(70, 70, 78, 0.85); }
  &--reserved { background-color: rgba(241, 196, 15, 0.55); }
}
</style>
