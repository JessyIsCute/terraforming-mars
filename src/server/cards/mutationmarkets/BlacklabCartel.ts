import {Tag} from '../../../common/cards/Tag';
import {CardName} from '../../../common/cards/CardName';
import {CardRenderer} from '../render/CardRenderer';
import {CorporationCard} from '../corporation/CorporationCard';
import {ICorporationCard} from '../corporation/ICorporationCard';
import {IActionCard} from '../ICard';
import {IPlayer} from '../../IPlayer';
import {IProjectCard} from '../IProjectCard';
import {PlayerId} from '../../../common/Types';
import {UnderworldExpansion} from '../../underworld/UnderworldExpansion';
import {InfectionEffects} from '../../mutationmarkets/InfectionEffects';
import {InfectionName} from '../../../common/mutationmarkets/InfectionName';
import {INFECTION_DEFINITIONS} from '../../../common/mutationmarkets/InfectionDefinitions';
import {describeInfectionEffect} from '../../../common/mutationmarkets/describeInfection';
import {SelectPlayer} from '../../inputs/SelectPlayer';
import {SelectCard} from '../../inputs/SelectCard';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectOption} from '../../inputs/SelectOption';
import {inplaceShuffle} from '../../utils/shuffle';
import {SerializedCard} from '../../SerializedCard';

export class BlacklabCartel extends CorporationCard implements ICorporationCard, IActionCard {
  private lastTargetId?: PlayerId;

  constructor() {
    super({
      name: CardName.BLACKLAB_CARTEL,
      tags: [Tag.SCIENCE, Tag.CRIME],
      startingMegaCredits: 38,

      behavior: {
        underworld: {corruption: 1},
      },

      action: {
        spend: {corruption: 1},
      },

      metadata: {
        cardNumber: 'MM01',
        description: 'You start with 38 M€ and 1 corruption.',
        renderData: CardRenderer.builder((b) => {
          b.megacredits(38).corruption(1).br;
          b.action('Spend 1 corruption. Look at 2 random cards from an opponent\'s hand, choose one, and infect it.', (ab) => {
            ab.corruption(1).startAction.cards(2).asterix();
          });
        }),
      },
    });
  }

  private targets(player: IPlayer): Array<IPlayer> {
    const withCards = player.opponents.filter((p) => p.cardsInHand.length > 0);
    if (player.opponents.length <= 1) {
      // 2-player game: only one possible opponent, so there's nothing to rotate.
      return withCards;
    }
    const rotated = withCards.filter((p) => p.id !== this.lastTargetId);
    // Don't block the action just because the only remaining candidate was targeted last time.
    return rotated.length > 0 ? rotated : withCards;
  }

  public canAct(player: IPlayer): boolean {
    return player.underworldData.corruption > 0 && this.targets(player).length > 0;
  }

  public action(player: IPlayer) {
    const game = player.game;
    UnderworldExpansion.loseCorruption(player, 1, {log: true});

    return new SelectPlayer(this.targets(player), 'Select a player to infect', 'Target')
      .andThen((opponent: IPlayer) => {
        this.lastTargetId = opponent.id;

        const shuffled = opponent.cardsInHand.slice();
        inplaceShuffle(shuffled, game.rng);
        const revealed = shuffled.slice(0, Math.min(2, shuffled.length));
        game.log('${0} revealed ${1} from ${2}\'s hand', (b) => b.player(player).cards(revealed).player(opponent));

        return new SelectCard('Choose a card to infect', 'Infect', revealed, {showOwner: true})
          .andThen((cards: ReadonlyArray<IProjectCard>) => {
            const target = cards[0];
            const orOptions = new OrOptions();
            for (const infection of Object.values(InfectionName)) {
              const definition = INFECTION_DEFINITIONS[infection];
              orOptions.options.push(
                new SelectOption(`${definition.prefix}: ${describeInfectionEffect(definition.effect)}`, 'Infect')
                  .andThen(() => {
                    target.infections = target.infections === undefined ?
                      [InfectionEffects.apply(infection)] :
                      [...target.infections, InfectionEffects.apply(infection)];
                    game.log('${0} infected ${1} with ${2}', (b) => b.player(player).card(target).string(definition.name));
                    return undefined;
                  }));
            }
            return orOptions;
          });
      });
  }

  public serialize(serialized: SerializedCard): void {
    serialized.blacklabCartelLastTargetId = this.lastTargetId;
  }

  public deserialize(serialized: SerializedCard): void {
    this.lastTargetId = serialized.blacklabCartelLastTargetId;
  }
}
