import {expect} from 'chai';
import {groupSpaceBonuses, spaceBonusCss} from '@/client/utils/spaceBonusIcon';
import {SpaceBonus} from '@/common/boards/SpaceBonus';

describe('spaceBonusIcon', () => {
  describe('spaceBonusCss', () => {
    it('returns the css suffix for a recognized bonus', () => {
      expect(spaceBonusCss(SpaceBonus.MEGACREDITS)).to.eq('megacredit');
      expect(spaceBonusCss(SpaceBonus.STEEL)).to.eq('steel');
    });

    it('returns an empty string for an unrecognized bonus', () => {
      expect(spaceBonusCss(SpaceBonus._RESTRICTED)).to.eq('');
    });
  });

  describe('groupSpaceBonuses', () => {
    it('leaves non-M€ bonuses exploded, one entry per instance', () => {
      const result = groupSpaceBonuses([SpaceBonus.STEEL, SpaceBonus.STEEL, SpaceBonus.TITANIUM]);
      expect(result).to.deep.eq([
        {bonus: SpaceBonus.STEEL, count: 1},
        {bonus: SpaceBonus.STEEL, count: 1},
        {bonus: SpaceBonus.TITANIUM, count: 1},
      ]);
    });

    it('collapses repeated M€ bonuses into one entry with a count', () => {
      const result = groupSpaceBonuses([SpaceBonus.MEGACREDITS, SpaceBonus.MEGACREDITS]);
      expect(result).to.deep.eq([{bonus: SpaceBonus.MEGACREDITS, count: 2}]);
    });

    it('collapses M€ at the position of its first occurrence, leaving other bonuses in place', () => {
      const result = groupSpaceBonuses([SpaceBonus.STEEL, SpaceBonus.MEGACREDITS, SpaceBonus.TITANIUM, SpaceBonus.MEGACREDITS]);
      expect(result).to.deep.eq([
        {bonus: SpaceBonus.STEEL, count: 1},
        {bonus: SpaceBonus.MEGACREDITS, count: 2},
        {bonus: SpaceBonus.TITANIUM, count: 1},
      ]);
    });

    it('returns an empty array for no bonuses', () => {
      expect(groupSpaceBonuses([])).to.deep.eq([]);
    });
  });
});
