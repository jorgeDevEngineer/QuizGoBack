import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupId } from "../valueObject/Group";
import { GroupRole } from "../valueObject/GroupMember";

export class GroupMember {
  private _group: GroupId;

  private constructor(
    private readonly _userId: UserId,
    private _role: GroupRole,
    private readonly _joinedAt: Date,
    private _completedQuizzes: number,
  ) {if (!Number.isInteger(_completedQuizzes) || _completedQuizzes < 0) {
      throw new Error("completedQuizzes must be a non-negative integer.");
    }
  }

  static create(userId: UserId, role: GroupRole, joinedAt: Date): GroupMember {
    return new GroupMember(userId, role, joinedAt, 0);
  }

  /** Este método solo debería ser llamado por el aggregate Group. */
  _setGroup(groupId: GroupId) {
    this._group = groupId;
  }

  // Getters
  get userId(): UserId {
    return this._userId;
  }

  get role(): GroupRole {
    return this._role;
  }

  get joinedAt(): Date {
    return this._joinedAt;
  }

  get completedQuizzes(): number {
    return this._completedQuizzes;
  }

  // Comportamiento de dominio
  changeRole(role: GroupRole): void {
    this._role = role;
  }

  incrementCompletedQuizzes(): void {
    this._completedQuizzes += 1;
  }

  toPlainObject() {
    return {
      groupId: this._group.value,
      userId: this._userId.value,
      role: this._role.value,
      joinedAt: this._joinedAt.toISOString(),
      completedQuizzes: this._completedQuizzes,
    };
  }
}
