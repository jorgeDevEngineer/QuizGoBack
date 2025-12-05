import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizRepository } from '../../../domain/port/QuizRepository';
import { Quiz } from '../../../../kahoot/domain/entity/Quiz';
import {
  QuizId,
  UserId,
  QuizTitle,
  QuizDescription,
  Visibility,
  ThemeId,
  QuizStatus,
  QuizCategory,
} from '../../../../kahoot/domain/valueObject/Quiz';
import { TypeOrmQuizEntity } from '../../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity';
import { Question } from '../../../../kahoot/domain/entity/Question';
import { Answer } from '../../../../kahoot/domain/entity/Answer';
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from '../../../../kahoot/domain/valueObject/Question';
import { MediaId as MediaIdVO } from '../../../../media/domain/valueObject/Media';
import {
  AnswerId,
  AnswerText,
  IsCorrect,
} from '../../../../kahoot/domain/valueObject/Answer';
import { UserId as UserIdVO } from '../../../../user/domain/valueObject/UserId';
import { QuizQueryCriteria } from 'src/lib/library/domain/valueObject/QuizQueryCriteria';
import { CriteriaApplier } from 'src/lib/library/domain/port/CriteriaApplier';

export class TypeOrmQuizRepository implements QuizRepository {
  constructor(
    @InjectRepository(TypeOrmQuizEntity)
    private readonly repository: Repository<TypeOrmQuizEntity>,
    private readonly criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmQuizEntity>, QuizQueryCriteria>
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

  async find(id: QuizId): Promise<Quiz | null> {
    const quizEntity = await this.repository.findOne({
      where: { id: id.value },
    });
    if (!quizEntity) return null;
    return this.mapToDomain(quizEntity);
  }

  async searchByAuthor(authorId: UserIdVO, criteria: QuizQueryCriteria): Promise<[Quiz[], number]> {
    let qb = this.repository.createQueryBuilder('quiz');
    qb.where('quiz.userId = :authorId', { authorId: authorId.value });
  
    // aplicar criterios avanzados sobre la tabla de quizzes
    qb = this.criteriaApplier.apply(qb, criteria, 'quiz');
  
    const [rows, totalCount] = await qb.getManyAndCount();
    const quizzes = rows.map((q) => this.mapToDomain(q));
  
    return [quizzes, totalCount];
  }

    async quizExists(quizId: QuizId): Promise<boolean> {
      return await this.repository.exists({ where: { id: quizId.value } });
    }

    async findByIds(ids: QuizId[], criteria: QuizQueryCriteria): Promise<Quiz[]> {
      let qb = this.repository.createQueryBuilder('quiz');
      qb.where('quiz.id IN (:...ids)', { ids: ids.map(id => id.value) });
  
      // 🔑 aplicar criterios completos sobre la tabla de quizzes
      qb = this.criteriaApplier.apply(qb, criteria, 'quiz');
  
      const rows = await qb.getMany();
  
      // mapear a entidades de dominio Quiz
      return rows.map(row => this.mapToDomain(row));
    }  
}
