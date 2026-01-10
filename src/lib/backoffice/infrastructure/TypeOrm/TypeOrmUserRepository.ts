import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Collection, Db } from "mongodb";
import { User } from "../../domain/aggregate/User";
import { UserRepository } from "../../domain/port/UserRepository";
import { UserName } from "../../domain/valueObject/UserName";
import { TypeOrmUserEntity } from "./TypeOrmUserEntity";
import { UserId } from "../../domain/valueObject/UserId";
import { UserEmail } from "../../domain/valueObject/UserEmail";
import { UserHashedPassword } from "../../domain/valueObject/UserHashedPassword";
import { UserType } from "../../domain/valueObject/UserType";
import { UserAvatarUrl } from "../../domain/valueObject/UserAvatarUrl";
import { UserPlainName } from "../../domain/valueObject/UserPlainName";
import { UserTheme } from "../../domain/valueObject/UserTheme";
import { UserLanguage } from "../../domain/valueObject/UserLanguaje";
import { UserGameStreak } from "../../domain/valueObject/UserGameStreak";
import { UserDate } from "../../domain/valueObject/UserDate";
import { Membership } from "../../domain/entity/Membership";
import { MembershipType } from "../../domain/valueObject/MembershipType";
import { MembershipDate } from "../../domain/valueObject/MembershipDate";
import { SearchParamsDto, SearchResultDto } from "../../application/SearchUsersUseCase";
import { UserNotFoundException } from "../../../shared/exceptions/UserNotFoundException";
import { DynamicMongoAdapter } from "../../../shared/infrastructure/database/dynamic-mongo.adapter";


