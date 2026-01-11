import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository
  ) {}

  async run(userheader: string, id: string): Promise<void> {
    const user = await this.userRepository.getOneById(new UserId(userheader));
    if (!user) {
      throw new BadRequestException("User not found");
    }
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
    const userId = new UserId(id);
    await this.userRepository.deleteUser(userId);
  }
}
