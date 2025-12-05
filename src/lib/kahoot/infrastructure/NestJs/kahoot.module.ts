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

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmQuizEntity])],
  controllers: [KahootController],
  providers: [
    {
      provide: 'QuizRepository',
      useClass: TypeOrmQuizRepository,
    },
    {
      provide: 'CreateQuizUseCase',
      useFactory: (repository: QuizRepository) =>
        new CreateQuizUseCase(repository),
      inject: ['QuizRepository'],
    },
    {
      provide: 'GetQuizUseCase',
      useFactory: (repository: QuizRepository) =>
        new GetQuizUseCase(repository),
      inject: ['QuizRepository'],
    },
    {
      provide: 'ListUserQuizzesUseCase',
      useFactory: (repository: QuizRepository) =>
        new ListUserQuizzesUseCase(repository),
      inject: ['QuizRepository'],
    },
    {
      provide: 'UpdateQuizUseCase',
      useFactory: (repository: QuizRepository) =>
        new UpdateQuizUseCase(repository),
      inject: ['QuizRepository'],
    },
    {
      provide: 'DeleteQuizUseCase',
      useFactory: (repository: QuizRepository) =>
        new DeleteQuizUseCase(repository),
      inject: ['QuizRepository'],
    },
  ],
  exports: [ 
    'QuizRepository', 
  ],
})
export class KahootModule {}
