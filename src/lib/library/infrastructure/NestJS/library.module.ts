import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { AddUserFavoriteQuizService } from '../../application/Services/AddUserFavoriteQuizUseService';
import { DeleteUserFavoriteQuizService } from '../../application/Services/DeleteUserFavoriteQuizUseService';
import { GetUserFavoriteQuizzesService } from '../../application/Services/GetUserFavoriteQuizzesService';
import { GetAllUserQuizzesService } from '../../application/Services/GetAllUserQuizzesUseService';
import { GetInProgressQuizzesService} from '../../application/Services/GetInProgessQuizzesService';
import { GetCompletedQuizzesService } from '../../application/Services/GetCompletedQuizzesSerice';
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
      provide: 'AddUserFavoriteQuizService',
      useFactory: (userFavoriteRepository: UserFavoriteQuizRepository,
        quizRepository: QuizRepository
      ) =>
        new AddUserFavoriteQuizService(userFavoriteRepository, quizRepository),
      inject: ['UserFavoriteQuizRepository', 'QuizRepository'],
    },
    {
      provide: 'DeleteUserFavoriteQuizService',
      useFactory: (repository: UserFavoriteQuizRepository) =>
        new DeleteUserFavoriteQuizService(repository),
      inject: ['UserFavoriteQuizRepository'],
    },
    {
      provide: 'GetUserFavoriteQuizzesService',
      useFactory: (favoritesRepo: UserFavoriteQuizRepository,
        quizRepo: QuizRepository,
        userRepo: UserRepository
      ) =>
        new GetUserFavoriteQuizzesService(favoritesRepo, quizRepo, userRepo),
      inject: ['UserFavoriteQuizRepository', 'QuizRepository', 'UserRepository'],
    },
    {
      provide: 'GetAllUserQuizzesService',
      useFactory: (quizRepository: QuizRepository, userRepo: UserRepository) =>
        new GetAllUserQuizzesService(quizRepository, userRepo),
      inject: ['QuizRepository', 'UserRepository'],
    },
    {
      provide: 'GetInProgressQuizzesService',
      useFactory: (quizRepository: QuizRepository,
        userRepo: UserRepository,
        singlePlayerRepo: SinglePlayerGameRepository) =>
        new GetInProgressQuizzesService(quizRepository, userRepo, singlePlayerRepo),
      inject: ['QuizRepository', 'UserRepository', 'SinglePlayerGameRepository'],
    },
    {
      provide: 'GetCompletedQuizzesService',
      useFactory: (quizRepository: QuizRepository,
        userRepo: UserRepository,
        singlePlayerRepo: SinglePlayerGameRepository) =>
        new GetCompletedQuizzesService(quizRepository, userRepo, singlePlayerRepo),
      inject: ['QuizRepository', 'UserRepository', 'SinglePlayerGameRepository'],
    },
  ],

})
export class LibraryModule {}
