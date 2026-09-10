import {expect} from 'chai';
import {CounterfeitCertificates} from '@/server/cards/blackmarket/CounterfeitCertificates';
import {Tag} from '@/common/cards/Tag';
import {CardType} from '@/common/cards/CardType';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('CounterfeitCertificates', () => {
  let card: CounterfeitCertificates;
  let player: TestPlayer;

  beforeEach(() => {
    card = new CounterfeitCertificates();
    [, player] = testGame(2);
  });

  it('has the printed stats', () => {
    expect(card.type).to.eq(CardType.EVENT);
    expect(card.tags).deep.eq([Tag.EARTH]);
    expect(card.cost).to.eq(2);
    expect(card.reserveUnits).deep.include({heat: 1});
    expect(card.victoryPoints).to.eq(-1);
  });

  it('play spends 1 heat and gains 2 TR', () => {
    player.heat = 1;
    const before = player.terraformRating;

    card.play(player);

    expect(player.heat).to.eq(0);
    expect(player.terraformRating).to.eq(before + 2);
  });
});
