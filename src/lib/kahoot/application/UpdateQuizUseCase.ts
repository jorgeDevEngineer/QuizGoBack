
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
import { CreateQuizDto } from './CreateQuizUseCase';

export class UpdateQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async run(quizIdStr: string, request: CreateQuizDto): Promise<Quiz> {
    const quizId = QuizId.of(quizIdStr);
    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      throw new Error('Quiz not found');
    }
    
    const isdraft = request.status === 'draft';

    if (!isdraft && (!request.title || !request.description || !request.category)) {
      throw new Error(
        'Title, description, and category are required for published quizzes.',
      );
    }

    quiz.updateMetadata(
      QuizTitle.of(request.title),
      QuizDescription.of(request.description),
      Visibility.fromString(request.visibility),
      QuizStatus.fromString(request.status),
      QuizCategory.of(request.category),
      ThemeId.of(request.themeId),
      request.coverImageId ? MediaIdVO.of(request.coverImageId) : null,
    );

    const newQuestions: Question[] = request.questions.map((qData) => {
      if (!isdraft && !qData.text) {
        throw new Error('Question text is required for published quizzes.');
      }
      
      const answers = qData.answers.map((aData) => {
        if (!isdraft && !aData.text && !aData.mediaId) {
          throw new Error(
            'Answer text or mediaId is required for published quizzes.',
          );
        }

        if ((aData.text && aData.mediaId)) {
          throw new Error(
            'Cada respuesta debe tener text o mediaId, pero no ambos.',
          );
        }

        try {
          if (aData.text) {
            return Answer.createTextAnswer(
              AnswerId.generate(),
              AnswerText.of(aData.text),
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
        QuestionText.of(qData.text),
        qData.mediaId ? MediaIdVO.of(qData.mediaId) : null,
        QuestionType.fromString(qData.questionType),
        TimeLimit.of(qData.timeLimit),
        Points.of(qData.points),
        answers,
      );
    });

    quiz.replaceQuestions(newQuestions);

    await this.quizRepository.save(quiz);

    return quiz;
  }
}
