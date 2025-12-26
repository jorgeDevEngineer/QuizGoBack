
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
import {
  QuizId,
  UserId,
  QuizTitle,
  QuizDescription,
  Visibility,
  ThemeId,
  QuizStatus,
  QuizCategory,
} from '../domain/valueObject/Quiz';
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from '../domain/valueObject/Question';
import { AnswerId, IsCorrect, AnswerText } from '../domain/valueObject/Answer';
import { MediaId as MediaIdVO } from '../../media/domain/valueObject/Media';
import { IUseCase } from '../../../common/interfaces/use-case.interface';

export interface CreateQuizDto {
  authorId: string;
  title: string | null;
  description: string | null;
  coverImageId?: string;
  visibility: 'public' | 'private';
  status: 'draft' | 'published';
  category: string | null;
  themeId: string;
  questions: Array<{
    text: string | null;
    mediaId?: string;
    questionType: 'quiz' | 'true_false';
    timeLimit: number;
    points: number | null;
    answers: Array<{
      text: string | null;
      mediaId: string | null;
      isCorrect: boolean;
    }>;
  }>;
}

export class CreateQuizUseCase implements IUseCase<CreateQuizDto, Quiz> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(request: CreateQuizDto): Promise<Quiz> {
    const isdraft = request.status === 'draft';

    if (!isdraft && (!request.title || !request.description || !request.category)) {
      throw new Error(
        'Title, description, and category are required for published quizzes.',
      );
    }

    const questionsEntities: Question[] = (request.questions || []).map(
      (qData) => {
        if (!isdraft && !qData.text) {
          throw new Error('Question text is required for published quizzes.');
        }

        const answersEntities: Answer[] = (qData.answers || []).map((aData) => {
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
          qData.text ? QuestionText.of(qData.text) : null,
          qData.mediaId ? MediaIdVO.of(qData.mediaId) : null,
          QuestionType.fromString(qData.questionType),
          TimeLimit.of(qData.timeLimit),
          qData.points ? Points.of(qData.points) : null,
          answersEntities,
        );
      },
    );

    const quiz = Quiz.create(
      QuizId.generate(),
      UserId.of(request.authorId),
      request.title ? QuizTitle.of(request.title) : null,
      request.description ? QuizDescription.of(request.description) : null,
      Visibility.fromString(request.visibility),
      QuizStatus.fromString(request.status),
      request.category ? QuizCategory.of(request.category) : null,
      ThemeId.of(request.themeId),
      request.coverImageId ? MediaIdVO.of(request.coverImageId) : null,
      questionsEntities,
      0, // playCount
    );

    await this.quizRepository.save(quiz);

    return quiz;
  }
}
