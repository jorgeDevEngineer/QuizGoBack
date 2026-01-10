import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { HostNextPhaseType } from "../responseDtos/enums/HostNextPhaseType.enum";
import { GameEndedResponseDto } from "../responseDtos/GameEndedResponses.dto";
import { PlayerEndGameResponseDto } from "../responseDtos/GameEndedResponses.dto";
import { MapHostEndData } from "../helpers/MapHostEndData";
import { MapPlayerEndData } from "../helpers/MapPlayerEndData";

export const MapFinalScoreboard = ( session: MultiplayerSession ): GameEndedResponseDto => {
    
    // Mappeamos la data para el host
    const hostData = MapHostEndData( session );

    // Ahora mappeamos la respuesta para cada jugador
    const entries = session.getPlayersLeaderboardEntries();
    const playerData: Map<string, PlayerEndGameResponseDto> = new Map();
    
    entries.forEach( entry => {

        const mappedEntryData = MapPlayerEndData( session, entry );
        
        playerData.set( entry.getPlayerId().getId() , mappedEntryData );
            
    });

    const response: GameEndedResponseDto = {
        type: HostNextPhaseType.GAME_END,
        hostData: hostData,
        playerData: playerData
    };  

    return response;
}