import {UserFavoriteQuiz} from "../valueObject/UserFavoriteQuiz";
import { QuizId, UserId } from "../valueObject/Quiz";

export interface UserFavoriteQuizRepository {
 addFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void>;
 removeFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void>;
 findFavoritesQuizByUser(userId: UserId): Promise<QuizId[]>;
 isFavorite(userId: UserId, quizId: QuizId): Promise<boolean>
}
