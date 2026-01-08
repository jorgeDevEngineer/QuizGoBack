export class GetGroupQuizLeaderboardQuery {
  constructor(
    public readonly groupId: string,
    public readonly quizId: string,
    public readonly currentUserId: string,
  ) {}
}