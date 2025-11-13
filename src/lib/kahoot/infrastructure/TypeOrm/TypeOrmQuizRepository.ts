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
  MediaUrl,
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
          MediaUrl.of(aData.mediaUrl),
          IsCorrect.fromBoolean(aData.isCorrect),
        );
      });
      return Question.create(
        QuestionId.of(qData.id),
        QuestionText.of(qData.text),
        MediaUrl.of(qData.mediaUrl),
        QuestionType.fromString(qData.type),
        TimeLimit.of(qData.timeLimit),
        Points.of(qData.points),
        answers,
      );
    });

    const quiz = Quiz.create(
      QuizId.of(q.id),
      UserId.of(q.userId),
      QuizTitle.of(q.title),
      QuizDescription.of(q.description),
      Visibility.fromString(q.visibility),
      ThemeId.of(q.themeId),
      MediaUrl.of(q.coverImage),
      questions,
    );
    return quiz;
  }

  async save(quiz: Quiz): Promise<void> {
    const plainQuiz = quiz.toPlainObject();
    const entity = this.repository.create({
      id: plainQuiz.id,
      userId: plainQuiz.author.authorId,
      title: plainQuiz.title,
      description: plainQuiz.description,
      visibility: plainQuiz.visibility,
      themeId: plainQuiz.themeId,
      coverImage: plainQuiz.coverImage,
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
