import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { LeaderboardEntry } from "../../domain/valueObjects/multiplayerVOs";
import { PlayerEndGameResponseDto } from "../responseDtos/GameEndedResponses.dto";

export const MapPlayerEndData = ( session: MultiplayerSession, entry: LeaderboardEntry ): PlayerEndGameResponseDto => {

    const state = session.getSessionStateType();

    const playerId = entry.getPlayerId();

    const player = session.getPlayerById( playerId );

    const rank = entry.getRank()

    return {
        state: state,
        rank: rank,         
        totalScore: player.getScore().getScore(),   
        isPodium: rank >= 1 && rank <= 3,    
        isWinner: rank === 1,     
        finalStreak: player.getStreak(),
    }

}