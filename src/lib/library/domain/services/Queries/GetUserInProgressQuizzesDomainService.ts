import {
  QuizId,
  UserId as UserIdQuizVo,
} from "src/lib/kahoot/domain/valueObject/Quiz";
import { User } from "src/lib/user/domain/aggregate/User";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "../../../../shared/exceptions/DomainException";
import { NotInProgressQuizzesException } from "../../../../shared/exceptions/NotInProgressQuizzesException";
import { QuizzesNotFoundException } from "../../../../shared/exceptions/QuizzesNotFoundException";
import { UserNotFoundException } from "../../../../shared/exceptions/UserNotFoundException";
import { QuizRepository } from "../../port/QuizRepository";
import { SinglePlayerGameRepository } from "../../port/SinglePlayerRepository";
import { QuizQueryCriteria } from "../../../application/Response Types/QuizQueryCriteria";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { MultiplayerSessionHistoryRepository } from "../../port/MultiplayerSessionHistoryRepository";

export class GetUserInProgressQuizzesDomainService {
  constructor(
    private readonly singlePlayerRepo: SinglePlayerGameRepository,
    private readonly multiPlayerRepo: MultiplayerSessionHistoryRepository,
    private readonly quizRepo: QuizRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(
    userId: UserIdQuizVo,
    criteria: QuizQueryCriteria
  ): Promise<
    Either<
      DomainException,
      {
        inProgressGames: SinglePlayerGame[];
        quizzes: Quiz[];
        quizAuthors: User[];
        totalCount: number;
      }
    >
  > {
    const [inProgressGames, totalCount] =
      await this.singlePlayerRepo.findInProgressGames(userId, criteria);
    if (inProgressGames.length === 0) {
      return Either.makeLeft(new NotInProgressQuizzesException());
    }

    const quizzesIds = inProgressGames.map((game) =>
      QuizId.of(game.getQuizId().value)
    );
    const quizzes = await this.quizRepo.findByIds(quizzesIds, criteria);
    if (quizzes.length === 0) {
      return Either.makeLeft(new QuizzesNotFoundException());
    }

    const quizAuthors: User[] = [];
    for (const quiz of quizzes) {
      const user = await this.userRepo.getOneById(
        new UserId(quiz.authorId.value)
      );
      if (!user) {
        return Either.makeLeft(new UserNotFoundException());
      }
      quizAuthors.push(user);
    }

    return Either.makeRight({
      inProgressGames,
      quizzes,
      quizAuthors,
      totalCount,
    });
  }
}
