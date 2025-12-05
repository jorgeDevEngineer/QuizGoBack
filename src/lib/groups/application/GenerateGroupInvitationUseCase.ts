import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { InvitationTokenGenerator } from "../domain/port/GroupInvitationTokenGenerator";

export interface GenerateGroupInvitationInput {
  groupId: string;
  currentUserId: string;
  ttlDays?: number;
  now?: Date;
}

export interface GenerateGroupInvitationOutput {
  groupId: string;
  Link: string;
  expiresAt: string;
}

export class GenerateGroupInvitationUseCase {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly tokenGenerator: InvitationTokenGenerator,
  ) {}

  async execute(input: GenerateGroupInvitationInput): Promise<GenerateGroupInvitationOutput> {
    const now = input.now ?? new Date();
    const ttlDays = input.ttlDays ?? 7;
    const groupId = GroupId.of(input.groupId);
    const currentUserId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new Error("Group not found");
    }

    if (group.adminId.value !== currentUserId.value) {
      throw new Error("solo el administrador del grupo puede generar invitaciones");
    }

    group.generateInvitation(this.tokenGenerator, ttlDays, now);

    await this.groupRepository.save(group);

    const Base_URL ='http://QuizGo.app/groups/join/';
    const token = group.invitationToken!;
    const fullInvitationLink = `${Base_URL}${token.token}`;

    return {
      groupId: group.id.value,
      Link: fullInvitationLink,
      expiresAt: token.expiresAt.toISOString(),
    };
  }
}