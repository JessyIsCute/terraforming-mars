import {Card, StaticCardProperties} from '../cards/Card';
import {ActionCard} from '../cards/ActionCard';
import {IProjectCard} from '../cards/IProjectCard';
import {ICard} from '../cards/ICard';
import {IPlayer} from '../IPlayer';
import {CardName} from '../../common/cards/CardName';
import {Units} from '../../common/Units';
import {AssembledCardDefinition} from './AssembledCardDefinition';
import {renderAssembled} from './AssemblerRender';
import {StealResources} from '../deferredActions/StealResources';
import {DiscardCards} from '../deferredActions/DiscardCards';
import {SelectPlayer} from '../inputs/SelectPlayer';

function properties(def: AssembledCardDefinition): StaticCardProperties {
  return {
    // Assembled card names aren't in the CardName enum; nothing assumes the enum is closed
    // (same approach as DataDrivenCard).
    name: def.name as unknown as CardName,
    type: def.type,
    cost: def.cost,
    tags: def.tags,
    requirements: def.requirements,
    resourceType: def.cardResource?.type,
    victoryPoints: def.cardResource?.vpPer !== undefined ? {resourcesHere: {}, per: def.cardResource.vpPer} : def.victoryPoints,
    behavior: def.behavior,
    action: def.action,
    cardDiscount: def.cardDiscount,
    metadata: {
      cardNumber: 'ASM',
      renderData: renderAssembled(def),
      description: def.description,
    },
  };
}

function onTrigger(def: AssembledCardDefinition, self: ICard, player: IPlayer, card: ICard) {
  const trigger = def.trigger;
  if (trigger === undefined) {
    return undefined;
  }
  if (player.tags.cardTagCount(card, trigger.tag) > 0) {
    if (Object.keys(trigger.gain).length > 0) {
      player.stock.adjust(Units.of(trigger.gain), {log: true});
    }
    if (trigger.drawCard !== undefined) {
      player.drawCard(trigger.drawCard);
    }
    if (trigger.addResource !== undefined) {
      player.addResourceTo(self, {qty: trigger.addResource, log: true});
    }
  }
  return undefined;
}

/** The on-play parts the Behavior DSL doesn't cover: stealing and discarding. */
function onPlay(def: AssembledCardDefinition, player: IPlayer) {
  if (def.steal !== undefined) {
    player.game.defer(new StealResources(player, def.steal.resource, def.steal.count));
  }
  if (def.discard !== undefined) {
    player.game.defer(new DiscardCards(player, def.discard, def.discard));
  }
  if (def.opponentsDiscard !== undefined) {
    for (const opponent of player.opponents) {
      player.game.defer(new DiscardCards(opponent, def.opponentsDiscard, def.opponentsDiscard));
    }
  }
  const n = def.targetDiscard;
  if (n !== undefined) {
    const targets = player.opponents.filter((p) => p.cardsInHand.length > 0);
    if (targets.length > 0) {
      player.defer(new SelectPlayer(targets, 'Select an opponent to discard a card', 'Discard').andThen((target) => {
        player.game.defer(new DiscardCards(target, n, n));
        return undefined;
      }));
    }
  }
  return undefined;
}

/** A generated card with no action. See AssemblerGenerator. */
export class AssembledCard extends Card implements IProjectCard {
  constructor(public readonly definition: AssembledCardDefinition) {
    super(properties(definition));
  }
  public override bespokePlay(player: IPlayer) {
    return onPlay(this.definition, player);
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    return onTrigger(this.definition, this, player, card);
  }
}

function requireAction(def: AssembledCardDefinition) {
  if (def.action === undefined) {
    throw new Error(`${def.name} has no action`);
  }
  return def.action;
}

/** A generated card with a declarative action. Separate class because the game treats any card with `action` as actionable. */
export class AssembledActionCard extends ActionCard implements IProjectCard {
  constructor(public readonly definition: AssembledCardDefinition) {
    super({...properties(definition), action: requireAction(definition)});
  }
  public override bespokePlay(player: IPlayer) {
    return onPlay(this.definition, player);
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    return onTrigger(this.definition, this, player, card);
  }
}

export function newAssembledCard(def: AssembledCardDefinition): IProjectCard {
  return def.action !== undefined ? new AssembledActionCard(def) : new AssembledCard(def);
}
