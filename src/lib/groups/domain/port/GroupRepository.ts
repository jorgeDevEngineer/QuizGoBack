import { CompletedAttemptPrimitive, Group, GroupMemberScoreStat, GroupQuizAssignmentPrimitive, QuizBasicPrimitive } from "../entity/Group";
import { GroupId } from "../valueObject/GroupId";
import { UserId } from "src/lib/user/domain/valueObject/UserId";

export interface GroupRepository {
  findById(id: GroupId): Promise<Group | null>;

  findByMember(userId: UserId): Promise<Group[]>;

  save(group: Group): Promise<void>;
  
  findByInvitationToken(token: string): Promise<Group | null>;


  findAssignmentsByGroupId(groupId: GroupId): Promise<GroupQuizAssignmentPrimitive[]>;

  findQuizzesBasicByIds(quizIds: string[]): Promise<QuizBasicPrimitive[]>;

  findCompletedAttemptsByUserAndQuizIds(userId: string, quizIds: string[]): Promise<CompletedAttemptPrimitive[]>;
  getGroupLeaderboardByGroupId(groupId: GroupId, memberUserIds: string[]): Promise<GroupMemberScoreStat[]>;

}