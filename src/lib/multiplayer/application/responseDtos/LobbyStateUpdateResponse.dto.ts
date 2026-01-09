import { SessionStateType } from "../../domain/valueObjects/multiplayerVOs";

interface PlayerData {
    playerId: string,
    nickname: string,
}


export interface PlayerLobbyUpdateResponseDto {

    state: SessionStateType,
    nickname: string,
    score: number,
    connectedBefore: boolean, 
}

export interface HostLobbyUpdateResponseDto {

    state: SessionStateType,
    players: PlayerData[],
    numberOfPlayers: number,

}

export interface LobbyStateUpdateResponseDto {

   hostLobbyUpdate?: HostLobbyUpdateResponseDto;

   playerLobbyUpdate: PlayerLobbyUpdateResponseDto;
        
}