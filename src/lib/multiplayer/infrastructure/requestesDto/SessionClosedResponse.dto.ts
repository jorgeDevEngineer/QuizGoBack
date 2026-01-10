import { HostUserEvents } from "../helpers/WebSocketEvents.enum";

export interface SessionClosedResponseDto {

      reason: HostUserEvents.HOST_END_SESSION,
      message: string
      
}