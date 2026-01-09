export class TransferGroupAdminCommand {
  constructor(
    public readonly groupId: string,
    public readonly currentUserId: string,
    public readonly newAdminUserId: string,
    public readonly now?: Date,
  ) {}
}