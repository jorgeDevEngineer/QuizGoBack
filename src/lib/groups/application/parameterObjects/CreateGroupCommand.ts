export class CreateGroupCommand {
  constructor(
    public readonly name: string,
    public readonly currentUserId: string,
    public readonly now?: Date,
  ) {}
}