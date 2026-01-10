export class LeaveGroupCommand {
  constructor(
    public readonly groupId: string,
    public readonly currentUserId: string,
    public readonly now?: Date,
  ) {}
}