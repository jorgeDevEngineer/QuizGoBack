export class RegisterCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly userName: string,
    public readonly name?: string
  ) {}
}