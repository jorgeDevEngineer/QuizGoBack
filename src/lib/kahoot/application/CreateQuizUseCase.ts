import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
// Importamos los VOs necesarios
import { QuizId, UserId, QuizTitle, QuizDescription, Visibility, ThemeId, QuizStatus, QuizCategory } from '../domain/valueObject/Quiz';
import { QuestionId, QuestionText, QuestionType, TimeLimit, Points } from '../domain/valueObject/Question';
import { AnswerId, IsCorrect, AnswerText } from '../domain/valueObject/Answer';
import { MediaId as MediaIdVO } from '../../media/domain/valueObject/Media';

// Definimos la estructura de entrada (el JSON del Request)
export interface CreateQuizDto {
  authorId: string;
  title: string;
  description: string;
  coverImageId?: string;
  visibility: 'public' | 'private';
  status: 'draft' | 'published';
  category: string;
  themeId: string;
  questions: Array<{
    questionText: string;
    mediaId?: string;
    questionType: 'quiz' | 'true_false';
    timeLimit: number;
    points: number;
    answers: Array<{
      answerText: string | null;
      mediaId: string | null;
      isCorrect: boolean;
    }>
  }>
}

export class CreateQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async run(request: CreateQuizDto): Promise<Quiz> {
    
    // 1. Mapeo de Preguntas y Respuestas (De Primitivos a Entidades)
    const questionsEntities: Question[] = request.questions.map(qData => {
      
      const answersEntities: Answer[] = qData.answers.map((aData) => {
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
          // Relanzamos el error con un mensaje más específico para la capa de aplicación/controlador
          throw new Error(`Invalid answer data provided: ${error.message}`);
        }
      });

      // Factory de Question
      return Question.create(
        QuestionId.generate(),
        QuestionText.of(qData.questionText),
        qData.mediaId ? MediaIdVO.of(qData.mediaId) : null,
        QuestionType.fromString(qData.questionType),
        TimeLimit.of(qData.timeLimit),
        Points.of(qData.points || 1000), // Valor por defecto si no viene
        answersEntities
      );
    });

    // 2. Creación de la Raíz del Agregado (Quiz)
    const quiz = Quiz.create(
      QuizId.generate(),
      UserId.of(request.authorId), // Usamos el authorId del DTO
      QuizTitle.of(request.title),
      QuizDescription.of(request.description),
      Visibility.fromString(request.visibility),
      QuizStatus.fromString(request.status),
      QuizCategory.of(request.category),
      ThemeId.of(request.themeId),
      request.coverImageId ? MediaIdVO.of(request.coverImageId) : null,
      questionsEntities,
      0 // playCount
    );

    // 3. Persistencia
    await this.quizRepository.save(quiz);

    return quiz;
  }
}