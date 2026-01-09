import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
export interface QuizReadService {
  quizBelongsToUser(quizId: QuizId, userId: UserId): Promise<boolean>;
}