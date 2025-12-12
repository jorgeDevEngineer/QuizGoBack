import { User } from "src/lib/user/domain/aggregate/User";
import { QuizResponse } from "./QuizResponse";
import { Quiz } from "src/lib/kahoot/domain/entity/Quiz";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";

/**
 * Tipo de respuesta para un Quiz en progreso
 */
export type PlayingQuizResponse = QuizResponse & {
  gameId: string;
  gameType: string;
};

/**
 * Funcion que genera una respuesta de tipo PlayingQuizResponse usando el quiz, el autor, el juego en progreso y el tipo de juego.
 */
export function toPlayingQuizResponse(
  quiz: Quiz,
  author: User,
  inProgressQuiz: SinglePlayerGame,
  gameType: string
): PlayingQuizResponse {
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
    gameId: inProgressQuiz.getGameId().getId(),
    gameType: gameType,
  };
}
