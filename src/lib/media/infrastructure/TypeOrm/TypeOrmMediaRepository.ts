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
    const entities = await this.mediaRepository.find();
    return entities.map(Media.fromPrimitives);
  }

  async delete(id: MediaId): Promise<void> {
    await this.mediaRepository.delete(id.value);
  }
}
