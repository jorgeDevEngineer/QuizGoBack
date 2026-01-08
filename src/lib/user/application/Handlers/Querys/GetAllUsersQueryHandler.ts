import { UserRepository } from "../../../domain/port/UserRepository";
import { User } from "../../../domain/aggregate/User";
import { IHandler } from "src/lib/shared/IHandler";
import { GetAllUsers } from "../../Parameter Objects/GetAllUsers";
import { Result } from "src/lib/shared/Type Helpers/result";

export class GetAllUsersQueryHandler
  implements IHandler<GetAllUsers, Result<User[]>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetAllUsers): Promise<Result<User[]>> {
    const users = await this.userRepository.getAll();
    return Result.ok(users);
  }
}
