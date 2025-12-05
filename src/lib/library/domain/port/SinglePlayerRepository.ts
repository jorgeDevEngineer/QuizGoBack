import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { QuizQueryCriteria } from "../valueObject/QuizQueryCriteria";

export interface SinglePlayerGameRepository {
    findInProgressGames(playerId: UserId, criteria: QuizQueryCriteria):Promise<[SinglePlayerGame[], number]>;
    findCompletedGames(playerId: UserId, criteria: QuizQueryCriteria):Promise<[SinglePlayerGame[], number]>;
}