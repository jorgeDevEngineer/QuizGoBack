import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { RegisterCommand } from "../../parameterObjects/RegisterCommand";
import { CreateUserCommandHandler } from "src/lib/user/application/Handlers/Commands/CreateUserCommandHandler";
import { CreateUser } from "src/lib/user/application/Parameter Objects/CreateUser";
import { Inject } from "@nestjs/common";
import * as bcrypt from "bcrypt";

export class RegisterCommandHandler
  implements IHandler<RegisterCommand, Result<void>>
{
  constructor(
    @Inject(CreateUserCommandHandler)
    private readonly createUserHandler: IHandler<CreateUser, Result<void>>
  ) {}

  async execute(command: RegisterCommand): Promise<Result<void>> {
    if (!command.password || command.password.trim() === "") {
      return Result.fail(new Error("Password is required"));
    }
    const hashedPassword = await bcrypt.hash(command.password, 12);
    const createUserCommand = new CreateUser(
      command.userName,
      command.email,
      hashedPassword,
      "personal", // default userType
      "https://images.wikidexcdn.net/mwuploads/esssbwiki/thumb/a/ae/latest/20100528185326/Kirby_SSBB.jpg/200px-Kirby_SSBB.jpg" // avatarUrl
    );
    return await this.createUserHandler.execute(createUserCommand);
  }
}
