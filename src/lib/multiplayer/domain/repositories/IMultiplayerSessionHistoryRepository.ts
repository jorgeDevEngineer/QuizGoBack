import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { MultiplayerSession } from "../aggregates/MultiplayerSession";

// Repositorio para el guardado de sesiones multijugador COMPLETADAS
export interface IMultiplayerSessionHistoryRepository {
  
  archiveSession(session: MultiplayerSession): Promise<void>;
  
  findbyId(session: MultiplayerSessionId): Promise<MultiplayerSession | null>

}