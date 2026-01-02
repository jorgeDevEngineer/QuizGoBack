import { User } from "src/lib/user/domain/aggregate/User";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";

/**
 * Tipo de respuesta para un Quiz
 */
export type QuizResponse = {
  /** Identificador único del quiz (UUID) */
  id: string;

  /** Título del quiz (opcional) */
  title: string | null;

  /** Descripción del quiz (opcional) */
  description: string | null;

  /** URL de la imagen de portada (opcional) */
  coverImageId: string | null;

  /** Visibilidad del quiz */
  visibility: "public" | "private";

  /** Identificador del tema (UUID) */
  themeId: string;

  /** Autor del quiz */
  author: {
    /** Identificador único del autor (UUID) */
    id: string;
    /** Nombre del autor */
    name: string;
  };

  /** Fecha de creación en formato ISO 8601 */
  createdAt: string;

  /** Número de veces jugado */
  playCount: number;

  /** Categoría del quiz (ej. "Matematica", "Castellano") */
  category: string;

  /** Estado del quiz */
  status: "draft" | "publish";
};

export function toQuizResponse(quiz: Quiz, author: User): QuizResponse {
  const plainQuiz = quiz.toPlainObject();
  return {
    id: plainQuiz.id,
    title: plainQuiz.title ? plainQuiz.title : null,
    description: plainQuiz.description ? plainQuiz.description : null,
    coverImageId: plainQuiz.coverImageId ? plainQuiz.coverImageId : null,
    visibility: plainQuiz.visibility,
    themeId: plainQuiz.themeId,
    author: {
      id: plainQuiz.authorId,
      name: author.name.value,
    },
    createdAt: plainQuiz.createdAt.toISOString(),
    playCount: plainQuiz.playCount,
    category: plainQuiz.category,
    status: plainQuiz.status,
  };
}
