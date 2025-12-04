import {UserFavoriteQuiz} from "../domain/valueObject/UserFavoriteQuiz";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizId} from "src/lib/kahoot/domain/valueObject/Quiz";
import {UserId} from "src/lib/user/domain/valueObject/UserId";
import { HttpException } from "@nestjs/common";
import { UserFavoriteQuizNotFoundException } from "../domain/exceptions/UserFavoriteQuizNotFoundException";
import { Either } from "src/lib/shared/Either";
import { UserIdDTO } from "./DTOs/UserIdDTO";

export class DeleteUserFavoriteQuizUseCase {
    constructor(
        private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository,
    ) {}
    
    async run(userId: UserIdDTO, quizId: string): Promise<Either<HttpException, void>> {
      // Construimos el objeto de favorito
      const userFavoriteQuiz = UserFavoriteQuiz.Of(new UserId(userId.userId), QuizId.of(quizId));
  
      // Verificamos si el favorito existe
      const exists = await this.userFavoriteQuizRepository.isFavorite(userFavoriteQuiz.userId, userFavoriteQuiz.quizId);
      if (!exists) {
        return Either.makeLeft(new UserFavoriteQuizNotFoundException());
      }
  
      // Eliminamos el favorito
      await this.userFavoriteQuizRepository.removeFavoriteQuiz(userFavoriteQuiz);
      return Either.makeRight<HttpException, void>(undefined);
    }  
}