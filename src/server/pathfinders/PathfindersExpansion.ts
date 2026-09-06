import {AddResourcesToCard} from '../deferredActions/AddResourcesToCard';
import {CardName} from '../../common/cards/CardName';
import {IGame} from '../IGame';
import {ICard} from '../cards/ICard';
import {PathfindersData, PLANETARY_TAGS, PlanetaryTag, isPlanetaryTag} from './PathfindersData';
import {PlaceCityTile} from '../deferredActions/PlaceCityTile';
import {PlaceGreeneryTile} from '../deferredActions/PlaceGreeneryTile';
import {PlaceMoonMineTile} from '../moon/PlaceMoonMineTile';
import {PlaceMoonRoadTile} from '../moon/PlaceMoonRoadTile';
import {PlaceOceanTile} from '../deferredActions/PlaceOceanTile';
import {PLANETARY_TRACKS} from '../../common/pathfinders/PlanetaryTracks';
import {IPlayer} from '../IPlayer';
import {Resource} from '../../common/Resource';
import {CardResource} from '../../common/CardResource';
import {Reward} from '../../common/pathfinders/Reward';
import {SelectResource} from '../inputs/SelectResource';
import {SendDelegateToArea} from '../deferredActions/SendDelegateToArea';
import {Tag} from '../../common/cards/Tag';
import {Turmoil} from '../turmoil/Turmoil';
import {VictoryPointsBreakdownBuilder} from '../game/VictoryPointsBreakdownBuilder';
import {GlobalEventName} from '../../common/turmoil/globalEvents/GlobalEventName';
import {Priority} from '../deferredActions/Priority';
import {message} from '../logs/MessageBuilder';

export class PathfindersExpansion {
  private constructor() {
  }

  public static initialize(game: IGame): PathfindersData {
    return {
      venus: game.tags.includes(Tag.VENUS) ? 0 : -1,
      earth: 0,
      mars: 0,
      jovian: 0,
      moon: game.tags.includes(Tag.MOON) ? 0 : -1,
      vps: [],
    };
  }

  public static onCardPlayed(player: IPlayer, card: ICard) {
    if (player.game.gameOptions.pathfindersExpansion === false) {
      return;
    }
    const tags = card.tags;
    tags.forEach((tag) => {
      if (isPlanetaryTag(tag)) {
        PathfindersExpansion.raiseTrack(tag, player);
      }
    });
  }

  public static willGainEnergyProductionOnNextMarsTag(player: IPlayer, count: 1 | 2 = 1): boolean {
    const data = player.game.pathfindersData;
    if (data === undefined) {
      return false;
    }
    const idx = data[Tag.MARS] + count;
    const rewards = PLANETARY_TRACKS[Tag.MARS].spaces[idx]?.risingPlayer;

    if (rewards === undefined) {
      return false;
    }
    if (rewards.includes('energy_production')) {
      return true;
    }
    if (count === 2) {
      return this.willGainEnergyProductionOnNextMarsTag(player, 1);
    }
    return false;
  }

  public static raiseTrack(tag: PlanetaryTag, player: IPlayer, steps: number = 1): void {
    // Planet PR: any track raise of 1+ steps goes 1 step further, including the raise
    // triggered by playing Planet PR itself (it's already in the tableau by this point).
    if (steps >= 1 && player.tableau.has(CardName.PLANET_PR)) {
      steps += 1;
    }
    PathfindersExpansion.raiseTrackEssense(tag, player, player.game, steps, true);
  }

  public static raiseTrackForGlobalEvent(tag: PlanetaryTag, name: GlobalEventName, game: IGame, steps: number = 1, gainRewards: boolean = true): void {
    PathfindersExpansion.raiseTrackEssense(tag, name, game, steps, gainRewards);
  }

