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
import { IMAGE_OPTIMIZER } from '../../domain/port/ImageOptimizer';
import { SharpImageOptimizer } from '../Sharp/SharpImageOptimizer';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmMediaEntity])],
  controllers: [MediaController],
  providers: [
    {
      provide: 'MediaRepository',
      useClass: TypeOrmMediaRepository,
    },
    {
      provide: IMAGE_OPTIMIZER,
      useClass: SharpImageOptimizer,
    },
    {
      provide: 'UploadMedia',
      useFactory: (repository: MediaRepository, imageOptimizer: SharpImageOptimizer) =>
        new UploadMedia(repository, imageOptimizer),
      inject: ['MediaRepository', IMAGE_OPTIMIZER],
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
