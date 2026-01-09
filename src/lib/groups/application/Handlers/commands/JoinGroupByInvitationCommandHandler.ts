import { GroupRepository } from "../../../domain/port/GroupRepository";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { IHandler } from "src/lib/shared/IHandler";
import { JoinGroupByInvitationCommand} from "../../parameterObjects/JoinGroupByInvitationCommand";
import { JoinGroupByInvitationResponseDto } from "../../dtos/GroupResponse.dto";

import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";

export class JoinGroupByInvitationCommandHandler
  implements IHandler<JoinGroupByInvitationCommand, Either<DomainException, JoinGroupByInvitationResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    command: JoinGroupByInvitationCommand,
  ): Promise<Either<DomainException, JoinGroupByInvitationResponseDto>> {

  try {  
    const now = command.now ?? new Date();
    const userId = new UserId(command.currentUserId);

    const groupOptional = await this.groupRepository.findByInvitationToken(command.token);
    if (!groupOptional.hasValue()) {
       return Either.makeLeft(new GroupBusinessException("Invalid invitation token"));
    }
    const group = groupOptional.getValue();
    
    const invitation = group.invitationToken;
    if (!invitation.hasValue()) {
      return Either.makeLeft(new GroupBusinessException("This group has no active invitation"));
    }

    const invitationValue = invitation.getValue();

    if (invitationValue.isExpired(now)) {
      return Either.makeLeft(new GroupBusinessException("Invitation token has expired"));
    }

    // Regla de máximo 5 miembros en free se debe implementar la validacion
    if (group.members.length >= 5) {
      console.log("Grupo alcanzó el límite free de 5 miembros (dominio no lo rompe).");
    }

    try {
      group.addMember(userId, now);
    } catch (e) {
        return Either.makeLeft(new GroupBusinessException(e.message));
    }

    await this.groupRepository.save(group);

    return Either.makeRight({
        groupId: group.id.value,
        joinedAs: "member",
      });
  } catch (error) {
      return Either.makeLeft(new DomainUnexpectedException(error.message));
    }
  }
}