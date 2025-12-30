import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
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
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';
import { Collection, Db } from 'mongodb';

// Defines the shape of the quiz document stored in MongoDB
interface MongoQuizDocument {
  _id: string; // The primary key is a string (UUID)
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
  questions: any[]; // Kept as any for simplicity
}

@Injectable()
export class TypeOrmQuizRepository implements QuizRepository {
  constructor(
    @InjectRepository(TypeOrmQuizEntity)
    private readonly pgRepository: Repository<TypeOrmQuizEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  // The collection is now typed with the interface
  private async getMongoCollection(): Promise<Collection<MongoQuizDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('kahoot');
    return db.collection<MongoQuizDocument>('quizzes');
  }

  private mapPgToDomain(q: TypeOrmQuizEntity): Quiz {
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

    return Quiz.fromDb(
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
  }

  // The document parameter is now strongly typed
  private mapMongoToDomain(mongoDoc: MongoQuizDocument): Quiz {
    const questions = mongoDoc.questions.map((qData) => {
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
        QuestionType.fromString(qData.type), // Corrected field name
        TimeLimit.of(qData.timeLimit),
        Points.of(qData.points),
        answers,
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
      mongoDoc.coverImageId ? MediaIdVO.of(mongoDoc.coverImageId) : null,
      new Date(mongoDoc.createdAt),
      mongoDoc.playCount,
      questions,
    );
  }

  async save(quiz: Quiz): Promise<void> {
    try {
      const collection = await this.getMongoCollection();
      const plainQuiz = quiz.toPlainObject();
      const { id, ...restOfQuiz } = plainQuiz;
      
      const documentToInsert: MongoQuizDocument = {
        _id: id,
        authorId: restOfQuiz.authorId,
        title: restOfQuiz.title,
        description: restOfQuiz.description,
        visibility: restOfQuiz.visibility,
        status: restOfQuiz.status,
        category: restOfQuiz.category,
        themeId: restOfQuiz.themeId,
        coverImageId: restOfQuiz.coverImageId,
        createdAt: restOfQuiz.createdAt,
        playCount: restOfQuiz.playCount,
        questions: restOfQuiz.questions,
      };

      await collection.insertOne(documentToInsert);
    } catch (error) {
      console.error("Failed to save to MongoDB, falling back to PostgreSQL.", error);
      const plainQuiz = quiz.toPlainObject();
      const entity = this.pgRepository.create({
        id: plainQuiz.id,
        userId: plainQuiz.authorId,
        title: plainQuiz.title,
        description: plainQuiz.description,
        visibility: plainQuiz.visibility as 'public' | 'private',
        status: plainQuiz.status as 'draft' | 'published',
        category: plainQuiz.category,
        themeId: plainQuiz.themeId,
        coverImageId: plainQuiz.coverImageId,
        createdAt: plainQuiz.createdAt,
        playCount: plainQuiz.playCount,
        questions: plainQuiz.questions,
      });
      await this.pgRepository.save(entity);
    }
  }

  async find(id: QuizId): Promise<Quiz | null> {
    try {
      const collection = await this.getMongoCollection();
      const quizDoc = await collection.findOne({ _id: id.value });
      if (!quizDoc) return null;
      return this.mapMongoToDomain(quizDoc);
    } catch (error) {
      console.error("Failed to find in MongoDB, falling back to PostgreSQL.", error);
      const quizEntity = await this.pgRepository.findOne({
        where: { id: id.value },
      });
      if (!quizEntity) return null;
      return this.mapPgToDomain(quizEntity);
    }
  }

  async searchByAuthor(authorId: UserId): Promise<Quiz[]> {
    try {
        const collection = await this.getMongoCollection();
        const quizzesCursor = await collection.find({ authorId: authorId.value });
        const quizzesDocs = await quizzesCursor.toArray();
        return quizzesDocs.map(doc => this.mapMongoToDomain(doc));
    } catch (error) {
        console.error("Failed to search in MongoDB, falling back to PostgreSQL.", error);
        const quizzes = await this.pgRepository.find({
            where: { userId: authorId.value },
        });
        return quizzes.map((q) => this.mapPgToDomain(q));
    }
  }

  async delete(id: QuizId): Promise<void> {
    try {
        const collection = await this.getMongoCollection();
        await collection.deleteOne({ _id: id.value });
    } catch (error) {
        console.error("Failed to delete in MongoDB, falling back to PostgreSQL.", error);
        await this.pgRepository.delete(id.value);
    }
  }
}
