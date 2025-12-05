import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupNotFoundError } from "../domain/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../domain/NotMemberGroupError";

export interface RemoveGroupMemberInput {
  groupId: string;
  targetUserId: string;   
  currentUserId: string;  
  now?: Date;
}

export interface RemoveGroupMemberOutput {
  groupId: string;
  removedUserId: string;
}

export class RemoveGroupMemberUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    input: RemoveGroupMemberInput,
  ): Promise<RemoveGroupMemberOutput> {
    const now = input.now ?? new Date();

    const groupId = GroupId.of(input.groupId);
    const adminId = UserId.of(input.currentUserId);
    const targetId = UserId.of(input.targetUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(input.groupId);
    }

    if (group.adminId.value !== adminId.value) {
      throw new Error("Solo el administrador del grupo puede realizar esta acción");
    }

    if (adminId.value === targetId.value) {
      throw new Error("El administrador no puede eliminarse a sí mismo del grupo");
    }

    const isMember = group.members.some(
      (m) => m.userId.value === targetId.value,
    );
    if (!isMember) {
      throw new UserNotMemberOfGroupError(input.targetUserId, input.groupId);
    }
    
    group.removeMember(targetId, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      removedUserId: targetId.value,
    };
  }
}