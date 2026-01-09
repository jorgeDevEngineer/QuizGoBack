import { IHandler } from "src/lib/shared/IHandler";
import { GetGroupQuizLeaderboardQuery } from "../../parameterObjects/GetGroupQuizLeaderboarquery";
import { GetGroupQuizLeaderboardResponseDto } from "../../dtos/GroupResponse.dto";

import { GroupRepository } from "../../../domain/port/GroupRepository";
import { GroupId } from "../../../domain/valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { GroupNotFoundError } from "../../../../shared/exceptions/GroupNotFoundError";
import { UserNotMemberOfGroupError } from "../../../../shared/exceptions/NotMemberGroupError";
import { GameProgressStatus } from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";

export class GetGroupQuizLeaderboardQueryHandler
  implements IHandler<GetGroupQuizLeaderboardQuery, GetGroupQuizLeaderboardResponseDto>
{
  constructor(private readonly groupRepository: GroupRepository) {}

  async execute(
    query: GetGroupQuizLeaderboardQuery,
  ): Promise<GetGroupQuizLeaderboardResponseDto> {

    const groupId = GroupId.of(query.groupId);
    const quizId = query.quizId;
    const currentUserId = new UserId(query.currentUserId);

    const groupOptional = await this.groupRepository.findById(groupId);
    if (!groupOptional.hasValue()) throw new GroupNotFoundError(groupId.value);

    const group = groupOptional.getValue();
    const plain = group.toPlainObject();
    const isMember = plain.members.some(
      (m) => m.userId === currentUserId.value,
    );
    if (!isMember) {
      throw new UserNotMemberOfGroupError(currentUserId.value, groupId.value);
    }
    
    const assignments = await this.groupRepository.findAssignmentsByGroupId(groupId);
    const isAssigned = assignments.some((a) => a.quizId === quizId);
    if (!isAssigned) {
      throw new Error("Quiz not assigned to this group");
    }

    //Buscar partidas completadas del quiz
    const games = await (this.groupRepository as any).gameRepo.find({
      where: {
        quizId,
        status: GameProgressStatus.COMPLETED,
      },
      order: { completedAt: "DESC" },
    });

    //Filtrar solo miembros del grupo
    const memberIds = new Set(plain.members.map((m) => m.userId));
    const validGames = games.filter((g) => memberIds.has(g.playerId));

    //Mejor score por usuario
    const bestScoreByUser = new Map<string, number>();

    for (const g of validGames) {
      const prev = bestScoreByUser.get(g.playerId);
      if (prev === undefined || g.score > prev) {
        bestScoreByUser.set(g.playerId, g.score);
      }
    }

    const topPlayers = Array.from(bestScoreByUser.entries())
      .map(([userId, score]) => ({
        userId,
        name: userId, // no tenemos nombres reales por ahora
        score,
      }))
      .sort((a, b) => b.score - a.score);

    return {
      quizId,
      groupId: groupId.value,
      topPlayers,
    };
  }
}