import { Module } from '@nestjs/common';
import { LibraryController } from './library.controller';
import { AddUserFavoriteQuizUseCase } from '../../application/Services/AddUserFavoriteQuizUseCase';
import { DeleteUserFavoriteQuizUseCase } from '../../application/Services/DeleteUserFavoriteQuizUseCase';
import { GetUserFavoriteQuizzesUseCase } from '../../application/Services/GetUserFavoriteQuizzesUseCase';
import { GetAllUserQuizzesUseCase } from '../../application/Services/GetAllUserQuizzesUseCase';
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { TypeOrmUserFavoriteQuizRepository } from '../TypeOrm/Repositories/TypeOrmUserFavoriteQuizRepository';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUserFavoriteQuizEntity } from '../TypeOrm/Entities/TypeOrmUserFavoriteQuizEntity';
import { TypeOrmQuizEntity } from '../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity';
import { TypeOrmQuizRepository } from '../TypeOrm/Repositories/TypeOrmQuizRepository';
import { UserRepository } from '../../../user/domain/port/UserRepository';
import { TypeOrmUserEntity } from '../../../user/infrastructure/TypeOrm//TypeOrmUserEntity';
import { TypeOrmUserRepository } from '../../../user/infrastructure/TypeOrm/TypeOrmUserRepository';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { CriteriaApplier } from '../../domain/port/CriteriaApplier';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { TypeOrmCriteriaApplier } from '../TypeOrm//Criteria Appliers/TypeOrmCriteriaApplier';
import { TypeOrmAdvancedCriteriaApplier } from '../TypeOrm/Criteria Appliers/TypeOrmAdvancedCriteriaApplier';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserFavoriteQuizEntity, TypeOrmQuizEntity, TypeOrmUserEntity])],
  controllers: [LibraryController],
  providers: [
    {
      provide: 'CriteriaApplier',
      useClass: TypeOrmCriteriaApplier, // tu implementación genérica
    },{
      provide: 'AdvancedCriteriaApplier',
      useClass: TypeOrmAdvancedCriteriaApplier, // usado en quizzes
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
  ],

})
export class LibraryModule {}
