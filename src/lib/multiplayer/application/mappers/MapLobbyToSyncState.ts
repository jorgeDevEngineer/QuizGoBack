import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { SyncStateCommand } from "../parameterObjects/SyncStateCommand";
import { SyncStateResponseDto } from "../responseDtos/SyncStateResponse.dto";
import { SyncType } from "../responseDtos/enums/SyncType.enum";
import { PlayerId } from "../../domain/valueObjects/playerVOs";
import { IsHost } from "../helpers/isHost";
import { MapHostLobbyData } from "../helpers/MapHostLobbyData";
import { MapPlayerLobbyData } from "../helpers/MapPlayerLobbyData";

export const MapLobbyToSyncState = ( 
    session: MultiplayerSession,
    userInfo: SyncStateCommand 
): SyncStateResponseDto => {

    if( IsHost( userInfo.userId, session.getHostId().value ) ){

        const hostData = MapHostLobbyData( session );

        return { type: SyncType.HOST_LOBBY_UPDATE, data: { ...hostData } }

    } else if( session.isPlayerAlreadyJoined( PlayerId.of( userInfo.userId ) )) {

        // Devolvermos ambas porque el Host debe ser notificado de la reconexion de un usuario registrado tambien, este ya paso por player join
        const playerData = MapPlayerLobbyData( session, userInfo.userId );

        const hostData = MapHostLobbyData( session );

        return { 
            type: SyncType.PLAYER_LOBBY_STATE_UPDATE, 
            data: { 
                hostLobbyUpdate: hostData,
                playerLobbyUpdate: playerData,
            } 
        }

    } else {

        return { type: SyncType.PLAYER_LOBBY_STATE_UPDATE, data: undefined, additionalData: { isJoined: false }  }

    }

}