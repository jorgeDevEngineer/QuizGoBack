import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";

import { GetGroupQuizzesQuery } from "../../parameterObjects/GetGroupQuizzesQuery";
import { GetGroupAssignedQuizzesResponseDto } from "../../dtos/GroupResponse.dto";

import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export class GetGroupQuizzesQueryHandler
  implements IHandler<GetGroupQuizzesQuery, Either<DomainException, GetGroupAssignedQuizzesResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupQuizzesQuery): Promise<Either<DomainException, GetGroupAssignedQuizzesResponseDto>> {
    try {
    const groupId = GroupId.of(query.groupId);
    const currentUserId = new UserId(query.currentUserId);

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) return Either.makeLeft(new GroupNotFoundError(query.groupId));

    const group = groupOptional.getValue();
    const plain = group.toPlainObject();
    const isMember = plain.members.some(m => m.userId === currentUserId.value);
    if (!isMember) return Either.makeLeft(new UserNotMemberOfGroupError(currentUserId.value, groupId.value));

    const assignments = await this.groupRepository.findAssignmentsByGroupId(groupId);
    const quizIds = [...new Set(assignments.map(a => a.quizId))];

    const quizzes = await this.groupRepository.findQuizzesBasicByIds(quizIds);
    const quizTitleMap = new Map(quizzes.map(q => [q.id, q.title]));

    const completedAttempts = await this.groupRepository.findCompletedAttemptsByUserAndQuizIds(
      currentUserId.value,
      quizIds,
    );

    // Agrupar attempts por quizId 
    const attemptsByQuiz = new Map<string, typeof completedAttempts>();
    for (const at of completedAttempts) {
      const arr = attemptsByQuiz.get(at.quizId) ?? [];
      arr.push(at);
      attemptsByQuiz.set(at.quizId, arr);
    }

    const data = assignments.map(a => {
      const effectiveAssignedAt = a.availableFrom ?? a.createdAt;

      const candidates = (attemptsByQuiz.get(a.quizId) ?? [])
        .filter(at => at.startedAt >= effectiveAssignedAt)
        .sort((x, y) => x.startedAt.getTime() - y.startedAt.getTime());

      const firstCompletedAfterAssign = candidates[0];

      const status: "PENDING" | "COMPLETED" = firstCompletedAfterAssign ? "COMPLETED" : "PENDING";

      return {
        assignmentId: a.id,
        quizId: a.quizId,
        title: quizTitleMap.get(a.quizId) ?? null,
        availableUntil: a.availableUntil ?? null,
        status,
        userResult: firstCompletedAfterAssign
          ? {
              score: firstCompletedAfterAssign.score,
              attemptId: firstCompletedAfterAssign.gameId,
              completedAt: firstCompletedAfterAssign.completedAt,
            }
          : null,
        leaderboard: [], // Por implementar
      };
    });

    return Either.makeRight({ data });
    } catch (e) { 
      return Either.makeLeft(new DomainUnexpectedException(e.message));
    }
  }
}