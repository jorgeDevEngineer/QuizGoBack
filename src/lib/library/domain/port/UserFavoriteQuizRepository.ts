import {UserFavoriteQuiz} from "../valueObject/UserFavoriteQuiz";
import { QuizId} from "../../../kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { QuizQueryCriteria } from "../../application/Response Types/QuizQueryCriteria";
export interface UserFavoriteQuizRepository {
 addFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void>;
 removeFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void>;
 findFavoritesQuizByUser(userId: UserId, criteria: QuizQueryCriteria): Promise<QuizId[]>;
 isFavorite(userId: UserId, quizId: QuizId): Promise<boolean>
}
