import {QueryParamsDto, QueryParamsInput} from "./DTOs/QueryParamsDTO";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../domain/port/QuizRepository";
import { Quiz } from "../../kahoot/domain/entity/Quiz";
import { QuizResponse, toQuizResponse} from "./QuizResponse";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { User } from "src/lib/user/domain/entity/User";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetUserFavoriteQuizzesUseCase {
  constructor(private readonly favoritesRepo: UserFavoriteQuizRepository, 
    private readonly quizRepo: QuizRepository,
    private readonly userRepo: UserRepository
  ) {}

  async execute(userId: string, queryInput: QueryParamsInput) {
    const query = new QueryParamsDto(queryInput);
    const criteria = query.toCriteria();
    const [favoriteIds, totalCount] = await this.favoritesRepo.findFavoritesQuizByUser(
      new UserId(userId),
      criteria,
    );

    if (favoriteIds.length === 0) {
      return {
        data: [],
        pagination: {
          page: criteria.page,
          limit: criteria.limit,
          totalCount: 0,
          totalPages: 0,
        },
      };
    }

    const favoriteQuizzes:Quiz[] = await this.quizRepo.findByIds(favoriteIds, criteria);
    const data: QuizResponse[] = [];
    for(const quiz of favoriteQuizzes){
      const author: User | null = await this.userRepo.getOneById(new UserId(quiz.authorId.value));
      data.push(toQuizResponse(quiz, author));
    }

    return {
      data,
      pagination: {
        page: criteria.page,
        limit: criteria.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / criteria.limit),
      }
    };
  }
}