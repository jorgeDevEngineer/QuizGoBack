
import { QuizRepository } from '../domain/port/QuizRepository';
import { Quiz } from '../domain/entity/Quiz';
import { Result } from '../../shared/Type Helpers/result';
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
import { DomainException } from '../../shared/exceptions/domain.exception';
import { IHandler } from 'src/lib/shared/IHandler';
import { CreateQuestionDto } from '../infrastructure/NestJs/DTOs/create-question.dto';

export interface CreateQuiz {
    authorId: string;
    title: string;
    description: string;
    visibility: 'public' | 'private';
    status: 'draft' | 'publish';
    category: string;
    themeId: string;
    coverImageId: string | null;
    questions: CreateQuestionDto[];
}

export class CreateQuizUseCase implements IHandler<CreateQuiz, Result<Quiz>> {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(dto: CreateQuiz): Promise<Result<Quiz>> {

    const authorId = UserId.of(dto.authorId);
    const title = QuizTitle.of(dto.title);
    const description = QuizDescription.of(dto.description);
    const visibility = Visibility.fromString(dto.visibility);
    const status = QuizStatus.fromString(dto.status);
    const category = QuizCategory.of(dto.category);
    const themeId = ThemeId.of(dto.themeId);
    const coverImageId = dto.coverImageId ? MediaIdVO.of(dto.coverImageId) : null;

    const questions: Question[] = [];
    for (const qDto of dto.questions) {
        const answers: Answer[] = [];
        for (const aDto of qDto.answers) {
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
            QuestionType.fromString(qDto.type),
            TimeLimit.of(qDto.timeLimit),
            Points.of(qDto.points),
            answers
        );
        questions.push(question);
    }

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

    await this.quizRepository.save(quiz);

    return Result.ok<Quiz>(quiz);
  }
}
