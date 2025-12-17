import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { UserId as UserIdVO} from "src/lib/kahoot/domain/valueObject/Quiz";
import { User } from "src/lib/user/domain/aggregate/User";
import { UserId} from "../../../user/domain/valueObject/UserId";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "../../../shared/exceptions/DomainException";
import { QuizzesNotFoundException } from "../../../shared/exceptions/QuizzesNotFoundException";
import { UserNotFoundException } from "../../../shared/exceptions/UserNotFoundException";
import { QuizRepository } from "../port/QuizRepository";
import { UserFavoriteQuizRepository } from "../port/UserFavoriteQuizRepository";
import { QuizQueryCriteria } from "../../application/Response Types/QuizQueryCriteria";

export class GetUserFavoriteQuizzesDomainService {
    constructor(
      private readonly favoritesRepo: UserFavoriteQuizRepository,
      private readonly quizRepo: QuizRepository,
      private readonly userRepo: UserRepository
    ) {}
  
    async execute(userId: UserIdVO, criteria: QuizQueryCriteria)
      : Promise<Either<DomainException, { quizzes: Quiz[], authors: User[] }>> {
  
      const favoriteIds = await this.favoritesRepo.findFavoritesQuizByUser(new UserId(userId.value), criteria);
      if (favoriteIds.length === 0) {
        return Either.makeLeft(new QuizzesNotFoundException());
      }
  
      const favoriteQuizzes = await this.quizRepo.findByIds(favoriteIds, criteria);
      if (favoriteQuizzes.length === 0) {
        return Either.makeLeft(new QuizzesNotFoundException());
      }
  
      const authors: User[] = [];
      for (const quiz of favoriteQuizzes) {
        const author = await this.userRepo.getOneById(new UserId(quiz.authorId.value));
        if (!author) {
          return Either.makeLeft(new UserNotFoundException());
        }
        authors.push(author);
      }
  
      return Either.makeRight({ quizzes: favoriteQuizzes, authors });
    }
  }