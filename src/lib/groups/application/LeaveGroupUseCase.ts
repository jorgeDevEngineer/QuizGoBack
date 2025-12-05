import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupNotFoundError } from "../domain/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../domain/NotMemberGroupError";

export interface LeaveGroupInput {
  groupId: string;
  currentUserId: string;
  now?: Date;
}

export interface LeaveGroupOutput {
  groupId: string;
  left: boolean;
}

export class LeaveGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(input: LeaveGroupInput): Promise<LeaveGroupOutput> {
    const now = input.now ?? new Date();

    const groupId = GroupId.of(input.groupId);
    const userId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(input.groupId);
    }

    if (group.adminId.value === userId.value) {
      throw new Error("El administrador no puede abandonar el grupo sin transferir el rol de administrador");
    }

    const isMember = group.members.some(
      (m) => m.userId.value === userId.value,
    );
    if (!isMember) {
      throw new UserNotMemberOfGroupError(input.currentUserId, input.groupId);
    }

    group.removeMember(userId, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      left: true,
    };
  }
}