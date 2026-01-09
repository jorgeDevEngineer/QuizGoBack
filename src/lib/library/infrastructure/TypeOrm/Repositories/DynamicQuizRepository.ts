import { Injectable } from "@nestjs/common";
import { ObjectId, Repository, SelectQueryBuilder } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { QuizRepository } from "../../../domain/port/QuizRepository";
import { Quiz } from "../../../../kahoot/domain/entity/Quiz";
import {
  QuizId,
  UserId,
  QuizTitle,
  QuizDescription,
  Visibility,
  ThemeId,
  QuizStatus,
  QuizCategory,
} from "../../../../kahoot/domain/valueObject/Quiz";
import { TypeOrmQuizEntity } from "../../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { Question } from "../../../../kahoot/domain/entity/Question";
import { Answer } from "../../../../kahoot/domain/entity/Answer";
import {
  QuestionId,
  QuestionText,
  QuestionType,
  TimeLimit,
  Points,
} from "../../../../kahoot/domain/valueObject/Question";
import {
  AnswerId,
  AnswerText,
  IsCorrect,
} from "../../../../kahoot/domain/valueObject/Answer";
import { UserId as UserIdVO } from "../../../../user/domain/valueObject/UserId";
import { QuizQueryCriteria } from "src/lib/library/application/Response Types/QuizQueryCriteria";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import {
  MongoAdvancedCriteriaApplier,
  MongoFindParams,
} from "../Criteria Appliers/Mongo/MongoAdvancedCriteriaApplier";
import { CriteriaApplier } from "src/lib/library/domain/port/CriteriaApplier";

type MongoQuizDoc = {
  _id: ObjectId; // ID nativo de Mongo
  userId: string; // autor del quiz
  title: string;
  description: string;
  visibility: string; // "public" | "private" | etc.
  status: string; // "COMPLETED" | "IN_PROGRESS" | etc.
  category: string;
  themeId: string;
  coverImageId?: string;
  createdAt: Date;
  playCount: number;
  questions: {
    id: string;
    text: string;
    type: string;
    mediaId?: string;
    timeLimit: number;
    points: number;
    answers: {
      id: string;
      text?: string;
      mediaId?: string;
      isCorrect: boolean;
    }[];
  }[];
};

@Injectable()
export class DynamicQuizRepository implements QuizRepository {
  constructor(
    @InjectRepository(TypeOrmQuizEntity)
    private readonly repository: Repository<TypeOrmQuizEntity>,
    private readonly pgCriteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmQuizEntity>,
      QuizQueryCriteria
    >,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoAdvancedCriteriaApplier<any>
  ) {}

  private mapToDomain(q: TypeOrmQuizEntity): Quiz {
    const questions = q.questions.map((qData) => {
      const answers = qData.answers.map((aData) => {
        if (aData.text) {
          return Answer.createTextAnswer(
            AnswerId.of(aData.id),
            AnswerText.of(aData.text),
            IsCorrect.fromBoolean(aData.isCorrect)
          );
        }
        return Answer.createMediaAnswer(
          AnswerId.of(aData.id),
          aData.mediaId,
          IsCorrect.fromBoolean(aData.isCorrect)
        );
      });
      return Question.create(
        QuestionId.of(qData.id),
        QuestionText.of(qData.text),
        qData.mediaId,
        QuestionType.fromString(qData.type),
        TimeLimit.of(qData.timeLimit),
        Points.of(qData.points),
        answers
      );
    });

    return Quiz.fromDb(
      QuizId.of(q.id),
      UserId.of(q.userId),
      QuizTitle.of(q.title),
      QuizDescription.of(q.description),
      Visibility.fromString(q.visibility),
      QuizStatus.fromString(q.status),
      QuizCategory.of(q.category),
      ThemeId.of(q.themeId),
      q.coverImageId,
      q.createdAt,
      q.playCount,
      questions
    );
  }

