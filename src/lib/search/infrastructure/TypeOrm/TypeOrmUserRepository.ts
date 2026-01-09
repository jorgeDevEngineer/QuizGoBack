import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { User } from '../../domain/entity/User';
import { UserRepository } from '../../domain/port/UserRepository';
import { TypeOrmUserEntity } from './TypeOrmUserEntity';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';

// Interfaz para el documento de MongoDB
interface MongoUserDoc {
  _id?: string;
  id?: string;
  userName: string;
  email: string;
  hashedPassword: string;
  userType: 'student' | 'teacher' | 'personal';
  avatarUrl: string;
  name: string;
  theme: string;
  language: string;
  gameStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(TypeOrmUserEntity)
    private readonly pgRepository: Repository<TypeOrmUserEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  /**
   * Obtiene la colección de usuarios de MongoDB para el módulo 'search'
   */
  private async getMongoCollection(): Promise<Collection<MongoUserDoc>> {
    const db: Db = await this.mongoAdapter.getConnection('search');
    return db.collection<MongoUserDoc>('users');
  }

  private mapToDomain(entity: TypeOrmUserEntity | MongoUserDoc): User {
    // Obtener el id dependiendo de si es Mongo (_id o id) o PG (id)
    const userId = entity.id || (entity as MongoUserDoc)._id;

    return new User(
      userId,
      entity.userName,
      entity.email,
      entity.hashedPassword,
      entity.userType,
      entity.avatarUrl,
      entity.name,
      entity.theme,
      entity.language,
      entity.gameStreak,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async getNameById(id: string): Promise<string> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      // Buscar por 'id' o '_id' según cómo esté almacenado el documento
      const user = await collection.findOne({ $or: [{ id: id }, { _id: id }] });

      if (!user) throw new Error('User not found');
      return user.name;
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      // Solo hacemos fallback si el error es de conexión, no si el usuario no existe
      if (error.message === 'User not found') {
        throw error;
      }

      console.log('MongoDB connection not available, falling back to PostgreSQL for getNameById operation.',error);
      const user = await this.pgRepository.findOne({ where: { id: id } });

      if (!user) throw new Error('User not found');
      return user.name;
    }
  }
}
