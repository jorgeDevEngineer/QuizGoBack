
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { WithId } from 'mongodb';
import { TypeOrmMediaEntity } from './TypeOrm/TypeOrmMediaEntity';
import { Media } from '../domain/entity/Media';
import { AuthorId, CreatedAt, MediaCategory, MediaId, MediaName, MediaUrl } from '../domain/value-object/MediaId';
import { MongoMediaDocument } from './TypeOrm/TypeOrmMediaRepository';

@Injectable()
export class MediaMapper {
  constructor(private readonly dataSource: DataSource) {}

  // --- Conversiones a Dominio ---

  pgToDomain(pgEntity: TypeOrmMediaEntity): Media {
    return Media.fromDb(
        MediaId.of(pgEntity.id),
        AuthorId.of(pgEntity.authorId),
        MediaName.of(pgEntity.name),
        MediaUrl.of(pgEntity.url),
        MediaCategory.of(pgEntity.category),
        CreatedAt.of(pgEntity.createdAt)
    );
  }

  mongoToDomain(mongoDoc: WithId<MongoMediaDocument>): Media {
    return Media.fromDb(
        MediaId.of(mongoDoc._id.toString()),
        AuthorId.of(mongoDoc.author_id.toString()),
        MediaName.of(mongoDoc.name),
        MediaUrl.of(mongoDoc.url),
        MediaCategory.of(mongoDoc.category),
        CreatedAt.of(mongoDoc.created_at)
    );
  }

  // --- Conversiones a Persistencia ---

  toPg(domainEntity: Media): TypeOrmMediaEntity {
    const props = domainEntity.properties(); // <- Usar el método existente
    const entity = this.dataSource.getRepository(TypeOrmMediaEntity).create();
    entity.id = props.id;
    entity.authorId = props.authorId;
    entity.name = props.name;
    entity.url = props.url;
    entity.category = props.category;
    entity.createdAt = props.createdAt;
    return entity;
  }

  toMongo(domainEntity: Media): MongoMediaDocument {
    const props = domainEntity.properties(); // <- Usar el método existente
    return {
        _id: props.id,
        author_id: props.authorId,
        name: props.name,
        url: props.url,
        category: props.category,
        created_at: props.createdAt
    };
  }
}
