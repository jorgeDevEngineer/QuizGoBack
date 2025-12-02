import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { TypeOrmQuizRepository } from '../TypeOrm/TypeOrmQuizRepository';
import { TypeOrmQuizEntity } from '../TypeOrm/TypeOrmQuizEntity';
import { SearchQuizzesUseCase } from '../../application/SearchQuizzesUseCase';
import { GetFeaturedQuizzesUseCase } from '../../application/GetFeaturedQuizzesUseCase';
import { GetCategoriesUseCase } from '../../application/GetCategoriesUseCase';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmQuizEntity])],
  controllers: [SearchController],
  providers: [
    SearchQuizzesUseCase,
    GetFeaturedQuizzesUseCase,
    GetCategoriesUseCase,
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
  ],
  exports: [SearchQuizzesUseCase, GetFeaturedQuizzesUseCase, GetCategoriesUseCase],
})
export class SearchModule {}
