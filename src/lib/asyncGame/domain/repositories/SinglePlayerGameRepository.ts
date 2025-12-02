import { SinglePlayerGame } from "../aggregates/SinglePlayerGame";
import { SinglePlayerGameId } from "../valueObjects/asyncGamesVO";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export interface SinglePlayerGameRepository {

    save(game: SinglePlayerGame): Promise<void>;

    findById(id: SinglePlayerGameId): Promise<SinglePlayerGame | null>;

    findByPlayerId(id: UserId): Promise<SinglePlayerGame[] | null>;

    findActiveGameByPlayerAndQuiz(playerId: UserId, quizId: QuizId): Promise<SinglePlayerGame | null>;

    delete(id: SinglePlayerGameId): Promise<void>;

}