export class EnablePremiumMembership {
  constructor(public readonly targetUserId: string, public readonly requesterUserId?: string) {}
}
