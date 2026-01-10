import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Collection, Db } from "mongodb";
import { NotificationRepository } from "../../domain/port/NotificationRepository";
import { TypeOrmNotificationEntity } from "./TypeOrmNotificationEntity";
import { Notification } from "../../domain/entity/Notification";
import { NotificationDto } from "../../application/SendNotificationUseCase";
import { DynamicMongoAdapter } from "../../../shared/infrastructure/database/dynamic-mongo.adapter";
import { GetNotificationsParamsDto } from "../../application/GetNotificationUseCase";
import { GetNotificationsResultDto } from "../../application/GetNotificationUseCase";
import { UserRepository } from "../../domain/port/UserRepository";
import { UserId } from "../../domain/valueObject/UserId";
import { SendNotificationDto } from "../../application/SendNotificationUseCase";

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
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Obtiene la colección de notificaciones de MongoDB para el módulo 'backoffice'
   */
  private async getMongoCollection(): Promise<Collection<MongoNotificationDoc>> {
    const db: Db = await this.mongoAdapter.getConnection('backoffice');
    return db.collection<MongoNotificationDoc>('notifications');
  }

  private mapToDomain(entity: TypeOrmNotificationEntity | MongoNotificationDoc): Notification {
    const notificationId = entity.id || (entity as MongoNotificationDoc)._id;
    const createdAt = typeof entity.createdAt === 'string' ? new Date(entity.createdAt) : entity.createdAt;
    return new Notification(
      entity.title,
      entity.message,
      entity.userId,
    );
  }

  async sendNotification(data: NotificationDto): Promise<SendNotificationDto> {
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

      const user = await this.userRepository.getOneById(new UserId(data.userId));

      return {
        id: domainNotification.id,
        title: domainNotification.title,
        message: domainNotification.message,
        createdAt: domainNotification.createdAt,
        sender: {
          ImageUrl: user.avatarUrl.value,
          id: user.id.value,
          name: user.name.value,
          email: user.email.value,
        },
      };
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

      const user = await this.userRepository.getOneById(new UserId(data.userId));

      return {
        id: domainNotification.id,
        title: domainNotification.title,
        message: domainNotification.message,
        createdAt: domainNotification.createdAt,
        sender: {
          ImageUrl: user.avatarUrl.value,
          id: user.id.value,
          name: user.name.value,
          email: user.email.value,
        },
      };
    }
  }

  async getNotifications(params: GetNotificationsParamsDto): Promise<GetNotificationsResultDto> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();

      // Construir filtro de MongoDB
      const filter: Record<string, unknown> = {};

      if (params.userId) {
        filter.userId = params.userId;
      }

      // Contar total
      const totalCount = await collection.countDocuments(filter);

      // Ordenamiento
      const sortField = params.orderBy || 'createdAt';
      const sortDirection = params.order?.toUpperCase() === 'ASC' ? 1 : -1;
      const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

      // Paginación
      const limit = params.limit || 20;
      const page = params.page || 1;
      const skip = (page - 1) * limit;

      const data = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray();

      const resultData = data.map(async (notification) => {
        const user = await this.userRepository.getOneById(new UserId(notification.userId));
        return {
        id: notification.id || notification._id,
        title: notification.title,
        message: notification.message,
        createdAt: typeof notification.createdAt === 'string' ? new Date(notification.createdAt) : notification.createdAt,
        sender: {
          ImageUrl: user.avatarUrl.value,
          id: user.id.value,
          name: user.name.value,
          email: user.email.value,
        },
      };
    });

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: await Promise.all(resultData),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for searchUsers operation.', error);

      const qb = this.pgRepository.createQueryBuilder('user');
      if (params.userId) {
        qb.andWhere('user.userId = :userId', { userId: params.userId });
      }
      if (params.limit) {
        qb.take(params.limit);
      } else {
        qb.take(20);
      }
      if (params.page) {
        qb.skip((params.page - 1) * params.limit);
      } else {
        qb.skip(0);
      }

      if (params.orderBy) {
        const orderDirection = params.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        qb.orderBy(`user.${params.orderBy}`, orderDirection);
      } else {
        qb.orderBy('user.createdAt', 'DESC');
      }

      const totalCount = await qb.getCount();
      const totalPages = Math.ceil(totalCount / params.limit);
      const data = await qb.getMany();

      const resultData = data.map(async (notification) => {
        const user = await this.userRepository.getOneById(new UserId(notification.userId));
        return {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          createdAt: typeof notification.createdAt === 'string' ? new Date(notification.createdAt) : notification.createdAt,
          sender: {
            ImageUrl: user.avatarUrl.value,
            id: user.id.value,
            name: user.name.value,
            email: user.email.value,
          },
        };
      });
      return {
        data: await Promise.all(resultData),
        pagination: {
          page: params.page,
          limit: params.limit,
          totalCount,
          totalPages,
        },
      };
    }
  }
}
