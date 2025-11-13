import { Quiz } from '../entity/Quiz';
import { QuizId, UserId } from '../valueObject/Quiz';

export interface QuizRepository {
    /**
     * Persiste un Quiz en la base de datos.
     * Sirve tanto para crear uno nuevo como para actualizar uno existente.
     * Al guardar el Quiz, se deben guardar en cascada sus Questions y Answers.
     */
    save(quiz: Quiz): Promise<void>;

    /**
     * Busca un Quiz por su identificador único.
     * Debe reconstruir el agregado completo (incluyendo preguntas y respuestas).
     */
    find(id: QuizId): Promise<Quiz | null>;

    /**
     * Elimina un Quiz y todo su contenido relacionado (preguntas y respuestas).
     */
    delete(id: QuizId): Promise<void>;

    /**
     * (Opcional) Busca todos los Quizzes creados por un autor específico.
     * Útil para el dashboard del profesor/usuario.
     */
    searchByAuthor(authorId: UserId): Promise<Quiz[]>;
}

/**
Atomicidad: El método save es responsable de garantizar que el Quiz y todas sus partes (questions, answers) se guarden en una sola transacción o unidad de trabajo. Si el Quiz se guarda, sus preguntas también.

Reconstrucción: El método find no devuelve datos crudos de la BD. Devuelve una instancia de la clase Quiz completamente hidratada (con sus VOs y entidades hijas listas para usarse).

Sin Repositorios Hijos: Nota que no existe QuestionRepository. Si quieres agregar una pregunta, obtienes el Quiz con find, agregas la pregunta en memoria (quiz.addQuestion(...)) y vuelves a llamar a save
 */