  private mapMongoToDomain(doc: MongoQuizDoc): Quiz {
    const questions = doc.questions.map((qData) => {
      const answers = qData.answers.map((aData) => {
        if (aData.text) {
          return Answer.createTextAnswer(
            AnswerId.of(aData.id),
            AnswerText.of(aData.text),
            IsCorrect.fromBoolean(aData.isCorrect)
          );
        }
        return Answer.createMediaAnswer(
          AnswerId.of(aData.id),
          aData.mediaId!,
          IsCorrect.fromBoolean(aData.isCorrect)
        );
      });

      return Question.create(
        QuestionId.of(qData.id),
        QuestionText.of(qData.text),
        qData.mediaId,
        QuestionType.fromString(qData.type),
        TimeLimit.of(qData.timeLimit),
        Points.of(qData.points),
        answers
      );
    });

    return Quiz.fromDb(
      QuizId.of(doc._id.toString()), // 🔑 usamos el _id de Mongo como identificador
      UserId.of(doc.userId),
      QuizTitle.of(doc.title),
      QuizDescription.of(doc.description),
      Visibility.fromString(doc.visibility),
      QuizStatus.fromString(doc.status),
      QuizCategory.of(doc.category),
      ThemeId.of(doc.themeId),
      doc.coverImageId,
      doc.createdAt,
      doc.playCount,
      questions
    );
  }

  async find(id: QuizId): Promise<Quiz | null> {
    try {
      const db = await this.mongoAdapter.getConnection("kahoot");
      const collection = db.collection<MongoQuizDoc>("quizzes");
      const doc = await collection.findOne({ _id: new ObjectId(id.value) });
      return doc ? this.mapMongoToDomain(doc) : null;
    } catch {
      const quizEntity = await this.repository.findOne({
        where: { id: id.value },
      });
      return quizEntity ? this.mapToDomain(quizEntity) : null;
    }
  }

  async searchByAuthor(
    authorId: UserIdVO,
    criteria: QuizQueryCriteria
  ): Promise<[Quiz[], number]> {
    try {
      const db = await this.mongoAdapter.getConnection("kahoot");
      const collection = db.collection<MongoQuizDoc>("quizzes");

      const params: MongoFindParams<any> = {
        filter: { userId: authorId.value },
      };
      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );

      const docs = await collection.find(filter, options).toArray();
      return [docs.map((doc) => this.mapMongoToDomain(doc)), docs.length];
    } catch {
      let qb = this.repository.createQueryBuilder("quiz");
      qb.where("quiz.userId = :authorId", { authorId: authorId.value });
      qb = this.pgCriteriaApplier.apply(qb, criteria, "quiz");
      const [rows, totalCount] = await qb.getManyAndCount();
      return [rows.map((q) => this.mapToDomain(q)), totalCount];
    }
  }

  async quizExists(quizId: QuizId): Promise<boolean> {
    try {
      const db = await this.mongoAdapter.getConnection("kahoot");
      const collection = db.collection("quizzes");
      const count = await collection.countDocuments({
        _id: new ObjectId(quizId.value),
      });
      return count > 0;
    } catch {
      return await this.repository.exists({ where: { id: quizId.value } });
    }
  }

  async findByIds(ids: QuizId[], criteria: QuizQueryCriteria): Promise<Quiz[]> {
    try {
      const db = await this.mongoAdapter.getConnection("kahoot");
      const collection = db.collection<MongoQuizDoc>("quizzes");

      const params: MongoFindParams<any> = {
        filter: { _id: { $in: ids.map((id) => id.value) } },
      };
      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );

      const docs = await collection.find(filter, options).toArray();
      return docs.map((doc) => this.mapMongoToDomain(doc));
    } catch {
      let qb = this.repository.createQueryBuilder("quiz");
      qb.where("quiz.id IN (:...ids)", { ids: ids.map((id) => id.value) });
      qb = this.pgCriteriaApplier.apply(qb, criteria, "quiz");
      const rows = await qb.getMany();
      return rows.map((row) => this.mapToDomain(row));
    }
  }
}
