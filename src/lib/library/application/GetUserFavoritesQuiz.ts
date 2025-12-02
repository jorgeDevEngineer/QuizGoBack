import {QueryParamsDto, QueryParamsInput} from "./DTOs/QueryParamsDTO";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../domain/port/QuizRepository";
import { UserId } from "../domain/valueObject/Quiz";

export class GetUserFavoritesUseCase {
  constructor(private readonly favoritesRepo: UserFavoriteQuizRepository, 
    private readonly quizRepo: QuizRepository
  ) {}

  async execute(userId: UserId, queryInput: QueryParamsInput) {
    const query = new QueryParamsDto(queryInput);
    const criteria = query.toCriteria();
    const favoriteIds = await this.favoritesRepo.findFavoritesQuizByUser(userId);
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

    /*return {
      data: data.map(q => q.toPlainObject()),
      pagination: {
        page: criteria.page,
        limit: criteria.limit,
        totalCount,
        totalPages: Math.ceil(totalCount / criteria.limit),
      },
    };*/
  }
}