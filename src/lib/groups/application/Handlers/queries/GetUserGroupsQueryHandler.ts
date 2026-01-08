import { IHandler } from "src/lib/shared/IHandler";
import { GetUserGroupsQuery } from "../../parameterObjects/GetUserGroupsQuery";
import { GetUserGroupsResponseDto } from "../../dtos/GroupResponse.dto";


import { GroupRepository } from "../../../domain/port/GroupRepository";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetUserGroupsQueryHandler implements IHandler<GetUserGroupsQuery, GetUserGroupsResponseDto> {
    constructor(
        private readonly groupRepository: GroupRepository
    ) {}
    async execute(query: GetUserGroupsQuery): Promise<GetUserGroupsResponseDto> {
    const userId = new UserId(query.currentUserId);

    const groups = await this.groupRepository.findByMember(userId);

    return {
      groups: groups.map((g) => ({
        id: g.id.value,
        name: g.name.value,
        adminId: g.adminId.value,
        memberCount: g.members.length,
        createdAt: g.createdAt.toISOString(),
      })),
    };
  }
}