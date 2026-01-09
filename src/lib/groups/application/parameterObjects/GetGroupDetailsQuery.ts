export class GetGroupDetailsQuery {
  constructor(public readonly groupId: string, public readonly currentUserId: string) {}
}