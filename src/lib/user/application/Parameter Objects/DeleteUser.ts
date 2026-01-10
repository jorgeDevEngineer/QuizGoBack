export class DeleteUser {
  constructor(public readonly targetUserId: string, public readonly requesterUserId?: string) {}
}