// Interfaz para el documento de MongoDB
interface MongoUserDoc {
  _id?: string;
  id?: string;
  userName: string;
  email: string;
  hashedPassword: string;
  userType: "student" | "teacher" | "personal";
  avatarUrl: string;
  name: string;
  theme: string;
  language: string;
  gameStreak: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  membershipType: "free" | "premium";
  membershipStartedAt: Date | string;
  membershipExpiresAt: Date | string;
  status: 'Active' | 'Blocked';
  isadmin: boolean;
}

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(TypeOrmUserEntity)
    private readonly pgRepository: Repository<TypeOrmUserEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  /**
   * Obtiene la colección de usuarios de MongoDB para el módulo 'backoffice'
   */
  private async getMongoCollection(): Promise<Collection<MongoUserDoc>> {
    const db: Db = await this.mongoAdapter.getConnection('backoffice');
    return db.collection<MongoUserDoc>('users');
  }

  private mapToDomain(entity: TypeOrmUserEntity | MongoUserDoc): User {
    const userId = entity.id || (entity as MongoUserDoc)._id;
    const createdAt = typeof entity.createdAt === 'string' ? new Date(entity.createdAt) : entity.createdAt;
    const updatedAt = typeof entity.updatedAt === 'string' ? new Date(entity.updatedAt) : entity.updatedAt;
    const membershipStartedAt = typeof entity.membershipStartedAt === 'string' ? new Date(entity.membershipStartedAt) : entity.membershipStartedAt;
    const membershipExpiresAt = typeof entity.membershipExpiresAt === 'string' ? new Date(entity.membershipExpiresAt) : entity.membershipExpiresAt;

    return new User(
      new UserName(entity.userName),
      new UserEmail(entity.email),
      new UserHashedPassword(entity.hashedPassword),
      new UserType(entity.userType),
      new UserAvatarUrl(entity.avatarUrl),
      new UserId(userId),
      new UserPlainName(entity.name),
      new UserTheme(entity.theme),
      new UserLanguage(entity.language),
      new UserGameStreak(entity.gameStreak),
      new Membership(
        new MembershipType(entity.membershipType),
        new MembershipDate(membershipStartedAt),
        new MembershipDate(membershipExpiresAt)
      ),
      new UserDate(createdAt),
      new UserDate(updatedAt),
      entity.status,
      entity.isadmin
    );
  }

  async searchUsers(params: SearchParamsDto): Promise<SearchResultDto> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();

      // Construir filtro de MongoDB
      const filter: Record<string, unknown> = {};

      if (params.q) {
        filter.name = { $regex: params.q, $options: 'i' };
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

      const resultData = data.map((user) => ({
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        createdAt: typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt,
        status: user.status,
      }));

      const totalPages = Math.ceil(totalCount / limit);

      return {
        data: resultData,
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
      if (params.q) {
        qb.andWhere('user.name LIKE :q', { q: `%${params.q}%` });
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

      const resultData = data.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        status: user.status,
      }));

      return {
        data: resultData,
        pagination: {
          page: params.page,
          limit: params.limit,
          totalCount,
          totalPages,
        },
      };
    }
  }

  async deleteUser(id: UserId): Promise<void> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      await collection.deleteOne({ $or: [{ id: id.value }, { _id: id.value }] });
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for deleteUser operation.', error);
      await this.pgRepository.delete(id.value);
    }
  }

  async blockUser(id: UserId): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
    };
  }> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      const user = await collection.findOne({ $or: [{ id: id.value }, { _id: id.value }] });

      if (!user) throw new UserNotFoundException('User not found');

      await collection.updateOne(
        { $or: [{ id: id.value }, { _id: id.value }] },
        { $set: { status: 'Blocked' } }
      );

      return {
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt,
          status: 'Blocked',
        },
      };
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      // Solo hacemos fallback si el error es de conexión, no si el usuario no existe
      if (error instanceof UserNotFoundException) {
        throw error;
      }

      console.log('MongoDB connection not available, falling back to PostgreSQL for blockUser operation.', error);

      const user = await this.pgRepository.findOne({ where: { id: id.value } });
      if (!user) throw new UserNotFoundException('User not found');
      user.status = 'Blocked';
      await this.pgRepository.save(user);
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: user.createdAt,
          status: user.status,
        },
      };
    }
  }

  async UnblockUser(id: UserId): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
    };
  }> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      const user = await collection.findOne({ $or: [{ id: id.value }, { _id: id.value }] });

      if (!user) throw new UserNotFoundException('User not found');

      await collection.updateOne(
        { $or: [{ id: id.value }, { _id: id.value }] },
        { $set: { status: 'Active' } }
      );

      return {
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt,
          status: 'Active',
        },
      };
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      // Solo hacemos fallback si el error es de conexión, no si el usuario no existe
      if (error instanceof UserNotFoundException) {
        throw error;
      }

      console.log('MongoDB connection not available, falling back to PostgreSQL for blockUser operation.', error);

      const user = await this.pgRepository.findOne({ where: { id: id.value } });
      if (!user) throw new UserNotFoundException('User not found');
      user.status = 'Active';
      await this.pgRepository.save(user);
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: user.createdAt,
          status: user.status,
        },
      };
    }
  }

  async GiveAdminRole(id: UserId): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
      isadmin: boolean;
    };
  }> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      const user = await collection.findOne({ $or: [{ id: id.value }, { _id: id.value }] });

      if (!user) throw new UserNotFoundException('User not found');

      await collection.updateOne(
        { $or: [{ id: id.value }, { _id: id.value }] },
        { $set: { isadmin: true } }
      );

      return {
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt,
          status: user.status,
          isadmin: true,
        },
      };
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      // Solo hacemos fallback si el error es de conexión, no si el usuario no existe
      if (error instanceof UserNotFoundException) {
        throw error;
      }

      console.log('MongoDB connection not available, falling back to PostgreSQL for blockUser operation.', error);

      const user = await this.pgRepository.findOne({ where: { id: id.value } });
      if (!user) throw new UserNotFoundException('User not found');
      user.isadmin = true;
      await this.pgRepository.save(user);
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: user.createdAt,
          status: user.status,
          isadmin: true,
        },
      };
    }
  }
  
  async RemoveAdminRole(id: UserId): Promise<{
    user: {
      id: string;
      name: string;
      email: string;
      userType: string;
      createdAt: Date;
      status: string;
      isadmin: boolean;
    };
  }> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      const user = await collection.findOne({ $or: [{ id: id.value }, { _id: id.value }] });

      if (!user) throw new UserNotFoundException('User not found');

      await collection.updateOne(
        { $or: [{ id: id.value }, { _id: id.value }] },
        { $set: { isadmin: false } }
      );

      return {
        user: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt,
          status: user.status,
          isadmin: false,
        },
      };
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      // Solo hacemos fallback si el error es de conexión, no si el usuario no existe
      if (error instanceof UserNotFoundException) {
        throw error;
      }

      console.log('MongoDB connection not available, falling back to PostgreSQL for blockUser operation.', error);

      const user = await this.pgRepository.findOne({ where: { id: id.value } });
      if (!user) throw new UserNotFoundException('User not found');
      user.isadmin = false;
      await this.pgRepository.save(user);
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: user.createdAt,
          status: user.status,
          isadmin: false,
        },
      };
    }
  }

  async getOneById(id: UserId): Promise<User | null> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      const user = await collection.findOne({ $or: [{ id: id.value }, { _id: id.value }] });
      if (!user) throw new UserNotFoundException('User not found');
      return this.mapToDomain(user);
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for getOneById operation.', error);
      const user = await this.pgRepository.findOne({ where: { id: id.value } });
      if (!user) throw new UserNotFoundException('User not found');
      return this.mapToDomain(user);
    }
  }

  async getEmailNoadmin(): Promise<string[]> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      const users = await collection.find({ isadmin: false }).toArray();
      return users.map((user) => user.email);
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for getEmailNoadmin operation.', error);
      const users = await this.pgRepository.find({ where: { isadmin: false } });
      return users.map((user) => user.email);
    }
  }

  async getEmailAdmin(): Promise<string[]> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      const users = await collection.find({ isadmin: true }).toArray();
      return users.map((user) => user.email);
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for getEmailAdmin operation.', error);
      const users = await this.pgRepository.find({ where: { isadmin: true } });
      return users.map((user) => user.email);
    }
  }
}
