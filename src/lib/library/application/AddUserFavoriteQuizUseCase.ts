import {UserFavoriteQuiz} from "../domain/valueObject/UserFavoriteQuiz";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../domain/port/QuizRepository";
import {QuizId, UserId} from "src/lib/kahoot/domain/valueObject/Quiz";
import { FavoriteDTO } from "./DTOs/FavoriteDTO";
import { Either } from "src/lib/shared/Either";
import { QuizNotFoundException } from "../domain/exceptions/QuizNotFoundException";
import { HttpException } from "@nestjs/common";
import { QuizAlreadyFavoriteException } from "../domain/exceptions/QuizAlreadyFavoriteException";

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
      return Either.makeLeft<HttpException, void>(new QuizNotFoundException());
    }

    const alreadyFavorite = await this.userFavoriteQuizRepository.isFavorite(userIdVO, quizIdVO);
    if (alreadyFavorite) {
      return Either.makeLeft<HttpException, void>(new QuizAlreadyFavoriteException);
    }

    await this.userFavoriteQuizRepository.addFavoriteQuiz(UserFavoriteQuiz.Of(userIdVO, quizIdVO));
    return Either.makeRight<HttpException, void>(undefined);
  }  
}