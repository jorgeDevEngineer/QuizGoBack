import { MultiplayerSession } from "../../domain/aggregates/MultiplayerSession";
import { HostLobbyUpdateResponseDto } from "../responseDtos/LobbyStateUpdateResponse.dto";

export const MapHostLobbyData = ( session: MultiplayerSession ): HostLobbyUpdateResponseDto => {

    const state = session.getSessionStateType();

    const players = session.getPlayers().map( player => ({
        playerId: player.getId().getId(),
        nickname: player.getNickname().getNickname(),
    }));

    return {
        state: state,
        players: players,
        numberOfPlayers: players.length,
    }

}