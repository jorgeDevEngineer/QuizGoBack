export class JoinGroupByInvitationCommand {
  constructor(
    public readonly token: string,
    public readonly currentUserId: string,
    public readonly now?: Date,
  ) {}
}