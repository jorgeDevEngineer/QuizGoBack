import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";


import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { InvitationTokenGenerator } from "../../../domain/port/GroupInvitationTokenGenerator";

import { GenerateGroupInvitationCommand } from "../../parameterObjects/GenerateGroupInvitationCommand";
import { GenerateGroupInvitationResponseDto } from "../../dtos/GroupResponse.dto";
import e from "express";



export class GenerateGroupInvitationCommandHandler
  implements
    IHandler<GenerateGroupInvitationCommand, Either<DomainException, GenerateGroupInvitationResponseDto>>
{
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly tokenGenerator: InvitationTokenGenerator,
  ) {}

  async execute(
    command: GenerateGroupInvitationCommand,
  ): Promise<Either<DomainException, GenerateGroupInvitationResponseDto>> {
  try {
    const now = command.now ?? new Date();
    const ttlDays = command.ttlDays ?? 7;

    const groupId = GroupId.of(command.groupId);
    const currentUserId = new UserId(command.currentUserId);

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) {
      return Either.makeLeft(new GroupNotFoundError(command.groupId));
    }

    const group = groupOptional.getValue();

    if (group.adminId.value !== currentUserId.value) {
      return Either.makeLeft(new GroupBusinessException("Solo el administrador del grupo puede generar enlaces de invitación"));
    }
    try {
      group.generateInvitation(this.tokenGenerator, ttlDays, now);
    } catch (e) {
      return Either.makeLeft(new GroupBusinessException(e.message));
    }

    await this.groupRepository.save(group);
    const tokenOptional = group.invitationToken;
    if (!tokenOptional.hasValue()) {
      return Either.makeLeft(new DomainUnexpectedException("Error generating invitation token"));
    }
    const Base_URL = "http://QuizGo.app/groups/join/";
    const token = tokenOptional.getValue();
    const fullInvitationLink = `${Base_URL}${token.token}`;

    return Either.makeRight({
      groupId: group.id.value,
      Link: fullInvitationLink,
      expiresAt: token.expiresAt.toISOString(),
    });
  } catch (e) { 
    return Either.makeLeft(new DomainUnexpectedException(e.message));
  }
}
}