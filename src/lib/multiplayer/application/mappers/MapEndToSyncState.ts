import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { PlayerId } from "../../domain/valueObjects/playerVOs";
import { SyncStateCommand } from "../parameterObjects/SyncStateCommand";
import { SyncStateResponseDto } from "../responseDtos/SyncStateResponse.dto";
import { SyncType } from "../responseDtos/enums/SyncType.enum";
import { IsHost } from "../helpers/IsHost";
import { MapHostEndData } from "../helpers/MapHostEndData";
import { MapPlayerEndData } from "../helpers/MapPlayerEndData";


export const MapEndToSyncState = ( 
    session: MultiplayerSession, 
    userInfo: SyncStateCommand 
): SyncStateResponseDto => {

    if( IsHost( userInfo.userId , session.getHostId().value ) ){

        const hostData = MapHostEndData( session );

        return { type: SyncType.HOST_END_GAME, data: { ...hostData } }

    } else {

        const entry = session.getOnePlayerLeaderboardEntry( PlayerId.of( userInfo.userId ) );

        const playerData = MapPlayerEndData( session, entry );

        return { type: SyncType.PLAYER_END_GAME, data: { ...playerData } };
        
    }

}