import {SpaceBonus} from '@/common/boards/SpaceBonus';

// Mirrors the bonus->icon mapping baked into MapEditor.vue's BONUS_TOOLS palette (board.less
// defines the actual `.board-space-bonus--<suffix>` sprites) -- kept here too so other
// non-interactive renderers (e.g. MapThumbnail.vue) don't need to pull in the whole editor.
const SPACE_BONUS_CSS: Partial<Record<SpaceBonus, string>> = {
  [SpaceBonus.PLANT]: 'plant',
  [SpaceBonus.STEEL]: 'steel',
  [SpaceBonus.TITANIUM]: 'titanium',
  [SpaceBonus.DRAW_CARD]: 'card',
  [SpaceBonus.HEAT]: 'heat',
  [SpaceBonus.ENERGY]: 'energy',
  [SpaceBonus.MICROBE]: 'microbe',
  [SpaceBonus.ANIMAL]: 'animal',
  [SpaceBonus.DATA]: 'data',
  [SpaceBonus.SCIENCE]: 'science',
  [SpaceBonus.ENERGY_PRODUCTION]: 'energy-production',
  [SpaceBonus.DELEGATE]: 'delegate',
  [SpaceBonus.OCEAN]: 'bonusocean',
  [SpaceBonus.TEMPERATURE]: 'bonustemperature',
  [SpaceBonus.COLONY]: 'colony',
};

/** CSS suffix for `.board-space-bonus--<suffix>` (board.less), or '' if unrecognized. */
export function spaceBonusCss(bonus: SpaceBonus): string {
  return SPACE_BONUS_CSS[bonus] ?? '';
}
