import {UserFavoriteQuiz} from "../domain/valueObject/UserFavoriteQuiz";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../domain/port/QuizRepository";
import {QuizId, UserId} from "src/lib/kahoot/domain/valueObject/Quiz";
import { FavoriteDTO } from "./DTOs/FavoriteDTO";
import { ConflictException, InternalServerErrorException, NotFoundException } from "@nestjs/common";

export class AddUserFavoriteQuizUseCase {
   constructor(private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository,
    private readonly quizRepository: QuizRepository
   ) {
   }

   async run(userId: FavoriteDTO, quizId: string): Promise<void> {
    const userIdVO = UserId.of(userId.userId);
    const quizIdVO = QuizId.of(quizId);
  
    const favoriteQuiz = UserFavoriteQuiz.Of(userIdVO, quizIdVO);
  
    try {
      // 1. Verificar que el quiz exista
      const exists = await this.quizRepository.quizExists(quizIdVO);
      if (!exists) {
        throw new NotFoundException('Quiz not found');
      }
  
      // 2. Verificar que no esté ya marcado como favorito
      const alreadyFavorite = await this.userFavoriteQuizRepository.isFavorite(userIdVO, quizIdVO);
      if (alreadyFavorite) {
        throw new ConflictException('Quiz already marked as favorite');
      }
  
      // 3. Guardar el favorito
      await this.userFavoriteQuizRepository.addFavoriteQuiz(favoriteQuiz);
  
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error; // se propaga tal cual
      }
      throw new InternalServerErrorException('Unexpected error adding favorite');
    }
  }  
}