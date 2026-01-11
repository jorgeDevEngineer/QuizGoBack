export class CreateUser {
  constructor(
    public readonly userName: string,
    public readonly email: string,
    public readonly password: string,
    public readonly userType: "STUDENT" | "TEACHER",
    public readonly name: string,
    public readonly description?: string
  ) {}
}
