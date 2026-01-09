import { UserRepository } from "../../../domain/port/UserRepository.js";
import { UserId } from "../../../domain/valueObject/UserId.js";
import { UserNotFoundException } from "../../exceptions/UserNotFoundException.js";
import { IHandler } from "src/lib/shared/IHandler";
import { EnableFreeMembership } from "../../Parameter Objects/EnableFreeMembership.js";
import { Result } from "src/lib/shared/Type Helpers/result";

export class EnableFreeMembershipCommandHandler
  implements IHandler<EnableFreeMembership, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EnableFreeMembership): Promise<Result<void>> {
    const user = await this.userRepository.getOneById(new UserId(command.id));
    if (!user) {
      return Result.fail(new UserNotFoundException());
    }
    user.enableFreeMembership();
    await this.userRepository.edit(user);
    return Result.ok(undefined);
  }
}
