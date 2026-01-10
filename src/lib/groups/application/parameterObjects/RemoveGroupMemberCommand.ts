export class RemoveGroupMemberCommand {
  constructor(
    public readonly groupId: string,
    public readonly memberId: string,
    public readonly currentUserId: string,
    public readonly now?: Date,
    
  ) {}
}