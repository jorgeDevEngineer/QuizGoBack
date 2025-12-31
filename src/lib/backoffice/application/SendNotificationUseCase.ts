import { NotificationRepository } from "../domain/port/NotificationRepository";
import { Inject, Injectable } from "@nestjs/common";
import { Notification } from "../domain/entity/Notification";

export interface NotificationDto {
    title: string;
    message: string;
    userId: string;
}

@Injectable()
export class SendNotificationUseCase {
    constructor(
        @Inject('NotificationRepository')
        private readonly notificationRepository: NotificationRepository
    ) {}

    async run(data: NotificationDto): Promise<Notification> {
        const result = await this.notificationRepository.sendNotification(data);
        return result;
    }
}