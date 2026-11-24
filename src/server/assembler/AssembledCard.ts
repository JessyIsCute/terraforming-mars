import {Card, StaticCardProperties} from '../cards/Card';
import {ActionCard} from '../cards/ActionCard';
import {IProjectCard} from '../cards/IProjectCard';
import {ICard} from '../cards/ICard';
import {IPlayer} from '../IPlayer';
import {CardName} from '../../common/cards/CardName';
import {Units} from '../../common/Units';
import {AssembledCardDefinition} from './AssembledCardDefinition';
import {renderAssembled} from './AssemblerRender';

function properties(def: AssembledCardDefinition): StaticCardProperties {
  return {
    // Assembled card names aren't in the CardName enum; nothing assumes the enum is closed
    // (same approach as DataDrivenCard).
    name: def.name as unknown as CardName,
    type: def.type,
    cost: def.cost,
    tags: def.tags,
    requirements: def.requirements,
    victoryPoints: def.victoryPoints,
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

function onTrigger(def: AssembledCardDefinition, player: IPlayer, card: ICard) {
  const trigger = def.trigger;
  if (trigger === undefined) {
    return undefined;
  }
  if (player.tags.cardTagCount(card, trigger.tag) > 0) {
    player.stock.adjust(Units.of(trigger.gain), {log: true});
  }
  return undefined;
}

/** A generated card with no action. See AssemblerGenerator. */
export class AssembledCard extends Card implements IProjectCard {
  constructor(public readonly definition: AssembledCardDefinition) {
    super(properties(definition));
  }
  public onCardPlayed(player: IPlayer, card: ICard) {
    return onTrigger(this.definition, player, card);
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
  public onCardPlayed(player: IPlayer, card: ICard) {
    return onTrigger(this.definition, player, card);
  }
}

export function newAssembledCard(def: AssembledCardDefinition): IProjectCard {
  return def.action !== undefined ? new AssembledActionCard(def) : new AssembledCard(def);
}
