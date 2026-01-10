import { SessionStateType } from "../../domain/valueObjects/multiplayerVOs";
import { PlayerLeaderboardEntry } from "./types/PlayerLeaderboardEntry.interface";
import { HostNextPhaseType } from "./enums/HostNextPhaseType.enum";

interface CurrentProgress {
    current: number;
    total: number;
}

interface HostCurrentProgress extends CurrentProgress {
    isLastSlide: boolean,
}

export interface QuestionResultsHostResponseDto {

    state: SessionStateType, 
    correctAnswerId: string[], 
    leaderboard: PlayerLeaderboardEntry[], 
    stats: {
        totalAnswers: number,
        distribution: Record<string, number> // Para el gráfico de barras: { "0": 12, "1": 5, "2": 0, "3": 1 }
    },
    progress: HostCurrentProgress 
}

export interface QuestionResultsPlayerResponseDto {
    state: SessionStateType,
    isCorrect: boolean,
    pointsEarned: number,
    totalScore: number,
    rank: number, // "Estás en el puesto 12"
    previousRank: number, // Estabas antes en el puest 24!
    streak: number,
    correctAnswerIds: string[], // Para que vea cuál era la buena
    message: string // Mensaje motivacional calculado en back
    progress: CurrentProgress
}

export interface QuestionResultsResponseDto {
    type: HostNextPhaseType.QUESTION_RESULTS,
    hostData: QuestionResultsHostResponseDto,
    playerData: Map<string, QuestionResultsPlayerResponseDto>,
}