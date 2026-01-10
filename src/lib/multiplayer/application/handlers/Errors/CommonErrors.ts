export enum COMMON_ERRORS {

        SESSION_NOT_FOUND = "Sesión no encontrada: El pin no corresponde a ninguna partida activa",
        SLIDE_NOT_FOUND = "La slide solicitada no existe en el kahoot en juego",
        PREVIOUS_SLIDE_NOT_FOUND = "No se pudo obtener la slide previa en la sesión activa",
        NO_OPTIONS = "La slide solicitada no tiene opciones de respuesta",
        NO_VALID_OPTION = "La slide no tiene opcion correcta",
        USER_NOT_FOUND = "Usuario no encontrado: El id del usuario no corresponde a ningun usuario registrado",
        USER_NOT_AUTHORIZED = "Usuario no autorizado: El usuario no puede conectarse a la sesión como HOST",
        SESSION_NOT_ACCEPTING_CONNECTIONS = "El host ha bloqueado las conexiones de nuevos jugadores a la sesión",
        USER_NOT_IN_SESSION = "La partida ya ha comenzado y el usuario no forma parte de la sesión activa",

}