import { SinglePlayerGame } from "../../../singlePlayerGame/domain/aggregates/SinglePlayerGame"
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";

export interface SinglePlayerGameRepository {

    findCompletedGames(playerId: UserId, criteria: CompletedQuizQueryCriteria):Promise<{games: SinglePlayerGame[], totalGames:number
    } | null>;
    findById(id: SinglePlayerGameId): Promise<SinglePlayerGame | null>;
}
