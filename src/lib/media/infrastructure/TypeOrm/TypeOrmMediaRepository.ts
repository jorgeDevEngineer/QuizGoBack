
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from '../../domain/entity/Media';
import { IMediaRepository } from '../../domain/port/IMediaRepository';
import { TypeOrmMediaEntity } from './TypeOrmMediaEntity';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';

@Injectable()
export class TypeOrmMediaRepository implements IMediaRepository {
  constructor(
    @InjectRepository(TypeOrmMediaEntity)
    private readonly pgRepository: Repository<TypeOrmMediaEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  async save(media: Media): Promise<void> {
    const entity = this.pgRepository.create(media.properties());
    await this.pgRepository.save(entity);
  }

  async findById(id: string): Promise<Media | null> {
    const entity = await this.pgRepository.findOne({ where: { id: id } });
    return entity ? Media.fromPrimitives(entity) : null;
  }

  async findAll(): Promise<Media[]> {
    const entities = await this.pgRepository.find();
    return entities.map(entity => Media.fromPrimitives(entity));
  }

  async findAllByAuthor(authorId: string): Promise<Media[]> {
    const entities = await this.pgRepository.find({ where: { authorId } });
    return entities.map(entity => Media.fromPrimitives(entity));
  }

  async delete(id: string): Promise<void> {
    await this.pgRepository.delete(id);
  }

  async findThemes(): Promise<Media[]> {
      throw new Error('Method not implemented.');
  }
}
