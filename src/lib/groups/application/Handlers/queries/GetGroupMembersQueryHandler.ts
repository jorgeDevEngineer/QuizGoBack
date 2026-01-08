import { IHandler } from "src/lib/shared/IHandler";

import { GetGroupMembersQuery } from "../../parameterObjects/GetGroupMembersQuery";
import { GetGroupMembersResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupNotFoundError } from "../../../domain/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../domain/NotMemberGroupError";
import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetGroupMembersQueryHandler
  implements IHandler<GetGroupMembersQuery, GetGroupMembersResponseDto>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupMembersQuery): Promise<GetGroupMembersResponseDto> {
      const groupId = GroupId.of(query.groupId);
      const currentUserId = new UserId(query.currentUserId);
    
      const group = await this.groupRepository.findById(groupId);
      if (!group) {
        throw new GroupNotFoundError(groupId.value);
      }
      const plain = group.toPlainObject();
      const isMember = plain.members.some(
        (m) => m.userId === currentUserId.value,
      );
      if (!isMember) {
        throw new UserNotMemberOfGroupError(currentUserId.value, groupId.value);
      }
      return {
        name: plain.name,
        members: plain.members.map((m) => ({
          userId: m.userId,
          role: m.role,
          joinedAt: m.joinedAt,
          completedQuizzes: m.completedQuizzes,
        })),
      };
    }
  }
  