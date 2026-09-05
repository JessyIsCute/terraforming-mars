<template>
  <div class="map-library-row">
    <MapThumbnail v-if="decoded !== undefined" :definition="decoded"/>
    <div v-else class="map-thumbnail map-thumbnail--error" v-i18n>Can't preview this map</div>

    <div class="map-library-row-body">
      <div class="map-library-row-title">
        <strong>{{ name }}</strong>
        <span class="map-library-tag" :class="'map-library-tag--' + entry.origin">{{ entry.origin }}</span>
        <span v-if="entry.origin === 'fanmade'" class="map-library-tag" :class="'map-library-tag--' + entry.status">{{ entry.status }}</span>
      </div>
      <p v-if="entry.description" class="map-library-row-description">{{ entry.description }}</p>
      <p v-if="entry.submittedBy" class="map-library-row-submitter">
        <span v-i18n>Submitted by</span>: {{ entry.submittedBy }}
      </p>

      <div class="map-library-row-actions">
        <button type="button" class="btn btn-primary" @click="play" v-i18n>Play this map</button>
        <template v-if="isAdmin">
          <button v-if="entry.origin === 'fanmade' && entry.status === 'submitted'" type="button" class="btn" @click="$emit('approve', entry.id)" v-i18n>
            Approve
          </button>
          <button type="button" class="btn btn-error" @click="$emit('delete', entry.id)" v-i18n>Delete</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, PropType} from 'vue';
import MapThumbnail from '@/client/components/maplibrary/MapThumbnail.vue';
import {MapLibraryEntry} from '@/common/boards/MapLibraryEntry';
import {CustomBoardDefinition} from '@/common/boards/CustomBoardDefinition';
import {decodeCustomBoard} from '@/common/boards/customBoardCodec';
import {boardNameForOfficialMapLibraryId} from '@/common/boards/officialMapLibraryLookup';
import {paths} from '@/common/app/paths';

export default defineComponent({
  name: 'MapLibraryRow',
  components: {MapThumbnail},
  props: {
    entry: {type: Object as PropType<MapLibraryEntry>, required: true},
    isAdmin: {type: Boolean, default: false},
  },
  emits: ['approve', 'delete'],
  computed: {
    decoded(): CustomBoardDefinition | undefined {
      try {
        return decodeCustomBoard(this.entry.code);
      } catch (e) {
        return undefined;
      }
    },
    name(): string {
      return this.decoded?.name ?? this.entry.id;
    },
  },
  methods: {
    play(): void {
      if (this.entry.origin === 'official') {
        const boardName = boardNameForOfficialMapLibraryId(this.entry.id);
        if (boardName !== undefined) {
          window.location.href = `${paths.NEW_GAME}?board=${encodeURIComponent(boardName)}`;
        }
        return;
      }
      // Reproduces MapEditor.vue's play() hand-off verbatim -- CreateGameForm.vue's
      // adoptCustomBoardFromEditor()/applyCustomBoardCode() already handle the rest.
      try {
        window.localStorage?.setItem('customBoardCode', this.entry.code);
      } catch (e) {
        // localStorage may be unavailable; fall through to the query param.
      }
      window.location.href = `${paths.NEW_GAME}?customBoard=1`;
    },
  },
});
</script>

<style scoped lang="less">
.map-library-row {
  display: flex;
  gap: 12px;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 6px;
  margin-bottom: 10px;
  background: #201d2b;
  color: #ddd;
}
.map-thumbnail--error {
  width: 140px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 11px;
  color: #999;
  background: #15131f;
  border-radius: 4px;
  flex: 0 0 auto;
  padding: 8px;
}
.map-library-row-body {
  flex: 1;
  min-width: 0;
}
.map-library-row-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.map-library-tag {
  font-size: 10px;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 3px;
  background: #444;
  &--official { background: #2e7d32; }
  &--fanmade { background: #455a64; }
  &--submitted { background: #b8860b; }
  &--approved { background: #2e7d32; }
}
.map-library-row-description {
  margin: 6px 0;
  font-size: 13px;
  color: #cfc9e6;
}
.map-library-row-submitter {
  margin: 0 0 6px;
  font-size: 11px;
  color: #999;
}
.map-library-row-actions {
  display: flex;
  gap: 8px;
}
</style>
