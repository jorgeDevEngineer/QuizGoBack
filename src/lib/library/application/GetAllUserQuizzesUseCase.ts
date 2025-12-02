import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { QuizId, UserId } from '../domain/valueObject/Quiz';

export class GetAllUserQuizzesUseCase {
constructor(private readonly quizRepository: QuizRepository) {}

  async run(id: string): Promise<Quiz[]> {
    // 1. Convertir string a Value Object
     const userId = UserId.of(id);
    
        // 2. Llamar al método de búsqueda del repositorio
        const quizzes = await this.quizRepository.searchByAuthor(userId);
    
        // Aquí podrías aplicar filtros adicionales en memoria si el repo fuera muy básico,
        // pero idealmente el repo ya te devuelve solo los de ese autor.
        
        return quizzes;
  }
}