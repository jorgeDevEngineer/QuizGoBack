import { UserId as UserIdQuizVo } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserIdDTO } from "../../DTOs/UserIdDTO";
import { PlayingQuizResponse } from "../../Response Types/PlayingQuizResponse";
import { QueryWithPaginationResponse } from "../../Response Types/QueryWithPaginationResponse";
import { Either } from "src/lib/shared/Either";
import { QuizQueryParamsDto, QuizQueryParamsInput } from "../../DTOs/QuizQueryParamsDTO";
import { DomainUnexpectedException } from "../../../domain/exceptions/DomainUnexpectedException";
import { GetCompletedQuizzesDomainService } from "../../../domain/services/GetCompletedQuizzesDomainService";
import { DomainException } from "src/lib/library/domain/exceptions/DomainException";
import { IHandler } from "src/lib/shared/IHandler";
import { GetUserQuizzes as GetUserCompletedQuizzes } from "../../Parameter Objects/GetUserQuizzes";

/**
 * Obtiene los kahoots completados(multipalyer o singleplayer), de un usuario.
 */
export class GetUserCompletedQuizzesQueryHandler implements IHandler<GetUserCompletedQuizzes, Either<DomainException, QueryWithPaginationResponse<PlayingQuizResponse>>> {
  constructor(
    private readonly domainService: GetCompletedQuizzesDomainService
  ) {}

  async execute(
    command: GetUserCompletedQuizzes
  ): Promise<Either<DomainException, QueryWithPaginationResponse<PlayingQuizResponse>>> {
    try {
      const query = new QuizQueryParamsDto(command.queryInput);
      const criteria = query.toCriteria();

      const result = await this.domainService.execute(
        UserIdQuizVo.of(command.userId),
        criteria
      );

      if (result.isLeft()) {
        return Either.makeLeft(result.getLeft());
      }

      const { responses, totalCount } = result.getRight();

      const answer: QueryWithPaginationResponse<PlayingQuizResponse> = {
        data: responses,
        pagination: {
          page: criteria.page,
          limit: criteria.limit,
          totalCount,
          totalPages: Math.ceil(totalCount / criteria.limit),
        },
      };

      return Either.makeRight(answer);
    } catch (error) {
      return Either.makeLeft(new DomainUnexpectedException());
    }
  }
}
