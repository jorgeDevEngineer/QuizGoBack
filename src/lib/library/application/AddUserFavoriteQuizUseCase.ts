import {UserFavoriteQuiz} from "../domain/valueObject/UserFavoriteQuiz";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../domain/port/QuizRepository";
import {QuizId, UserId} from "src/lib/kahoot/domain/valueObject/Quiz";
import { FavoriteDTO } from "./DTOs/FavoriteDTO";
import { ConflictException, HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Either } from "src/lib/shared/Either";

export class AddUserFavoriteQuizUseCase {
   constructor(private readonly userFavoriteQuizRepository: UserFavoriteQuizRepository,
    private readonly quizRepository: QuizRepository
   ) {
   }

   async run(userId: FavoriteDTO, quizId: string): Promise<Either<HttpException, void>> {
    const userIdVO = UserId.of(userId.userId);
    const quizIdVO = QuizId.of(quizId);
  
    const exists = await this.quizRepository.quizExists(quizIdVO);
    if (!exists) {
      return Either.makeLeft<HttpException, void>(new NotFoundException('El kahoot no existe'));
    }

    const alreadyFavorite = await this.userFavoriteQuizRepository.isFavorite(userIdVO, quizIdVO);
    if (alreadyFavorite) {
      return Either.makeLeft<HttpException, void>(new ConflictException('El kahoot ya está en favoritos'));
    }

    await this.userFavoriteQuizRepository.addFavoriteQuiz(UserFavoriteQuiz.Of(userIdVO, quizIdVO));
    return Either.makeRight<HttpException, void>(undefined);
  }  
}