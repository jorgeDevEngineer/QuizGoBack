export interface PlayerLeaderboardEntry {
    playerId: string
    nickname: string,
    score: number,            // Puntaje total acumulado
    rank: number,             // Posición actual (1, 2, 3...)
    previousRank: number,     // (Opcional)
}