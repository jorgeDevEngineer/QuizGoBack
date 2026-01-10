import { HostEndGameResponseDto } from "../GameEndedResponses.dto";
import { PlayerEndGameResponseDto } from "../GameEndedResponses.dto";
import { HostLobbyUpdateResponseDto } from "../LobbyStateUpdateResponse.dto";
import { LobbyStateUpdateResponseDto } from "../LobbyStateUpdateResponse.dto";
import { PlayerLobbyUpdateResponseDto } from "../LobbyStateUpdateResponse.dto";
import { QuestionResultsHostResponseDto } from "../QuestionResultResponses.dto";
import { QuestionResultsPlayerResponseDto } from "../QuestionResultResponses.dto";
import { QuestionStartedResponseDto } from "../QuestionStartedResponse.dto";

export type SyncData = 
    QuestionStartedResponseDto
    | QuestionResultsHostResponseDto | QuestionResultsPlayerResponseDto
    | HostEndGameResponseDto | PlayerEndGameResponseDto
    | LobbyStateUpdateResponseDto | HostLobbyUpdateResponseDto | PlayerLobbyUpdateResponseDto;