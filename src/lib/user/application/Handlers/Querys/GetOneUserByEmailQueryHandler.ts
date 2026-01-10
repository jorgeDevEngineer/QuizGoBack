import { UserRepository } from "../../../domain/port/UserRepository";
import { User } from "../../../domain/aggregate/User";
import { UserEmail } from "../../../domain/valueObject/UserEmail";
import { UserNotFoundException } from "../../exceptions/UserNotFoundException";
import { IHandler } from "src/lib/shared/IHandler";
import { GetOneUserByEmail } from "../../Parameter Objects/GetOneUserByEmail";
import { Result } from "src/lib/shared/Type Helpers/result";

export class GetOneUserByEmailQueryHandler
  implements IHandler<GetOneUserByEmail, Result<User>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetOneUserByEmail): Promise<Result<User>> {
    const userEmailValueObject = new UserEmail(query.email);
    const user = await this.userRepository.getOneByEmail(userEmailValueObject);
    if (!user) {
      return Result.fail(new UserNotFoundException());
    }
    return Result.ok(user);
  }
}
