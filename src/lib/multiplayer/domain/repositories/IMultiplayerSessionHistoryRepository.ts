import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSession } from "../aggregates/MultiplayerSession";

// Repositorio para el guardado de sesiones multijugador COMPLETADAS
export interface IMultiplayerSessionHistoryRepository {
  
  archiveSession(session: MultiplayerSession, quiz: Quiz ): Promise<void>;
  
}