import {UserFavoriteQuiz} from "../domain/valueObject/UserFavoriteQuiz";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizId, UserId} from "src/lib/kahoot/domain/valueObject/Quiz";
import { InternalServerErrorException, NotFoundException } from "@nestjs/common";

export class DeleteUserFavoriteQuizUseCase {
    constructor(
        private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository,
    ) {}
    
    async execute(userId: string, quizId: string): Promise<void> {
        const userFavoriteQuiz = UserFavoriteQuiz.Of(
          UserId.of(userId),
          QuizId.of(quizId),
        );
    
        try {
          // 1. Verificar si el favorito existe
          const exists = await this.userFavoriteQuizRepository.isFavorite(
            userFavoriteQuiz.userId,
            userFavoriteQuiz.quizId,
          );
    
          if (!exists) {
            throw new NotFoundException('Favorite quiz not found');
          }
    
          // 2. Eliminar el favorito
          await this.userFavoriteQuizRepository.removeFavoriteQuiz(userFavoriteQuiz);
    
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error; // se propaga tal cual
          }
          throw new InternalServerErrorException('Unexpected error deleting favorite');
        }
      }
    
    
}