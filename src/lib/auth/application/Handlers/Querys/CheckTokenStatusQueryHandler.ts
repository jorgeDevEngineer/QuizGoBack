import { IHandler } from "src/lib/shared/IHandler";
import { Result } from "src/lib/shared/Type Helpers/result";
import { CheckTokenStatusQuery } from "../../parameterObjects/CheckTokenStatusQuery";
import { ITokenProvider } from "../../providers/ITokenProvider";
import { Inject } from "@nestjs/common";

export class CheckTokenStatusQueryHandler
  implements IHandler<CheckTokenStatusQuery, Result<boolean>>
{
  constructor(
    @Inject("ITokenProvider") private readonly tokenProvider: ITokenProvider
  ) {}

  async execute(query: CheckTokenStatusQuery): Promise<Result<boolean>> {
    const payload = await this.tokenProvider.validateToken(query.token);
    const isValid = payload !== null;
    return Result.ok(isValid);
  }
}
