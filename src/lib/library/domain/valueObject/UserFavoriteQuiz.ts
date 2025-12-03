import { QuizId, UserId } from "./Quiz";

export class UserFavoriteQuiz {
    private constructor(
      public readonly userId: UserId,
      public readonly quizId: QuizId,
    ) {}

    static Of(userId: UserId, quizId: QuizId): UserFavoriteQuiz {
      return new UserFavoriteQuiz(userId, quizId);
    }
  }