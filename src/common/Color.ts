export const PLAYER_COLORS = ['red', 'green', 'yellow', 'blue', 'black', 'purple', 'orange', 'pink'] as const;
/** Reserved for Conglomerates Turmoil delegates -- shared per-team, never a player's own color. */
export const CONGLOMERATES_TEAM_COLORS = ['white', 'gray'] as const;
const ALL_COLORS = [...PLAYER_COLORS, 'neutral', 'bronze', ...CONGLOMERATES_TEAM_COLORS] as const;
export type Color = typeof ALL_COLORS[number];
export type ColorWithNeutral = Color | 'NEUTRAL';
