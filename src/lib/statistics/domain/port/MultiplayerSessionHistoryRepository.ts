import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { MultiplayerSession } from "../../../multiplayer/domain/aggregates/MultiplayerSession";
import { UserId } from "../../../user/domain/valueObject/UserId";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";

// Repositorio para el guardado de sesiones multijugador COMPLETADAS
export interface MultiplayerSessionHistoryRepository {
  findCompletedSessions(
    playerId: UserId,
    criteria: CompletedQuizQueryCriteria
  ): Promise<[MultiplayerSession[], number]>;
  findbyId(session: MultiplayerSessionId): Promise<MultiplayerSession | null>;
}
