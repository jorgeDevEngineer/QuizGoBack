import {  UserId as UserIdQuizVo,} from "../../../../kahoot/domain/valueObject/Quiz";
import {
  PlayingQuizResponse,
} from "../../Response Types/PlayingQuizResponse";
import { QueryWithPaginationResponse } from "../../Response Types/QueryWithPaginationResponse";
import { Either } from "../../../../shared/Type Helpers/Either";
import { QuizQueryParamsDTO } from "../../DTOs/QuizQueryParamsDTO";
import { DomainException } from "../../../../shared/exceptions/DomainException";
import { GetInProgressQuizzesDomainService } from "../../../domain/services/GetInProgressQuizzesDomainService";
import { IHandler} from "../.././../../shared/IHandler";
import { GetUserQuizzes as GetUserInProgressQuizzes} from "../../Parameter Objects/GetUserQuizzes"
import { Injectable } from "@nestjs/common";

/**
 * Query Handler que obtiene los kahoots en progreso(solo singleplayer), de un usuario.
 */
@Injectable()
export class GetUserInProgressQuizzesQueryHandler implements IHandler<GetUserInProgressQuizzes, 
Either<DomainException, QueryWithPaginationResponse<PlayingQuizResponse>>>{
  constructor(
    private readonly domainService: GetInProgressQuizzesDomainService
  ) {}

  async execute(command: GetUserInProgressQuizzes)
  : Promise<Either<DomainException, QueryWithPaginationResponse<PlayingQuizResponse>>> {
    
  const params = new QuizQueryParamsDTO(command.queryInput);
  const criteria = params.toCriteria();

  const result = await this.domainService.execute(
    UserIdQuizVo.of(command.userId),
    criteria
  );

  if (result.isLeft()) return Either.makeLeft(result.getLeft());

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
}


}
