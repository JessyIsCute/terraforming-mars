export type DeltaProjectPlayerModel = {
  position: number;
  jovianBonus: boolean;
  /**
   * Only used by markers that can also move backward (e.g. Epsilon Dample's second
   * marker): the furthest position ever reached, so retreating and re-advancing over
   * already-claimed ground doesn't re-trigger that position's reward.
   */
  highestPosition?: number;
}
