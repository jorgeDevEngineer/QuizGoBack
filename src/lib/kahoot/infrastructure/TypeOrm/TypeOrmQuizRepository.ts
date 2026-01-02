
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection, Db } from 'mongodb';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { Quiz } from '../../domain/entity/Quiz';
import { Question } from '../../domain/entity/Question';
import { Answer } from '../../domain/entity/Answer';
import { QuizId, UserId, QuizTitle, QuizDescription, Visibility, ThemeId, QuizStatus, QuizCategory } from '../../domain/valueObject/Quiz';
import { QuestionId, QuestionText, QuestionType, TimeLimit, Points } from '../../domain/valueObject/Question';
import { AnswerId, AnswerText, IsCorrect } from '../../domain/valueObject/Answer';
import { TypeOrmQuizEntity } from './TypeOrmQuizEntity';

interface MongoQuizDocument {
  _id: string;
  authorId: string;
  title: string;
  description: string;
  visibility: string;
  status: string;
  category: string;
  themeId: string;
  coverImageId: string | null;
  createdAt: Date;
  playCount: number;
  questions: any[];
}

@Injectable()
export class TypeOrmQuizRepository implements QuizRepository {
  constructor(
    @InjectRepository(TypeOrmQuizEntity)
    private readonly pgRepository: Repository<TypeOrmQuizEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  private async getMongoCollection(): Promise<Collection<MongoQuizDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('kahoot');
    return db.collection<MongoQuizDocument>('quizzes');
  }

  async save(quiz: Quiz): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      const plainQuiz = quiz.toPlainObject();
      const mongoDoc = {
        _id: plainQuiz.id,
        ...plainQuiz,
        questions: plainQuiz.questions.map(q => ({ ...q, answers: q.answers.map(a => ({ ...a }))})),
      };
      await collection.replaceOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for save.');
      const pgEntity = this.mapDomainToPg(quiz);
      await this.pgRepository.save(pgEntity);
    }
  }

  async find(id: QuizId): Promise<Quiz | null> {
    try {
      const collection = await this.getMongoCollection();
      const quizDoc = await collection.findOne({ _id: id.value });
      return quizDoc ? this.mapMongoToDomain(quizDoc) : null;
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for find.');
      const pgEntity = await this.pgRepository.findOne({ where: { id: id.value } });
      return pgEntity ? this.mapPgToDomain(pgEntity) : null;
    }
  }

  async searchByAuthor(authorId?: UserId): Promise<Quiz[]> {
    try {
      const query = authorId ? { authorId: authorId.value } : {};
      const collection = await this.getMongoCollection();
      const quizzesCursor = await collection.find(query);
      const quizzesDocs = await quizzesCursor.toArray();
      return quizzesDocs.map(doc => this.mapMongoToDomain(doc));
    } catch (error) {
        console.log('MongoDB connection not available, falling back to PostgreSQL for search.');
        if (authorId) {
            const pgEntities = await this.pgRepository.find({ where: { userId: authorId.value } });
            return pgEntities.map(entity => this.mapPgToDomain(entity));
        }
        else {
            const pgEntities = await this.pgRepository.find();
            return pgEntities.map(entity => this.mapPgToDomain(entity));
        }
    }
  }

  async delete(id: QuizId): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      await collection.deleteOne({ _id: id.value });
    } catch (error) {
      console.log('MongoDB connection not available, falling back to PostgreSQL for delete.');
      await this.pgRepository.delete(id.value);
    }
  }
  
  // MAPPERS

  private mapMongoToDomain(mongoDoc: MongoQuizDocument): Quiz {
    const questions = mongoDoc.questions.map((qData) => {
        const answers = qData.answers.map((aData) => {
            if (aData.text) {
                return Answer.createTextAnswer(AnswerId.of(aData.id), AnswerText.of(aData.text), IsCorrect.fromBoolean(aData.isCorrect));
            } else {
                return Answer.createMediaAnswer(AnswerId.of(aData.id), aData.mediaId, IsCorrect.fromBoolean(aData.isCorrect));
            }
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
        QuizId.of(mongoDoc._id),
        UserId.of(mongoDoc.authorId),
        QuizTitle.of(mongoDoc.title),
        QuizDescription.of(mongoDoc.description),
        Visibility.fromString(mongoDoc.visibility),
        QuizStatus.fromString(mongoDoc.status),
        QuizCategory.of(mongoDoc.category),
        ThemeId.of(mongoDoc.themeId),
        mongoDoc.coverImageId,
        new Date(mongoDoc.createdAt),
        mongoDoc.playCount,
        questions
    );
  }

  private mapPgToDomain(pgEntity: TypeOrmQuizEntity): Quiz {
    const questions = pgEntity.questions.map((qData) => {
      const answers = qData.answers.map((aData) => {
          if (aData.text) {
              return Answer.createTextAnswer(AnswerId.of(aData.id), AnswerText.of(aData.text), IsCorrect.fromBoolean(aData.isCorrect));
          } else {
              return Answer.createMediaAnswer(AnswerId.of(aData.id), aData.mediaId, IsCorrect.fromBoolean(aData.isCorrect));
          }
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
        QuizId.of(pgEntity.id),
        UserId.of(pgEntity.userId),
        QuizTitle.of(pgEntity.title),
        QuizDescription.of(pgEntity.description),
        Visibility.fromString(pgEntity.visibility),
        QuizStatus.fromString(pgEntity.status),
        QuizCategory.of(pgEntity.category),
        ThemeId.of(pgEntity.themeId),
        pgEntity.coverImageId,
        pgEntity.createdAt,
        pgEntity.playCount,
        questions
    );
  }

  private mapDomainToPg(quiz: Quiz): TypeOrmQuizEntity {
    const plain = quiz.toPlainObject();
    const quizEntity = new TypeOrmQuizEntity();
    quizEntity.id = plain.id;
    quizEntity.userId = plain.authorId;
    quizEntity.title = plain.title;
    quizEntity.description = plain.description;
    quizEntity.visibility = plain.visibility;
    quizEntity.status = plain.status;
    quizEntity.category = plain.category;
    quizEntity.themeId = plain.themeId;
    quizEntity.coverImageId = plain.coverImageId;
    quizEntity.createdAt = plain.createdAt;
    quizEntity.playCount = plain.playCount;
    quizEntity.questions = plain.questions;
    return quizEntity;
  }
}
