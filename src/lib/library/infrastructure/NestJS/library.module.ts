import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { AddUserFavoriteQuizUseCase } from '../../application/Services/AddUserFavoriteQuizUseCase';
import { DeleteUserFavoriteQuizUseCase } from '../../application/Services/DeleteUserFavoriteQuizUseCase';
import { GetUserFavoriteQuizzesUseCase } from '../../application/Services/GetUserFavoriteQuizzesUseCase';
import { GetAllUserQuizzesUseCase } from '../../application/Services/GetAllUserQuizzesUseCase';
import { GetInProgressQuizzesUseCase} from '../../application/Services/GetInProgessQuizzesUseCase';
import { GetCompletedQuizzesUseCase} from '../../application/Services/GetCompletedQuizzesUseCase';
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
import { TypeOrmAdvancedCriteriaApplier } from '../TypeOrm/Criteria Appliers/TypeOrmAdvancedCriteriaApplier';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserFavoriteQuizEntity, TypeOrmQuizEntity, TypeOrmUserEntity, TypeOrmSinglePlayerGameEntity])],
  controllers: [LibraryController],
  providers: [
    {
      provide: 'CriteriaApplier',
      useClass: TypeOrmCriteriaApplier, // implementación genérica
    },{
      provide: 'AdvancedCriteriaApplier',
      useClass: TypeOrmAdvancedCriteriaApplier, // implementación avanzada
    },
    {
      provide: 'UserFavoriteQuizRepository',
      useFactory: (
        ormRepo: Repository<TypeOrmUserFavoriteQuizEntity>,
        criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmUserFavoriteQuizEntity>>,
      ) => new TypeOrmUserFavoriteQuizRepository(ormRepo, criteriaApplier),
      inject: [getRepositoryToken(TypeOrmUserFavoriteQuizEntity), 'CriteriaApplier'],
    },
    {
      provide: 'QuizRepository',
      useFactory: (
        ormRepo: Repository<TypeOrmQuizEntity>,
        advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmQuizEntity>>,
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
        advancedCriteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>>
      ) => new TypeOrmSinglePlayerGameRepository(ormRepo, advancedCriteriaApplier),
      inject: [getRepositoryToken(TypeOrmSinglePlayerGameEntity), 'AdvancedCriteriaApplier'],
    },
    {
      provide: 'AddUserFavoriteQuizUseCase',
      useFactory: (userFavoriteRepository: UserFavoriteQuizRepository,
        quizRepository: QuizRepository
      ) =>
        new AddUserFavoriteQuizUseCase(userFavoriteRepository, quizRepository),
      inject: ['UserFavoriteQuizRepository', 'QuizRepository'],
    },
    {
      provide: 'DeleteUserFavoriteQuizUseCase',
      useFactory: (repository: UserFavoriteQuizRepository) =>
        new DeleteUserFavoriteQuizUseCase(repository),
      inject: ['UserFavoriteQuizRepository'],
    },
    {
      provide: 'GetUserFavoriteQuizzesUseCase',
      useFactory: (favoritesRepo: UserFavoriteQuizRepository,
        quizRepo: QuizRepository,
        userRepo: UserRepository
      ) =>
        new GetUserFavoriteQuizzesUseCase(favoritesRepo, quizRepo, userRepo),
      inject: ['UserFavoriteQuizRepository', 'QuizRepository', 'UserRepository'],
    },
    {
      provide: 'GetAllUserQuizzesUseCase',
      useFactory: (quizRepository: QuizRepository, userRepo: UserRepository) =>
        new GetAllUserQuizzesUseCase(quizRepository, userRepo),
      inject: ['QuizRepository', 'UserRepository'],
    },
    {
      provide: 'GetInProgressQuizzesUseCase',
      useFactory: (quizRepository: QuizRepository,
        userRepo: UserRepository,
        singlePlayerRepo: SinglePlayerGameRepository) =>
        new GetInProgressQuizzesUseCase(quizRepository, userRepo, singlePlayerRepo),
      inject: ['QuizRepository', 'UserRepository', 'SinglePlayerGameRepository'],
    },
    {
      provide: 'GetCompletedQuizzesUseCase',
      useFactory: (quizRepository: QuizRepository,
        userRepo: UserRepository,
        singlePlayerRepo: SinglePlayerGameRepository) =>
        new GetCompletedQuizzesUseCase(quizRepository, userRepo, singlePlayerRepo),
      inject: ['QuizRepository', 'UserRepository', 'SinglePlayerGameRepository'],
    },
  ],

})
export class LibraryModule {}
