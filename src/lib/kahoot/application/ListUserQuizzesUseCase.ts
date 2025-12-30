
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { UserId } from '../domain/valueObject/Quiz';
import { Result } from '../../shared/Type Helpers/result'; 
import { IHandler } from 'src/lib/shared/IHandler';

export class ListUserQuizzesUseCase implements IHandler<string, Result<Quiz[]>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(authorId: string): Promise<Result<Quiz[]>> {
    // DomainException from UserId.of will bubble up to the decorator
    const userId = UserId.of(authorId);

    // Infrastructure errors will bubble up to the decorator
    const quizzes = await this.quizRepository.searchByAuthor(userId);
    
    return Result.ok<Quiz[]>(quizzes);
  }
}
