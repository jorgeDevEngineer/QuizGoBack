import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { QuizId } from '../domain/valueObject/Quiz';

export class GetQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async run(id: string): Promise<Quiz> {
    // 1. Convertir string a Value Object
    const quizId = QuizId.of(id);

    // 2. Buscar en el repositorio
    const quiz = await this.quizRepository.find(quizId);

    // 3. Validar existencia
    if (!quiz) {
      throw new Error(`Quiz with id <${id}> not found`); 
      // Esto el Controller lo debe capturar y devolver un 404
    }

    return quiz;
  }
}