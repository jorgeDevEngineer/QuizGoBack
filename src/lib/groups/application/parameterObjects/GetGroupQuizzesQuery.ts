export class GetGroupQuizzesQuery {
  constructor(
    public readonly groupId: string,
    public readonly currentUserId: string,
  ) {}
}