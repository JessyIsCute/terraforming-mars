import {CardModel} from './CardModel';

export type BlackMarketRowModel = ReadonlyArray<CardModel | undefined>;

export type BlackMarketModel = {
  /** Length 4, always dealt full unless the tier's design pool is exhausted. Always present. */
  early: BlackMarketRowModel;
  /** `undefined` until the game reaches generation 4. */
  mid: BlackMarketRowModel | undefined;
  /** `undefined` until the game reaches generation 7. */
  late: BlackMarketRowModel | undefined;
};
