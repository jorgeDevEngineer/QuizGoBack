
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { IUseCase } from '../../../common/use-case.interface';
import { Result } from '../../../common/domain/result';
import { Question } from '../domain/entity/Question';
import { Answer } from '../domain/entity/Answer';
import { MediaId as MediaIdVO } from '../../media/domain/valueObject/Media';
import {
    QuizId, UserId, QuizTitle, QuizDescription, Visibility, QuizStatus, 
    QuizCategory, ThemeId
} from '../domain/valueObject/Quiz';
import {
    QuestionId, QuestionText, QuestionType, TimeLimit, Points
} from '../domain/valueObject/Question';
import {
    AnswerId, AnswerText, IsCorrect
} from '../domain/valueObject/Answer';
import { DomainException } from '../../../common/domain/domain.exception';

// DTOs para la entrada de datos.
export interface CreateAnswerDto {
    text: string | null;
    isCorrect: boolean;
    mediaId: string | null;
}

export interface CreateQuestion {
    text: string;
    questionType: 'quiz' | 'true_false';
    timeLimit: number;
    points: number;
    mediaId: string | null;
    answers: CreateAnswerDto[];
}

export interface CreateQuiz {
    authorId: string;
    title: string;
    description: string;
    visibility: 'public' | 'private';
    status: 'draft' | 'published';
    category: string;
    themeId: string;
    coverImageId: string | null;
    questions: CreateQuestion[];
}

export class CreateQuizUseCase implements IUseCase<CreateQuiz, Result<Quiz>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(dto: CreateQuiz): Promise<Result<Quiz>> {

    // 1. Crear Value Objects. DomainExceptions will be thrown on validation failure.
    const authorId = UserId.of(dto.authorId);
    const title = QuizTitle.of(dto.title);
    const description = QuizDescription.of(dto.description);
    const visibility = Visibility.fromString(dto.visibility);
    const status = QuizStatus.fromString(dto.status);
    const category = QuizCategory.of(dto.category);
    const themeId = ThemeId.of(dto.themeId);
    const coverImageId = dto.coverImageId ? MediaIdVO.of(dto.coverImageId) : null;

    // 2. Build Question and Answer entities from DTOs.
    const questions: Question[] = [];
    for (const qDto of dto.questions) {
        const answers: Answer[] = [];
        for (const aDto of qDto.answers) {
            if (aDto.text && aDto.mediaId) {
                 throw new DomainException('Answer cannot have both text and mediaId');
            }
            if (!aDto.text && !aDto.mediaId) {
                throw new DomainException('Answer must have either text or mediaId');
            }

            const answerId = AnswerId.generate();
            const isCorrect = IsCorrect.fromBoolean(aDto.isCorrect);
            let answer: Answer;

            if (aDto.text) {
                answer = Answer.createTextAnswer(answerId, AnswerText.of(aDto.text), isCorrect);
            } else {
                answer = Answer.createMediaAnswer(answerId, MediaIdVO.of(aDto.mediaId!), isCorrect);
            }
            answers.push(answer);
        }

        const question = Question.create(
            QuestionId.generate(),
            QuestionText.of(qDto.text),
            qDto.mediaId ? MediaIdVO.of(qDto.mediaId) : null,
            QuestionType.fromString(qDto.questionType),
            TimeLimit.of(qDto.timeLimit),
            Points.of(qDto.points),
            answers
        );
        questions.push(question);
    }

    // 3. Create the Aggregate Root (Quiz)
    const quiz = Quiz.create(
        QuizId.generate(),
        authorId,
        title,
        description,
        visibility,
        status,
        category,
        themeId,
        coverImageId,
        questions
    );

    // 4. Persist the aggregate. Infrastructure errors will bubble up to the decorator.
    await this.quizRepository.save(quiz);

    // If no exceptions were thrown, return a success result.
    return Result.ok<Quiz>(quiz);
  }
}
