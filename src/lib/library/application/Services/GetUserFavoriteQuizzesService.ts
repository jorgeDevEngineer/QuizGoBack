import { QuizQueryParamsDto, QuizQueryParamsInput } from "../DTOs/QuizQueryParamsDTO";
import { QuizResponse, toQuizResponse } from "../Response Types/QuizResponse";
import { UserId as UserIdVO} from "src/lib/kahoot/domain/valueObject/Quiz";
import { QueryResponse } from "../Response Types/QueryResponse";
import { Either } from "src/lib/shared/Either";
import { DomainUnexpectedException } from "../../domain/exceptions/DomainUnexpectedException";
import { DomainException } from "../../domain/exceptions/DomainException";
import { UserIdDTO } from "../DTOs/UserIdDTO";
import { GetUserFavoriteQuizzesDomainService } from "../../domain/services/GetUserFavoriteQuizzesDomainService";

/**
 * Obtiene los kahoots favoritos de un usuario.
 */

export class GetUserFavoriteQuizzesService {
  constructor(
    private readonly domainService: GetUserFavoriteQuizzesDomainService
  ) {}

  async execute(id: UserIdDTO, queryInput: QuizQueryParamsInput)
    : Promise<Either<DomainException, QueryResponse<QuizResponse>>> {
    try {
      const params = new QuizQueryParamsDto(queryInput);
      const criteria = params.toCriteria();
      const result = await this.domainService.execute(
        UserIdVO.of(id.userId),
        criteria
      );

      if (result.isLeft()) return Either.makeLeft(result.getLeft());

      const { quizzes, authors } = result.getRight();

      const data: QuizResponse[] = quizzes.map(quiz => {
        const author = authors.find(u => u.id.value === quiz.authorId.value)!;
        return toQuizResponse(quiz, author);
      });

      const totalCount = quizzes.length;

      const answer: QueryResponse<QuizResponse> = {
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
