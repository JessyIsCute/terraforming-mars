import {CardName} from '../../../common/cards/CardName';
import {ModuleManifest} from '../ModuleManifest';
import {SpaceTradingStation} from './SpaceTradingStation';
import {OrbitalHeadquarters} from './OrbitalHeadquarters';
import {Observatory} from './Observatory';
import {PropellantDepot} from './PropellantDepot';
import {AutoFactory} from './AutoFactory';
import {AsteroidMine} from './AsteroidMine';
import {Freighter} from './Freighter';
import {OrbitalShipyard} from './OrbitalShipyard';
import {NavigationalBeacon} from './NavigationalBeacon';
import {Comsat} from './Comsat';
import {WeatherSatellite} from './WeatherSatellite';
import {Hydroponics} from './Hydroponics';
import {SalvageDepot} from './SalvageDepot';
import {Powersat} from './Powersat';
import {PlanetaryOutpost} from './PlanetaryOutpost';
import {SpaceHabitat} from './SpaceHabitat';
import {ScienceFacility} from './ScienceFacility';
import {Probe} from './Probe';

export const HIGH_ORBIT_CARD_MANIFEST = new ModuleManifest({
  module: 'highOrbit',
  projectCards: {
    [CardName.SPACE_TRADING_STATION]: {Factory: SpaceTradingStation, copiesInDeck: 3},
    [CardName.ORBITAL_HEADQUARTERS]: {Factory: OrbitalHeadquarters, copiesInDeck: 5},
    [CardName.OBSERVATORY]: {Factory: Observatory, copiesInDeck: 3},
    [CardName.PROPELLANT_DEPOT]: {Factory: PropellantDepot, copiesInDeck: 3},
    [CardName.AUTO_FACTORY]: {Factory: AutoFactory, copiesInDeck: 3},
    [CardName.ASTEROID_MINE]: {Factory: AsteroidMine, copiesInDeck: 5},
    [CardName.FREIGHTER]: {Factory: Freighter, copiesInDeck: 3},
    [CardName.ORBITAL_SHIPYARD]: {Factory: OrbitalShipyard, copiesInDeck: 3},
    [CardName.NAVIGATIONAL_BEACON]: {Factory: NavigationalBeacon, copiesInDeck: 3},
    [CardName.COMSAT]: {Factory: Comsat, copiesInDeck: 5},
    [CardName.WEATHER_SATELLITE]: {Factory: WeatherSatellite, copiesInDeck: 4},
    [CardName.HYDROPONICS]: {Factory: Hydroponics, copiesInDeck: 3},
    [CardName.SALVAGE_DEPOT]: {Factory: SalvageDepot, copiesInDeck: 3},
    [CardName.POWERSAT]: {Factory: Powersat, copiesInDeck: 3},
    [CardName.PLANETARY_OUTPOST]: {Factory: PlanetaryOutpost, copiesInDeck: 5},
    [CardName.SPACE_HABITAT]: {Factory: SpaceHabitat, copiesInDeck: 3},
    [CardName.SCIENCE_FACILITY]: {Factory: ScienceFacility, copiesInDeck: 4},
    [CardName.PROBE]: {Factory: Probe, copiesInDeck: 5},
  },
});
