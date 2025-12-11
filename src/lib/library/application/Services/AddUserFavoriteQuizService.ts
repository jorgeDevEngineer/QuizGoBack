import {QuizId} from "src/lib/kahoot/domain/valueObject/Quiz";
import {UserId} from "src/lib/user/domain/valueObject/UserId";
import { UserIdDTO } from "../DTOs/UserIdDTO";
import { Either } from "src/lib/shared/Either";
import { DomainUnexpectedException } from "../../domain/exceptions/DomainUnexpectedException";
import { AddUserFavoriteQuizDomainService } from "../../domain/services/AddUserFavoriteQuizDomainService";
import { DomainException } from "../../domain/exceptions/DomainException";

/**
 * Marca como favorito un kahoot para un usuario.
 */
export class AddUserFavoriteQuizService {
  constructor(private readonly domainService: AddUserFavoriteQuizDomainService) {}

  async execute(userId: UserIdDTO, quizId: string)
    : Promise<Either<DomainException, void>> {
    try {
      const userIdVO = new UserId(userId.userId);
      const quizIdVO = QuizId.of(quizId);

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

