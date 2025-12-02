import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { User } from "../domain/entity/User";
import { UserNotFoundError } from "./error/UserNotFoundError";

export class GetOneUserById {
  constructor(private readonly userRepository: UserRepository) {}
  async run(id: string): Promise<User | null> {
    const userId = new UserId(id);
    const user = await this.userRepository.getOneById(userId);
    if (!user) {
      throw new UserNotFoundError("User not found");
    }
    return user;
  }
}
