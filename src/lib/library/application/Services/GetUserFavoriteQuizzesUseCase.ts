import {QueryParamsDto, QueryParamsInput} from "../DTOs/QueryParamsDTO";
import {UserFavoriteQuizRepository} from "../../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../../domain/port/QuizRepository";
import { Quiz } from "../../../kahoot/domain/entity/Quiz";
import { QuizResponse, toQuizResponse} from "../Response Types/QuizResponse";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { User } from "src/lib/user/domain/entity/User";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { QueryResponse } from "../Response Types/QueryResponse";
import { HttpException } from "@nestjs/common";
import { Either } from "src/lib/shared/Either";
import { QuizzesNotFoundException } from "../../domain/exceptions/QuizzesNotFoundException";
import { UserNotFoundException } from "../../domain/exceptions/UserNotFoundException";

export class GetUserFavoriteQuizzesUseCase {
  constructor(private readonly favoritesRepo: UserFavoriteQuizRepository, 
    private readonly quizRepo: QuizRepository,
    private readonly userRepo: UserRepository
  ) {}

  async run(userId: string, queryInput: QueryParamsInput): Promise<Either<HttpException, QueryResponse<QuizResponse>>> {
    const query = new QueryParamsDto(queryInput);
    const criteria = query.toCriteria();
    const [favoriteIds, totalCount] = await this.favoritesRepo.findFavoritesQuizByUser(
      new UserId(userId),
      criteria,
    );

    if (favoriteIds.length === 0) {
      return Either.makeLeft(new QuizzesNotFoundException());
    }

    const favoriteQuizzes:Quiz[] = await this.quizRepo.findByIds(favoriteIds, criteria);
    const data: QuizResponse[] = [];
    for(const quiz of favoriteQuizzes){
      const author: User | null = await this.userRepo.getOneById(new UserId(quiz.authorId.value));
      if(!author){
        return Either.makeLeft(new UserNotFoundException());
      }
      data.push(toQuizResponse(quiz, author));
    }

    const answer:QueryResponse<QuizResponse>= {
      data,
      pagination:{
        page: criteria.page,
        limit: criteria.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / criteria.limit),
      }
    }

    return Either.makeRight<HttpException, QueryResponse<QuizResponse>>(answer);
  }
}