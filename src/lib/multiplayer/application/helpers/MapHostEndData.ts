import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { HostEndGameResponseDto } from "../responseDtos/GameEndedResponses.dto";

export const MapHostEndData = ( session: MultiplayerSession ): HostEndGameResponseDto => {

    const state = session.getSessionStateType();
    
    const playerPodium = session.getTopThree().map( entry => ({
            playerId: entry.getPlayerId().getId(),
            nickname: entry.getNickname().getNickname(),
            score: entry.getScore().getScore(),            
            rank: entry.getRank(),          
            previousRank: entry.getPreviousRank(),  
    }));

    return {
        state: state,
        finalPodium: playerPodium,
        winner: playerPodium[0],
        totalParticipants: session.getPlayers().length,
    };


}