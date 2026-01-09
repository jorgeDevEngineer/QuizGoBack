import { UserRepository } from "../../../domain/port/UserRepository";
import { User } from "../../../domain/aggregate/User";
import { UserName } from "../../../domain/valueObject/UserName";
import { UserNotFoundError } from "../../error/UserNotFoundError";
import { IHandler } from "src/lib/shared/IHandler";
import { GetOneUserByUserName } from "../../Parameter Objects/GetOneUserByUserName";
import { Result } from "src/lib/shared/Type Helpers/result";

export class GetOneUserByUserNameQueryHandler
  implements IHandler<GetOneUserByUserName, Result<User>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetOneUserByUserName): Promise<Result<User>> {
    const userNameValueObject = new UserName(query.userName);
    const user = await this.userRepository.getOneByName(userNameValueObject);
    if (!user) {
      return Result.fail(new UserNotFoundError("User not found"));
    }
    return Result.ok(user);
  }
}
