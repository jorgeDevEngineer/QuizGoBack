import { GroupId } from "../valueObject/Group";
import { GroupQuizAssignmentId } from "../valueObject/GroupQuizAssigments";
import { GroupQuizAttemptId } from "../valueObject/GroupQuizAttempt";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export class GroupQuizAttempt {
  private constructor(
    private readonly _id: GroupQuizAttemptId,
    private readonly _groupId: GroupId,
    private readonly _assignmentId: GroupQuizAssignmentId,
    private readonly _userId: UserId,
    private readonly _score: number,
    private readonly _completedAt: Date,

    private readonly _quizAttemptId: string,//esto debe hacer referencia a un valueobject que venga de quizattem ya que es el aggregate general donde se guardan todos los intentos de quices
  ) {
    if (!Number.isFinite(_score) || _score < 0) {
      throw new Error("Score must be a non-negative number.");
    }
    if (!_quizAttemptId.trim()) {
      throw new Error("quizAttemptId cannot be empty.");
    }
  }

  static create(
    id: GroupQuizAttemptId,
    groupId: GroupId,
    assignmentId: GroupQuizAssignmentId,
    userId: UserId,
    score: number,
    completedAt: Date = new Date(),
    quizAttemptId: string,  
  ): GroupQuizAttempt {
    return new GroupQuizAttempt(
      id,
      groupId,
      assignmentId,
      userId,
      score,
      completedAt,
      quizAttemptId,
    );
  }

  // Getters
  get id(): GroupQuizAttemptId {
    return this._id;
  }

  get groupId(): GroupId {
    return this._groupId;
  }

  get assignmentId(): GroupQuizAssignmentId {
    return this._assignmentId;
  }

  get userId(): UserId {
    return this._userId;
  }

  get score(): number {
    return this._score;
  }

  get completedAt(): Date {
    return this._completedAt;
  }
  get quizAttemptId(): string {
    return this._quizAttemptId;
  }

  toPlainObject() {
    return {
      id: this._id.value,
      groupId: this._groupId.value,
      assignmentId: this._assignmentId.value,
      userId: this._userId.value,
      score: this._score,
      completedAt: this._completedAt.toISOString(),
      quizAttemptId: this._quizAttemptId,
    };
  }
}