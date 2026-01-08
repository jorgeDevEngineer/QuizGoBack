import { UserRepository } from "../../../domain/port/UserRepository";
import { UserId } from "../../../domain/valueObject/UserId";
import { IHandler } from "src/lib/shared/IHandler";
import { DeleteUser } from "../../Parameter Objects/DeleteUser";
import { Result } from "src/lib/shared/Type Helpers/Result";

export class DeleteUserCommandHandler
  implements IHandler<DeleteUser, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: DeleteUser): Promise<Result<void>> {
    const userId = new UserId(command.id);
    await this.userRepository.delete(userId);
    return Result.ok(undefined);
  }
}
