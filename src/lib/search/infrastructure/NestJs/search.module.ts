import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { TypeOrmQuizRepository } from '../TypeOrm/TypeOrmQuizRepository';
import { TypeOrmQuizEntity } from '../TypeOrm/TypeOrmQuizEntity';
import { TypeOrmUserRepository } from '../TypeOrm/TypeOrmUserRepository';
import { TypeOrmUserEntity } from '../TypeOrm/TypeOrmUserEntity';
import { SearchQuizzesUseCase } from '../../application/SearchQuizzesUseCase';
import { GetFeaturedQuizzesUseCase } from '../../application/GetFeaturedQuizzesUseCase';
import { GetCategoriesUseCase } from '../../application/GetCategoriesUseCase';
import { LoggerModule } from 'src/lib/shared/aspects/logger/infrastructure/logger.module';
import { ILoggerPort } from 'src/lib/shared/aspects/logger/domain/ports/logger.port';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { ErrorHandlingDecorator } from 'src/lib/shared/aspects/error-handling/application/decorators/error-handling.decorator';
import { LoggingUseCaseDecorator } from 'src/lib/shared/aspects/logger/application/decorators/logging.decorator';

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmQuizEntity, TypeOrmUserEntity]),
    LoggerModule,
  ],
  controllers: [SearchController],
  providers: [
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },
    // SearchQuizzesUseCase con decoradores
    {
      provide: SearchQuizzesUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new SearchQuizzesUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          'SearchQuizzesUseCase'
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          'SearchQuizzesUseCase'
        );
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    // GetFeaturedQuizzesUseCase con decoradores
    {
      provide: GetFeaturedQuizzesUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new GetFeaturedQuizzesUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          'GetFeaturedQuizzesUseCase'
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          'GetFeaturedQuizzesUseCase'
        );
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    // GetCategoriesUseCase con decoradores
    {
      provide: GetCategoriesUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new GetCategoriesUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          'GetCategoriesUseCase'
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          'GetCategoriesUseCase'
        );
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
  ],
  exports: [SearchQuizzesUseCase, GetFeaturedQuizzesUseCase, GetCategoriesUseCase],
})
export class SearchModule {}
