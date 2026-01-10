import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/port/UserRepository";
import { NotificationRepository } from "../domain/port/NotificationRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";


export interface GetNotificationsParamsDto {
    userId?: string,
    limit?: number,
    page?: number,
    orderBy?: string;
    order: 'asc' | 'desc';
}

export interface GetNotificationsResultDto {
    data: { 
        id: string;
        title: string;
        message: string;
        createdAt: Date;
        sender: {
            ImageUrl: string;
            id: string;
            name: string;
            email: string;
        }
    }[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
    };
  }

@Injectable()
export class GetNotificationsUseCase {
    constructor(
        @Inject('NotificationRepository')
        private readonly notificationRepository: NotificationRepository,
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {}

    async run(userheader: string, params: GetNotificationsParamsDto): Promise<GetNotificationsResultDto> {
        const user = await this.userRepository.getOneById(new UserId(userheader));
        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (!user.isadmin) {
            throw new UnauthorizedException('Unauthorized');
        }
        const result = await this.notificationRepository.getNotifications(params);
        return result;
    }
}