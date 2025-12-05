//servicio de dominio para validar si un quiz existe y pertenece a un usuario

import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
export interface QuizReadService {
  quizBelongsToUser(quizId: QuizId, userId: UserId): Promise<boolean>;
}