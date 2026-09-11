import {expect} from 'chai';
import {BootlegTerraformingFormula, BootlegTerraformingFormulaII, BootlegTerraformingFormulaIII} from '@/server/cards/blackmarket/BootlegTerraformingFormula';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('BootlegTerraformingFormula', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    const card = new BootlegTerraformingFormula();
    expect(card.cost).to.eq(4);
    expect(card.tags).deep.eq([Tag.PLANT]);
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play raises plant production 1 step', () => {
    const card = new BootlegTerraformingFormula();
    expect(player.production.plants).to.eq(0);
    card.play(player);
    expect(player.production.plants).to.eq(1);
  });

  it('printings II and III are distinct CardNames with an escalating price', () => {
    const printings = [new BootlegTerraformingFormula(), new BootlegTerraformingFormulaII(), new BootlegTerraformingFormulaIII()];
    expect(new Set(printings.map((c) => c.name)).size).to.eq(3);
    expect(printings.map((c) => c.cost)).deep.eq([4, 5, 6]);
  });
});
