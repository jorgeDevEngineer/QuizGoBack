import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";

export interface BlockedUserDto {
  user: {
    id: string;
    name: string;
    email: string;
    userType: string;
    createdAt: Date;
    status: string;
  };
}

@Injectable()
export class BlockUserUseCase {
  constructor(
    @Inject("UserRepository")
    private readonly userRepository: UserRepository
  ) {}

  async run(userheader: string, id: string): Promise<BlockedUserDto> {
    const user = await this.userRepository.getOneById(new UserId(userheader));
    if (!user) {
      throw new BadRequestException("User not found");
    }
    if (!user.isAdmin) {
      throw new UnauthorizedException("Unauthorized");
    }
    const userId = new UserId(id);
    const result = await this.userRepository.blockUser(userId);
    return result;
  }
}
