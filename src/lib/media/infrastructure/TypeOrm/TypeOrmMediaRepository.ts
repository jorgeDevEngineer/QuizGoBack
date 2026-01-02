
import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../../domain/entity/Media';
import { IMediaRepository, IMEDIA_REPOSITORY } from '../../domain/port/IMediaRepository';
import { TypeOrmMediaEntity } from './TypeOrmMediaEntity';

@Injectable()
export class TypeOrmMediaRepository implements IMediaRepository {
  constructor(
    @InjectRepository(TypeOrmMediaEntity)
    private readonly mediaRepository: Repository<TypeOrmMediaEntity>,
  ) {}

  async save(media: Media): Promise<void> {
    const entity = this.mediaRepository.create(media.properties());
    await this.mediaRepository.save(entity);
  }

  async findById(id: string): Promise<Media | null> {
    const entity = await this.mediaRepository.findOne({ where: { id: id } });
    return entity ? Media.fromPrimitives(entity) : null;
  }

  async findAll(): Promise<Media[]> {
    const entities = await this.mediaRepository.find();
    return entities.map(entity => Media.fromPrimitives(entity));
  }

  async findAllByAuthor(authorId: string): Promise<Media[]> {
    const entities = await this.mediaRepository.find({ where: { authorId } });
    return entities.map(entity => Media.fromPrimitives(entity));
  }

  async delete(id: string): Promise<void> {
    await this.mediaRepository.delete(id);
  }

  async findByCategory(category: string): Promise<Media[]> {
    const entities = await this.mediaRepository.find({ where: { category } });
    return entities.map(entity => Media.fromPrimitives(entity));
  }
}
