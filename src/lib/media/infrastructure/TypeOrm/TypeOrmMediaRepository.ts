import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../../domain/entity/Media';
import { MediaRepository } from '../../domain/port/MediaRepository';
import { TypeOrmMediaEntity } from './TypeOrmMediaEntity';
import { MediaId } from '../../domain/valueObject/Media';

@Injectable()
export class TypeOrmMediaRepository implements MediaRepository {
  constructor(
    @InjectRepository(TypeOrmMediaEntity)
    private readonly mediaRepository: Repository<TypeOrmMediaEntity>,
  ) {}

  async save(media: Media): Promise<void> {
    const entity = this.mediaRepository.create(media.properties());
    await this.mediaRepository.save(entity);
  }

  async findById(id: MediaId): Promise<Media | null> {
    const entity = await this.mediaRepository.findOne({ where: { id: id.value } });
    return entity ? Media.fromPrimitives(entity) : null;
  }

  async findAll(): Promise<Media[]> {
    // Excluimos la columna 'data' (imagen completa) para optimizar
    const entities = await this.mediaRepository.find({
      select: ['id', 'thumbnail', 'mimeType', 'size', 'originalName', 'createdAt'],
    });
    
    // Mapeamos a la entidad de dominio. `data` será undefined.
    return entities.map(entity => Media.fromPrimitives({ ...entity, data: Buffer.from([]) }));
  }

  async delete(id: MediaId): Promise<void> {
    await this.mediaRepository.delete(id.value);
  }
}
