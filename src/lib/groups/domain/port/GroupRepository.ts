import { CompletedAttemptPrimitive, Group, GroupMemberScoreStat, GroupQuizAssignmentPrimitive, QuizBasicPrimitive } from "../entity/Group";
import { GroupId } from "../valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { Optional } from  "src/lib/shared/Type Helpers/Optional";

export interface GroupRepository {
  findById(id: GroupId): Promise<Optional<Group>>;
  
  findByInvitationToken(token: string): Promise<Optional<Group>>;

  findByMember(userId: UserId): Promise<Group[]>;

  save(group: Group): Promise<void>;

  findAssignmentsByGroupId(groupId: GroupId): Promise<GroupQuizAssignmentPrimitive[]>;

  findQuizzesBasicByIds(quizIds: string[]): Promise<QuizBasicPrimitive[]>;

  findCompletedAttemptsByUserAndQuizIds(userId: string, quizIds: string[]): Promise<CompletedAttemptPrimitive[]>;
  getGroupLeaderboardByGroupId(groupId: GroupId, memberUserIds: string[]): Promise<GroupMemberScoreStat[]>;

}