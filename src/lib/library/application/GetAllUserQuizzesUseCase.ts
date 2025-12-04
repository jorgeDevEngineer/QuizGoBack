import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from 'src/lib/kahoot/domain/entity/Quiz';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { QueryParamsDto, QueryParamsInput } from './DTOs/QueryParamsDTO';
import { UserIdDTO } from "./DTOs/UserIdDTO";
export class GetAllUserQuizzesUseCase {
constructor(private readonly quizRepository: QuizRepository) {}

  async run(id: UserIdDTO, queryInput: QueryParamsInput) {
    const query = new QueryParamsDto(queryInput);
    const criteria = query.toCriteria();
    // 1. Convertir string a Value Object
     const userId = new UserId(id.userId);
    
        // 2. Llamar al método de búsqueda del repositorio
        const [quizzes, totalCount] = await this.quizRepository.searchByAuthor(userId, criteria);
    
        // Aquí podrías aplicar filtros adicionales en memoria si el repo fuera muy básico,
        // pero idealmente el repo ya te devuelve solo los de ese autor.
        
        return {
          quizzes: quizzes.map(quiz => quiz.toPlainObject()),
          pagination: {
            page: criteria.page,
            limit: criteria.limit,
            totalCount,
            totalPages: Math.ceil(totalCount / criteria.limit),
          }
        };
  }
}