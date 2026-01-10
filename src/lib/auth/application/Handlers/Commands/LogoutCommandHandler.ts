import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { LogoutCommand } from "../../parameterObjects/LogoutCommand";
import { ITokenProvider } from "src/lib/auth/application/providers/ITokenProvider";
import { Inject } from "@nestjs/common";

export class LogoutCommandHandler
  implements IHandler<LogoutCommand, Result<void>>
{
  constructor(
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider
  ) {}

  async execute(command: LogoutCommand): Promise<Result<void>> {
    await this.tokenProvider.revokeToken(command.token);
    return Result.ok(undefined);
  }
}
