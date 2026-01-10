import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { GroupBusinessException } from "src/lib/shared/exceptions/GroupGenException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";



import { GetGroupDetailsQuery } from "../../parameterObjects/GetGroupDetailsQuery";
import { GetGroupDetailsResponseDto } from "../../dtos/GroupResponse.dto";

import { Group } from "../../../domain/entity/Group";
import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetGroupDetailsQueryHandler
  implements IHandler<GetGroupDetailsQuery, Either<DomainException, GetGroupDetailsResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}
  async execute(query: GetGroupDetailsQuery): Promise<Either<DomainException, GetGroupDetailsResponseDto>> {
    try {
      const groupId = GroupId.of(query.groupId);
      const currentUserId = new UserId(query.currentUserId);

      const groupOptional = await this.groupRepository.findById(groupId);
      if (!groupOptional.hasValue()) {
        return Either.makeLeft(new GroupNotFoundError(query.groupId));
      }
      const group = groupOptional.getValue();

      const plain = group.toPlainObject();
      const isMember = plain.members.some((m) => m.userId === currentUserId.value);
      if (!isMember) {
        return Either.makeLeft(new UserNotMemberOfGroupError(currentUserId.value, groupId.value));
      }
  
      return Either.makeRight({
        id: plain.id,
        name: plain.name,
        description: plain.description,
        adminId: plain.adminId,
        members: plain.members.map((m) => ({
          userId: m.userId,
          role: m.role,
          joinedAt: m.joinedAt,
          completedQuizzes: m.completedQuizzes,
        })),
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
      });
    } catch (e) { 
      return Either.makeLeft(new DomainUnexpectedException(e.message));
    }
  }
}
  