import { SessionStateType } from "../../domain/valueObjects/multiplayerVOs";
import { QuestionWithoutAnswers } from "./types/QuestionWithoutAnswers.interface";
import { HostNextPhaseType } from "./enums/HostNextPhaseType.enum";
import { QuestionAdditionalData } from "./SyncStateResponse.dto";

export interface QuestionStartedResponseDto {
    type: HostNextPhaseType.QUESTION_STARTED,
    data: {
        state: SessionStateType,
        // questionIndex: number,
        currentSlideData: QuestionWithoutAnswers,
    }
    additionalData?: QuestionAdditionalData
}