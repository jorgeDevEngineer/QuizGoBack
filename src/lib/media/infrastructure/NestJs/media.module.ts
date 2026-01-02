
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaController } from './media.controller';
import { TypeOrmMediaEntity } from '../TypeOrm/TypeOrmMediaEntity';
import { TypeOrmMediaRepository } from '../TypeOrm/TypeOrmMediaRepository';
import { UploadMedia } from '../../application/UploadMedia';
import { ListMediaUseCase } from '../../application/ListMediaUseCase';
import { LoggerModule } from '../../../shared/aspects/logger/infrastructure/logger.module';
import { ILoggerPort } from '../../../shared/aspects/logger/domain/ports/logger.port';
import { LoggingUseCaseDecorator } from '../../../shared/aspects/logger/application/decorators/logging.decorator';
import { ErrorHandlingDecorator } from '../../../shared/aspects/error-handling/application/decorators/error-handling.decorator';
import { SupabaseStorageService } from '../Supabase/SupabaseStorageService';
import { IStorageService } from '../../domain/port/IStorageService';
import { IMediaRepository } from '../../domain/port/IMediaRepository';

@Module({
    imports: [TypeOrmModule.forFeature([TypeOrmMediaEntity]), LoggerModule],
    controllers: [MediaController],
    providers: [
        // 1. Provide the implementation for the IStorageService interface
        {
            provide: 'IStorageService', // Use a string token for the interface
            useClass: SupabaseStorageService,
        },
        // 2. Provide the implementation for the IMediaRepository interface
        {
            provide: 'IMediaRepository', // Use a string token for the interface
            useClass: TypeOrmMediaRepository,
        },
        // 3. Provide the UploadMedia use case with its dependencies
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
            inject: ['ILoggerPort', 'IStorageService', 'IMediaRepository'], // Use string tokens for injection
        },
        // 4. Provide the ListMediaUseCase with its dependencies
        {
            provide: ListMediaUseCase,
            useFactory: (logger: ILoggerPort, repository: IMediaRepository) => {
                const useCase = new ListMediaUseCase(repository);
                const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'ListMediaUseCase');
                return new LoggingUseCaseDecorator(withErrorHandling, logger, 'ListMediaUseCase');
            },
            inject: ['ILoggerPort', 'IMediaRepository'], // Use string token for injection
        },
    ],
})
export class MediaModule {}
