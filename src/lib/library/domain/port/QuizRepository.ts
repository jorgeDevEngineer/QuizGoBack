import { Quiz } from '../entity/Quiz';
import { QuizId, UserId } from '../valueObject/Quiz';

export interface QuizRepository {
    /**
     * Busca un Quiz por su identificador único.
     * Debe reconstruir el agregado completo (incluyendo preguntas y respuestas).
     */
    find(id: QuizId): Promise<Quiz | null>;
    searchByAuthor(authorId: UserId): Promise<Quiz[]>;
    quizExists(quizId: QuizId): Promise<boolean>
}

/**
Reconstrucción: El método find no devuelve datos crudos de la BD. Devuelve una instancia de la clase Quiz completamente hidratada (con sus VOs y entidades hijas listas para usarse).*/