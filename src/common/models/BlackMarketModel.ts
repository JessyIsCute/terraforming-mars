import {CardModel} from './CardModel';

export type BlackMarketModel = {
  /** Length 5, always dealt full unless the market's small dedicated card pool is exhausted. */
  slots: ReadonlyArray<CardModel | undefined>;
};
