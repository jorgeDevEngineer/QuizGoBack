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

@Module({
    imports: [TypeOrmModule.forFeature([TypeOrmQuizEntity, TypeOrmSinglePlayerGameEntity])],
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
          useFactory: (dService: GetUserResultsDomainService) => 
            new GetUserResultsQueryHandler(dService),
          inject: ['GetUserResultsDomainService'],
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
          useFactory: (dService: GetCompletedQuizSummaryDomainService) => 
            new GetCompletedQuizSummaryQueryHandler(dService),
          inject: ['GetCompletedQuizSummaryDomainService'],
        }
    ],

})
export class StatisticsModule {}
