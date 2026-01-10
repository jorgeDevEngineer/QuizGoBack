import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";

import { RemoveGroupMemberCommand } from "../../parameterObjects/RemoveGroupMemberCommand";
import { RemoveGroupMemberResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

export class RemoveGroupMemberCommandHandler
  implements IHandler<RemoveGroupMemberCommand, Either<DomainException, RemoveGroupMemberResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
      command: RemoveGroupMemberCommand,
    ): Promise<Either<DomainException, RemoveGroupMemberResponseDto>> {
    try {
      const now = command.now ?? new Date();

      const groupId = GroupId.of(command.groupId);
      const adminId = new UserId(command.currentUserId);
      const targetId = new UserId(command.memberId);
  
      const groupOptional = await this.groupRepository.findById(groupId);
      if (!groupOptional.hasValue()) {
        return Either.makeLeft(new GroupNotFoundError(command.groupId));
      }
  
      const group = groupOptional.getValue();
  
      if (group.adminId.value !== adminId.value) {
        return Either.makeLeft(new GroupBusinessException("Solo el administrador del grupo puede realizar esta acción"));
      }
  
      if (adminId.value === targetId.value) {
        return Either.makeLeft(new GroupBusinessException("El administrador no puede eliminarse a sí mismo del grupo"));
      }
  
      const isMember = group.members.some(
        (m) => m.userId.value === targetId.value,
      );
      if (!isMember) {
        return Either.makeLeft(new UserNotMemberOfGroupError(command.memberId, command.groupId));
      }
      try {
        group.removeMember(targetId, now);
      } catch (e) {
        return Either.makeLeft(new DomainUnexpectedException(e.message));
      }
  
      await this.groupRepository.save(group);
  
      return Either.makeRight({ 
        groupId: group.id.value,
        removedUserId: targetId.value,
      });
    } catch (e) { 
      return Either.makeLeft(new DomainUnexpectedException(e.message));
    }
  }
  }