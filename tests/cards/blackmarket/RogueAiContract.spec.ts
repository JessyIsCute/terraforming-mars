import {expect} from 'chai';
import {RogueAiContract, RogueAiContractII, RogueAiContractIII} from '@/server/cards/blackmarket/RogueAiContract';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('RogueAiContract', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    const card = new RogueAiContract();
    expect(card.cost).to.eq(8);
    expect(card.tags).deep.eq([Tag.SCIENCE]);
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play draws 3 cards', () => {
    const card = new RogueAiContract();
    expect(player.cardsInHand).has.lengthOf(0);
    card.play(player);
    expect(player.cardsInHand).has.lengthOf(3);
  });

  it('printings II and III are distinct CardNames with an escalating price', () => {
    const printings = [new RogueAiContract(), new RogueAiContractII(), new RogueAiContractIII()];
    expect(new Set(printings.map((c) => c.name)).size).to.eq(3);
    expect(printings.map((c) => c.cost)).deep.eq([8, 9, 10]);
  });
});
