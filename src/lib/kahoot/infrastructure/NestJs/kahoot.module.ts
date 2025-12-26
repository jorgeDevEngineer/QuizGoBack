
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KahootController } from './kahoots.controller';
import { CreateQuizUseCase } from '../../application/CreateQuizUseCase';
import { GetQuizUseCase } from '../../application/GetQuizUseCase';
import { ListUserQuizzesUseCase } from '../../application/ListUserQuizzesUseCase';
import { UpdateQuizUseCase } from '../../application/UpdateQuizUseCase';
import { DeleteQuizUseCase } from '../../application/DeleteQuizUseCase';
import { TypeOrmQuizEntity } from '../TypeOrm/TypeOrmQuizEntity';
import { TypeOrmQuizRepository } from '../TypeOrm/TypeOrmQuizRepository';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { LoggerModule } from '../../../../logger/infrastructure/logger.module';
import { ILoggerPort } from '../../../../logger/domain/ports/logger.port';
import { LoggingUseCaseDecorator } from '../../../../logger/application/decorators/logging.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmQuizEntity]), LoggerModule],
  controllers: [KahootController],
  providers: [
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: 'CreateQuizUseCase',
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new CreateQuizUseCase(repo);
        return new LoggingUseCaseDecorator(useCase, logger, 'CreateQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: 'GetQuizUseCase',
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new GetQuizUseCase(repo);
        return new LoggingUseCaseDecorator(useCase, logger, 'GetQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: 'ListUserQuizzesUseCase',
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new ListUserQuizzesUseCase(repo);
        return new LoggingUseCaseDecorator(useCase, logger, 'ListUserQuizzesUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: 'UpdateQuizUseCase',
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new UpdateQuizUseCase(repo);
        return new LoggingUseCaseDecorator(useCase, logger, 'UpdateQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
    {
      provide: 'DeleteQuizUseCase',
      useFactory: (logger: ILoggerPort, repo: QuizRepository) => {
        const useCase = new DeleteQuizUseCase(repo);
        return new LoggingUseCaseDecorator(useCase, logger, 'DeleteQuizUseCase');
      },
      inject: ['ILoggerPort', 'QuizRepository'],
    },
  ],
  exports: ['QuizRepository'],
})
export class KahootModule {}
