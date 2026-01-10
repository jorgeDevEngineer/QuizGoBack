import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository"
import { UserId } from "../domain/valueObject/UserId";


export interface RemovedAdminRoleDto {
    user: {
        id: string;
        name: string;
        email: string;
        userType: string;
        createdAt: Date;
        status: string;
        isadmin: boolean;
    };
}

@Injectable()
export class RemoveAdminRoleUseCase {
    constructor(
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {}

    async run(userheader: string, id: string): Promise<RemovedAdminRoleDto> {
        const user = await this.userRepository.getOneById(new UserId(userheader));
        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (!user.isadmin) {
            throw new UnauthorizedException('Unauthorized');
        }
        const userId = new UserId(id);
        const result = await this.userRepository.RemoveAdminRole(userId);
        return result;
    }   
}