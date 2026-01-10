import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";

import { GetGroupMembersQuery } from "../../parameterObjects/GetGroupMembersQuery";
import { GetGroupMembersResponseDto } from "../../dtos/GroupResponse.dto";

import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";
import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetGroupMembersQueryHandler
  implements IHandler<GetGroupMembersQuery, Either<DomainException, GetGroupMembersResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupMembersQuery): Promise<Either<DomainException, GetGroupMembersResponseDto>> {
    try {
      const groupId = GroupId.of(query.groupId);
      const currentUserId = new UserId(query.currentUserId);
    
      const groupOptional = await this.groupRepository.findById(groupId);
      if (!groupOptional.hasValue()) {
        return Either.makeLeft(new GroupNotFoundError(query.groupId));
      }
      const group = groupOptional.getValue();

      const plain = group.toPlainObject();
      const isMember = plain.members.some(
        (m) => m.userId === currentUserId.value,
      );
      if (!isMember) {
        return Either.makeLeft(new UserNotMemberOfGroupError(currentUserId.value, groupId.value));
      }
      return Either.makeRight({ 
        name: plain.name,
        members: plain.members.map((m) => ({
          userId: m.userId,
          role: m.role,
          joinedAt: m.joinedAt,
          completedQuizzes: m.completedQuizzes,
        })),
      });
    } catch (e) { 
      return Either.makeLeft(new DomainUnexpectedException(e.message));
    }
  }
}
  