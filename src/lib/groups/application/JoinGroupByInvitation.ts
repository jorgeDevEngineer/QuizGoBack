import { GroupRepository } from "../domain/port/GroupRepository";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupRole } from "../domain/valueObject/GroupMemberRole";

export interface JoinGroupByInvitationInput {
  token: string;
  currentUserId: string;
  now?: Date;
}

export interface JoinGroupByInvitationOutput {
  groupId: string;
  joinedAs: "member";
}

export class JoinGroupByInvitationUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(input: JoinGroupByInvitationInput,): Promise<JoinGroupByInvitationOutput> {
    const now = input.now ?? new Date();

    const userId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findByInvitationToken(
      input.token,
    );
    if (!group) {
      throw new Error("Invalid invitation token");
    }

    const invitation = group.invitationToken;
    if (!invitation) {
      throw new Error("This group has no active invitation");
    }

    if (invitation.isExpired(now)) {
      throw new Error("Invitation token has expired");
    }

    // Regla de máximo 5 miembros en free se debe implementar la validacion
    if (group.members.length >= 5) {
      console.log("Grupo alcanzó el límite free de 5 miembros (dominio no lo rompe).");
    }

    group.addMember(userId, GroupRole.member(), now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      joinedAs: "member",
    };
  }
}