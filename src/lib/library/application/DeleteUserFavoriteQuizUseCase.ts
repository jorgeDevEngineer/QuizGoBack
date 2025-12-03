import {UserFavoriteQuiz} from "../domain/valueObject/UserFavoriteQuiz";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizId, UserId} from "src/lib/kahoot/domain/valueObject/Quiz";
import { HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { UserFavoriteQuizNotFoundException } from "../domain/exceptions/UserFavoriteQuizNotFoundException";
import { Either } from "src/lib/shared/Either";

export class DeleteUserFavoriteQuizUseCase {
    constructor(
        private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository,
    ) {}
    
    async execute(userId: string, quizId: string): Promise<Either<HttpException, void>> {
      // Construimos el objeto de favorito
      const userFavoriteQuiz = UserFavoriteQuiz.Of(UserId.of(userId), QuizId.of(quizId));
  
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