  private static raiseTrackEssense(tag: PlanetaryTag, from: IPlayer | GlobalEventName, game: IGame, steps: number = 1, gainRewards: boolean = true): void {
    const data = game.pathfindersData;
    if (data === undefined) {
      return;
      // throw new Error('Pathfinders not defined');
    }

    const track = PLANETARY_TRACKS[tag];
    if (track === undefined) {
      return;
    }

    let space = data[tag];

    // Do not raise tracks unused this game.
    if (space === -1) {
      return;
    }

    const lastSpace = Math.min(track.spaces.length - 1, space + steps);
    const distance = lastSpace - space;
    if (distance === 0) {
      return;
    }

    if (typeof(from) === 'object') {
      game.log('${0} raised the ${1} planetary track ${2} step(s)', (b) => {
        b.player(from).string(tag).number(distance);
      });
    } else {
      game.log('Global Event ${0} raised the ${1} planetary track ${2} step(s)', (b) => {
        b.globalEventName(from).string(tag).number(distance);
      });
    }

    // game.indentation++;
    while (space < lastSpace) {
      space++;
      data[tag] = space;
      const rewards = track.spaces[space];

      // Can be false because of the Constant Struggle global event.
      if (gainRewards) {
        if (typeof(from) === 'object') {
          rewards.risingPlayer.forEach((reward) => {
            PathfindersExpansion.grant(reward, from, tag);
          });
          if (rewards.risingPlayer.length > 0) {
            PathfindersExpansion.grantPlanetPrBonus(from, tag);
          }
        }
      }
      rewards.everyone.forEach((reward) => {
        game.players.forEach((p) => {
          PathfindersExpansion.grant(reward, p, tag);
        });
      });
      if (rewards.mostTags.length > 0) {
        const players = PathfindersExpansion.playersWithMostTags(
          tag,
          game.players.slice(),
          (typeof(from) === 'object') ? from : undefined);
        rewards.mostTags.forEach((reward) => {
          players.forEach((p) => {
            PathfindersExpansion.grant(reward, p, tag);
          });
        });
      }
      // game.indentation--;
    }
  }

  /**
   * Grant the specified award.
   *
   * @param reward the reward to grant
   * @param player the player gaining the reward (which may not be the same as the player who triggers the reward)
   * @param tag the tag associated with the reward (used for logging VP rewards.)
   */
  public static grant(reward: Reward, player: IPlayer, tag: PlanetaryTag): void {
    const game = player.game;

    switch (reward) {
    case '1vp':
      game.pathfindersData?.vps.push({id: player.id, tag, points: 1});
      game.log('${0} has the most ${1} tags and earns 1VP', (b) => b.player(player).string(tag));
      break;
    case '2vp':
      game.pathfindersData?.vps.push({id: player.id, tag, points: 2});
      game.log('${0} has the most ${1} tags and earns 2VP', (b) => b.player(player).string(tag));
      break;
    case '3mc':
      player.stock.add(Resource.MEGACREDITS, 3, {log: true});
      break;
    case '6mc':
      player.stock.add(Resource.MEGACREDITS, 6, {log: true});
      break;
    //   break;
    case 'card':
      player.drawCard();
      break;
    case 'city':
      game.defer(new PlaceCityTile(player));
      break;
    case 'delegate':
      Turmoil.ifTurmoilElse(game,
        (turmoil) => {
          if (turmoil.hasDelegatesInReserve(player)) {
            game.defer(new SendDelegateToArea(player));
          }
        },
        () => player.stock.add(Resource.MEGACREDITS, 3, {log: true}));
      break;
    case 'energy':
      player.stock.add(Resource.ENERGY, 1, {log: true});
      break;
    case 'energy_production':
      player.production.add(Resource.ENERGY, 1, {log: true});
      break;
    case 'floater':
      game.defer(new AddResourcesToCard(player, CardResource.FLOATER));
      break;
    case 'greenery':
      game.defer(new PlaceGreeneryTile(player));
      break;
    case 'heat':
      player.stock.add(Resource.HEAT, 1, {log: true});
      break;
    case 'heat_production':
      player.production.add(Resource.HEAT, 1, {log: true});
      break;
    case 'moon_mine':
      game.defer(new PlaceMoonMineTile(player));
      break;
    case 'moon_road':
      game.defer(new PlaceMoonRoadTile(player));
      break;
    case 'ocean':
      game.defer(new PlaceOceanTile(player));
      break;
    case 'plant':
      player.stock.add(Resource.PLANTS, 1, {log: true});
      break;
    case 'plant_production':
      player.production.add(Resource.PLANTS, 1, {log: true});
      break;
    case 'any_resource':
    case 'resource':
      player.defer(new SelectResource(message('Gain ${0} units of a standard resource', (b) => b.number(1)))
        .andThen((unit) => {
          player.stock.add(unit, 1, {log: true});
          return undefined;
        }));
      break;
    case 'steel':
      player.stock.add(Resource.STEEL, 1, {log: true});
      break;
    case 'steel_production':
      player.production.add(Resource.STEEL, 1, {log: true});
      break;
    case 'titanium':
      player.stock.add(Resource.TITANIUM, 1, {log: true});
      break;
    case 'titanium_production':
      player.production.add(Resource.TITANIUM, 1, {log: true});
      break;
    case 'tr':
      player.increaseTerraformRating();
      break;
    case 'venus_scale':
      if (game.gameOptions.venusNextExtension) {
        game.increaseVenusScaleLevel(player, 1);
      } else {
        player.game.log('TODO: come up with some reward in place of Increase Venus Scale.');
      }
      break;
    default:
      throw new Error('Unknown reward: ' + reward);
    }
  }

