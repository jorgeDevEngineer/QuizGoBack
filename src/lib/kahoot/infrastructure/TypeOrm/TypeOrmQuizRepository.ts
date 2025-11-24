import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { Quiz } from '../../domain/entity/Quiz';
import {
  QuizId,
  UserId,
  QuizTitle,
  QuizDescription,
  Visibility,
  ThemeId,
  QuizStatus,
  QuizCategory,
} from '../../domain/valueObject/Quiz';
import { TypeOrmQuizEntity } from './TypeOrmQuizEntity';
import { Question } from '../../domain/entity/Question';
import { Answer } from '../../domain/entity/Answer';
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from '../../domain/valueObject/Question';
import { MediaId as MediaIdVO } from '../../../media/domain/valueObject/Media';
import {
  AnswerId,
  AnswerText,
  IsCorrect,
} from '../../domain/valueObject/Answer';

export class TypeOrmQuizRepository implements QuizRepository {
  constructor(
    @InjectRepository(TypeOrmQuizEntity)
    private readonly repository: Repository<TypeOrmQuizEntity>,
  ) {}

  private mapToDomain(q: TypeOrmQuizEntity): Quiz {
    const questions = q.questions.map((qData) => {
      const answers = qData.answers.map((aData) => {
        if (aData.text) {
          return Answer.createTextAnswer(
            AnswerId.of(aData.id),
            AnswerText.of(aData.text),
            IsCorrect.fromBoolean(aData.isCorrect),
          );
        }
        return Answer.createMediaAnswer(
          AnswerId.of(aData.id),
          aData.mediaId ? MediaIdVO.of(aData.mediaId) : null,
          IsCorrect.fromBoolean(aData.isCorrect),
        );
      });
      return Question.create(
        QuestionId.of(qData.id),
        QuestionText.of(qData.text),
        qData.mediaId ? MediaIdVO.of(qData.mediaId) : null,
        QuestionType.fromString(qData.type),
        TimeLimit.of(qData.timeLimit),
        Points.of(qData.points),
        answers,
      );
    });

    const quiz = Quiz.fromDb(
      QuizId.of(q.id),
      UserId.of(q.userId),
      QuizTitle.of(q.title),
      QuizDescription.of(q.description),
      Visibility.fromString(q.visibility),
      QuizStatus.fromString(q.status),
      QuizCategory.of(q.category),
      ThemeId.of(q.themeId),
      q.coverImageId ? MediaIdVO.of(q.coverImageId) : null,
      q.createdAt,
      q.playCount,
      questions,
    );
    return quiz;
  }

  async save(quiz: Quiz): Promise<void> {
    const plainQuiz = quiz.toPlainObject();
    const entity = this.repository.create({
      id: plainQuiz.id,
      userId: plainQuiz.authorId,
      title: plainQuiz.title,
      description: plainQuiz.description,
      visibility: plainQuiz.visibility,
      status: plainQuiz.status,
      category: plainQuiz.category,
      themeId: plainQuiz.themeId,
      coverImageId: plainQuiz.coverImageId,
      createdAt: plainQuiz.createdAt,
      playCount: plainQuiz.playCount,
      questions: plainQuiz.questions,
    });
    await this.repository.save(entity);
  }

  async find(id: QuizId): Promise<Quiz | null> {
    const quizEntity = await this.repository.findOne({
      where: { id: id.value },
    });
    if (!quizEntity) return null;
    return this.mapToDomain(quizEntity);
  }

  async searchByAuthor(authorId: UserId): Promise<Quiz[]> {
    const quizzes = await this.repository.find({
      where: { userId: authorId.value },
    });
    return quizzes.map((q) => this.mapToDomain(q));
  }

  async delete(id: QuizId): Promise<void> {
    await this.repository.delete(id.value);
  }
}
