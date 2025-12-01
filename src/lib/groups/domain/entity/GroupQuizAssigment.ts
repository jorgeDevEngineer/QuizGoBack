import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupId } from "../valueObject/GroupId";
import { GroupQuizAssignmentId } from "../valueObject/GroupQuizAssigmentId";

export class GroupQuizAssignment {
  private _group!: GroupId;

  private constructor(
    private readonly _id: GroupQuizAssignmentId,
    private readonly _quizId: QuizId,
    private readonly _assignedBy: UserId,
    private readonly _createdAt: Date,
    private readonly _availableFrom: Date,
    private readonly _availableUntil: Date | null,
    private _isActive: boolean,
  ) {
    if (
      this._availableUntil &&
      this._availableFrom > this._availableUntil
    ) {
      throw new Error(
        "availableFrom must be earlier than or equal to availableUntil.",
      );
    }
  }

  static create(
    id: GroupQuizAssignmentId,
    quizId: QuizId,
    assignedBy: UserId,
    availableFrom: Date,
    availableUntil: Date | null = null,
    createdAt: Date = new Date(),
  ): GroupQuizAssignment {
    return new GroupQuizAssignment(
      id,
      quizId,
      assignedBy,
      createdAt,
      availableFrom,
      availableUntil,
      true,
    );
  }

  /** Solo debería ser llamado desde el aggregate Group. */
  _setGroup(groupId: GroupId) {
    this._group = groupId;
  }

  // Getters
  get id(): GroupQuizAssignmentId {
    return this._id;
  }

  get quizId(): QuizId {
    return this._quizId;
  }

  get assignedBy(): UserId {
    return this._assignedBy;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get availableFrom(): Date {
    return this._availableFrom;
  }

  get availableUntil(): Date | null {
    return this._availableUntil;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  deactivate(): void {
    this._isActive = false;
  }

  isAvailableAt(now: Date = new Date()): boolean {
    if (!this._isActive) return false;
    if (now < this._availableFrom) return false;
    if (this._availableUntil && now > this._availableUntil) return false;
    return true;
  }

  toPlainObject() {
    return {
      id: this._id.value,
      groupId: this._group.value,
      quizId: this._quizId.value,
      assignedBy: this._assignedBy.value,
      createdAt: this._createdAt.toISOString(),
      availableFrom: this._availableFrom.toISOString(),
      availableUntil: this._availableUntil?.toISOString() ?? null,
      isActive: this._isActive,
    };
  }
}