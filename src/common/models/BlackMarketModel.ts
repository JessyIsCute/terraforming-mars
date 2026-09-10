import {CardModel} from './CardModel';
import {BlackMarketPrice} from '../blackmarket/BlackMarketPrice';

export type BlackMarketSlotModel = {
  card: CardModel;
  /** Owned by the market, not the card -- see BlackMarket.ts's doc comment. */
  price: BlackMarketPrice;
} | undefined;

export type BlackMarketModel = {
  /** Length 5, always dealt full unless the market's small dedicated card pool is exhausted. */
  slots: ReadonlyArray<BlackMarketSlotModel>;
};
