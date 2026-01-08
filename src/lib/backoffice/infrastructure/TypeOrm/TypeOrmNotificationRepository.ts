import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Collection, Db } from "mongodb";
import { NotificationRepository } from "../../domain/port/NotificationRepository";
import { TypeOrmNotificationEntity } from "./TypeOrmNotificationEntity";
import { Notification } from "../../domain/entity/Notification";
import { NotificationDto } from "../../application/SendNotificationUseCase";
import { DynamicMongoAdapter } from "../../../shared/infrastructure/database/dynamic-mongo.adapter";

// Interfaz para el documento de MongoDB
interface MongoNotificationDoc {
  _id?: string;
  id?: string;
  title: string;
  message: string;
  userId: string;
  createdAt: Date;
}

@Injectable()
export class TypeOrmNotificationRepository implements NotificationRepository {
  constructor(
    @InjectRepository(TypeOrmNotificationEntity)
    private readonly pgRepository: Repository<TypeOrmNotificationEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  /**
   * Obtiene la colección de notificaciones de MongoDB para el módulo 'backoffice'
   */
  private async getMongoCollection(): Promise<Collection<MongoNotificationDoc>> {
    const db: Db = await this.mongoAdapter.getConnection('backoffice');
    return db.collection<MongoNotificationDoc>('notifications');
  }

  async sendNotification(data: NotificationDto): Promise<Notification> {
    const domainNotification = new Notification(
      data.title,
      data.message,
      data.userId
    );

    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      await collection.insertOne({
        id: domainNotification.id,
        title: domainNotification.title,
        message: domainNotification.message,
        userId: domainNotification.userId,
        createdAt: domainNotification.createdAt,
      });

      return domainNotification;
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for sendNotification operation.', error);

      const entity = this.pgRepository.create({
        id: domainNotification.id,
        title: domainNotification.title,
        message: domainNotification.message,
        userId: domainNotification.userId,
        createdAt: domainNotification.createdAt,
      });
      await this.pgRepository.save(entity);

      return domainNotification;
    }
  }
}
