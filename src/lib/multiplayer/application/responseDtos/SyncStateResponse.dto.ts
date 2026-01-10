import { SyncType } from "./enums/SyncType.enum";
import { SyncData } from "./types/SyncData.type";

export interface QuestionAdditionalData {
    timeRemainingMs: number;
    hasAnswered?: boolean;
}

export interface LobbydditionalData {
    isJoined: boolean
}

export interface SyncStateResponseDto { 

    type: SyncType

    data?: SyncData;

    // Esto es contexto extra que podemos usar o no
    additionalData?: QuestionAdditionalData | LobbydditionalData

}