
import { QuizRepository } from '../domain/port/QuizRepository';
import { Result } from '../../shared/Type Helpers/result';
import { QuizId } from '../domain/valueObject/Quiz';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { IHandler } from 'src/lib/shared/IHandler';

export class DeleteQuizUseCase implements IHandler<string, Result<void>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(id: string): Promise<Result<void>> {
    // DomainExceptions from QuizId.of will bubble up
    const quizId = QuizId.of(id);

    const existingQuiz = await this.quizRepository.find(quizId);
    if (!existingQuiz) {
      // Throw a domain exception if the quiz is not found
      throw new DomainException('Quiz not found');
    }

    // Infrastructure errors from delete will bubble up
    await this.quizRepository.delete(quizId);

    return Result.ok<void>();
  }
}
