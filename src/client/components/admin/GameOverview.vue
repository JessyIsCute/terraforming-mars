<template>
  <tr>

  <!-- single item in GamesOverview -->
  <td><span :class="statusClass"></span></td>
  <td><a :href="'game?id='+id" class="game-id">{{id}}</a></td>
  <template v-if="game !== undefined">
    <td class="game-timer" :title="startTitle">{{ ageText }}</td>
    <td v-for="player in game.players" :key="player.color">
      <span class="player-name" :class="'player_bg_color_'+ player.color">
        <a calassc target="blank" :href="'player?id=' + player.id">{{player.name}}</a>
      </span>
    </td>
    <td><a target="blank" :href="'spectator?id=' + game.spectatorId" v-i18n class="player-name spectator">Spectator</a></td>
  </template>
  <td v-else></td>
  <td>
    <button type="button" class="btn btn-error btn-sm" @click="purge" :disabled="purging" v-i18n>Purge</button>
  </td>
  </tr>
</template>

<script lang="ts">
import {defineComponent} from 'vue';
import {SimpleGameModel} from '@/common/models/SimpleGameModel';
import {Phase} from '@/common/Phase';
import {paths} from '@/common/app/paths';

type Status = 'loading' | 'error' | 'done';

function formatDuration(milliseconds: number): string {
  const ms = Math.max(0, milliseconds);
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default defineComponent({
  name: 'GameOverview',
  data() {
    return {
      purging: false,
    };
  },
  props: {
    status: {
      type: String as () => Status,
      required: true,
    },
    game: {
      type: Object as () => SimpleGameModel | undefined,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  computed: {
    statusClass(): string {
      switch (this.status) {
      case 'loading':
        return 'status-loading';
      case 'error':
        return 'status-error';
      case 'done':
        if (this.isRunning) {
          return 'status-running';
        } else {
          return 'status-finished';
        }
      default:
        return '';
      }
    },
    isRunning(): boolean {
      return this.game?.phase !== Phase.END;
    },
    serverId(): string {
      return (new URL(location.href)).searchParams.get('serverId') || '';
    },
    startTitle(): string {
      const ms = this.game?.createdTimeMs;
      if (ms === undefined || ms === 0) {
        return 'unknown start time';
      }
      return 'Started ' + new Date(ms).toLocaleString();
    },
    ageText(): string {
      const ms = this.game?.createdTimeMs;
      if (ms === undefined || ms === 0) {
        return '—';
      }
      const started = new Date(ms);
      return `${started.toLocaleDateString()} ${started.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} · ${formatDuration(Date.now() - ms)} ago`;
    },
  },
  methods: {
    async purge() {
      if (!window.confirm(`Permanently delete game ${this.id}? This cannot be undone.`)) {
        return;
      }
      this.purging = true;
      try {
        const response = await fetch(`${paths.API_GAMES}?serverId=${this.serverId}`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({gameId: this.id}),
        });
        if (response.ok) {
          this.$emit('purged', this.id);
        } else {
          alert(`Could not purge game ${this.id}`);
        }
      } catch (e) {
        alert(`Error purging game ${this.id}`);
      } finally {
        this.purging = false;
      }
    },
  },
});
</script>
