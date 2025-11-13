import { QuizRepository } from '../domain/port/QuizRepository';
import { QuizId } from '../domain/valueObject/Quiz';
import { QuizNotFoundError } from '../domain/QuizNotFoundError';

export class DeleteQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async run(quizIdStr: string): Promise<void> {
    const quizId = QuizId.of(quizIdStr);

    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      throw new QuizNotFoundError(`Quiz <${quizIdStr}> not found`);
    }

    await this.quizRepository.delete(quizId);
  }
}