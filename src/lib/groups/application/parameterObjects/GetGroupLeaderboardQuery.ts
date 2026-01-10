export class GetGroupLeaderboardQuery {
  constructor(
    public readonly groupId: string,
    public readonly currentUserId: string,
  ) {}
}