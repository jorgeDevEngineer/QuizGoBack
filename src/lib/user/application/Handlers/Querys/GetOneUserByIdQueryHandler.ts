import { UserRepository } from "../../../domain/port/UserRepository";
import { UserId } from "../../../domain/valueObject/UserId";
import { User } from "../../../domain/aggregate/User";
import { UserNotFoundException } from "../../exceptions/UserNotFoundException";
import { IHandler } from "src/lib/shared/IHandler";
import { GetOneUserById } from "../../Parameter Objects/GetOneUserById";
import { Result } from "src/lib/shared/Type Helpers/result";

export class GetOneUserByIdQueryHandler
  implements IHandler<GetOneUserById, Result<User>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetOneUserById): Promise<Result<User>> {
    const userId = new UserId(query.id);
    const user = await this.userRepository.getOneById(userId);
    if (!user) {
      return Result.fail(new UserNotFoundException());
    }
    return Result.ok(user);
  }
}
