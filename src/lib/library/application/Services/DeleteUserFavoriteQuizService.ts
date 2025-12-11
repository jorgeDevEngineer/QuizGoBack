import {UserFavoriteQuiz} from "../../domain/valueObject/UserFavoriteQuiz";
import {QuizId} from "src/lib/kahoot/domain/valueObject/Quiz";
import {UserId} from "src/lib/user/domain/valueObject/UserId";
import { DomainUnexpectedException } from "../../domain/exceptions/DomainUnexpectedException";
import { Either } from "src/lib/shared/Either";
import { UserIdDTO } from "../DTOs/UserIdDTO";
import { DeleteUserFavoriteQuizDomainService } from "../../domain/services/DeleteUserFavoriteQuizDomainService";
import { DomainException } from "../../domain/exceptions/DomainException";

/**
 * Elimina como favorito un quiz para un usuario.
 */
export class DeleteUserFavoriteQuizService {
    constructor(
      private readonly domainService: DeleteUserFavoriteQuizDomainService
    ) {}
    
    async execute(userId: UserIdDTO, quizId: string)
    : Promise<Either<DomainException, void>> {
    try {
      const userFavoriteQuiz = UserFavoriteQuiz.Of(
        new UserId(userId.userId),
        QuizId.of(quizId)
      );

      const result = await this.domainService.removeFavorite(userFavoriteQuiz);

      if (result.isLeft()) {
        return Either.makeLeft(result.getLeft());
      }

      return Either.makeRight(undefined);
    } catch (error) {
      return Either.makeLeft(new DomainUnexpectedException());
    }
  }
}