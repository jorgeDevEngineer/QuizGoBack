import {
  QuizId,
  UserId as UserIdQuizVo,
} from "src/lib/kahoot/domain/valueObject/Quiz";
import { User } from "../../../../user/domain/aggregate/User";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { UserRepository } from "../../../../user/domain/port/UserRepository";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "../../../../shared/exceptions/DomainException";
import { NotInProgressQuizzesException } from "../../../../shared/exceptions/NotInProgressQuizzesException";
import { QuizzesNotFoundException } from "../../../../shared/exceptions/QuizzesNotFoundException";
import { UserNotFoundException } from "../../../../shared/exceptions/UserNotFoundException";
import { QuizRepository } from "../../port/QuizRepository";
import { SinglePlayerGameRepository } from "../../port/SinglePlayerRepository";
import { QuizQueryCriteria } from "../../../application/Response Types/QuizQueryCriteria";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { MultiplayerSessionHistoryRepository } from "../../port/MultiplayerSessionHistoryRepository";

export class GetUserCompletedQuizzesDomainService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly userRepo: UserRepository,
    private readonly singlePlayerRepo: SinglePlayerGameRepository,
    private readonly multiPlayerRepo: MultiplayerSessionHistoryRepository
  ) {}

  async execute(
    userId: UserIdQuizVo,
    criteria: QuizQueryCriteria
  ): Promise<
    Either<
      DomainException,
      {
        completedGames: SinglePlayerGame[];
        quizzes: Quiz[];
        quizAuthors: User[];
        totalCount: number;
      }
    >
  > {
    const [completedGames, totalCount] =
      await this.singlePlayerRepo.findCompletedGames(userId, criteria);
    if (completedGames.length === 0) {
      return Either.makeLeft(
        new NotInProgressQuizzesException(
          "No hay quizzes completados para este usuario"
        )
      );
    }

    const quizzesIds = completedGames.map((game) =>
      QuizId.of(game.getQuizId().value)
    );
    const quizzes = await this.quizRepository.findByIds(quizzesIds, criteria);
    if (quizzes.length === 0) {
      return Either.makeLeft(new QuizzesNotFoundException());
    }

    const quizAuthors: User[] = [];
    for (const quiz of quizzes) {
      const author = await this.userRepo.getOneById(
        new UserId(quiz.authorId.value)
      );
      if (!author) {
        return Either.makeLeft(new UserNotFoundException());
      }
      quizAuthors.push(author);
    }

    return Either.makeRight({
      completedGames,
      quizzes,
      quizAuthors,
      totalCount,
    });
  }
}
