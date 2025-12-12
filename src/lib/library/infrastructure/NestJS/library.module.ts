import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { AddUserFavoriteQuizCommandHanlder } from '../../application/Handlers/Commands/AddUserFavoriteQuizCommandHandler';
import { DeleteUserFavoriteQuizCommandHandler } from '../../application/Handlers/Commands/DeleteUserFavoriteQuizCommandHandler';
import { GetUserFavoriteQuizzesQueryHandler } from '../../application/Handlers/Querys/GetUserFavoriteQuizzesQueryHandler';
import { GetAllUserQuizzesQueryHandler } from '../../application/Handlers/Querys/GetAllUserQuizzesQueryHandler';
import { GetUserInProgressQuizzesQueryHandler} from '../../application/Handlers/Querys/GetUserInProgessQuizzesQueryHandler';
import { GetUserCompletedQuizzesQueryHandler } from '../../application/Handlers/Querys/GetUserCompletedQuizzesQueryHandler';
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { TypeOrmUserFavoriteQuizRepository } from '../TypeOrm/Repositories/TypeOrmUserFavoriteQuizRepository';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUserFavoriteQuizEntity } from '../TypeOrm/Entities/TypeOrmUserFavoriteQuizEntity';
import { TypeOrmQuizEntity } from '../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity';
import { TypeOrmQuizRepository } from '../TypeOrm/Repositories/TypeOrmQuizRepository';
import { UserRepository } from '../../../user/domain/port/UserRepository';
import { TypeOrmUserEntity } from '../../../user/infrastructure/TypeOrm//TypeOrmUserEntity';
import { TypeOrmUserRepository } from '../../../user/infrastructure/TypeOrm/TypeOrmUserRepository';
import { SinglePlayerGameRepository} from '../../domain/port/SinglePlayerRepository';
import { TypeOrmSinglePlayerGameRepository } from '../TypeOrm/Repositories/TypeOrmSinglePlayerGameRepository';
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { QuizRepository } from '../../domain/port/QuizRepository';
import { CriteriaApplier } from '../../domain/port/CriteriaApplier';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TypeOrmCriteriaApplier } from '../TypeOrm//Criteria Appliers/TypeOrmCriteriaApplier';
import { TypeOrmQuizCriteriaApplier } from '../TypeOrm/Criteria Appliers/TypeOrmAdvancedCriteriaApplier';
import { QuizQueryCriteria } from "../../domain/valueObject/QuizQueryCriteria";
import { GetUserQuizzesDomainService } from '../../domain/services/GetUserQuizzesDomainService';
import { GetInProgressQuizzesDomainService } from '../../domain/services/GetInProgressQuizzesDomainService';
import { GetUserFavoriteQuizzesDomainService } from '../../domain/services/GetUserFavoriteQuizzesDomainService';
import { GetCompletedQuizzesDomainService } from '../../domain/services/GetCompletedQuizzesDomainService';
import { AddUserFavoriteQuizDomainService } from '../../domain/services/AddUserFavoriteQuizDomainService';
import { DeleteUserFavoriteQuizDomainService } from '../../domain/services/DeleteUserFavoriteQuizDomainService';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserFavoriteQuizEntity, TypeOrmQuizEntity, TypeOrmUserEntity, TypeOrmSinglePlayerGameEntity])],
  controllers: [LibraryController],
  providers: [
    {
      provide: 'CriteriaApplier',
      useClass: TypeOrmCriteriaApplier, // implementación genérica
    },{
      provide: 'AdvancedCriteriaApplier',
      useClass: TypeOrmQuizCriteriaApplier, // implementación avanzada
    },
    {
      provide: 'UserFavoriteQuizRepository',
      useFactory: (
        ormRepo: Repository<TypeOrmUserFavoriteQuizEntity>,
        criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmUserFavoriteQuizEntity>, QuizQueryCriteria>,
      ) => new TypeOrmUserFavoriteQuizRepository(ormRepo, criteriaApplier),
      inject: [getRepositoryToken(TypeOrmUserFavoriteQuizEntity), 'CriteriaApplier'],
    },
    {
      provide: 'QuizRepository',
      useFactory: (
        ormRepo: Repository<TypeOrmQuizEntity>,
        advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmQuizEntity>, QuizQueryCriteria>,
      ) => new TypeOrmQuizRepository(ormRepo, advancedCriteriaApplier),
      inject: [getRepositoryToken(TypeOrmQuizEntity), 'AdvancedCriteriaApplier'],
    },
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },
    {
      provide: 'SinglePlayerGameRepository',
      useFactory: (
        ormRepo: Repository<TypeOrmSinglePlayerGameEntity>,
        advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>, QuizQueryCriteria>
      ) => new TypeOrmSinglePlayerGameRepository(ormRepo, advancedCriteriaApplier),
      inject: [getRepositoryToken(TypeOrmSinglePlayerGameEntity), 'AdvancedCriteriaApplier'],
    },
    {
      provide: 'AddUserFavoriteQuizDomainService',
      useFactory: (userFavoriteRepository: UserFavoriteQuizRepository,
        quizRepository: QuizRepository,
        userRepository: UserRepository
      ) =>
        new AddUserFavoriteQuizDomainService(userFavoriteRepository, quizRepository, userRepository),
      inject: ['UserFavoriteQuizRepository', 'QuizRepository', 'UserRepository'],
    },
    {
      provide: 'AddUserFavoriteQuizService',
      useFactory: (domainService: AddUserFavoriteQuizDomainService
      ) =>
        new AddUserFavoriteQuizCommandHanlder(domainService),
      inject: ['AddUserFavoriteQuizDomainService'],
    },
    {
      provide: 'DeleteUserFavoriteQuizDomainService',
      useFactory: (repository: UserFavoriteQuizRepository) =>
        new DeleteUserFavoriteQuizDomainService(repository),
      inject: ['UserFavoriteQuizRepository'],
    },
    {
      provide: 'DeleteUserFavoriteQuizService',
      useFactory: (domainService: DeleteUserFavoriteQuizDomainService) =>
        new DeleteUserFavoriteQuizCommandHandler(domainService),
      inject: ['DeleteUserFavoriteQuizDomainService'],
    },
    {
      provide: 'GetUserFavoriteQuizzesDomainService',
      useFactory: (favoritesRepo: UserFavoriteQuizRepository,
        userRepo: UserRepository,
        quizRepo: QuizRepository) => new GetUserFavoriteQuizzesDomainService(favoritesRepo, quizRepo, userRepo),
      inject: ['UserFavoriteQuizRepository', 'UserRepository', 'QuizRepository'],
    },
    {
      provide: 'GetUserFavoriteQuizzesService',
      useFactory: (domainService: GetUserFavoriteQuizzesDomainService,
      ) =>
        new GetUserFavoriteQuizzesQueryHandler(domainService),
      inject: ['GetUserFavoriteQuizzesDomainService'],
    },
    {
      provide: 'GetUserQuizzesDomainService',
      useFactory: (quizRepository: QuizRepository, userRepo: UserRepository) => 
        new GetUserQuizzesDomainService(quizRepository, userRepo),
      inject: ['QuizRepository', 'UserRepository'],
    },
    {
      provide: 'GetAllUserQuizzesService',
      useFactory: (domainService: GetUserQuizzesDomainService) =>
        new GetAllUserQuizzesQueryHandler(domainService),
      inject: ['GetUserQuizzesDomainService'],
    },
    {
      provide: 'GetInProgressQuizzesDomainService',
      useFactory: (singlePlayerRepo: SinglePlayerGameRepository,
        quizRepo: QuizRepository,
        userRepo: UserRepository) =>
        new GetInProgressQuizzesDomainService(singlePlayerRepo, quizRepo, userRepo),
      inject: ['SinglePlayerGameRepository', 'QuizRepository', 'UserRepository'],
    },
    {
      provide: 'GetInProgressQuizzesService',
      useFactory: ( domainService: GetInProgressQuizzesDomainService) =>
        new GetUserInProgressQuizzesQueryHandler(domainService),
      inject: ['GetInProgressQuizzesDomainService'],
    },
    {
      provide: 'GetCompletedQuizzesDomainService',
      useFactory: (quizRepository: QuizRepository,
        userRepo: UserRepository,
        singlePlayerRepo: SinglePlayerGameRepository) =>
        new GetCompletedQuizzesDomainService(quizRepository, userRepo, singlePlayerRepo),
      inject: ['QuizRepository', 'UserRepository', 'SinglePlayerGameRepository'],
    },
    {
      provide: 'GetCompletedQuizzesService',
      useFactory: (domainService: GetCompletedQuizzesDomainService) => new GetUserCompletedQuizzesQueryHandler(domainService),
      inject: ['GetCompletedQuizzesDomainService'],
    },
  ],

})
export class LibraryModule {}
