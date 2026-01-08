import { UserRepository } from "../../../domain/port/UserRepository.js";
import { UserId } from "../../../domain/valueObject/UserId.js";
import { UserNotFoundError } from "../../error/UserNotFoundError.js";
import { IHandler } from "src/lib/shared/IHandler";
import { EnablePremiumMembership } from "../../Parameter Objects/EnablePremiumMembership.js";
import { Result } from "src/lib/shared/Type Helpers/Result";

export class EnablePremiumMembershipCommandHandler
  implements IHandler<EnablePremiumMembership, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EnablePremiumMembership): Promise<Result<void>> {
    const user = await this.userRepository.getOneById(new UserId(command.id));
    if (!user) {
      return Result.fail(new UserNotFoundError("User not found"));
    }
    user.enablePremiumMembership();
    await this.userRepository.edit(user);
    return Result.ok(undefined);
  }
}
