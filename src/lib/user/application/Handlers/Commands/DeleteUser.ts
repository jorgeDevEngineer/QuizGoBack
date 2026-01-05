import { UserRepository } from "../../../domain/port/UserRepository";
import { UserId } from "../../../domain/valueObject/UserId";

export class DeleteUser {
  constructor(private readonly userRepository: UserRepository) {}

  async run(id: string): Promise<void> {
    const userId = new UserId(id);
    await this.userRepository.delete(userId);
  }
}
