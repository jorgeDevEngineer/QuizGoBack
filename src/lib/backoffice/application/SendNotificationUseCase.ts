import { NotificationRepository } from "../domain/port/NotificationRepository";
import { Inject, Injectable } from "@nestjs/common";
import { Notification } from "../domain/entity/Notification";
import { UserRepository } from "../domain/port/UserRepository";
import { UserId } from "../domain/valueObject/UserId";
import { BadRequestException } from "@nestjs/common";
import { UnauthorizedException } from "@nestjs/common";
export interface NotificationDto {
    title: string;
    message: string;
    userId: string;
}

@Injectable()
export class SendNotificationUseCase {
    constructor(
        @Inject('NotificationRepository')
        private readonly notificationRepository: NotificationRepository,
        @Inject('UserRepository')
        private readonly userRepository: UserRepository,
    ) {}

    async run(userheader: string, data: NotificationDto): Promise<Notification> {
        const user = await this.userRepository.getOneById(new UserId(userheader));
        if (!user) {
            throw new BadRequestException('User not found');
        }
        if (!user.isadmin) {
            throw new UnauthorizedException('Unauthorized');
        }
        const result = await this.notificationRepository.sendNotification(data);
        return result;
    }
}