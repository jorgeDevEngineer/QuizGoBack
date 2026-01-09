import { MultiplayerSession } from "../../../multiplayer/domain/aggregates/MultiplayerSession";
import { UserId } from "../../../user/domain/valueObject/UserId";
import { QuizQueryCriteria } from "../../application/Response Types/QuizQueryCriteria";

// Repositorio para el guardado de sesiones multijugador COMPLETADAS
export interface MultiplayerSessionHistoryRepository {
  findCompletedSessions(
    playerId: UserId,
    criteria: QuizQueryCriteria
  ): Promise<[MultiplayerSession[], number]>;
}
