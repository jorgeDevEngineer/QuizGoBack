export class UpdateGroupDetailsCommand {
  constructor(
    public readonly groupId: string,
    public readonly currentUserId: string,
    public readonly name?: string,
    public readonly description?: string | null,
    public readonly now?: Date,
  ) {}
}