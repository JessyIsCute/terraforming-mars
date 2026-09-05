import {expect} from 'chai';
import {Microbetronics} from '../../../src/server/cards/teco/Microbetronics';
import {CardResource} from '../../../src/common/CardResource';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('Microbetronics', () => {
  let card: Microbetronics;
  let player: TestPlayer;

  beforeEach(() => {
    card = new Microbetronics();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
    player.production.override({energy: 0});
  });

  it('gains 1 energy production for every 2 microbes added to it', () => {
    player.addResourceTo(card, {qty: 1, log: false});
    card.onResourceAdded(player, card);
    expect(player.production.energy).to.eq(0);

    player.addResourceTo(card, {qty: 1, log: false});
    card.onResourceAdded(player, card);
    expect(player.production.energy).to.eq(1);
  });

  it('ignores non-microbe resources added to other cards', () => {
    const other = {resourceType: CardResource.ANIMAL} as any;
    card.onResourceAdded(player, other);
    expect(player.production.energy).to.eq(0);
  });

  it('does not re-grant production for the same total', () => {
    player.addResourceTo(card, {qty: 2, log: false});
    card.onResourceAdded(player, card);
    expect(player.production.energy).to.eq(1);

    card.onResourceAdded(player, card);
    expect(player.production.energy).to.eq(1);
  });
});
