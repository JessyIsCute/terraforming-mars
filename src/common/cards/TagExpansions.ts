import {Tag} from './Tag';
import {Expansion} from './GameModule';

/**
 * Which expansion (if any) a tag's theme belongs to -- so MutationMarkets' random-tag
 * mutations (Tag Diversifier) don't hand out, say, a Moon tag in a game that doesn't have
 * the Moon expansion enabled. A tag with no entry here is base game, always available.
 * Confirmed by which module's cards actually print each tag: Venus Next for VENUS, The
 * Moon for MOON, Pathfinders for MARS/CLONE, Underworld for CRIME. JOVIAN and the rest are
 * base-game tags (Jovian ships in the base box, well before Colonies added more of them).
 */
export const TAG_REQUIRES_EXPANSION: Partial<Record<Tag, Expansion>> = {
  [Tag.VENUS]: 'venus',
  [Tag.MOON]: 'moon',
  [Tag.MARS]: 'pathfinders',
  [Tag.CLONE]: 'pathfinders',
  [Tag.CRIME]: 'underworld',
};
