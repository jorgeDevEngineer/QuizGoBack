import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository"
import { UserId } from "../domain/valueObject/UserId";

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
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {}

    async run(id: string): Promise<BlockedUserDto> {
        const userId = new UserId(id);
        const result = await this.userRepository.blockUser(userId);
        return result;
    }
}