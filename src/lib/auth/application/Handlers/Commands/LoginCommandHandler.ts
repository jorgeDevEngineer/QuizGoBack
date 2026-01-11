import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { LoginCommand } from "../../parameterObjects/LoginCommand";
import { GetOneUserByUserNameQueryHandler } from "src/lib/user/application/Handlers/Querys/GetOneUserByUserNameQueryHandler";
import { GetOneUserByUserName } from "src/lib/user/application/Parameter Objects/GetOneUserByUserName";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { Get, Inject } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { User } from "src/lib/user/domain/aggregate/User";

export class LoginCommandHandler
  implements IHandler<LoginCommand, Result<string>>
{
  constructor(
    @Inject(GetOneUserByUserNameQueryHandler)
    private readonly getUserByUserNameHandler: IHandler<
      GetOneUserByUserName,
      Result<User>
    >,
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider
  ) {}

  async execute(command: LoginCommand): Promise<Result<string>> {
    if (!command.password || command.password.trim() === "") {
      return Result.fail(new Error("Password is required"));
    }
    const getUserResult = await this.getUserByUserNameHandler.execute(
      new GetOneUserByUserName(command.userName)
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
      id: user.id.value,
      email: user.email.value,
      roles: user.roles.value,
    });
    return Result.ok(token);
  }
}
