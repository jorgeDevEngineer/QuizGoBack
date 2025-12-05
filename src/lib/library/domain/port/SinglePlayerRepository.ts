import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { QueryCriteria } from "../valueObject/QueryCriteria";

export interface SinglePlayerGameRepository {
    findInProgressGames(playerId: UserId, criteria: QueryCriteria):Promise<[SinglePlayerGame[], number]>;
    findCompletedGames(playerId: UserId, criteria: QueryCriteria):Promise<[SinglePlayerGame[], number]>;
}