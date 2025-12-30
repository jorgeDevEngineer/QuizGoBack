
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MediaController } from "./media.controller";
import { TypeOrmMediaEntity } from "../TypeOrm/TypeOrmMediaEntity";
import { TypeOrmMediaRepository } from "../TypeOrm/TypeOrmMediaRepository";
import { MediaRepository } from "../../domain/port/MediaRepository";
import { UploadMedia } from "../../application/UploadMedia";
import { GetMedia } from "../../application/GetMedia";
import { DeleteMedia } from "../../application/DeleteMedia";
import { ListMediaUseCase } from "../../application/ListMediaUseCase";
import { IMAGE_OPTIMIZER, ImageOptimizer } from "../../domain/port/ImageOptimizer";
import { SharpImageOptimizer } from "../Sharp/SharpImageOptimizer";
import { LoggerModule } from "../../../shared/aspects/logger/infrastructure/logger.module";
import { ILoggerPort } from "../../../shared/aspects/logger/domain/ports/logger.port";
import { LoggingUseCaseDecorator } from "../../../shared/aspects/logger/application/decorators/logging.decorator";
import { ErrorHandlingDecorator } from "../../../shared/aspects/error-handling/application/decorators/error-handling.decorator";

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmMediaEntity]), LoggerModule],
  controllers: [MediaController],
  providers: [
    {
      provide: "MediaRepository",
      useClass: TypeOrmMediaRepository,
    },
    {
      provide: IMAGE_OPTIMIZER,
      useClass: SharpImageOptimizer,
    },
    {
      provide: UploadMedia,
      useFactory: (
        logger: ILoggerPort,
        repository: MediaRepository,
        imageOptimizer: ImageOptimizer
      ) => {
        const useCase = new UploadMedia(repository, imageOptimizer);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, "UploadMedia");
        return new LoggingUseCaseDecorator(withErrorHandling, logger, "UploadMedia");
      },
      inject: ["ILoggerPort", "MediaRepository", IMAGE_OPTIMIZER],
    },
    {
      provide: GetMedia,
      useFactory: (logger: ILoggerPort, repository: MediaRepository) => {
        const useCase = new GetMedia(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, "GetMedia");
        return new LoggingUseCaseDecorator(withErrorHandling, logger, "GetMedia");
      },
      inject: ["ILoggerPort", "MediaRepository"],
    },
    {
      provide: DeleteMedia,
      useFactory: (logger: ILoggerPort, repository: MediaRepository) => {
        const useCase = new DeleteMedia(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, "DeleteMedia");
        return new LoggingUseCaseDecorator(withErrorHandling, logger, "DeleteMedia");
      },
      inject: ["ILoggerPort", "MediaRepository"],
    },
    {
      provide: ListMediaUseCase,
      useFactory: (logger: ILoggerPort, repository: MediaRepository) => {
        const useCase = new ListMediaUseCase(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, "ListMediaUseCase");
        return new LoggingUseCaseDecorator(withErrorHandling, logger, "ListMediaUseCase");
      },
      inject: ["ILoggerPort", "MediaRepository"],
    },
  ],
})
export class MediaModule {}
