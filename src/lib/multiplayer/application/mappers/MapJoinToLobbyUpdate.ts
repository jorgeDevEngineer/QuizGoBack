import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { Player } from "../../domain/entities/Player";
import { LobbyStateUpdateResponseDto } from "../responseDtos/LobbyStateUpdateResponse.dto";
import { MapHostLobbyData } from "../helpers/MapHostLobbyData";
import { MapPlayerLobbyData } from "../helpers/MapPlayerLobbyData";

export const MapJoinToLobbyUpdate = ( player: Player, session: MultiplayerSession ): LobbyStateUpdateResponseDto => {

    // Construimos la response del game_state_update
    // mapeamos la respuesta para el host
    const hostData = MapHostLobbyData( session );

    // mapeamos la respuesta para el player
    const playerData = MapPlayerLobbyData( session, player.getId().getId() );

    return {
        hostLobbyUpdate: hostData,
        playerLobbyUpdate: playerData
    }; 

};