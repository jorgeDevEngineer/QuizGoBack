import {UserFavoriteQuiz} from "../../../domain/valueObject/UserFavoriteQuiz";
import {QuizId} from "src/lib/kahoot/domain/valueObject/Quiz";
import {UserId} from "src/lib/user/domain/valueObject/UserId";
import { DomainUnexpectedException } from "../../../domain/exceptions/DomainUnexpectedException";
import { Either } from "src/lib/shared/Either";
import { UserIdDTO } from "../../DTOs/UserIdDTO";
import { DeleteUserFavoriteQuizDomainService } from "../../../domain/services/DeleteUserFavoriteQuizDomainService";
import { DomainException } from "../../../domain/exceptions/DomainException";
import { IHandler } from "src/lib/shared/IHandler";
import { DeleteUserFavoriteQuiz } from "../../Parameter Objects/DeleteUserFavoriteQuiz";

/**
 * Elimina como favorito un quiz para un usuario.
 */
export class DeleteUserFavoriteQuizCommandHandler implements IHandler<DeleteUserFavoriteQuiz, Either<DomainException, void>> {
    constructor(
      private readonly domainService: DeleteUserFavoriteQuizDomainService
    ) {}
    
    async execute(command: DeleteUserFavoriteQuiz)
    : Promise<Either<DomainException, void>> {
    try {
      const userFavoriteQuiz = UserFavoriteQuiz.Of(
        new UserId(command.userId),
        QuizId.of(command.quizId)
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