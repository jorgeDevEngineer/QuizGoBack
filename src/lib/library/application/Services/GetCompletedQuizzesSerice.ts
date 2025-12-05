import { QuizRepository } from "../../domain/port/QuizRepository";
import {
  QuizId,
  UserId as UserIdQuizVo,
} from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { UserIdDTO } from "../DTOs/UserIdDTO";
import {
  PlayingQuizResponse,
  toPlayingQuizResponse,
} from "../Response Types/PlayingQuizResponse";
import { QueryResponse } from "../Response Types/QueryResponse";
import { HttpException } from "@nestjs/common";
import { Either } from "src/lib/shared/Either";
import { QuizQueryParamsDto, QuizQueryParamsInput } from "../DTOs/QuizQueryParamsDTO";
import { NotInProgressQuizzesException } from "../../domain/exceptions/NotInProgressQuizzesException";
import { QuizzesNotFoundException } from "../../domain/exceptions/QuizzesNotFoundException";
import { UserNotFoundException } from "../../domain/exceptions/UserNotFoundException";
import { DomainUnexpectedException } from "../../domain/exceptions/DomainUnexpectedException";
import { User } from "src/lib/user/domain/aggregate/User";

export class GetCompletedQuizzesService {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly userRepo: UserRepository,
    private readonly singlePlayerRepo: SinglePlayerGameRepository
  ) {}

  async run(
    id: UserIdDTO,
    queryInput: QuizQueryParamsInput
  ): Promise<Either<HttpException, QueryResponse<PlayingQuizResponse>>> {
    try{
      const query = new QuizQueryParamsDto(queryInput);
      const criteria = query.toCriteria();
      const [inProgressGames, totalCount] =
        await this.singlePlayerRepo.findCompletedGames(
          UserIdQuizVo.of(id.userId),
          criteria
        );
      if (inProgressGames.length == 0) {
        return Either.makeLeft(new NotInProgressQuizzesException());
      }

      const quizzesIds = inProgressGames.map((quiz) =>
        QuizId.of(quiz.getQuizId().value)
      );
      const quizzes = await this.quizRepository.findByIds(quizzesIds, criteria);
      if (quizzes.length == 0) {
        Either.makeLeft(new QuizzesNotFoundException());
      }

      const usersIds = quizzes.map((quiz) => quiz.authorId);
      const quizAuthors: User[] = [];
      for (const userId of usersIds) {
        const user = await this.userRepo.getOneById(new UserId(userId.value));
        if (!user) {
          return Either.makeLeft(new UserNotFoundException());
        }
        quizAuthors.push(user);
      }

      const playingQuizResponses: PlayingQuizResponse[] = [];

      for (let i = 0; i < inProgressGames.length; i++) {
        const inProgressGame = inProgressGames[i];
        const quiz = quizzes.find(
          (q) => q.id.value === inProgressGame.getQuizId().value
        );
        if (quiz) {
          const author = quizAuthors.find(
            (u) => u.id.value === quiz.authorId.value
          );
          if (author) {
            const playingQuizResponse = toPlayingQuizResponse(
              quiz,
              author,
              inProgressGame,
              "singleplayer"
            );
            playingQuizResponses.push(playingQuizResponse);
          }
        }
      }

      const answer: QueryResponse<PlayingQuizResponse> = {
        data: playingQuizResponses,
        pagination: {
          page: criteria.page,
          limit: criteria.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / criteria.limit),
        },
      };

      return Either.makeRight<HttpException, QueryResponse<PlayingQuizResponse>>(
        answer
      );
    }catch(error){
      return Either.makeLeft(new DomainUnexpectedException());
    }
  }
}
