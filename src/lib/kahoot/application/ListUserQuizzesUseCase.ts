import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { UserId } from '../domain/valueObject/Quiz';

export class ListUserQuizzesUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async run(authorId: string): Promise<Quiz[]> {
    // 1. Convertir el ID del usuario (que viene del token) a VO
    const userId = UserId.of(authorId);

    // 2. Llamar al método de búsqueda del repositorio
    const quizzes = await this.quizRepository.searchByAuthor(userId);

    // Aquí podrías aplicar filtros adicionales en memoria si el repo fuera muy básico,
    // pero idealmente el repo ya te devuelve solo los de ese autor.
    
    return quizzes;
  }
}