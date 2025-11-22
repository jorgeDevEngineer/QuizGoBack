import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
import { QuizId, QuizTitle, QuizDescription, Visibility, ThemeId, QuizStatus, QuizCategory } from '../domain/valueObject/Quiz';
import { QuestionId, QuestionText, QuestionType, TimeLimit, Points } from '../domain/valueObject/Question';
import {
  AnswerId,
  IsCorrect,
  AnswerText,
} from '../domain/valueObject/Answer';
import { MediaId as MediaIdVO } from '../../media/domain/valueObject/Media';

// Reutilizamos la estructura del DTO de creación ya que el PUT envía todo
import { CreateQuizDto } from './CreateQuizUseCase';

export class UpdateQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async run(quizIdStr: string, request: CreateQuizDto): Promise<Quiz> {
    // 1. Buscar el Quiz existente
    const quizId = QuizId.of(quizIdStr);
    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      throw new Error('Quiz not found'); // Debería mapearse a 404 en el Controller
    }

    // 2. Actualizar Metadatos (usando los métodos de la Entidad)
    quiz.updateMetadata(
      QuizTitle.of(request.title),
      QuizDescription.of(request.description),
      Visibility.fromString(request.visibility),
      QuizStatus.fromString(request.status),
      QuizCategory.of(request.category),
      ThemeId.of(request.themeId),
      request.coverImageId ? MediaIdVO.of(request.coverImageId) : null,
    );

    // 3. Reconstruir las NUEVAS Preguntas (Lógica idéntica a Create)
    // Al ser un PUT, ignoramos las preguntas viejas y creamos nuevas instancias
    const newQuestions: Question[] = request.questions.map((qData) => {
      const answers = qData.answers.map((aData) => {
        if ((!aData.answerText && !aData.mediaId) || (aData.answerText && aData.mediaId)) {
          throw new Error('Cada respuesta debe tener answerText o mediaId, pero no ambos.');
        }

        try {
          if (aData.answerText) {
            return Answer.createTextAnswer(
              AnswerId.generate(),
              AnswerText.of(aData.answerText),
              IsCorrect.fromBoolean(aData.isCorrect),
            );
          } else {
            return Answer.createMediaAnswer(
              AnswerId.generate(),
              aData.mediaId ? MediaIdVO.of(aData.mediaId) : null,
              IsCorrect.fromBoolean(aData.isCorrect),
            );
          }
        } catch (error) {
          throw new Error(`Invalid answer data provided: ${error.message}`);
        }
      });

      return Question.create(
        QuestionId.generate(),
        QuestionText.of(qData.questionText),
        qData.mediaId ? MediaIdVO.of(qData.mediaId) : null,
        QuestionType.fromString(qData.questionType),
        TimeLimit.of(qData.timeLimit),
        Points.of(qData.points || 1000),
        answers,
      );
    });

    // 4. Reemplazar preguntas en el Agregado
    // NOTA: Necesitas agregar este método en tu entidad Quiz
    quiz.replaceQuestions(newQuestions);

    // 5. Guardar cambios (El repositorio hará el Update)
    await this.quizRepository.save(quiz);

    return quiz;
  }
}