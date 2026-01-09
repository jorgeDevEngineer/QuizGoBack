export class GenerateGroupInvitationCommand {
  constructor(
    public readonly groupId: string,
    public readonly currentUserId: string,
    public readonly ttlDays?: number,
    public readonly now?: Date,
  ) {}
}