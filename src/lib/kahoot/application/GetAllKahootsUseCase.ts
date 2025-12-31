import { Inject, Injectable } from '@nestjs/common';
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Result } from '../../shared/Type Helpers/result';
import { IHandler } from 'src/lib/shared/IHandler';

@Injectable()
export class GetAllKahootsUseCase implements IHandler<void, Result<Quiz[]>> {
  constructor(
    @Inject('QuizRepository')
    private readonly quizRepository: QuizRepository,
  ) {}

  async execute(): Promise<Result<Quiz[]>> {
    const quizzes = await this.quizRepository.searchByAuthor();
    return Result.ok<Quiz[]>(quizzes);
  }
}
