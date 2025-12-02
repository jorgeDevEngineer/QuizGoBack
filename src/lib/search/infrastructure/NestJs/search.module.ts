import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { TypeOrmQuizRepository } from '../TypeOrm/TypeOrmQuizRepository';
import { TypeOrmQuizEntity } from '../TypeOrm/TypeOrmQuizEntity';
import { SearchQuizzesUseCase } from '../../application/SearchQuizzesUseCase';
import { GetFeaturedQuizzesUseCase } from '../../application/GetFeaturedQuizzesUseCase';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmQuizEntity])],
  controllers: [SearchController],
  providers: [
    SearchQuizzesUseCase,
    GetFeaturedQuizzesUseCase,
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
  ],
  exports: [SearchQuizzesUseCase, GetFeaturedQuizzesUseCase],
})
export class SearchModule {}
