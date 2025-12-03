import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupId } from "../valueObject/GroupId";
import { GroupName } from "../valueObject/GroupName";
import {
  GroupDescription,
} from "../valueObject/GroupDescription";
import { GroupRole } from "../valueObject/GroupMemberRole";
import { GroupMember } from "./GroupMember";
import { GroupQuizAssignment } from "./GroupQuizAssigment";
import { GroupQuizAssignmentId } from "../valueObject/GroupQuizAssigmentId";
import { GroupInvitationToken } from "../valueObject/GroupInvitationToken";  
import { GroupQuizCompletion } from "./GroupQuizCompletion";
import { SinglePlayerGameId } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { InvitationTokenGenerator } from "../port/GroupInvitationTokenGenerator";

export class Group {
  private _members: GroupMember[];
  private _quizAssignments: GroupQuizAssignment[];
  private _completions: GroupQuizCompletion[];
  private _invitationToken: GroupInvitationToken | null;

  private constructor(
    private readonly _id: GroupId,
    private _name: GroupName,
    private _description: GroupDescription, 
    private _adminId: UserId,
    members: GroupMember[],
    quizAssignments: GroupQuizAssignment[],
    completions: GroupQuizCompletion[],
    invitationToken: GroupInvitationToken | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {
    this._members = members;
    this._quizAssignments = quizAssignments;
    this._invitationToken = invitationToken;
    this._completions = completions;

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
      [],
      null,    // invitation (aún no generada)     // completions
      createdAt,
      createdAt,
    );
  }
  

static createFromdb(
  id: GroupId,
  name: GroupName,
  description: GroupDescription | null,
  adminId: UserId,
  members: GroupMember[],
  quizAssignments: GroupQuizAssignment[],
  completions: GroupQuizCompletion[],
  invitationToken: GroupInvitationToken | null,
  createdAt: Date,
  updatedAt: Date,
): Group {
  return new Group(
    id,
    name,
    description,
    adminId,
    members,
    quizAssignments,
    completions,
    invitationToken,
    createdAt,
    updatedAt,
  );
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

  get invitationToken(): GroupInvitationToken | null {
    return this._invitationToken;
  }

  get completions(): GroupQuizCompletion[] {
    return [...this._completions];
  }

private isMember(userId: UserId): boolean {
    return this._members.some((m) => m.userId.value === userId.value);
  }

  private isAdmin(userId: UserId): boolean {
    return this._adminId.value === userId.value;
  }

  rename(
    name: GroupName,
    description: GroupDescription,             
    now: Date = new Date(),
  ): void {
    this._name = name;
    this._description = description;
    this._updatedAt = now;
  }

  addMember(userId: UserId, role: GroupRole, now: Date = new Date()): void {
    const existing = this._members.find(
      (m) => m.userId.value === userId.value,
    );
    if (existing) {
      throw new Error("El usuario ya es miembro de este grupo.");
    }

// Regla: ningún miembro nuevo entra como admin.
    if (role.value === GroupRole.admin().value) {
      throw new Error(
        "No se puede agregar un miembro directamente como admin. Usa transferAdmin para cambiar el administrador."
      );
    }

    const member = GroupMember.create(userId, GroupRole.member(), now);
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

// Asignación de quizzes al grupo
assignQuiz(
  assignment: GroupQuizAssignment,
  now: Date = new Date(),
): void {
  //Validar que el que asigna es miembro
  const isMember = this._members.some(
    (m) => m.userId.value === assignment.assignedBy.value,
  );

  if (!isMember) {
    throw new Error(
      "Solo los miembros del grupo pueden asignar un kahoot al grupo."
    );
  }

  assignment._setGroup(this._id);
  this._quizAssignments.push(assignment);
  this._updatedAt = now;
}

removeQuizAssignment(
    assignmentId: GroupQuizAssignmentId,
    requesterId: UserId,
    now: Date = new Date(),
  ): void {
    const assignment = this._quizAssignments.find(
      (a) => a.id.value === assignmentId.value,
    );
    if (!assignment) return;

    const isAdmin = this.isAdmin(requesterId);
    const isOwner = assignment.assignedBy.value === requesterId.value;

    if (!isAdmin && !isOwner) {
      throw new Error(
        "Solo el admin o el miembro que añadió el kahoot puede eliminarlo.",
      );
    }

    assignment.deactivate();
    this._updatedAt = now;
  }

  // Completions (intentos registrados)

  hasCompletedAssignment(
    assignmentId: GroupQuizAssignmentId,
    userId: UserId,
  ): boolean {
    return this._completions.some(
      (c) =>
        c.assignmentId.value === assignmentId.value &&
        c.userId.value === userId.value,
    );
  }

  getCompletionFor(
    assignmentId: GroupQuizAssignmentId,
    userId: UserId,
  ): GroupQuizCompletion | null {
    return (
      this._completions.find(
        (c) =>
          c.assignmentId.value === assignmentId.value &&
          c.userId.value === userId.value,
      ) ?? null
    );
  }

  registerAssignmentCompletion(
    assignmentId: GroupQuizAssignmentId,
    userId: UserId,
    quizAttemptId: SinglePlayerGameId,
    score: number,
    now: Date = new Date(),
  ): void {
    if (!this.isMember(userId)) {
      throw new Error("El usuario no es miembro del grupo.");
    }

    const assignment = this._quizAssignments.find(
      (a) => a.id.value === assignmentId.value,
    );
    if (!assignment) {
      throw new Error(
        "El kahoot no está asignado a este grupo.",
      );
    }

    if (this.hasCompletedAssignment(assignmentId, userId)) {
      throw new Error(
        "El miembro ya completó este kahoot en el grupo.",
      );
    }

    const completion = GroupQuizCompletion.create(
      assignmentId,
      userId,
      quizAttemptId,
      score,
      now,
    );

    this._completions.push(completion);
    this._updatedAt = now;

    // Actualizar contador interno del miembro
    const member = this._members.find(
      (m) => m.userId.value === userId.value,
    );
    if (member) {
      member.incrementCompletedQuizzes();
    }
  }



  // Invitaciones al grupo
setInvitation(invitation: GroupInvitationToken, now: Date = new Date()): void {
  this._invitationToken = invitation;
  this._updatedAt = now;
}

validateInvitationToken(
  token: string,
  now: Date = new Date(),
): void {
  if (!this._invitationToken) {
    throw new Error("No hay invitación activa para este grupo.");
  }

  if (this._invitationToken.token !== token) {
    throw new Error("Token de invitación inválido.");
  }

  if (this._invitationToken.isExpired(now)) {
    throw new Error("La invitación ha expirado.");
  }
}

get invitation(): GroupInvitationToken | null {
  return this._invitationToken;
}

generateInvitation(
    generator: InvitationTokenGenerator,
    ttlDays: number,
    now: Date,
  ): void {
    this._invitationToken = GroupInvitationToken.fromGenerator(
      generator,
      ttlDays,
      now,
    );
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
      quizAssignments: this._quizAssignments.map((qa) =>qa.toPlainObject()),
      completions: this._completions.map((c) => c.toPlainObject()),
      invitation: this._invitationToken? this._invitationToken.toPlainObject(): null,
    };
  }
}