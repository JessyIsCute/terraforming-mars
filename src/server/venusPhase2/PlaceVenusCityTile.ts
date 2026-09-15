import {Space} from '../boards/Space';
import {IPlayer} from '../IPlayer';
import {BasePlaceVenusPhase2Tile} from './BasePlaceVenusPhase2Tile';
import {VenusPhase2Data} from './VenusPhase2Data';
import {VenusPhase2Expansion} from './VenusPhase2Expansion';

// A plain City tile on the Venus surface board -- the "Venus Habitat" placement several Venus
// Phase 2 fan cards describe (New Alexandria, New Athens, New Rome, New Babylon, etc.).
export class PlaceVenusCityTile extends BasePlaceVenusPhase2Tile {
  constructor(
    player: IPlayer,
    spaces?: Array<Space>,
    title: string = 'Select a space on the Venus surface for a City.',
  ) {
    super(player, spaces, title);
  }

  protected getSpaces(data: VenusPhase2Data) {
    return data.venusSurface.getAvailableSpacesForLand(this.player);
  }

  public placeTile(space: Space) {
    VenusPhase2Expansion.addCityTile(this.player, space.id);
    return undefined;
  }
}
