import {expect} from 'chai';
import {MarketInsurance} from '../../../src/server/cards/teco/MarketInsurance';
import {Resource} from '../../../src/common/Resource';
import {TestPlayer} from '../../TestPlayer';
import {testGame} from '../../TestGame';

describe('MarketInsurance', () => {
  let card: MarketInsurance;
  let player: TestPlayer;

  beforeEach(() => {
    card = new MarketInsurance();
    [/* game */, player] = testGame(2);
    player.playedCards.push(card);
  });

  it('gains 2 M€ production when M€ production was not decreased this generation', () => {
    player.production.override({megacredits: 0});
    card.onProductionPhase(player);
    expect(player.production.megacredits).to.eq(2);
  });

  it('gains 5 M€ production when M€ production was decreased this generation', () => {
    player.production.override({megacredits: 0});
    card.onProductionGain(player, Resource.MEGACREDITS, -1);
    card.onProductionPhase(player);
    expect(player.production.megacredits).to.eq(5);
  });

  it('resets the tracked loss after each production phase', () => {
    player.production.override({megacredits: 0});
    card.onProductionGain(player, Resource.MEGACREDITS, -1);
    card.onProductionPhase(player);
    expect(player.production.megacredits).to.eq(5);

    card.onProductionPhase(player);
    expect(player.production.megacredits).to.eq(7);
  });

  it('ignores gains and other resources', () => {
    player.production.override({megacredits: 0});
    card.onProductionGain(player, Resource.MEGACREDITS, 3);
    card.onProductionGain(player, Resource.STEEL, -3);
    card.onProductionPhase(player);
    expect(player.production.megacredits).to.eq(2);
  });
});
