import { Socket } from "socket.io";

import { HostLobbyUpdateResponseDto } from "../../application/responseDtos/LobbyStateUpdateResponse.dto";
import { PlayerLobbyUpdateResponseDto } from "../../application/responseDtos/LobbyStateUpdateResponse.dto";

import { HostUserEvents, PlayerUserEvents, ServerErrorEvents, ServerEvents, ClientEvents } from "./WebSocketEvents.enum";
import { SessionRoles } from "./SessionRoles.enum";

export interface ServerToClientEvents { 
   // Eventos exitosos
  [ServerEvents.HOST_CONNECTED_SUCCESS]: (payload: { status: 'IN_LOBBY - CONNECTED TO SERVER' }) => void;
  [ServerEvents.PLAYER_CONNECTED_TO_SERVER]: (payload: { status: 'IN_LOBBY - CONNECTED TO SERVER' }) => void;
  [ServerEvents.HOST_LOBBY_UPDATE]: (payload: HostLobbyUpdateResponseDto) => void;
  [ServerEvents.PLAYER_CONNECTED_TO_SESSION]: (payload: PlayerLobbyUpdateResponseDto ) => void;  
  //[ServerEvents.QUESTION_STARTED]:(payload: QuestionStartedResponse) => void; 
  //[ServerEvents.HOST_ANSWERS_UPDATE]:(payload: PlayerSubmitAnswerResponse ) => void; 

  //[ServerEvents.PLAYER_ANSWER_CONFIRMATION]:(payload: { status: 'ANSWER SUCCESFULLY SUBMITTED' }) => void; 
  //[ServerEvents.HOST_RESULTS]:(payload: QuestionResultsHostResponse ) => void;
  //[ServerEvents.PLAYER_RESULTS]:(payload: QuestionResultsPlayerResponse ) => void;
  //[ServerEvents.HOST_GAME_END]:(payload: HostEndGameResponse ) => void; 
  //[ServerEvents.PLAYER_GAME_END]:(payload: PlayerEndGameResponse ) => void;
  [ServerEvents.PLAYER_LEFT_SESSION]:(payload: { userId: string, nickname: string, message: string}) => void; 
  [ServerEvents.HOST_LEFT_SESSION]:(payload: { message: string }) => void; 
  [ServerEvents.HOST_RETURNED_TO_SESSION]:(payload: { message: string }) => void; 
  //[ServerEvents.SESSION_CLOSED]:(payload: SessionClosed ) => void; 


   // Errores
  [ServerErrorEvents.FATAL_ERROR]: (payload: { statusCode: number, message: string }) => void;
  [ServerErrorEvents.UNAVAILABLE_SESSION]: (payload: { statusCode: number, message: string }) => void;
  [ServerErrorEvents.SYNC_ERROR]: (payload: { statusCode: number, message: string }) => void;

}

export interface ClientToServerEvents {

  [ClientEvents.CLIENT_READY]: () => void;

  [PlayerUserEvents.PLAYER_JOIN]: (payload: {}) => void;
  //[PlayerUserEvents.PLAYER_SUBMIT_ANSWER]: (payload: PlayerSubmitAnswerDto ) => void;

  [HostUserEvents.HOST_START_GAME]: (payload: {}) => void;

}


export interface SocketData {
    
    nickname: string,
    userId: string,
    roomPin: string
    role: SessionRoles,
    // isAuthenticated: boolean;
    
}

// Comunicación entre Servidores (raramente se usa en apps sencillas)
export interface InterServerEvents {
  // Ej: Un servidor notifica a otro en un entorno multi-servidor (clustering)
  ping: () => void;
}


export type SessionSocket = Socket<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>;