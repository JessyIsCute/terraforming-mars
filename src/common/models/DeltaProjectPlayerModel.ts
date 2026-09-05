export type DeltaProjectPlayerModel = {
  position: number;
  jovianBonus: boolean;
  /**
   * Only used by markers that can also move backward (e.g. Epsilon Dample's second
   * marker): every position this marker has already claimed the landing reward for
   * (forward or backward), so revisiting it doesn't re-trigger that reward.
   */
  rewardedPositions?: Array<number>;
}
