import { randomUUID } from "node:crypto";

import { GroupRepository } from "../domain/port/GroupRepository";
import { Group } from "../domain/entity/Group";
import { GroupId } from "../domain/valueObject/GroupId";
import { GroupName } from "../domain/valueObject/GroupName";
import { GroupDescription } from "../domain/valueObject/GroupDescription";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";

export class CreateGroupRequestDto {
  name!: string; 
}
export class CreateGroupResponseDto {
  id!: string;
  name!: string;
  adminId!: string;
  memberCount!: number;
  createdAt!: string;
}

export interface CreateGroupInput {
  name: string;
  currentUserId: string;
  now?: Date;
}

export interface CreateGroupOutput {
  id: string;
  name: string;
  adminId: string;
  memberCount: number;
  createdAt: string;
}

export class CreateGroupUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(input: CreateGroupInput): Promise<CreateGroupOutput> {
    const now = input.now ?? new Date();
    const rawId = randomUUID();
    const groupId = GroupId.of(rawId); 
    const groupName = GroupName.of(input.name);
    const groupDescription = GroupDescription.of("");
    const adminId = UserId.of(input.currentUserId);
    
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