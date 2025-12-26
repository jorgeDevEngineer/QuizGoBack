import { QuizRepository } from '../domain/port/QuizRepository';
import { QuizId } from '../domain/valueObject/Quiz';
import { IUseCase } from '../../../common/interfaces/use-case.interface';

export class DeleteQuizUseCase implements IUseCase<string, void>{
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(quizIdStr: string): Promise<void> {
    const quizId = QuizId.of(quizIdStr);

    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      throw new Error(`Quiz <${quizIdStr}> not found`);
    }

    await this.quizRepository.delete(quizId);
  }
}