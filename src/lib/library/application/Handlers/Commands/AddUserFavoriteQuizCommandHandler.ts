import {QuizId} from "src/lib/kahoot/domain/valueObject/Quiz";
import {UserId} from "src/lib/user/domain/valueObject/UserId";
import { UserIdDTO } from "../../DTOs/UserIdDTO";
import { Either } from "src/lib/shared/Either";
import { DomainUnexpectedException } from "../../../domain/exceptions/DomainUnexpectedException";
import { AddUserFavoriteQuizDomainService } from "../../../domain/services/AddUserFavoriteQuizDomainService";
import { DomainException } from "../../../domain/exceptions/DomainException";
import { AddUserFavoriteQuiz } from "../../Parameter Objects/AddUserFavoriteQuiz";
import { IHandler } from "src/lib/shared/IHandler";

/**
 * Marca como favorito un kahoot para un usuario.
 */
export class AddUserFavoriteQuizCommandHanlder implements IHandler<AddUserFavoriteQuiz, Either<DomainException, void>> {
  constructor(private readonly domainService: AddUserFavoriteQuizDomainService) {}

  async execute(command: AddUserFavoriteQuiz)
    : Promise<Either<DomainException, void>> {
    try {
      const userIdVO = new UserId(command.userId);
      const quizIdVO = QuizId.of(command.quizId);

      const result = await this.domainService.execute(userIdVO, quizIdVO);

      if (result.isLeft()) {
        return Either.makeLeft(result.getLeft());
      }

      return Either.makeRight(undefined);
    } catch (error) {
      return Either.makeLeft(new DomainUnexpectedException());
    }
  }
}

