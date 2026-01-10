export class EnableFreeMembership {
  constructor(public readonly targetUserId: string, public readonly requesterUserId?: string) {}
}
