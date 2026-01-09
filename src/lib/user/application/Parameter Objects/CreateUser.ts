export class CreateUser {
  constructor(
    public readonly userName: string,
    public readonly email: string,
    public readonly hashedPassword: string,
    public readonly userType: "student" | "teacher" | "personal",
    public readonly avatarUrl: string,
    public readonly id?: string,
    public readonly name?: string,
    public readonly theme?: string,
    public readonly language?: string,
    public readonly gameStreak?: number,
    public readonly membership?: {
      type: "free" | "premium";
      startedAt: Date;
      expiresAt: Date;
    },
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly status?: "Active" | "Blocked"
  ) {}
}
