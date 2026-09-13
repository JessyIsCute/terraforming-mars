import {IParty} from './IParty';
import {Party} from './Party';
import {PartyName} from '../../../common/turmoil/PartyName';
import {Bonus} from '../Bonus';
import {IPolicy} from '../Policy';
import {IPlayer} from '../../IPlayer';
import {ICard} from '../../cards/ICard';
import {CardType} from '../../../common/cards/CardType';
import {Resource} from '../../../common/Resource';
import {SelectPaymentDeferred} from '../../deferredActions/SelectPaymentDeferred';
import {TITLES} from '../../inputs/titles';
import {POLITICAL_AGENDAS_MAX_ACTION_USES} from '../../../common/constants';

/**
 * More Parties: Populists, one of the 6 new "Political Agendas" parties. Bonus B and policy 2
 * reference "population"/"sector"/"face-up faction card" -- concepts from an external campaign
 * expansion (EPIC) this codebase doesn't model -- and are left undefined per the source
 * document's own guidance to ignore such references when playing without that content.
 */
export class Populists extends Party implements IParty {
  readonly name = PartyName.POPULISTS;
  readonly bonuses = [POPULISTS_BONUS_1, POPULISTS_BONUS_2];
  readonly policies = [POPULISTS_POLICY_1, POPULISTS_POLICY_2, POPULISTS_POLICY_3, POPULISTS_POLICY_4];
}

class PopulistsBonus01 extends Bonus {
  readonly id = 'popb01' as const;
  readonly description = 'Gain 1 M€ for every event you have played';

  getScore(player: IPlayer) {
    return player.getPlayedEventsCount();
  }

  grantForPlayer(player: IPlayer): void {
    player.stock.add(Resource.MEGACREDITS, this.getScore(player), {log: true, from: {partyName: PartyName.POPULISTS}});
  }
}

// Not implemented: references "population" and "face-up faction card", concepts from the EPIC
// campaign expansion that this codebase doesn't model.
class PopulistsBonus02 extends Bonus {
  readonly id = 'popb02' as const;
  readonly description = 'Not implemented in this codebase: gain 2 M€ for every population and ' +
    'face-up faction card you have (EPIC campaign concepts)';

  getScore(_player: IPlayer) {
    return 0;
  }

  grantForPlayer(_player: IPlayer): void {}
}

class PopulistsPolicy01 implements IPolicy {
  readonly id = 'popp01' as const;
  readonly description = 'Every time you play a card worth VP (positive or negative), gain or pay twice that many M€';

  onCardPlayed(player: IPlayer, card: ICard) {
    const vp = card.getVictoryPoints(player);
    if (vp !== 0) {
      player.stock.add(Resource.MEGACREDITS, vp * 2, {log: true, from: {partyName: PartyName.POPULISTS}});
    }
  }
}

// Not implemented: references "population" and "sector", concepts from the EPIC campaign
// expansion that this codebase doesn't model.
class PopulistsPolicy02 implements IPolicy {
  readonly id = 'popp02' as const;
  readonly description = 'Not implemented in this codebase: action, pay 4 M€ to gain one population ' +
    'from any sector (EPIC campaign concepts)';
}

class PopulistsPolicy03 implements IPolicy {
  readonly id = 'popp03' as const;
  readonly description = 'Every time you play an Event card, draw 1 card';

  onCardPlayed(player: IPlayer, card: ICard) {
    if (card.type === CardType.EVENT) {
      player.drawCard(1);
    }
  }
}

// Adapted: the source describes this as choosing "the event tag," but no card in this codebase
// actually carries Tag.EVENT as a real tag (it's used only for rendering/counting purposes) --
// so this buys the first Event-*type* card instead, matching the evident intent.
class PopulistsPolicy04 implements IPolicy {
  readonly id = 'popp04' as const;
  readonly description = 'Action: spend 4 M€ to buy the first Event card';

  canAct(player: IPlayer): boolean {
    return player.canAfford(4) && player.politicalAgendasActionUsedCount < POLITICAL_AGENDAS_MAX_ACTION_USES;
  }

  action(player: IPlayer) {
    const game = player.game;
    player.politicalAgendasActionUsedCount += 1;
    game.log('${0} used Turmoil ${1} action', (b) => b.player(player).partyName(PartyName.POPULISTS));
    game.defer(new SelectPaymentDeferred(player, 4, {title: TITLES.payForPartyAction(PartyName.POPULISTS)}))
      .andThen(() => player.drawCard(1, {cardType: CardType.EVENT}));
    return undefined;
  }
}

export const POPULISTS_BONUS_1 = new PopulistsBonus01();
export const POPULISTS_BONUS_2 = new PopulistsBonus02();
export const POPULISTS_POLICY_1 = new PopulistsPolicy01();
export const POPULISTS_POLICY_2 = new PopulistsPolicy02();
export const POPULISTS_POLICY_3 = new PopulistsPolicy03();
export const POPULISTS_POLICY_4 = new PopulistsPolicy04();
