
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, Db } from 'mongodb';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';
import { Media } from '../../domain/entity/Media';
import { IMediaRepository } from '../../domain/port/IMediaRepository';
import { TypeOrmMediaEntity } from './TypeOrmMediaEntity';
import { MediaId, AuthorId, CreatedAt, MediaCategory, MediaName, MediaUrl, MediaMimeType, MediaSize, MediaFormat } from '../../domain/value-object/MediaId';

// Unified interface for the MongoDB document, using camelCase
export interface MongoMediaDocument {
  mediaId: string;
  authorId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  format: string;
  category: string;
  createdAt: Date;
}

@Injectable()
export class TypeOrmMediaRepository implements IMediaRepository {
  constructor(
    @InjectRepository(TypeOrmMediaEntity)
    private readonly pgRepository: Repository<TypeOrmMediaEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  private async getMongoCollection(): Promise<Collection<MongoMediaDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('media');
    return db.collection<MongoMediaDocument>('media');
  }

  async save(media: Media): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDoc = this.mapDomainToMongo(media);
      await collection.replaceOne({ mediaId: mongoDoc.mediaId }, mongoDoc, { upsert: true });
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for save.');
      const pgEntity = this.mapDomainToPg(media);
      await this.pgRepository.save(pgEntity);
    }
  }

  async findById(id: string): Promise<Media | null> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDoc = await collection.findOne({ mediaId: id });
      return mongoDoc ? this.mapMongoToDomain(mongoDoc) : null;
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by ID.');
      const pgEntity = await this.pgRepository.findOne({ where: { mediaId: id } });
      return pgEntity ? this.mapPgToDomain(pgEntity) : null;
    }
  }

  async findAll(): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find().toArray();
      return mongoDocs.map(doc => this.mapMongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find all.');
      const pgEntities = await this.pgRepository.find();
      return pgEntities.map(entity => this.mapPgToDomain(entity));
    }
  }

  async findAllByAuthor(authorId: string): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find({ authorId }).toArray();
      return mongoDocs.map(doc => this.mapMongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by author.');
      const pgEntities = await this.pgRepository.find({ where: { authorId } });
      return pgEntities.map(entity => this.mapPgToDomain(entity));
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      await collection.deleteOne({ mediaId: id });
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for delete.');
      await this.pgRepository.delete(id);
    }
  }

  async findByCategory(category: string): Promise<Media[]> {
    try {
      const collection = await this.getMongoCollection();
      const mongoDocs = await collection.find({ category }).toArray();
      return mongoDocs.map(doc => this.mapMongoToDomain(doc));
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find by category.');
      const pgEntities = await this.pgRepository.find({ where: { category } });
      return pgEntities.map(entity => this.mapPgToDomain(entity));
    }
  }

  private mapDomainToMongo(media: Media): MongoMediaDocument {
    const plain = media.toPlainObject();
    return {
      mediaId: plain.mediaId,
      authorId: plain.authorId,
      name: plain.name,
      url: plain.url,
      mimeType: plain.mimeType,
      size: plain.size,
      format: plain.format,
      category: plain.category,
      createdAt: plain.createdAt,
    };
  }

  private mapDomainToPg(media: Media): TypeOrmMediaEntity {
    const plain = media.toPlainObject();
    const entity = new TypeOrmMediaEntity();
    entity.mediaId = plain.mediaId;
    entity.authorId = plain.authorId;
    entity.name = plain.name;
    entity.url = plain.url;
    entity.mimeType = plain.mimeType;
    entity.size = plain.size;
    entity.format = plain.format;
    entity.category = plain.category;
    entity.createdAt = plain.createdAt;
    return entity;
  }

  private mapMongoToDomain(mongoDoc: MongoMediaDocument): Media {
    return Media.fromDb(
      MediaId.of(mongoDoc.mediaId),
      AuthorId.of(mongoDoc.authorId),
      MediaName.of(mongoDoc.name),
      MediaUrl.of(mongoDoc.url),
      MediaMimeType.of(mongoDoc.mimeType),
      MediaSize.of(mongoDoc.size),
      MediaFormat.of(mongoDoc.format),
      MediaCategory.of(mongoDoc.category),
      CreatedAt.of(mongoDoc.createdAt),
    );
  }

  private mapPgToDomain(pgEntity: TypeOrmMediaEntity): Media {
    return Media.fromDb(
      MediaId.of(pgEntity.mediaId),
      AuthorId.of(pgEntity.authorId),
      MediaName.of(pgEntity.name),
      MediaUrl.of(pgEntity.url),
      MediaMimeType.of(pgEntity.mimeType),
      MediaSize.of(pgEntity.size),
      MediaFormat.of(pgEntity.format),
      MediaCategory.of(pgEntity.category),
      CreatedAt.of(pgEntity.createdAt),
    );
  }
}
