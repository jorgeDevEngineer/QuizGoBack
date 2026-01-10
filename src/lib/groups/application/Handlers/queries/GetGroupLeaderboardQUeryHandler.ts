import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { DomainUnexpectedException } from "src/lib/shared/exceptions/DomainUnexpectedException";
import { GroupNotFoundError } from "src/lib/shared/exceptions/GroupNotFoundError";

import { GetGroupLeaderboardQuery } from "../../parameterObjects/GetGroupLeaderboardQuery";
import { GetGroupLeaderboardResponseDto } from "../../dtos/GroupResponse.dto";

import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

export class GetGroupLeaderboardQueryHandler
  implements IHandler<GetGroupLeaderboardQuery, Either<DomainException, GetGroupLeaderboardResponseDto>>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(query: GetGroupLeaderboardQuery): Promise<Either<DomainException, GetGroupLeaderboardResponseDto>> {
    try {
    const groupId = GroupId.of(query.groupId);
    const currentUserId = new UserId(query.currentUserId);

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) return Either.makeLeft(new GroupNotFoundError(query.groupId));

    const group = groupOptional.getValue();
    const plain = group.toPlainObject();

    const isMember = plain.members.some(m => m.userId === currentUserId.value);
    if (!isMember) {
      return Either.makeLeft(new UserNotMemberOfGroupError(currentUserId.value, groupId.value));
    }

    //quizzes asignados al grupo
    const assignments = await this.groupRepository.findAssignmentsByGroupId(groupId);
    const assignedQuizIds = [...new Set(assignments.map(a => a.quizId))];

    //traer partidas completadas
    const games = await (this.groupRepository as any).gameRepo.find({
      where: {
        quizId: assignedQuizIds,
        status: GameProgressStatus.COMPLETED,
      },
      order: { completedAt: "DESC" },
    });

    //best score por (userId, quizId)
    const bestScoreByUserQuiz = new Map<string, number>();

    for (const g of games) {
      const key = `${g.playerId}|${g.quizId}`;
      const prev = bestScoreByUserQuiz.get(key);
      if (prev === undefined || g.score > prev) {
        bestScoreByUserQuiz.set(key, g.score);
      }
    }

    //sumar puntos por usuario
    const totalPointsByUser = new Map<string, number>();
    for (const [key, score] of bestScoreByUserQuiz.entries()) {
      const userId = key.split("|")[0];
      totalPointsByUser.set(userId, (totalPointsByUser.get(userId) ?? 0) + score);
    }

    // Se arma el leaderboard
    const items = plain.members.map((m) => ({
      userId: m.userId,
      name: (m as any).name ?? (m as any).userName ?? m.userId,
      completedQuizzes: Number(m.completedQuizzes ?? 0), // 👈 NO SE TOCA
      totalPoints: totalPointsByUser.get(m.userId) ?? 0,
      position: 0,
    }));

    items.sort((a, b) => {
      if (b.completedQuizzes !== a.completedQuizzes) {
        return b.completedQuizzes - a.completedQuizzes;
      }
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return a.userId.localeCompare(b.userId);
    });

    // cambios de posicion
    items.forEach((x, i) => (x.position = i + 1));

    return Either.makeRight({ leaderboard: items });
    } catch (e) { 
      return Either.makeLeft(new DomainUnexpectedException(e.message));
    }
  }
}