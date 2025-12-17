import { Quiz } from 'src/lib/kahoot/domain/entity/Quiz';
import { QuizId } from 'src/lib/kahoot/domain/valueObject/Quiz';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { QuizQueryCriteria } from '../../application/Response Types/QuizQueryCriteria';

export interface QuizRepository {
    /**
     * Busca un Quiz por su identificador único.
     * Debe reconstruir el agregado completo (incluyendo preguntas y respuestas).
     */
    find(id: QuizId): Promise<Quiz | null>;
    searchByAuthor(authorId: UserId, criteria: QuizQueryCriteria): Promise<[Quiz[], number]>;
    quizExists(quizId: QuizId): Promise<boolean>;
    findByIds(ids: QuizId[], criteria: QuizQueryCriteria): Promise<Quiz[]>
}

/**
Reconstrucción: El método find no devuelve datos crudos de la BD. Devuelve una instancia de la clase Quiz completamente hidratada (con sus VOs y entidades hijas listas para usarse).*/