import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository"
import { UserId } from "../domain/valueObject/UserId";


export interface UnblockedUserDto {
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
export class UnblockUserUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {}

    async run(userheader: string, id: string): Promise<UnblockedUserDto> {
        const user = await this.userRepository.getOneById(new UserId(userheader));
        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (!user.isadmin) {
            throw new UnauthorizedException('Unauthorized');
        }
        const userId = new UserId(id);
        const result = await this.userRepository.UnblockUser(userId);
        return result;
    }
}