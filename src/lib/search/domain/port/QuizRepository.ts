import { Quiz } from '../entity/Quiz';
import { QuizCategory, QuizId, UserId } from '../valueObject/Quiz';

export interface QuizRepository {
        /**
        * Busca todos los Quizzes segun los parametros de busqueda.
         */
    search(params: {
            q?: string;
            categories?: string[];
            limit: number;
            page: number;
            orderBy: string;
            order: 'asc' | 'desc';
    }): Promise<{
            data: Quiz[];
            pagination: {
                page: number;
                limit: number;
                totalCount: number;
                totalPages: number;
            };
    }>;
    
    /**
    * Busca los Quizzes mas destacados segun el limite de quizzes.
    */
    findFeatured(limit: number): Promise<Quiz[]>;

    getCategories(): Promise<QuizCategory[]>;
    

}

/**
Atomicidad: El método save es responsable de garantizar que el Quiz y todas sus partes (questions, answers) se guarden en una sola transacción o unidad de trabajo. Si el Quiz se guarda, sus preguntas también.

Reconstrucción: El método find no devuelve datos crudos de la BD. Devuelve una instancia de la clase Quiz completamente hidratada (con sus VOs y entidades hijas listas para usarse).

Sin Repositorios Hijos: Nota que no existe QuestionRepository. Si quieres agregar una pregunta, obtienes el Quiz con find, agregas la pregunta en memoria (quiz.addQuestion(...)) y vuelves a llamar a save
 */