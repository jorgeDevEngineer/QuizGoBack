import { GroupId } from "../valueObject/Group";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { 
    GroupInvitationId, 
    InvitationToken, 
    InvitationStatus 
} from "../valueObject/GroupInvitation";


export class GroupInvitation {
  private constructor(
    private readonly _id: GroupInvitationId,
    private readonly _groupId: GroupId,
    private readonly _token: InvitationToken,
    private _status: InvitationStatus,
    private readonly _expiresAt: Date,
    private readonly _createdAt: Date,
    private readonly _createdBy: UserId,
  ) {}

  static create(
    id: GroupInvitationId,
    groupId: GroupId,
    token: InvitationToken,
    expiresAt: Date,
    createdBy: UserId,
    createdAt: Date = new Date(),
  ): GroupInvitation {
    if (expiresAt <= createdAt) {
      throw new Error("Invitation expiration date must be in the future.");
    }

    return new GroupInvitation(
      id,
      groupId,
      token,
      InvitationStatus.active(),
      expiresAt,
      createdAt,
      createdBy,
    );
  }

  // Getters
  get id(): GroupInvitationId {
    return this._id;
  }

  get groupId(): GroupId {
    return this._groupId;
  }

  get token(): InvitationToken {
    return this._token;
  }

  get status(): InvitationStatus {
    return this._status;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get createdBy(): UserId {
    return this._createdBy;
  }

  // Reglas de dominio

  ensureIsActiveAndNotExpired(now: Date = new Date()): void {
    if (this._status.value !== InvitationStatus.active().value) {
      throw new Error("Invitation is not active.");
    }
    if (this._expiresAt <= now) {
      this._status = InvitationStatus.expired();
      throw new Error("Invitation has expired.");
    }
  }

  revoke(): void {
    this._status = InvitationStatus.revoked();
  }

  expire(): void {
    this._status = InvitationStatus.expired();
  }

  toPlainObject() {
    return {
      id: this._id.value,
      groupId: this._groupId.value,
      token: this._token.value,
      status: this._status.value,
      expiresAt: this._expiresAt.toISOString(),
      createdAt: this._createdAt.toISOString(),
      createdBy: this._createdBy.value,
    };
  }
}