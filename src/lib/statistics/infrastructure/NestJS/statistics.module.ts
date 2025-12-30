import { Module } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmQuizEntity } from 'src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity';
import { TypeOrmSinglePlayerGameEntity } from 'src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity';
import { StatisticsController } from './statistics.controller';
import { TypeOrmCriteriaApplier } from '../TypeORM/Criteria Appliers/TypeOrmCriteriaApplier';
import { TypeOrmQuizRepository } from 'src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizRepository';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CriteriaApplier } from 'src/lib/library/domain/port/CriteriaApplier';
import { CompletedQuizQueryCriteria } from '../../application/Response Types/CompletedQuizQueryCriteria';
import { TypeOrmSinglePlayerGameRepository } from '../TypeORM/Repositories/TypeOrmSinglePlayerGameRepository';
import { SinglePlayerGameRepository } from '../../domain/port/SinglePlayerRepository';
import { QuizRepository } from 'src/lib/kahoot/domain/port/QuizRepository';
import { GetUserResultsDomainService } from '../../domain/services/GetUserResultsDomainService';
import { GetUserResultsQueryHandler } from '../../application/Handlers/GetUserResultsQueryHandler';
import { GetCompletedQuizSummaryDomainService } from '../../domain/services/GetCompletedQuizSummaryDomainService';
import { GetCompletedQuizSummaryQueryHandler } from '../../application/Handlers/GetCompletedQuizSummaryQueryHandler';
import { LoggerModule } from 'src/lib/shared/aspects/logger/infrastructure/logger.module';
import { LoggingUseCaseDecorator } from 'src/lib/shared/aspects/logger/application/decorators/logging.decorator';
import { ILoggerPort } from 'src/lib/shared/aspects/logger/domain/ports/logger.port';
import { ErrorHandlingDecoratorWithEither } from 'src/lib/shared/aspects/error-handling/application/decorators/error-handling-either';

@Module({
    imports: [TypeOrmModule.forFeature([TypeOrmQuizEntity, TypeOrmSinglePlayerGameEntity]), LoggerModule],
    controllers: [StatisticsController],
    providers: [
        {
          provide: 'CriteriaApplier',
          useClass: TypeOrmCriteriaApplier,
        },
        {
          provide: 'QuizRepository',
          useClass: TypeOrmQuizRepository,
        },
        {
          provide: 'SinglePlayerGameRepository',
          useFactory: (
            ormRepo: Repository<TypeOrmSinglePlayerGameEntity>,
            criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>, CompletedQuizQueryCriteria>
          ) => new TypeOrmSinglePlayerGameRepository(ormRepo, criteriaApplier),
          inject: [getRepositoryToken(TypeOrmSinglePlayerGameEntity), 'CriteriaApplier'],
        },
        {
          provide: 'GetUserResultsDomainService',
          useFactory: (
            singleGameRepo: SinglePlayerGameRepository,
            quizRepo: QuizRepository
          ) => new GetUserResultsDomainService(singleGameRepo, quizRepo),
          inject: ['SinglePlayerGameRepository', 'QuizRepository'],
        },
        {
          provide: 'GetUserResultsQueryHandler',
          useFactory: (logger: ILoggerPort, dService: GetUserResultsDomainService) => {
            const realHandler = new GetUserResultsQueryHandler(dService);
            const withErrorHandling = new ErrorHandlingDecoratorWithEither(realHandler, logger, 'GetUserResultsQueryHandler');
            return new LoggingUseCaseDecorator(withErrorHandling, logger, 'GetUserResultsQueryHandler');
          },
          inject: ['ILoggerPort', 'GetUserResultsDomainService'],    
        },
        {
          provide: 'GetCompletedQuizSummaryDomainService',
          useFactory: (
            singleGameRepo: SinglePlayerGameRepository,
            quizRepo: QuizRepository
          ) => new GetCompletedQuizSummaryDomainService(singleGameRepo, quizRepo),
          inject: ['SinglePlayerGameRepository', 'QuizRepository'],
        },
        {
          provide: 'GetCompletedQuizSummaryQueryHandler',
          useFactory: (logger: ILoggerPort, dService: GetCompletedQuizSummaryDomainService) => {
            const realHandler = new GetCompletedQuizSummaryQueryHandler(dService);
            const withErrorHandling = new ErrorHandlingDecoratorWithEither(realHandler, logger, 'GetCompletedQuizSummaryQueryHandler');
            return new LoggingUseCaseDecorator(withErrorHandling, logger, 'GetCompletedQuizSummaryQueryHandler');
          },
          inject: ['ILoggerPort', 'GetCompletedQuizSummaryDomainService'],    
        }
    ],

})
export class StatisticsModule {}
