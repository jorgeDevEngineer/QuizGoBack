
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
import { QuizId, UserId, QuizTitle, QuizDescription, Visibility, ThemeId, QuizStatus, QuizCategory } from '../domain/valueObject/Quiz';
import { QuestionId, QuestionText, QuestionType, TimeLimit, Points } from '../domain/valueObject/Question';
import { AnswerId, IsCorrect, AnswerText } from '../domain/valueObject/Answer';
import { MediaId as MediaIdVO } from '../../media/domain/valueObject/Media';
import { Result } from '../../shared/Type Helpers/result';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { IHandler } from 'src/lib/shared/IHandler';

// Interfaces para el DTO de actualización...

export class UpdateQuizUseCase implements IHandler<UpdateQuiz, Result<Quiz>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(request: UpdateQuiz): Promise<Result<Quiz>> {
    try {
      const quizId = QuizId.of(request.quizId);
      const authorId = UserId.of(request.authorId);

      const quiz = await this.quizRepository.find(quizId);
      if (!quiz) {
        return Result.fail<Quiz>('Quiz not found'); // <-- CORREGIDO
      }

      // ... (resto del mapeo)
      const title = QuizTitle.of(request.title || quiz.toPlainObject().title);
      const description = QuizDescription.of(request.description || quiz.toPlainObject().description);
      const visibility = Visibility.fromString(request.visibility || quiz.toPlainObject().visibility);
      const status = QuizStatus.fromString(request.status || quiz.toPlainObject().status);
      const category = QuizCategory.of(request.category || quiz.toPlainObject().category);
      const themeId = ThemeId.of(request.themeId || quiz.toPlainObject().themeId);
      const coverImageId = request.coverImageId ? MediaIdVO.of(request.coverImageId) : null;

      const newQuestions = request.questions.map(qData => {
        const questionId = qData.id ? QuestionId.of(qData.id) : QuestionId.generate();
        const answers = (qData.answers || []).map(aData => {
          const answerId = aData.id ? AnswerId.of(aData.id) : AnswerId.generate();
          return Answer.createTextAnswer(answerId, AnswerText.of(aData.text), IsCorrect.fromBoolean(aData.isCorrect));
        });

        return Question.create(
          questionId, QuestionText.of(qData.text), qData.mediaId ? MediaIdVO.of(qData.mediaId) : null,
          QuestionType.fromString(qData.type), TimeLimit.of(qData.timeLimit), Points.of(qData.points), answers
        );
      });

      quiz.update(
        authorId, title, description, visibility, status, category, themeId, coverImageId, newQuestions
      );

      await this.quizRepository.save(quiz);
      return Result.ok(quiz);

    } catch (e) {
      return Result.fail<Quiz>(e.message); // <-- CORREGIDO
    }
  }
}
// Las interfaces UpdateQuiz, UpdateQuestion y UpdateAnswer se omiten por brevedad
interface UpdateAnswer {
  id?: string;
  text: string;
  isCorrect: boolean;
  mediaId: string | null;
}

interface UpdateQuestion {
  id?: string;
  text: string;
  type: 'single' | 'multiple' | 'true_false' | 'quiz';
  timeLimit: number;
  points: number;
  position?: number;
  mediaId: string | null;
  answers?: UpdateAnswer[];
}

export interface UpdateQuiz {
  quizId: string;
  authorId: string;
  title?: string;
  description?: string | null;
  visibility?: 'public' | 'private';
  status?: 'draft' | 'publish';
  category?: string;
  themeId?: string;
  coverImageId?: string | null;
  questions: UpdateQuestion[];
}
