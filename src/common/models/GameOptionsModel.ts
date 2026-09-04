import {BoardName} from '../boards/BoardName';
import {GlobalParametersConfig} from '../GlobalParameterConfig';
import {RandomMAOptionType} from '../ma/RandomMAOptionType';
import {AgendaStyle} from '../turmoil/Types';
import {CardName} from '../cards/CardName';
import {Expansion} from '../cards/GameModule';
import {EscapeVelocityOptions} from '../game/NewGameConfig';

export type GameOptionsModel = {
  aresExtremeVariant: boolean,
  altVenusBoard: boolean,
  boardName: BoardName,
  /** Global-parameter track overrides (custom boards only); absent means the official tracks. */
  globalParameters?: GlobalParametersConfig,
  /** Row count of a custom board, so the client can render its voided (carved-out) cells. */
  customBoardRows?: number,
  bannedCards: ReadonlyArray<CardName>;
  expansions: Record<Expansion, boolean>,
  draftVariant: boolean,
  escapeVelocity?: EscapeVelocityOptions,
  fastModeOption: boolean,
  includedCards: ReadonlyArray<CardName>;
  includeFanMA: boolean,
  initialDraftVariant: boolean,
  preludeDraftVariant: boolean,
  ceosDraftVariant: boolean,
  politicalAgendasExtension: AgendaStyle,
  removeNegativeGlobalEvents: boolean,
  showOtherPlayersVP: boolean,
  showTimers: boolean,
  shuffleMapOption: boolean,
  solarPhaseOption: boolean,
  soloTR: boolean,
  randomMA: RandomMAOptionType,
  requiresMoonTrackCompletion: boolean,
  requiresVenusTrackCompletion: boolean,
  twoCorpsVariant: boolean,
  undoOption: boolean,
}
