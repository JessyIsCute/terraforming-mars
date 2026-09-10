import {expect} from 'chai';
import {
  BootlegTerraformingFormula,
  BOOTLEG_TERRAFORMING_FORMULA_MIN_COST,
  BOOTLEG_TERRAFORMING_FORMULA_MAX_COST,
} from '@/server/cards/blackmarket/BootlegTerraformingFormula';
import {CardName} from '@/common/cards/CardName';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('BootlegTerraformingFormula', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [, player] = testGame(2);
  });

  it('defaults to the minimum listed price, and a rolled price bypasses the shared properties cache', () => {
    expect(new BootlegTerraformingFormula().cost).to.eq(BOOTLEG_TERRAFORMING_FORMULA_MIN_COST);
    expect(new BootlegTerraformingFormula(CardName.BOOTLEG_TERRAFORMING_FORMULA, BOOTLEG_TERRAFORMING_FORMULA_MAX_COST).cost)
      .to.eq(BOOTLEG_TERRAFORMING_FORMULA_MAX_COST);
  });

  it('has the printed tag and VP', () => {
    const card = new BootlegTerraformingFormula();
    expect(card.tags).deep.eq([Tag.PLANT]);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play raises plant production 1 step', () => {
    const card = new BootlegTerraformingFormula();
    expect(player.production.plants).to.eq(0);
    card.play(player);
    expect(player.production.plants).to.eq(1);
  });
});
