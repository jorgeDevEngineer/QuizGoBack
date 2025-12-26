
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
import { CreateQuiz, CreateQuestion as CreateQuestionDto, CreateAnswerDto } from './CreateQuizUseCase'; // CORRECTED IMPORT
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';
import { DomainException } from '../../../common/domain/domain.exception';

// The Update DTO extends the Create DTO and adds the ID of the quiz to be updated.
export interface UpdateQuizDto extends CreateQuiz {
  quizId: string;
}

export class UpdateQuizUseCase implements IUseCase<UpdateQuizDto, Result<Quiz>>{
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(request: UpdateQuizDto): Promise<Result<Quiz>> {
    // DomainExceptions from QuizId.of will bubble up
    const quizId = QuizId.of(request.quizId);
    const quiz = await this.quizRepository.find(quizId);

    if (!quiz) {
      throw new DomainException('Quiz not found');
    }
    
    const isDraft = request.status === 'draft';

    if (!isDraft && (!request.title || !request.description || !request.category)) {
      throw new DomainException(
        'Title, description, and category are required for published quizzes.',
      );
    }

    // Update Quiz Metadata. Value Object validations will throw DomainExceptions.
    quiz.updateMetadata(
      QuizTitle.of(request.title),
      QuizDescription.of(request.description),
      Visibility.fromString(request.visibility),
      QuizStatus.fromString(request.status),
      QuizCategory.of(request.category),
      ThemeId.of(request.themeId),
      request.coverImageId ? MediaIdVO.of(request.coverImageId) : null
    );

    // Replace Quiz Questions
    const newQuestions: Question[] = request.questions.map((qData) => {
      if (!isDraft && !qData.text) {
        throw new DomainException('Question text is required for published quizzes.');
      }
      
      const answers = qData.answers.map((aData) => {
        if (!isDraft && !aData.text && !aData.mediaId) {
          throw new DomainException(
            'Answer text or mediaId is required for published quizzes.',
          );
        }

        if (aData.text && aData.mediaId) {
          throw new DomainException(
            'Each answer must have text or mediaId, but not both.',
          );
        }

        let answer: Answer;
        const answerId = AnswerId.generate();
        const isCorrect = IsCorrect.fromBoolean(aData.isCorrect);

        if (aData.text) {
          answer = Answer.createTextAnswer(answerId, AnswerText.of(aData.text), isCorrect);
        } else if (aData.mediaId) {
          answer = Answer.createMediaAnswer(answerId, MediaIdVO.of(aData.mediaId), isCorrect);
        } else {
           throw new DomainException('Answer must have either text or mediaId');
        }

        return answer;
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

    // Infrastructure errors will bubble up
    await this.quizRepository.save(quiz);

    return Result.ok<Quiz>(quiz);
  }
}
