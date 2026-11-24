import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {IProjectCard} from '../cards/IProjectCard';
import {AssembledCardDefinition, AssemblerComplexity} from './AssembledCardDefinition';
import {AssemblerGenerator} from './AssemblerGenerator';
import {assembledCardName, registerAssembledCard} from './AssembledCardRegistry';
import {newAssembledCard} from './AssembledCard';

const COMPLEXITY_WEIGHTS: Array<[AssemblerComplexity, number]> = [['low', 4], ['mid', 4], ['high', 2]];

export class AssemblerExpansion {
  private constructor() {}

  /**
   * Generate a new card for this game: give it a unique name, remember it on the game (so it's
   * saved), and register it (so it can be found by name). Doesn't put it anywhere.
   */
  public static create(game: IGame, complexity?: AssemblerComplexity, options: {forceRequirement?: boolean} = {}): {definition: AssembledCardDefinition, card: IProjectCard} {
    const generator = new AssemblerGenerator(game.rng);
    const chosen = complexity ?? AssemblerExpansion.pickComplexity(game);
    const name = assembledCardName(game.id, game.assembledCards.length + 1);
    const definition = generator.generate(name, chosen, options);
    game.assembledCards.push(definition);
    registerAssembledCard(definition);
    return {definition, card: newAssembledCard(definition)};
  }

  /** The `assemble` behavior: generate `count` cards and shuffle each into the project deck. */
  public static assemble(game: IGame, count: number, player?: IPlayer): Array<IProjectCard> {
    const cards: Array<IProjectCard> = [];
    for (let i = 0; i < count; i++) {
      const {card} = AssemblerExpansion.create(game);
      const pile = game.projectDeck.drawPile;
      pile.splice(game.rng.nextInt(pile.length + 1), 0, card);
      cards.push(card);
    }
    if (player !== undefined) {
      game.log('${0} assembled ${1} new card(s) into the deck', (b) => b.player(player).number(count));
    }
    return cards;
  }

  private static pickComplexity(game: IGame): AssemblerComplexity {
    const total = COMPLEXITY_WEIGHTS.reduce((s, [, w]) => s + w, 0);
    let r = game.rng.next() * total;
    for (const [c, w] of COMPLEXITY_WEIGHTS) {
      r -= w;
      if (r < 0) {
        return c;
      }
    }
    return 'mid';
  }
}
