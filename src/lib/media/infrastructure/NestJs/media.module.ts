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
import { LocalStorageProvider } from '../Storage/LocalStorageProvider';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmMediaEntity])],
  controllers: [MediaController],
  providers: [
    {
      provide: 'MediaRepository',
      useClass: TypeOrmMediaRepository,
    },
    {
      provide: 'StorageProvider',
      useClass: LocalStorageProvider,
    },
    {
      provide: 'UploadMedia',
      useFactory: (repository: MediaRepository, storageProvider: any) =>
        new UploadMedia(repository, storageProvider),
      inject: ['MediaRepository', 'StorageProvider'],
    },
    {
      provide: 'GetMedia',
      useFactory: (repository: MediaRepository, storageProvider: any) =>
        new GetMedia(repository, storageProvider),
      inject: ['MediaRepository', 'StorageProvider'],
    },
    {
      provide: 'DeleteMedia',
      useFactory: (repository: MediaRepository, storageProvider: any) =>
        new DeleteMedia(repository, storageProvider),
      inject: ['MediaRepository', 'StorageProvider'],
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
