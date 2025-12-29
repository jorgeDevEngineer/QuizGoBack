
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { IUseCase } from '../../../common/use-case.interface';
import { UserId } from '../domain/valueObject/Quiz';
import { Result } from '../../../common/domain/result'; 

export class ListUserQuizzesUseCase implements IUseCase<string, Result<Quiz[]>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(authorId: string): Promise<Result<Quiz[]>> {
    // DomainException from UserId.of will bubble up to the decorator
    const userId = UserId.of(authorId);

    // Infrastructure errors will bubble up to the decorator
    const quizzes = await this.quizRepository.searchByAuthor(userId);
    
    return Result.ok<Quiz[]>(quizzes);
  }
}
