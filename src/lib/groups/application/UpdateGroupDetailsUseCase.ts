// src/lib/groups/application/UpdateGroupInfoUseCase.ts
import { GroupRepository } from "../domain/port/GroupRepository";
import { GroupId } from "../domain/valueObject/GroupId";
import { GroupName } from "../domain/valueObject/GroupName";
import { GroupDescription } from "../domain/valueObject/GroupDescription";
import { UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { GroupNotFoundError } from "../domain/GroupNotFoundError";
import { Group } from "../domain/entity/Group";

export interface UpdateGroupInfoInput {
  groupId: string;
  currentUserId: string;
  name?: string;
  description?: string;
  now?: Date;
}

export interface UpdateGroupInfoOutput {
  groupId: string;
  name: string;
  description: string;
}

export class UpdateGroupInfoUseCase {
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    input: UpdateGroupInfoInput,
  ): Promise<UpdateGroupInfoOutput> {
    const now = input.now ?? new Date();

    if (!input.name && input.description === undefined) {
      throw new Error("al menos un campo (nombre o descripción) debe ser proporcionado para la actualización");
    }

    const groupId = GroupId.of(input.groupId);
    const userId = UserId.of(input.currentUserId);

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new GroupNotFoundError(input.groupId);
    }

    if (group.adminId.value !== userId.value) {
      throw new Error("Solo el administrador puede editar la información del grupo");
    }

    let newName = group.name;
    if (input.name) {
      newName = GroupName.of(input.name);
    }
    
    let newDescription = group.description ?? GroupDescription.of("");
    if (input.description !== undefined) {
      newDescription = GroupDescription.of(input.description);
    }

    group.rename(newName, newDescription, now);

    await this.groupRepository.save(group);

    return {
      groupId: group.id.value,
      name: group.name.value,
      description: group.description?.value ?? "",
    };
  }
}