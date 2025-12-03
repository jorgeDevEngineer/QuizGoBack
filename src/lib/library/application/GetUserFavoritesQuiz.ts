import {QueryParamsDto, QueryParamsInput} from "./DTOs/QueryParamsDTO";
import {UserFavoriteQuizRepository} from "../domain/port/UserFavoriteQuizRepository";
import {QuizRepository} from "../domain/port/QuizRepository";
import { UserId } from "../domain/valueObject/Quiz";
import { Quiz } from "../domain/entity/Quiz";

export class GetUserFavoritesUseCase {
  constructor(private readonly favoritesRepo: UserFavoriteQuizRepository, 
    private readonly quizRepo: QuizRepository
  ) {}

  async execute(userId: UserId, queryInput: QueryParamsInput) {
    //let quizFinded: Quiz[];
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
    
    /*let dataElement: Quiz;
    for(const quizId of favoriteIds){
      dataElement = await this.quizRepo.find(quizId);
      quizFinded.push(dataElement);
    }*/

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