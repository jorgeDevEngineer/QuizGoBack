import { QuizId} from "../../../kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class UserFavoriteQuiz {
    private constructor(
      public readonly userId: UserId,
      public readonly quizId: QuizId,
    ) {}

    static Of(userId: UserId, quizId: QuizId): UserFavoriteQuiz {
      return new UserFavoriteQuiz(userId, quizId);
    }
  }