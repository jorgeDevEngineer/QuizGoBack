import { UserRepository } from "../domain/port/UserRepository";
import { User } from "../domain/aggregate/User";

export class GetAllUsers {
  constructor(private readonly userRepository: UserRepository) {}
  async run(): Promise<User[]> {
    return await this.userRepository.getAll();
  }
}
