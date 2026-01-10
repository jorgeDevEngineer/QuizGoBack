export class EditUser {
  constructor(
    public readonly userName: string,
    public readonly email: string,
    public readonly hashedPassword: string,
    public readonly userType: "student" | "teacher" | "personal",
    public readonly avatarUrl: string,
    public readonly targetUserId: string,
    public readonly name: string,
    public readonly theme: string,
    public readonly language: string,
    public readonly gameStreak: number,
    public readonly status: "Active" | "Blocked",
    public readonly requesterUserId?: string
  ) {}
}
