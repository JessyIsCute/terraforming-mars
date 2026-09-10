import {expect} from 'chai';
import {RogueAiContract, ROGUE_AI_CONTRACT_MIN_COST, ROGUE_AI_CONTRACT_MAX_COST} from '@/server/cards/blackmarket/RogueAiContract';
import {CardName} from '@/common/cards/CardName';
import {Tag} from '@/common/cards/Tag';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('RogueAiContract', () => {
  let player: TestPlayer;

  beforeEach(() => {
    [, player] = testGame(2);
  });

  it('defaults to the minimum listed price, and a rolled price bypasses the shared properties cache', () => {
    expect(new RogueAiContract().cost).to.eq(ROGUE_AI_CONTRACT_MIN_COST);
    expect(new RogueAiContract(CardName.ROGUE_AI_CONTRACT, ROGUE_AI_CONTRACT_MAX_COST).cost).to.eq(ROGUE_AI_CONTRACT_MAX_COST);
  });

  it('has the printed tag and VP', () => {
    const card = new RogueAiContract();
    expect(card.tags).deep.eq([Tag.SCIENCE]);
    expect(card.victoryPoints).to.eq(-2);
  });

  it('play draws 2 cards', () => {
    const card = new RogueAiContract();
    expect(player.cardsInHand).has.lengthOf(0);
    card.play(player);
    expect(player.cardsInHand).has.lengthOf(2);
  });
});
