import { Either } from "../../../shared/Type Helpers/Either";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { QuizzesNotFoundException } from "../../../shared/exceptions/QuizzesNotFoundException";
import { SinglePlayerGameRepository } from "../port/SinglePlayerRepository";
import { CompletedQuizQueryCriteria } from "../../application/Response Types/CompletedQuizQueryCriteria";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId as UserIdFromUser } from "../../../user/domain/valueObject/UserId";
import { QuizRepository } from "../../../kahoot/domain/port/QuizRepository";
import { QuizId } from "../../../kahoot/domain/valueObject/Quiz";
import { QuizNotFoundException } from "src/lib/shared/exceptions/QuizNotFoundException";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSessionHistoryRepository } from "../port/MultiplayerSessionHistoryRepository";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";

export class GetUserResultsDomainService {
  constructor(
    private readonly singlePlayerGameRepository: SinglePlayerGameRepository,
    private readonly multiPlayerRepo: MultiplayerSessionHistoryRepository,
    private readonly quizRepository: QuizRepository
  ) {}

  public async execute(
    userId: UserId,
    criteria: CompletedQuizQueryCriteria
  ): Promise<
    Either<
      DomainException,
      {
        games: SinglePlayerGame[];
        multiPlayerGames: MultiplayerSession[];
        quizzes: Quiz[];
        totalGames: number;
      }
    >
  > {
    const { games: completedQuizzes, totalGames } =
      await this.singlePlayerGameRepository.findCompletedGames(
        userId,
        criteria
      );

    const [completeMultiGames, totalMultiCount] =
      await this.multiPlayerRepo.findCompletedSessions(
        UserIdFromUser.of(userId.getValue()),
        criteria
      );

    if (completedQuizzes.length === 0 && completeMultiGames.length === 0) {
      return Either.makeLeft(
        new QuizzesNotFoundException(
          "El usuario no ha completado nigun kahoot."
        )
      );
    }

    const quizzes: Quiz[] = [];

    for (const quiz of completedQuizzes) {
      const quizId = QuizId.of(quiz.getQuizId().getValue());
      const quizData = await this.quizRepository.find(quizId);

      if (!quizData) {
        return Either.makeLeft(new QuizNotFoundException());
      }

      quizzes.push(quizData);
    }

    for (const game of completeMultiGames) {
      const quizId = QuizId.of(game.getQuizId().getValue());
      const quizData = await this.quizRepository.find(quizId);

      if (!quizData) {
        return Either.makeLeft(new QuizNotFoundException());
      }

      quizzes.push(quizData);
    }

    let realCount = totalGames + totalMultiCount;

    return Either.makeRight({
      games: completedQuizzes,
      multiPlayerGames: completeMultiGames,
      quizzes,
      totalGames: realCount,
    });
  }
}
