import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupId } from "../valueObject/GroupId";
import { GroupRole } from "../valueObject/GroupMemberRole";

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
