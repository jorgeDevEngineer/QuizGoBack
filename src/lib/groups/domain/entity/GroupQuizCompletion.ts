import { GroupQuizAssignmentId } from "../valueObject/GroupQuizAssigmentId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { SinglePlayerGameId } from "src/lib/asyncGame/domain/valueObjects/asyncGamesVO";

export class GroupQuizCompletion {
  private constructor(
    private readonly _assignmentId: GroupQuizAssignmentId,
    private readonly _userId: UserId,
    private readonly _quizAttemptId: SinglePlayerGameId,
    private readonly _score: number,
    private readonly _completedAt: Date,
  ) {
    if (typeof _score !== "number" || _score < 0) {
      throw new Error("Score inválido.");
    }

    if (!_completedAt || typeof _completedAt.getTime !== "function") {
      throw new Error("Fecha de completación inválida.");
    }
  }

  static create(
    assignmentId: GroupQuizAssignmentId,
    userId: UserId,
    quizAttemptId: SinglePlayerGameId,
    score: number,
    completedAt: Date = new Date(),
  ): GroupQuizCompletion {
    return new GroupQuizCompletion(
      assignmentId,
      userId,
      quizAttemptId,
      score,
      completedAt,
    );
  }

  get assignmentId(): GroupQuizAssignmentId {
    return this._assignmentId;
  }

  get userId(): UserId {
    return this._userId;
  }

  get quizAttemptId(): SinglePlayerGameId {
    return this._quizAttemptId;
  }

  get score(): number {
    return this._score;
  }

  get completedAt(): Date {
    return this._completedAt;
  }

  toPlainObject() {
    return {
      assignmentId: this._assignmentId.value,
      userId: this._userId.value,
      quizAttemptId: this._quizAttemptId.game,
      score: this._score,
      completedAt: this._completedAt.toISOString(),
    };
  }
}