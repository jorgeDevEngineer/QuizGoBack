import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { LoginCommand } from "../../parameterObjects/LoginCommand";
import { GetOneUserByEmailQueryHandler } from "src/lib/user/application/Handlers/Querys/GetOneUserByEmailQueryHandler";
import { GetOneUserByEmail } from "src/lib/user/application/Parameter Objects/GetOneUserByEmail";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { Get, Inject } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { User } from "src/lib/user/domain/aggregate/User";
import { GetOneUserByUserName } from "src/lib/user/application/Parameter Objects/GetOneUserByUserName";
import { GetOneUserByUserNameQueryHandler } from "src/lib/user/application/Handlers/Querys/GetOneUserByUserNameQueryHandler";

export class LoginCommandHandler
  implements IHandler<LoginCommand, Result<string>>
{
  constructor(
    @Inject(GetOneUserByUserNameQueryHandler)
    private readonly getUserByNameHandler: IHandler<
      GetOneUserByUserName,
      Result<User>
    >,
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider
  ) {}

  async execute(command: LoginCommand): Promise<Result<string>> {
    if (!command.password || command.password.trim() === "") {
      return Result.fail(new Error("Password is required"));
    }
    const getUserResult = await this.getUserByNameHandler.execute(
      new GetOneUserByUserName(command.name)
    );
    if (getUserResult.isFailure) {
      return Result.fail(getUserResult.error);
    }
    const user = getUserResult.getValue();
    const isPasswordValid = await bcrypt.compare(
      command.password,
      user.hashedPassword.value
    );
    if (!isPasswordValid) {
      return Result.fail(new Error("Invalid credentials"));
    }
    const token = await this.tokenProvider.generateToken({
      sub: user.id.value,
      email: user.email.value,
    });
    return Result.ok(token);
  }
}
