import {Units} from '../Units';

/**
 * A Black Market slot's price, owned by the market itself rather than by the card it's
 * selling -- see BlackMarket.ts's doc comment. Only the non-zero fields are meaningful.
 */
export type BlackMarketPrice = Readonly<Partial<Units>>;

const UNIT_LABELS: Record<keyof Units, string> = {
  megacredits: 'M€',
  steel: 'steel',
  titanium: 'titanium',
  plants: 'plant',
  energy: 'energy',
  heat: 'heat',
};

/** A short, human-readable price label, e.g. "2 titanium" or "2 M€, 1 heat". Shared between the server (turn-action button label) and client (market slot badge). */
export function describeBlackMarketPrice(price: BlackMarketPrice): string {
  const parts: Array<string> = [];
  for (const key of Units.keys) {
    const amount = price[key];
    if (amount !== undefined && amount > 0) {
      parts.push(`${amount} ${UNIT_LABELS[key]}`);
    }
  }
  return parts.length > 0 ? parts.join(', ') : 'free';
}
