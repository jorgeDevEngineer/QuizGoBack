import { IHandler } from "src/lib/shared/IHandler";
import { GetGroupDetailsQuery } from "../../parameterObjects/GetGroupDetailsQuery";
import { GetGroupDetailsResponseDto } from "../../dtos/GroupResponse.dto";

import { Group } from "../../../domain/entity/Group";
import { UserNotMemberOfGroupError } from "../../../domain/NotMemberGroupError";
import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupNotFoundError } from "../../../domain/GroupNotFoundError";

export class GetGroupDetailsQueryHandler
  implements IHandler<GetGroupDetailsQuery, GetGroupDetailsResponseDto>
{
  constructor(private readonly groupRepository: GroupRepository) {}
  async execute(query: GetGroupDetailsQuery): Promise<GetGroupDetailsResponseDto> {
      const groupId = GroupId.of(query.groupId);
      const currentUserId = new UserId(query.currentUserId);

      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw new GroupNotFoundError(query.groupId);
      }
      const plain = group.toPlainObject();
      const isMember = plain.members.some((m) => m.userId === currentUserId.value);
      if (!isMember) {
        throw new UserNotMemberOfGroupError(query.currentUserId, query.groupId);
      }
  
      return {
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
      };
    }
  }
  