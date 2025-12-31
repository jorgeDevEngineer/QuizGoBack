import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationRepository } from "../../domain/port/NotificationRepository";
import { TypeOrmNotificationEntity } from "./TypeOrmNotificationEntity";
import { Notification } from "../../domain/entity/Notification";
import { NotificationDto } from "../../application/SendNotificationUseCase";

@Injectable()
export class TypeOrmNotificationRepository implements NotificationRepository {
  constructor(
    @InjectRepository(TypeOrmNotificationEntity)
    private readonly repository: Repository<TypeOrmNotificationEntity>
  ) {}

  async sendNotification(data: NotificationDto): Promise<Notification> {
    const domainNotification = new Notification(
      data.title,
      data.message,
      data.userId
    );
    const entity = this.repository.create({
      id: domainNotification.id,
      title: domainNotification.title,
      message: domainNotification.message,
      userId: domainNotification.userId,
      createdAt: domainNotification.createdAt,
    });
    await this.repository.save(entity);

    return domainNotification;
  }

}
