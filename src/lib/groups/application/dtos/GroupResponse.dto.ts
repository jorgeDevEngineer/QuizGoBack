export class CreateGroupResponseDto {
  id!: string;
  name!: string;
  adminId!: string;
  memberCount!: number;
  createdAt!: string;
}

export class UpdateGroupDetailsResponseDto {
  groupId: string;
  name: string;
  description: string;
}

export class JoinGroupByInvitationResponseDto {
  groupId: string;
  joinedAs: "member";
}

export class GenerateGroupInvitationResponseDto {
  groupId: string;
  Link: string;
  expiresAt: string;
}

export class LeaveGroupResponseDto {
  groupId: string
  left: boolean;
}

export class RemoveGroupMemberResponseDto {
  groupId: string
  removedUserId: string;
}

export class TransferGroupAdminResponseDto {
  groupId: string
  newAdminUserId: string;
  oldAdminUserId: string;
}

export class AssignQuizToGroupResponseDto {
  id!: string;
  groupId!: string;
  quizId!: string;
  assignedBy!: string;
  createdAt!: string;
  availableFrom!: string; 
  availableUntil!: string; 
  isActive!: boolean;
}

export class GetUserGroupitem {
  id: string;
  name: string;
  adminId: string;
  memberCount: number;
  createdAt: string;
}

export class GetUserGroupsResponseDto {
  groups!: GetUserGroupitem[];
}

export class GetGroupMembersItem {
  userId: string;
  role: string;
  joinedAt: string;
  completedQuizzes: number;
}

export class GetGroupMembersResponseDto {
  name: string;
  members: GetGroupMembersItem[];
}

export interface GroupMemberitem {
  userId: string;
  role: string;
  joinedAt: string;
  completedQuizzes: number;
}

export interface GetGroupDetailsResponseDto {
  id: string;
  name: string;
  description: string;
  adminId: string;
  members: GroupMemberitem[];
  createdAt: string;
  updatedAt: string;
}

export type GroupQuizStatus = "PENDING" | "COMPLETED";

export interface GetGroupAssignedQuizzesResponseDto {
  data: Array<{
    assignmentId: string;
    quizId: string;
    title: string | null;
    availableUntil: Date | null;
    status: GroupQuizStatus;
    userResult: null | {
      score: number;
      attemptId: string;
      completedAt: Date;
    };
    leaderboard: Array<{ name: string; score: number }>;
  }>;
}

export interface GroupLeaderboardItemDto {
  userId: string;
  name: string;              
  completedQuizzes: number;
  totalPoints: number;
  position: number;
};

export interface GetGroupLeaderboardResponseDto {
  leaderboard: GroupLeaderboardItemDto[];
}

export interface GetGroupQuizLeaderboardResponseDto {
  quizId: string;
  groupId: string;
  topPlayers: {
    userId: string;
    name: string;
    score: number;
  }[];
}