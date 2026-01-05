import { UserRepository } from "../../../domain/port/UserRepository";
import { User } from "../../../domain/aggregate/User";
import { UserName } from "../../../domain/valueObject/UserName";
import { UserNotFoundError } from "../../error/UserNotFoundError";

export class GetOneUserByUserName {
  constructor(private readonly userRepository: UserRepository) {}
  async run(userName: string): Promise<User | null> {
    const userNameValueObject = new UserName(userName);
    const user = await this.userRepository.getOneByName(userNameValueObject);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }
    return user;
  }
}
