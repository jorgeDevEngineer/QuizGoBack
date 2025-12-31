
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../../domain/entity/Media';
import { MediaRepository } from '../../domain/port/MediaRepository';
import { TypeOrmMediaEntity } from './TypeOrmMediaEntity';
import { MediaId } from '../../domain/valueObject/Media';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';

@Injectable()
export class TypeOrmMediaRepository implements MediaRepository {
  constructor(
    @InjectRepository(TypeOrmMediaEntity)
    private readonly pgRepository: Repository<TypeOrmMediaEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  // Example of how you might use the adapter
  async getMongoDbInstance() {
    // The name 'media' should be consistent with what you use in the AdminController
    const db = await this.mongoAdapter.getConnection('media');
    return db;
  }

  async save(media: Media): Promise<void> {
    const entity = this.pgRepository.create(media.properties());
    await this.pgRepository.save(entity);
  }

  async findById(id: MediaId): Promise<Media | null> {
    const entity = await this.pgRepository.findOne({ where: { id: id.value } });
    return entity ? Media.fromPrimitives(entity) : null;
  }

  async findAll(): Promise<Media[]> {
    // Excluimos la columna 'data' (imagen completa) para optimizar
    const entities = await this.pgRepository.find({
      select: ['id', 'thumbnail', 'mimeType', 'size', 'originalName', 'createdAt'],
    });
    
    // Mapeamos a la entidad de dominio. `data` será undefined.
    return entities.map(entity => Media.fromPrimitives({ ...entity, data: Buffer.from([]) }));
  }

  async delete(id: MediaId): Promise<void> {
    await this.pgRepository.delete(id.value);
  }
}
