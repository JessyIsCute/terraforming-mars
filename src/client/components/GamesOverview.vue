<template>
  <div id="games-overview" class="games-overview-container">
    <h1 v-i18n>{{ constants.APP_NAME }} — Games Overview</h1>
      <p v-i18n>The following games are available on this server:</p>
      <div class="games-overview-actions">
        <button type="button" class="btn btn-error" :disabled="bulkPurging" @click="purgeFinishedAndAbandoned" v-i18n>
          Purge finished &amp; abandoned games
        </button>
        <button type="button" class="btn btn-error" :disabled="bulkPurging" @click="purgeAll" v-i18n>
          Purge ALL games
        </button>
        <span v-if="bulkPurging" v-i18n>Working…</span>
      </div>
      <table>
        <GameOverview v-for="entry in entries" :key="entry.id" :id="entry.id" :game="entry.game" :status="entry.status" @purged="removeEntry"/>
      </table>
  </div>
</template>

<script lang="ts">

import {defineComponent} from 'vue';
import * as constants from '@/common/constants';
import GameOverview from '@/client/components/admin/GameOverview.vue';
import {SimpleGameModel} from '@/common/models/SimpleGameModel';
import {GameId, ParticipantId} from '@/common/Types';
import {paths} from '@/common/app/paths';

type FetchStatus = {
  id: GameId;
  game: SimpleGameModel | undefined;
  status: 'loading' | 'error' | 'done';
}
type DataModel = {
  entries: Array<FetchStatus>,
  bulkPurging: boolean,
};

// Copied from routes/Game.ts and probably IDatabase. Should be centralized I suppose
type Response = {gameId: GameId, participants: Array<ParticipantId>};

export default defineComponent({
  name: 'GamesOverview',
  data(): DataModel {
    return {
      entries: [],
      bulkPurging: false,
    };
  },
  mounted() {
    this.getGames();
  },
  components: {
    GameOverview,
  },
  methods: {
    async getGames() {
      try {
        const response = await fetch('api/games?serverId=' + this.serverId);
        if (!response.ok) {
          alert('Unexpected response fetching games from API');
          return;
        }
        const result: Response[] = await response.json();
        if (result instanceof Array) {
          this.entries = result.map((response) => ({
            id: response.gameId,
            game: undefined,
            status: 'loading',
          }));
          this.entries.forEach((_, idx) => this.getGame(idx));
        } else {
          alert('Unexpected response fetching games from API');
        }
      } catch (error) {
        alert('Error getting games data');
      }
    },
    async getGame(idx: number) {
      if (idx >= this.entries.length) {
        return;
      }
      const entry = this.entries[idx];
      const gameId = entry.id;
      try {
        const response = await fetch('api/game?id=' + gameId);
        if (response.ok) {
          const game = await response.json() as SimpleGameModel;
          entry.status = 'done';
          entry.game = game;
        } else {
          entry.status = 'error';
        }
      } catch (error) {
        entry.status = 'error';
      }
    },
    removeEntry(gameId: GameId) {
      this.entries = this.entries.filter((entry) => entry.id !== gameId);
    },
    async bulkPurge(mode: 'finishedAndAbandoned' | 'all', prompt: string) {
      if (!window.confirm(prompt)) {
        return;
      }
      this.bulkPurging = true;
      try {
        const response = await fetch(`${paths.API_GAMES}?serverId=${this.serverId}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({mode}),
        });
        if (response.ok) {
          const result = await response.json() as {deleted: number};
          alert(`Purged ${result.deleted} game(s).`);
          await this.getGames();
        } else {
          alert('Purge failed.');
        }
      } catch (e) {
        alert('Error during purge.');
      } finally {
        this.bulkPurging = false;
      }
    },
    purgeFinishedAndAbandoned() {
      this.bulkPurge('finishedAndAbandoned', 'Delete every finished game and every abandoned (old, still-running) game? This cannot be undone.');
    },
    purgeAll() {
      this.bulkPurge('all', 'Delete EVERY game on this server, including games in progress? This cannot be undone.');
    },
  },
  computed: {
    constants(): typeof constants {
      return constants;
    },
    serverId(): string {
      return (new URL(location.href)).searchParams.get('serverId') || '';
    },
  },
});
</script>
