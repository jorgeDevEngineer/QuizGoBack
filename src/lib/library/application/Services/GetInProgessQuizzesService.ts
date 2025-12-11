import {  UserId as UserIdQuizVo,} from "../../../kahoot/domain/valueObject/Quiz";
import { UserIdDTO } from "../DTOs/UserIdDTO";
import {
  PlayingQuizResponse,
} from "../Response Types/PlayingQuizResponse";
import { QueryResponse } from "../Response Types/QueryResponse";
import { Either } from "../../../shared/Either";
import { QuizQueryParamsDto, QuizQueryParamsInput } from "../DTOs/QuizQueryParamsDTO";
import { DomainException } from "../../domain/exceptions/DomainException";
import { GetInProgressQuizzesDomainService } from "../../domain/services/GetInProgressQuizzesDomainService";

/**
 * Obtiene los kahoots en progreso(solo singleplayer), de un usuario.
 */
export class GetInProgressQuizzesService {
  constructor(
    private readonly domainService: GetInProgressQuizzesDomainService
  ) {}

  async execute(id: UserIdDTO, queryInput: QuizQueryParamsInput)
  : Promise<Either<DomainException, QueryResponse<PlayingQuizResponse>>> {
  const params = new QuizQueryParamsDto(queryInput);
  const criteria = params.toCriteria();

  const result = await this.domainService.execute(
    UserIdQuizVo.of(id.userId),
    criteria
  );

  if (result.isLeft()) return Either.makeLeft(result.getLeft());

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
}


}