  /** Planet PR: whenever you trigger a planetary track bonus, also gain a small track-specific reward. */
  private static grantPlanetPrBonus(player: IPlayer, tag: PlanetaryTag): void {
    if (!player.tableau.has(CardName.PLANET_PR)) {
      return;
    }
    switch (tag) {
    case Tag.VENUS:
      player.game.defer(new AddResourcesToCard(player, CardResource.FLOATER));
      break;
    case Tag.EARTH:
      player.stock.add(Resource.MEGACREDITS, 2, {log: true});
      break;
    case Tag.MARS:
    case Tag.MOON:
      player.stock.add(Resource.STEEL, 1, {log: true});
      break;
    case Tag.JOVIAN:
      player.stock.add(Resource.TITANIUM, 1, {log: true});
      break;
    }
  }

  /**
   * Planet PR's other passive: at the start of every generation, whichever planetary
   * track is currently furthest along (and hasn't already reached its end) drops back 3
   * steps, clamped to 0. Does nothing if there's no unique leader, if no player in the
   * game has this corporation, or if the leading track is already at position 0.
   */
  public static applyPlanetPrTrackDecay(game: IGame): void {
    const owner = game.players.find((p) => p.tableau.has(CardName.PLANET_PR));
    if (owner === undefined) {
      return;
    }
    const data = game.pathfindersData;
    if (data === undefined) {
      return;
    }

    let leadingTag: PlanetaryTag | undefined;
    let leadingPos = -1;
    let tied = false;

    for (const tag of PLANETARY_TAGS) {
      const pos = data[tag];
      const track = PLANETARY_TRACKS[tag];
      if (pos < 0 || track === undefined) {
        continue; // Not used this game.
      }
      if (pos >= track.spaces.length - 1) {
        continue; // Already at the end.
      }
      if (pos > leadingPos) {
        leadingPos = pos;
        leadingTag = tag;
        tied = false;
      } else if (pos === leadingPos) {
        tied = true;
      }
    }

    if (leadingTag === undefined || tied || leadingPos <= 0) {
      return;
    }

    const newPos = Math.max(0, leadingPos - 3);
    const tag = leadingTag;
    data[tag] = newPos;
    game.log('${0}\'s Planet PR lowers the ${1} planetary track ${2} step(s)', (b) => b.player(owner).string(tag).number(leadingPos - newPos));
  }

  private static playersWithMostTags(tag: Tag, players: Array<IPlayer>, activePlayer: IPlayer | undefined): Array<IPlayer> {
    const counts = players.map((player) => {
      // Wild tags only apply to a player taking an action.
      const includeWildTags = player.id === activePlayer?.id;
      const count = player.tags.count(tag, includeWildTags ? 'default' : 'raw');
      return {player, count};
    });
    const max = Math.max(...counts.map((c) => c.count));
    const filtered = counts.filter((c) => c.count === max);
    const result = filtered.map((c) => c.player);
    return result;
  }

  public static calculateVictoryPoints(player: IPlayer, builder: VictoryPointsBreakdownBuilder) {
    const data = player.game.pathfindersData;
    if (data === undefined) {
      return;
    }
    data.vps
      .filter((vp) => vp.id === player.id)
      .forEach((vp) => builder.setVictoryPoints('planetary tracks', vp.points, vp.tag));
  }

  public static addToSolBank(player: IPlayer) {
    const solBank = player.tableau.get(CardName.SOLBANK);
    if (solBank !== undefined) {
      player.defer(
        () => player.addResourceTo(solBank, {qty: 1, log: true}),
        Priority.GAIN_RESOURCE_OR_PRODUCTION);
    }
  }
}
