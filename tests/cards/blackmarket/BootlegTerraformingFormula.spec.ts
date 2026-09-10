import {expect} from 'chai';
import {BootlegTerraformingFormula} from '@/server/cards/blackmarket/BootlegTerraformingFormula';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('BootlegTerraformingFormula', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [, player] = testGame(2);
  });

  it('has no printed price -- the market owns it', () => {
    expect(new BootlegTerraformingFormula().cost).to.eq(0);
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
