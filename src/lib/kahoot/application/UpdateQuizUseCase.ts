
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
import { QuizId, QuizTitle, QuizDescription, Visibility, ThemeId } from '../domain/valueObject/Quiz';
import { QuestionId, QuestionText, QuestionType, TimeLimit, Points } from '../domain/valueObject/Question';
import {
  AnswerId,
  IsCorrect,
  AnswerText,
} from '../domain/valueObject/Answer';
import { MediaId as MediaIdVO } from '../../media/domain/valueObject/Media';
import { CreateQuizDto } from './CreateQuizUseCase';
import { QuizNotFoundError } from '../domain/QuizNotFoundError';

export class UpdateQuizUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async run(quizIdStr: string, request: CreateQuizDto): Promise<Quiz> {
    const quizId = QuizId.of(quizIdStr);
    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      throw new QuizNotFoundError('Quiz not found');
    }

    quiz.updateMetadata(
      QuizTitle.of(request.title),
      QuizDescription.of(request.description || ''),
      Visibility.fromString(request.visibility),
      request.themeId ? ThemeId.of(request.themeId) : quiz.themeId,
      request.coverImageId ? MediaIdVO.of(request.coverImageId) : null,
    );

    const newQuestions: Question[] = request.questions.map((qData) => {
      const answers = qData.answers.map((aData) => {
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

    quiz.replaceQuestions(newQuestions);

    await this.quizRepository.save(quiz);

    return quiz;
  }
}
