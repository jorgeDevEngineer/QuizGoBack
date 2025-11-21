import { Repository, DataSource } from 'typeorm';
import { TypeOrmMediaEntity } from './TypeOrmMediaEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from '../../domain/entity/Media';
import { MediaId } from '../../domain/valueObject/Media';
import { MediaRepository } from '../../domain/port/MediaRepository';

export class TypeOrmMediaRepository implements MediaRepository {
  private ormRepo: Repository<TypeOrmMediaEntity>;

  constructor(
    @InjectRepository(TypeOrmMediaEntity)
    ormRepo: Repository<TypeOrmMediaEntity>,
  ) {
    this.ormRepo = ormRepo;
  }

  static fromDataSource(dataSource: DataSource): TypeOrmMediaRepository {
    return new TypeOrmMediaRepository(dataSource.getRepository(TypeOrmMediaEntity));
  }

  private toOrm(media: Media): TypeOrmMediaEntity {
    const e = new TypeOrmMediaEntity();
    e.id = media.id.value;
    e.path = media.path.value;
    e.mimeType = media.mimeType.value;
    e.size = media.size.value;
    e.originalName = media.originalName;
    e.createdAt = media.createdAt;
    return e;
  }

  private toDomain(e: TypeOrmMediaEntity): Media {
    return Media.reconstitute(
      e.id,
      e.path,
      e.mimeType,
      e.size,
      e.originalName,
      e.createdAt
    );
  }

  async save(media: Media): Promise<void> {
    const e = this.toOrm(media);
    await this.ormRepo.save(e);
  }

  async findById(id: MediaId): Promise<Media | null> {
    const e = await this.ormRepo.findOneBy({ id: id.value });
    if (!e) return null;
    return this.toDomain(e);
  }

  async delete(id: MediaId): Promise<void> {
    await this.ormRepo.delete(id.value);
  }

  async findAll(): Promise<Media[]> {
    const entities = await this.ormRepo.find();
    return entities.map((e) => this.toDomain(e));
  }
}
