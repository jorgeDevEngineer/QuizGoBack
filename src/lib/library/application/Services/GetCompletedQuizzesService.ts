import { UserId as UserIdQuizVo } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserIdDTO } from "../DTOs/UserIdDTO";
import { PlayingQuizResponse } from "../Response Types/PlayingQuizResponse";
import { QueryResponse } from "../Response Types/QueryResponse";
import { HttpException } from "@nestjs/common";
import { Either } from "src/lib/shared/Either";
import { QuizQueryParamsDto, QuizQueryParamsInput } from "../DTOs/QuizQueryParamsDTO";
import { DomainUnexpectedException } from "../../domain/exceptions/DomainUnexpectedException";
import { GetCompletedQuizzesDomainService } from "../../domain/services/GetCompletedQuizzesDomainService";

/**
 * Obtiene los kahoots completados(multipalyer o singleplayer), de un usuario.
 */
export class GetCompletedQuizzesService {
  constructor(
    private readonly domainService: GetCompletedQuizzesDomainService
  ) {}

  async execute(
    id: UserIdDTO,
    queryInput: QuizQueryParamsInput
  ): Promise<Either<HttpException, QueryResponse<PlayingQuizResponse>>> {
    try {
      const query = new QuizQueryParamsDto(queryInput);
      const criteria = query.toCriteria();

      const result = await this.domainService.execute(
        UserIdQuizVo.of(id.userId),
        criteria
      );

      if (result.isLeft()) {
        return Either.makeLeft(result.getLeft());
      }

      const { responses, totalCount } = result.getRight();

      const answer: QueryResponse<PlayingQuizResponse> = {
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
