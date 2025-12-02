import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { User } from "../domain/entity/User";

export class GetOneUserById {
  constructor(private readonly userRepository: UserRepository) {}
  async run(id: string): Promise<User | null> {
    const userId = new UserId(id);
    return await this.userRepository.getOneById(userId);
  }
}
