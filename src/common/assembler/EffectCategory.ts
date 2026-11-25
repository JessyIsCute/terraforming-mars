/**
 * Assembler (fan): every part of an assembled card belongs to one effect category. Categories
 * name the card ("Cooled Reactor") and let presets and the card generator page guarantee effects.
 *
 * A boon is something the card's owner wants; a bane is a drawback the card pays for (or, for
 * sabotage like "decrease any heat production", something done to another player).
 */
export const EFFECT_CATEGORIES = [
  'heat', 'cooling',
  'plants', 'blight',
  'energy', 'drain',
  'metal', 'money', 'debt',
  'water', 'air',
  'knowledge', 'city',
  'prestige', 'infamy',
  'efficiency', 'synergy',
  'rust', 'theft',
  'espionage', 'forgetting',
] as const;

export type EffectCategory = typeof EFFECT_CATEGORIES[number];

export type EffectCategoryInfo = {
  label: string,
  description: string,
  /** Can this category be a drawback of the card? Banes are guaranteed as drawbacks, boons as benefits. */
  bane: boolean,
};

export const EFFECT_CATEGORY_INFO: Record<EffectCategory, EffectCategoryInfo> = {
  heat: {label: 'Heat', description: 'Gain heat or heat production, or raise the temperature.', bane: false},
  cooling: {label: 'Cooling', description: 'Remove heat or heat production, from you or another player.', bane: true},
  plants: {label: 'Plants', description: 'Gain plants or plant production, or place a greenery.', bane: false},
  blight: {label: 'Blight', description: 'Remove plants or plant production, from you or another player.', bane: true},
  energy: {label: 'Energy', description: 'Gain energy or energy production.', bane: false},
  drain: {label: 'Drain', description: 'Lose energy or energy production.', bane: true},
  metal: {label: 'Metal', description: 'Gain steel, titanium or their production.', bane: false},
  money: {label: 'Money', description: 'Gain M€ or M€ production.', bane: false},
  debt: {label: 'Debt', description: 'Lower M€ production (yours or another player\'s), or make cards cost more.', bane: true},
  water: {label: 'Water', description: 'Place an ocean tile.', bane: false},
  air: {label: 'Air', description: 'Raise oxygen or Venus.', bane: false},
  knowledge: {label: 'Knowledge', description: 'Draw cards.', bane: false},
  city: {label: 'City', description: 'Place a city tile.', bane: false},
  prestige: {label: 'Prestige', description: 'Victory points or TR.', bane: false},
  infamy: {label: 'Infamy', description: 'Lose victory points.', bane: true},
  efficiency: {label: 'Efficiency', description: 'Cards cost less to play.', bane: false},
  synergy: {label: 'Synergy', description: 'Gain resources when you play a tag.', bane: false},
  rust: {label: 'Rust', description: 'Remove steel, titanium or their production, from you or another player.', bane: true},
  theft: {label: 'Theft', description: 'Steal resources from another player.', bane: false},
  espionage: {label: 'Espionage', description: 'Make your opponents discard cards.', bane: false},
  forgetting: {label: 'Forgetting', description: 'Discard cards from your hand.', bane: true},
};

export function isEffectCategory(s: string): s is EffectCategory {
  return (EFFECT_CATEGORIES as ReadonlyArray<string>).includes(s);
}
