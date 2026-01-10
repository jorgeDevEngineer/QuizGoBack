
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './media.controller';
import { TypeOrmMediaEntity } from '../TypeOrm/TypeOrmMediaEntity';
import { TypeOrmMediaRepository } from '../TypeOrm/TypeOrmMediaRepository';
import { UploadMedia } from '../../application/UploadMedia';
import { ListThemesUseCase } from '../../application/ListThemesUseCase';
import { LoggerModule } from '../../../shared/aspects/logger/infrastructure/logger.module';
import { ILoggerPort, LOGGER_PORT } from '../../../shared/aspects/logger/domain/ports/logger.port';
import { LoggingUseCaseDecorator } from '../../../shared/aspects/logger/application/decorators/logging.decorator';
import { ErrorHandlingDecorator } from '../../../shared/aspects/error-handling/application/decorators/error-handling.decorator';
import { SupabaseStorageService } from '../Supabase/SupabaseStorageService';
import { IStorageService, STORAGE_SERVICE } from '../../domain/port/IStorageService';
import { IMediaRepository, MEDIA_REPOSITORY } from '../../domain/port/IMediaRepository';
import { DatabaseModule } from '../../../shared/infrastructure/database/database.module';

@Module({
    imports: [TypeOrmModule.forFeature([TypeOrmMediaEntity]), LoggerModule, DatabaseModule],
    controllers: [MediaController],
    providers: [
        // 1. Storage Service
        {
            provide: STORAGE_SERVICE,
            useClass: SupabaseStorageService,
        },
        // 2. Media Repository
        {
            provide: MEDIA_REPOSITORY,
            useClass: TypeOrmMediaRepository,
        },
        // 3. UploadMedia Use Case
        {
            provide: UploadMedia,
            useFactory: (
                logger: ILoggerPort,
                storageService: IStorageService,
                repository: IMediaRepository,
            ) => {
                const useCase = new UploadMedia(storageService, repository);
                const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'UploadMedia');
                return new LoggingUseCaseDecorator(withErrorHandling, logger, 'UploadMedia');
            },
            inject: [LOGGER_PORT, STORAGE_SERVICE, MEDIA_REPOSITORY],
        },
        // 4. ListThemesUseCase
        {
            provide: ListThemesUseCase,
            useFactory: (logger: ILoggerPort, repository: IMediaRepository) => {
                const useCase = new ListThemesUseCase(repository);
                const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'ListThemesUseCase');
                return new LoggingUseCaseDecorator(withErrorHandling, logger, 'ListThemesUseCase');
            },
            inject: [LOGGER_PORT, MEDIA_REPOSITORY],
        },
    ],
})
export class MediaModule {}
