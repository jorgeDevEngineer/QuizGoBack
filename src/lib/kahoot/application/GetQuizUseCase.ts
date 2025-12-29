
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';
import { QuizId } from '../domain/valueObject/Quiz';
import { DomainException } from '../../../common/domain/domain.exception';

export class GetQuizUseCase implements IUseCase<string, Result<Quiz>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(id: string): Promise<Result<Quiz>> {
    // DomainExceptions from QuizId.of will bubble up
    const quizId = QuizId.of(id);

    // Infrastructure errors will bubble up
    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      // Throw a domain exception if the quiz is not found
      throw new DomainException('Quiz not found');
    }

    return Result.ok<Quiz>(quiz);
  }
}
