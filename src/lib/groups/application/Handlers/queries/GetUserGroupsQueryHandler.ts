import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";

import { GetUserGroupsQuery } from "../../parameterObjects/GetUserGroupsQuery";
import { GetUserGroupsResponseDto } from "../../dtos/GroupResponse.dto";


import { GroupRepository } from "../../../domain/port/GroupRepository";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetUserGroupsQueryHandler implements IHandler<GetUserGroupsQuery, Either<DomainException, GetUserGroupsResponseDto>> {
    constructor(
        private readonly groupRepository: GroupRepository
    ) {}
    async execute(query: GetUserGroupsQuery): Promise<Either<DomainException, GetUserGroupsResponseDto>> {
    try {
    const userId = new UserId(query.currentUserId);

    const groups = await this.groupRepository.findByMember(userId);

    return Either.makeRight({
      groups: groups.map((g) => ({
        id: g.id.value,
        name: g.name.value,
        adminId: g.adminId.value,
        memberCount: g.members.length,
        createdAt: g.createdAt.toISOString(),
      })),
    });
  } catch (e) { 
    return Either.makeLeft(new DomainUnexpectedException(e.message));
  }
}
}