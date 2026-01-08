import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";

@Injectable()
export class DeleteUserUseCase {

  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async run(id: string): Promise<void> {
    const userId = new UserId(id);
    await this.userRepository.deleteUser(userId);
  }
}
