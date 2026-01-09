import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { PlayerLobbyUpdateResponseDto } from "../responseDtos/LobbyStateUpdateResponse.dto";
import { PlayerId } from "../../domain/valueObjects/playerVOs";

export const MapPlayerLobbyData = ( session: MultiplayerSession, userId: string ): PlayerLobbyUpdateResponseDto => {

    const playerId = PlayerId.of( userId );
    const state = session.getSessionStateType();
    const player = session.getPlayerById( playerId );

    return { 
        state: state,
        nickname: player.getNickname().getNickname(),
        score: player.getScore().getScore(),
        connectedBefore: false, // Es false porque asumimos aca que el usuario se acaba de conectar por primera vez bajo ese nickname
    }; 

}