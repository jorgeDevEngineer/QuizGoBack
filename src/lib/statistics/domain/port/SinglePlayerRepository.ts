import { SinglePlayerGame } from "../../../singlePlayerGame/domain/aggregates/SinglePlayerGame"
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";
import { SinglePlayerGameId } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

export interface SinglePlayerGameRepository {

    findCompletedGames(playerId: UserId, criteria: CompletedQuizQueryCriteria):Promise<SinglePlayerGame[] | null>;
    findById(id: SinglePlayerGameId): Promise<SinglePlayerGame | null>;
}
