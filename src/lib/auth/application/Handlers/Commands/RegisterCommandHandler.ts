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
      "STUDENT",
      command.name ?? ""
    );
    return await this.createUserHandler.execute(createUserCommand);
  }
}
