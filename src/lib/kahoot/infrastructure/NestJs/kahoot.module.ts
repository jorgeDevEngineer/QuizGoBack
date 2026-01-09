
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KahootController } from './kahoots.controller';
import { CreateQuizUseCase } from '../../application/CreateQuizUseCase';
import { GetQuizUseCase } from '../../application/GetQuizUseCase';
import { ListUserQuizzesUseCase } from '../../application/ListUserQuizzesUseCase';
import { UpdateQuizUseCase } from '../../application/UpdateQuizUseCase';
import { DeleteQuizUseCase } from '../../application/DeleteQuizUseCase';
import { TypeOrmQuizRepository } from '../TypeOrm/TypeOrmQuizRepository';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { LoggerModule } from '../../../shared/aspects/logger/infrastructure/logger.module';
import { ILoggerPort } from '../../../shared/aspects/logger/domain/ports/logger.port';
import { LoggingUseCaseDecorator } from '../../../shared/aspects/logger/application/decorators/logging.decorator';
import { ErrorHandlingDecorator } from '../../../shared/aspects/error-handling/application/decorators/error-handling.decorator';
import { GetAllKahootsUseCase } from '../../application/GetAllKahootsUseCase';
import { DatabaseModule } from '../../../shared/infrastructure/database/database.module';
import { TypeOrmQuizEntity } from '../TypeOrm/TypeOrmQuizEntity';

@Module({
  imports: [
    LoggerModule, 
    DatabaseModule,
    TypeOrmModule.forFeature([TypeOrmQuizEntity]),
  ],
  controllers: [KahootController],
  providers: [
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: CreateQuizUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const realUseCase = new CreateQuizUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(realUseCase, logger, 'CreateQuizUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'CreateQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: GetQuizUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const realUseCase = new GetQuizUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(realUseCase, logger, 'GetQuizUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'GetQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: ListUserQuizzesUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const realUseCase = new ListUserQuizzesUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(realUseCase, logger, 'ListUserQuizzesUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'ListUserQuizzesUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: UpdateQuizUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const realUseCase = new UpdateQuizUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(realUseCase, logger, 'UpdateQuizUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'UpdateQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: DeleteQuizUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const realUseCase = new DeleteQuizUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(realUseCase, logger, 'DeleteQuizUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'DeleteQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: GetAllKahootsUseCase,
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const realUseCase = new GetAllKahootsUseCase(repo);
        const withErrorHandling = new ErrorHandlingDecorator(realUseCase, logger, 'GetAllKahootsUseCase');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'GetAllKahootsUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
  ],
  exports: ['QuizRepository', TypeOrmModule],
})
export class KahootModule {}
