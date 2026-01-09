
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, Db, WithId } from 'mongodb';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';
import { Media } from '../../domain/entity/Media';
import { IMediaRepository } from '../../domain/port/IMediaRepository';
import { TypeOrmMediaEntity } from './TypeOrmMediaEntity';
import { MediaMapper } from '../../infrastructure/MediaMapper';

// Interfaz unificada para el documento de MongoDB, usando snake_case
export interface MongoMediaDocument {
  _id: string;
  author_id: string;
  name: string;
  url: string;
  category: string;
  created_at: Date;
}

@Injectable()
export class TypeOrmMediaRepository implements IMediaRepository {
  constructor(
    @InjectRepository(TypeOrmMediaEntity)
    private readonly pgRepository: Repository<TypeOrmMediaEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mapper: MediaMapper,
  ) {}

  private async getMongoCollection(): Promise<Collection<MongoMediaDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('media');
    return db.collection<MongoMediaDocument>('media');
  }

  async save(media: Media): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDoc = this.mapper.toMongo(media);
      // Separamos el _id del resto del documento para el 'replaceOne'
      const { _id, ...docToInsert } = mongoDoc;
      await collection.replaceOne({ _id: _id }, docToInsert, { upsert: true });
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for save.');
      const pgEntity = this.mapper.toPg(media);
      await this.pgRepository.save(pgEntity);
    }
  }

  async findById(id: string): Promise<Media | null> {
    try {
      const collection = await this.getMongoCollection();
      // El driver devuelve un tipo WithId<T>
      const mongoDoc: WithId<MongoMediaDocument> | null = await collection.findOne({ _id: id });
      return mongoDoc ? this.mapper.mongoToDomain(mongoDoc) : null;
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by ID.');
      const pgEntity = await this.pgRepository.findOne({ where: { id } });
      return pgEntity ? this.mapper.pgToDomain(pgEntity) : null;
    }
  }

  async findAll(): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find().toArray();
      return mongoDocs.map(doc => this.mapper.mongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find all.');
      const pgEntities = await this.pgRepository.find();
      return pgEntities.map(entity => this.mapper.pgToDomain(entity));
    }
  }

  async findAllByAuthor(authorId: string): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find({ author_id: authorId }).toArray();
      return mongoDocs.map(doc => this.mapper.mongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by author.');
      const pgEntities = await this.pgRepository.find({ where: { authorId } });
      return pgEntities.map(entity => this.mapper.pgToDomain(entity));
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      await collection.deleteOne({ _id: id });
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for delete.');
      await this.pgRepository.delete(id);
    }
  }

  async findByCategory(category: string): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find({ category }).toArray();
      return mongoDocs.map(doc => this.mapper.mongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by category.');
      const pgEntities = await this.pgRepository.find({ where: { category } });
      return pgEntities.map(entity => this.mapper.pgToDomain(entity));
    }
  }
}
