import { randomUUID } from "node:crypto";

import { IHandler } from "src/lib/shared/IHandler";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { Group } from "../../../domain/entity/Group";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { GroupName } from "../../../domain/valueObject/GroupName";
import { GroupDescription } from "../../../domain/valueObject/GroupDescription";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

import { CreateGroupCommand } from "../../parameterObjects/CreateGroupCommand";
import { CreateGroupResponseDto } from "../../dtos/GroupResponse.dto";



export class CreateGroupCommandHandler
  implements IHandler<CreateGroupCommand, CreateGroupResponseDto>{
    constructor(private readonly groupRepository: GroupRepository) {}

  async execute(command: CreateGroupCommand): Promise<CreateGroupResponseDto> {
    const now = command.now ?? new Date();
    const groupId = GroupId.of(randomUUID());
    const groupName = GroupName.of(command.name);
    const groupDescription = GroupDescription.of("");
    const adminId = new UserId(command.currentUserId);
    const group = Group.create(
      groupId,
      groupName,
      groupDescription,
      adminId,
      now,
    );
    await this.groupRepository.save(group);

    return {
      id: group.id.value,
      name: group.name.value,
      adminId: group.adminId.value,
      memberCount: group.members.length,
      createdAt: group.createdAt.toISOString(),
    };
  }
}