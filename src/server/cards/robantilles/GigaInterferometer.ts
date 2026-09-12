import {IProjectCard} from '../IProjectCard';
import {Tag} from '../../../common/cards/Tag';
import {Card} from '../Card';
import {CardType} from '../../../common/cards/CardType';
import {CardName} from '../../../common/cards/CardName';
import {IPlayer} from '../../IPlayer';
import {CardRenderer} from '../render/CardRenderer';

/**
 * "A RESEARCH PHASE BEGINS IMMEDIATELY." This is a genuinely novel mechanic: an ad hoc,
 * mid-generation research/draft phase for every player, triggered outside the normal
 * end-of-generation flow.
 *
 * It reuses the real per-player drafting mechanism (Player.runResearchPhase, which in turn
 * uses the same draft/ChooseCards machinery as the normal generation-end research phase) rather
 * than approximating this as a plain card draw. It deliberately does NOT reuse the game-level
 * Game.gotoResearchPhase()/Game.playerIsFinishedWithResearchPhase() orchestration, because that
 * method's "everyone's done" branch is written for the *generation boundary*: it resets the turn
 * order back to the first player (Game.startActionsForPlayer), clears passed-player state, and
 * potentially advances to the production phase. Calling that path mid-generation, in the middle
 * of another player's turn, would corrupt whoever's turn it currently is.
 *
 * Instead, Player.runResearchPhase() was given an optional `onFinished` callback (see IPlayer.ts/
 * Player.ts) that defaults to the original `game.playerIsFinishedWithResearchPhase(this)` for
 * every other caller, but here supplies a lightweight completion of our own. A new
 * `Player.awaitingAdHocResearch` flag (see IPlayer.ts/Player.ts) tells the acting player's
 * `takeAction()` to leave their drafted-card selection alone instead of immediately overwriting
 * it with their normal "take your next action" prompt (which `takeAction()` unconditionally does
 * at the end of every call) -- once they answer it, the flag clears and their turn resumes via
 * `takeAction()`. Non-active players simply get an interrupt: their own drafted-card choice is
 * set immediately (players outside of their own turn otherwise have no pending input), and once
 * answered nothing else needs to happen for them.
 *
 * Known scope limits: in a draft-variant game, `runResearchPhase()` skips the draw entirely
 * (real drafting is a separate multi-round hand-passing flow driven by Draft.ts's own game-level
 * phase machinery, which isn't designed to be invoked ad hoc mid-action); this card still resolves
 * safely in that case, but with nothing to buy, rather than performing a real draft round.
 */
export class GigaInterferometer extends Card implements IProjectCard {
  constructor() {
    super({
      type: CardType.AUTOMATED,
      name: CardName.GIGA_INTERFEROMETER,
      tags: [Tag.SCIENCE],
      cost: 0,

      metadata: {
        cardNumber: 'H52',
        renderData: CardRenderer.builder((b) => {
          b.plainText('A RESEARCH PHASE BEGINS IMMEDIATELY.', true);
        }),
        description: 'Requires that each player has at least 6 M€. Immediately hold a research phase: every ' +
          'player drafts cards and may buy them, just like at the start of a generation.',
      },
    });
  }

  public override bespokeCanPlay(player: IPlayer): boolean {
    return player.game.players.every((p) => p.megaCredits >= 6);
  }

  public override bespokePlay(player: IPlayer) {
    const game = player.game;
    game.log('${0} triggers an immediate research phase for every player', (b) => b.card(this));
    for (const p of game.players) {
      const isActingPlayer = p === player;
      p.awaitingAdHocResearch = true;
      p.runResearchPhase(() => {
        game.deferredActions.runAllFor(p, () => {
          p.awaitingAdHocResearch = false;
          if (isActingPlayer) {
            p.takeAction();
          }
        });
      });
    }
    return undefined;
  }
}
