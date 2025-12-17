import { QuizQueryParamsDTO } from "../../DTOs/QuizQueryParamsDTO";
import { QuizResponse, toQuizResponse } from "../../Response Types/QuizResponse";
import { UserId as UserIdVO} from "src/lib/kahoot/domain/valueObject/Quiz";
import { QueryWithPaginationResponse } from "../../Response Types/QueryWithPaginationResponse";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainUnexpectedException } from "../../../../shared/exceptions/DomainUnexpectedException";
import { DomainException } from "../../../../shared/exceptions/DomainException";
import { GetUserFavoriteQuizzesDomainService } from "../../../domain/services/GetUserFavoriteQuizzesDomainService";
import { IHandler } from "src/lib/shared/IHandler";
import { GetUserQuizzes as GetUserFavoriteQuizzes} from '../../Parameter Objects/GetUserQuizzes';
import { Injectable } from "@nestjs/common";

/**
 * Query Handler que obtiene los kahoots favoritos de un usuario.
 */

@Injectable()
export class GetUserFavoriteQuizzesQueryHandler implements IHandler<GetUserFavoriteQuizzes, Either<DomainException, QueryWithPaginationResponse<QuizResponse>>> {
  constructor(
    private readonly domainService: GetUserFavoriteQuizzesDomainService
  ) {}

  async execute(command: GetUserFavoriteQuizzes)
    : Promise<Either<DomainException, QueryWithPaginationResponse<QuizResponse>>> {
    try {
      const params = new QuizQueryParamsDTO(command.queryInput);
      const criteria = params.toCriteria();
      const result = await this.domainService.execute(
        UserIdVO.of(command.userId),
        criteria
      );

      if (result.isLeft()) return Either.makeLeft(result.getLeft());

      const { quizzes, authors } = result.getRight();

      const data: QuizResponse[] = quizzes.map(quiz => {
        const author = authors.find(u => u.id.value === quiz.authorId.value)!;
        return toQuizResponse(quiz, author);
      });

      const totalCount = quizzes.length;

      const answer: QueryWithPaginationResponse<QuizResponse> = {
        data,
        pagination: {
          page: criteria.page,
          limit: criteria.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / criteria.limit),
        },
      };

      return Either.makeRight(answer);
    } catch (err) {
      console.error(err);
      return Either.makeLeft(new DomainUnexpectedException());
    }
  }
}
