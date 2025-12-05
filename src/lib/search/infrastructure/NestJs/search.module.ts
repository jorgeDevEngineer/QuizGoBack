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

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmQuizEntity, TypeOrmUserEntity])],
  controllers: [SearchController],
  providers: [
    SearchQuizzesUseCase,
    GetFeaturedQuizzesUseCase,
    GetCategoriesUseCase,
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: 'UserRepository',
      useClass: TypeOrmUserRepository,
    },
  ],
  exports: [SearchQuizzesUseCase, GetFeaturedQuizzesUseCase, GetCategoriesUseCase],
})
export class SearchModule {}
