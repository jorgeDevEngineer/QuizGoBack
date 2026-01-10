
export enum ClientEvents {

    CLIENT_READY = "client_ready",

}



export enum HostUserEvents {

    HOST_START_GAME = "host_start_game",
    HOST_NEXT_PHASE = "host_next_phase",
    HOST_END_SESSION = "host_end_session"

}

export enum PlayerUserEvents {

    PLAYER_SUBMIT_ANSWER = "player_submit_answer",
    PLAYER_JOIN = "player_join",

}


export enum ServerEvents {

    // Eventos provenientes de infraestructura 
    HOST_CONNECTED_SUCCESS = "host_connected_success",
    PLAYER_CONNECTED_TO_SERVER = "player_connected_to_server",
    PLAYER_ANSWER_CONFIRMATION = "player_answer_confirmation",
    PLAYER_LEFT_SESSION = "player_left_session",
    HOST_LEFT_SESSION = "host_left_session",
    HOST_RETURNED_TO_SESSION = "host_returned_to_session",

    // Eventos provenientes de aplicación
    HOST_LOBBY_UPDATE = "host_lobby_update",
    PLAYER_CONNECTED_TO_SESSION = "player_connected_to_session",
    QUESTION_STARTED = "question_started",
    HOST_ANSWERS_UPDATE = "host_answers_update",
    HOST_RESULTS = "host_results",
    PLAYER_RESULTS = "player_results",
    HOST_GAME_END = "host_game_end",
    PLAYER_GAME_END = "player_game_end",
    SESSION_CLOSED = "session_closed",


}


export enum ServerErrorEvents {

    SYNC_ERROR = "sync_error",
    FATAL_ERROR = "connection_error",
    UNAVAILABLE_SESSION = "unnavailable_session",
    GAME_ERROR = "game_error",

}