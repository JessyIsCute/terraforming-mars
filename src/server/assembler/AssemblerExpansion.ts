import {IGame} from '../IGame';
import {IPlayer} from '../IPlayer';
import {IProjectCard} from '../cards/IProjectCard';
import {AssembledCardDefinition} from './AssembledCardDefinition';
import {AssembleSpec} from './AssembleSpec';
import {AssemblerGenerator} from './AssemblerGenerator';
import {assembledCardName, registerAssembledCard} from './AssembledCardRegistry';
import {newAssembledCard} from './AssembledCard';

export class AssemblerExpansion {
  private constructor() {}

  /**
   * Generate a new card for this game: give it a unique name, remember it on the game (so it's
   * saved), and register it (so it can be found by name). Doesn't put it anywhere.
   * @param spec optional preset: complexity, required tags, tag count, cost range, cost adjustment.
   */
  public static create(game: IGame, spec: AssembleSpec = {}): {definition: AssembledCardDefinition, card: IProjectCard} {
    const generator = new AssemblerGenerator(game.rng);
    const name = assembledCardName(game.id, game.assembledCards.length + 1);
    const definition = generator.generate(name, spec);
    game.assembledCards.push(definition);
    registerAssembledCard(definition);
    return {definition, card: newAssembledCard(definition)};
  }

  /** The `assemble` behavior: generate `count` cards and shuffle each into the project deck. */
  public static assemble(game: IGame, count: number, player?: IPlayer, spec: AssembleSpec = {}): Array<IProjectCard> {
    const cards: Array<IProjectCard> = [];
    for (let i = 0; i < count; i++) {
      const {card} = AssemblerExpansion.create(game, spec);
      const pile = game.projectDeck.drawPile;
      pile.splice(game.rng.nextInt(pile.length + 1), 0, card);
      cards.push(card);
    }
    if (player !== undefined) {
      game.log('${0} assembled ${1} new card(s) into the deck', (b) => b.player(player).number(count));
    }
    return cards;
  }

  /** The `assemble` behavior with `into: 'hand'`: generate `count` cards straight into the player's hand. */
  public static assembleIntoHand(player: IPlayer, count: number, spec: AssembleSpec = {}): Array<IProjectCard> {
    const cards: Array<IProjectCard> = [];
    for (let i = 0; i < count; i++) {
      const {card} = AssemblerExpansion.create(player.game, spec);
      player.cardsInHand.push(card);
      cards.push(card);
    }
    player.game.log('${0} assembled ${1} new card(s) into their hand', (b) => b.player(player).number(count));
    return cards;
  }

  /** Setup: how many assembled cards are shuffled into the deck when the expansion is on. */
  public static readonly SETUP_CARDS = 12;

  /** Game setup with the expansion on: shuffle SETUP_CARDS new cards into the project deck. */
  public static setup(game: IGame): void {
    AssemblerExpansion.assemble(game, AssemblerExpansion.SETUP_CARDS);
  }
}
