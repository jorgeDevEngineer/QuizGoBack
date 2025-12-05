import { SinglePlayerGame } from "../aggregates/SinglePlayerGame";
import { SinglePlayerGameId } from "../valueObjects/SinglePlayerGameVOs";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export interface SinglePlayerGameRepository {

    save(game: SinglePlayerGame): Promise<void>;

    findById(id: SinglePlayerGameId): Promise<SinglePlayerGame | null>;

    findByPlayerId(id: UserId): Promise<SinglePlayerGame[] | null>;

    findInProgressGameByPlayerAndQuiz(playerId: UserId, quizId: QuizId): Promise<SinglePlayerGame | null>;

    findInProgressGames(playerId: UserId):Promise<SinglePlayerGame[] | null>;

    findCompletedGames(playerId: UserId):Promise<SinglePlayerGame[] | null>;

    delete(id: SinglePlayerGameId): Promise<void>;

}