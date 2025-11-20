import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import {
  GroupDescription,
  GroupId,
  GroupName,
} from "../valueObject/Group";
import { GroupRole } from "../valueObject/GroupMember";
import { GroupMember } from "./GroupMember";
import { GroupQuizAssignment } from "./GroupQuizAssigment";
import { GroupQuizAssignmentId } from "../valueObject/GroupQuizAssigments";

export class Group {
  private _members: GroupMember[];
  private _quizAssignments: GroupQuizAssignment[];

  private constructor(
    private readonly _id: GroupId,
    private _name: GroupName,
    private _description: GroupDescription, 
    private _adminId: UserId,
    members: GroupMember[],
    quizAssignments: GroupQuizAssignment[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    this._members = members;
    this._quizAssignments = quizAssignments;

    this._members.forEach((m) => m._setGroup(this._id));
    this._quizAssignments.forEach((qa) => qa._setGroup(this._id));

    const adminMember = this._members.find(
      (m) =>
        m.userId.value === this._adminId.value &&
        m.role.value === GroupRole.admin().value,
    );

    if (!adminMember) {
      throw new Error(
        "El grupo debe tener un miembro admin cuyo userId coincida con adminId.",
      );
    }
  }

  static create(
    id: GroupId,
    name: GroupName,
    description: GroupDescription,  
    adminId: UserId,
    createdAt: Date = new Date(),
  ): Group {
    const adminMember = GroupMember.create(
      adminId,
      GroupRole.admin(),
      createdAt,
    );

    return new Group(
      id,
      name,
      description,
      adminId,
      [adminMember],
      [],
      createdAt,
      createdAt,
    );
  }

  removeQuizAssignment(
  assignmentId: GroupQuizAssignmentId,
  requesterId: UserId,
  now: Date = new Date(),
): void {
  const assignment = this._quizAssignments.find(a => a.id.value === assignmentId.value);
  if (!assignment) return;

  const isAdmin = this._adminId.value === requesterId.value;
  const isOwner = assignment.assignedBy.value === requesterId.value;

  if (!isAdmin && !isOwner) {
    throw new Error("Solo el admin o el miembro que añadió el kahoot puede eliminarlo.");
  }

  assignment.deactivate();
  this._updatedAt = now;
}

  // Getters
  get id(): GroupId {
    return this._id;
  }

  get name(): GroupName {
    return this._name;
  }

  get description(): GroupDescription {
    return this._description;
  }

  get adminId(): UserId {
    return this._adminId;
  }

  get members(): GroupMember[] {
    return [...this._members];
  }

  get quizAssignments(): GroupQuizAssignment[] {
    return [...this._quizAssignments];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // --- Comportamiento de dominio ---

  rename(
    name: GroupName,
    description: GroupDescription,             
    now: Date = new Date(),
  ): void {
    this._name = name;
    this._description = description;
    this._updatedAt = now;
  }

  /** El límite de miembros por plan (premium / no premium) validar en la capa de aplicación. */
  addMember(userId: UserId, role: GroupRole, now: Date = new Date()): void {
    const existing = this._members.find(
      (m) => m.userId.value === userId.value,
    );
    if (existing) {
      throw new Error("El usuario ya es miembro de este grupo.");
    }

    const member = GroupMember.create(userId, role, now);
    member._setGroup(this._id);
    this._members.push(member);
    this._updatedAt = now;
  }

  removeMember(userId: UserId, now: Date = new Date()): void {
    if (this._adminId.value === userId.value) {
      throw new Error(
        "El admin no puede salir del grupo sin transferir el rol de admin.",
      );
    }

    this._members = this._members.filter(
      (m) => m.userId.value !== userId.value,
    );
    this._updatedAt = now;
  }

  transferAdmin(
    currentAdminId: UserId,
    newAdminId: UserId,
    now: Date = new Date(),
  ): void {
    if (this._adminId.value !== currentAdminId.value) {
      throw new Error("solo el admin actual puede transferir el rol de admin.");
    }

    const newAdmin = this._members.find(
      (m) => m.userId.value === newAdminId.value,
    );
    if (!newAdmin) {
      throw new Error("El nuevo admin debe ser un miembro del grupo.");
    }

    // Cambiar roles
    this._members.forEach((m) => {
      if (m.userId.value === this._adminId.value) {
        m.changeRole(GroupRole.member());
      }
      if (m.userId.value === newAdminId.value) {
        m.changeRole(GroupRole.admin());
      }
    });

    this._adminId = newAdminId;
    this._updatedAt = now;
  }

  assignQuiz(
    assignment: GroupQuizAssignment,
    now: Date = new Date(),
  ): void {
    assignment._setGroup(this._id);
    this._quizAssignments.push(assignment);
    this._updatedAt = now;
  }

  /** Para ranking: aumenta el contador de quizzes completados por un miembro. */
  registerQuizCompletion(userId: UserId, now: Date = new Date()): void {
    const member = this._members.find(
      (m) => m.userId.value === userId.value,
    );

    if (!member) {
      throw new Error("El usuario no es miembro de este grupo.");
    }

    member.incrementCompletedQuizzes();
    this._updatedAt = now;
  }

  toPlainObject() {
    return {
      id: this._id.value,
      name: this._name.value,
      description: this._description.value,   
      adminId: this._adminId.value,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      members: this._members.map((m) => m.toPlainObject()),
      quizAssignments: this._quizAssignments.map((qa) => qa.toPlainObject()),
    };
  }
}