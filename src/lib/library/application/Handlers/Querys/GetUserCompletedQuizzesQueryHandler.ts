import { UserId as UserIdQuizVo } from "src/lib/kahoot/domain/valueObject/Quiz";
import {
  PlayingQuizResponse,
  toCompletedQuizResponse,
} from "../../Response Types/PlayingQuizResponse";
import { QueryWithPaginationResponse } from "../../Response Types/QueryWithPaginationResponse";
import { Either } from "src/lib/shared/Type Helpers/Either";
import {
  QuizQueryParamsDTO,
  QuizQueryParamsInput,
} from "../../../infrastructure/DTOs/QuizQueryParamsDTO";
import { DomainUnexpectedException } from "../../../../shared/exceptions/DomainUnexpectedException";
import { GetUserCompletedQuizzesDomainService } from "../../../domain/services/Queries/GetUserCompletedQuizzesDomainService";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { IHandler } from "src/lib/shared/IHandler";
import { GetUserQuizzes as GetUserCompletedQuizzes } from "../../Parameter Objects/GetUserQuizzes";
import { Injectable } from "@nestjs/common";

/**
 * Query Hanlder que obtiene los kahoots completados(multipalyer o singleplayer), de un usuario.
 */
@Injectable()
export class GetUserCompletedQuizzesQueryHandler
  implements
    IHandler<
      GetUserCompletedQuizzes,
      Either<DomainException, QueryWithPaginationResponse<PlayingQuizResponse>>
    >
{
  constructor(
    private readonly domainService: GetUserCompletedQuizzesDomainService
  ) {}

  async execute(
    command: GetUserCompletedQuizzes
  ): Promise<
    Either<DomainException, QueryWithPaginationResponse<PlayingQuizResponse>>
  > {
    try {
      const query = new QuizQueryParamsDTO(command.queryInput);
      const criteria = query.toCriteria();

      const result = await this.domainService.execute(
        UserIdQuizVo.of(command.userId),
        criteria
      );

      if (result.isLeft()) {
        return Either.makeLeft(result.getLeft());
      }

      const {
        completedGames,
        completeMultiGames,
        quizzes,
        quizAuthors,
        totalCount,
      } = result.getRight();

      let singleGameData: PlayingQuizResponse[] = completedGames.flatMap(
        (game) => {
          const quiz = quizzes.find(
            (q) => q.id.value === game.getQuizId().value
          );
          if (!quiz) return [];
          const author = quizAuthors.find(
            (u) => u.id.value === quiz.authorId.value
          );
          if (!author) return [];
          return [
            toCompletedQuizResponse(quiz, author, game, "singleplayer", true),
          ];
        }
      );

      let multiGameData: PlayingQuizResponse[] = completeMultiGames.flatMap(
        (session) => {
          const quiz = quizzes.find(
            (q) => q.id.value === session.getQuizId().value
          );
          if (!quiz) return [];
          const author = quizAuthors.find(
            (u) => u.id.value === quiz.authorId.value
          );
          if (!author) return [];
          return [
            toCompletedQuizResponse(
              quiz,
              author,
              session,
              "multiplayer",
              false
            ),
          ];
        }
      );

      const data = [...singleGameData, ...multiGameData];

      const answer: QueryWithPaginationResponse<PlayingQuizResponse> = {
        data,
        pagination: {
          page: criteria.page,
          limit: criteria.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / criteria.limit),
        },
      };

      return Either.makeRight(answer);
    } catch (error) {
      return Either.makeLeft(new DomainUnexpectedException(error.message));
    }
  }
}
