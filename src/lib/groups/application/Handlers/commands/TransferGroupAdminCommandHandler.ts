import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { TransferGroupAdminCommand } from "../../parameterObjects/TransferGroupAdminCommand";
import { TransferGroupAdminResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { User } from "src/lib/search/domain/entity/User";


export class TransferGroupAdminCommandHandler
  implements IHandler<TransferGroupAdminCommand, Either<DomainException, TransferGroupAdminResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}
  async execute(
      command: TransferGroupAdminCommand,
    ): Promise<Either<DomainException, TransferGroupAdminResponseDto>> {
    try {
      const now = command.now ?? new Date();

      const groupId = GroupId.of(command.groupId);
      const currentAdminId = new UserId(command.currentUserId);
      const newAdminId = new UserId(command.newAdminUserId);
  
      const groupOptional = await this.groupRepository.findById(groupId);
      if (!groupOptional.hasValue()) {
        return Either.makeLeft(new GroupNotFoundError(command.groupId));
      }
      const group = groupOptional.getValue();
      if (group.adminId.value !== currentAdminId.value) {
        return Either.makeLeft(new GroupBusinessException("Solo el administrador del grupo puede transferir la administración"));
      }
      if (currentAdminId.value === newAdminId.value) {
        return Either.makeLeft(new GroupBusinessException("El nuevo administrador debe ser diferente del administrador actual",));
      }
      const isMember = group.members.some(
        (m) => m.userId.value === newAdminId.value,
      );
      if (!isMember) {
        return Either.makeLeft(new UserNotMemberOfGroupError(command.newAdminUserId, command.groupId));
      }
    try{
      group.transferAdmin(currentAdminId, newAdminId, now);
    } catch (e) {
      return Either.makeLeft(new GroupBusinessException(e.message));
    }
      await this.groupRepository.save(group);
  
      return Either.makeRight({
        groupId: group.id.value,
        oldAdminUserId: currentAdminId.value,
        newAdminUserId: newAdminId.value,
      });
    } catch (e) { 
      return Either.makeLeft(new DomainUnexpectedException(e.message));
    }
  }
}