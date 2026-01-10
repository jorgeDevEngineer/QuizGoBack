import { QuestionStartedResponseDto } from "../QuestionStartedResponse.dto";
import { QuestionResultsResponseDto } from "../QuestionResultResponses.dto";
import { GameEndedResponseDto } from "../GameEndedResponses.dto";

export type HostNextPhaseResponseDto = QuestionStartedResponseDto | QuestionResultsResponseDto | GameEndedResponseDto;