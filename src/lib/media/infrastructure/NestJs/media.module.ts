import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './media.controller';
import { TypeOrmMediaEntity } from '../TypeOrm/TypeOrmMediaEntity';
import { TypeOrmMediaRepository } from '../TypeOrm/TypeOrmMediaRepository';
import { MediaRepository } from '../../domain/port/MediaRepository';
import { UploadMedia } from '../../application/UploadMedia';
import { GetMedia } from '../../application/GetMedia';
import { DeleteMedia } from '../../application/DeleteMedia';
import { ListMediaUseCase } from '../../application/ListMediaUseCase';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmMediaEntity])],
  controllers: [MediaController],
  providers: [
    {
      provide: 'MediaRepository',
      useClass: TypeOrmMediaRepository,
    },
    {
      provide: 'UploadMedia',
      useFactory: (repository: MediaRepository) =>
        new UploadMedia(repository),
      inject: ['MediaRepository'],
    },
    {
      provide: 'GetMedia',
      useFactory: (repository: MediaRepository) =>
        new GetMedia(repository),
      inject: ['MediaRepository'],
    },
    {
      provide: 'DeleteMedia',
      useFactory: (repository: MediaRepository) =>
        new DeleteMedia(repository),
      inject: ['MediaRepository'],
    },
    {
      provide: 'ListMediaUseCase',
      useFactory: (repository: MediaRepository) =>
        new ListMediaUseCase(repository),
      inject: ['MediaRepository'],
    }
  ],
})
export class MediaModule {}
