import { SessionStateType } from "../../domain/valueObjects/multiplayerVOs";
import { HostNextPhaseType } from "./enums/HostNextPhaseType.enum";
import { PlayerLeaderboardEntry } from "./types/PlayerLeaderboardEntry.interface";

export interface HostEndGameResponseDto {
    state: SessionStateType, 
    finalPodium: PlayerLeaderboardEntry[]; // El top importante para el front
    winner: PlayerLeaderboardEntry;   // El ganador rapidamente sin calculos
    totalParticipants: number;
}

// Payload para el JUGADOR
export interface PlayerEndGameResponseDto {
    state: SessionStateType,
    rank: number;          // "Quedaste en el puesto 15"
    totalScore: number;    // "Hiciste 12,000 puntos"
    isPodium: boolean;     // Para mostrar un diseño dorado/especial si quedó en el top 3
    isWinner: boolean;     // Para mostrar "¡GANASTE!" vs "Buen intento"
    finalStreak: number;
}


export interface GameEndedResponseDto {
    type: HostNextPhaseType.GAME_END,
    hostData: HostEndGameResponseDto,
    playerData: Map<string, PlayerEndGameResponseDto>
}