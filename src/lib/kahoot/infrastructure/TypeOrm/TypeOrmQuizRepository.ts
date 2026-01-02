
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { Quiz } from '../../domain/entity/Quiz';
import { QuizId, UserId, QuizTitle, QuizDescription, Visibility, ThemeId, QuizStatus, QuizCategory } from '../../domain/valueObject/Quiz';
import { TypeOrmQuizEntity } from './TypeOrmQuizEntity';
import { Question } from '../../domain/entity/Question';
import { Answer } from '../../domain/entity/Answer';
import { QuestionId, QuestionText, QuestionType, TimeLimit, Points } from '../../domain/valueObject/Question';
import { MediaId as MediaIdVO } from '../../../media/domain/valueObject/Media';
import { AnswerId, AnswerText, IsCorrect } from '../../domain/valueObject/Answer';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';
import { Collection, Db } from 'mongodb';

interface MongoQuizDocument { _id: string; authorId: string; title: string; description: string; visibility: string; status: string; category: string; themeId: string; coverImageId: string | null; createdAt: Date; playCount: number; questions: any[]; }

@Injectable()
export class TypeOrmQuizRepository implements QuizRepository {
  constructor(
    @InjectRepository(TypeOrmQuizEntity) private readonly pgRepository: Repository<TypeOrmQuizEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  private async getMongoCollection(): Promise<Collection<MongoQuizDocument>> {
    const db: Db = await this.mongoAdapter.getConnection('kahoot');
    return db.collection<MongoQuizDocument>('quizzes');
  }

  private mapPgToDomain(q: TypeOrmQuizEntity): Quiz {
    const questions = q.questions.map((qData) => {
      const answers = qData.answers.map((aData) => {
        if (aData.text) {
          return Answer.createTextAnswer(AnswerId.of(aData.id), AnswerText.of(aData.text), IsCorrect.fromBoolean(aData.isCorrect));
        } else {
          return Answer.createMediaAnswer(AnswerId.of(aData.id), aData.mediaId ? MediaIdVO.of(aData.mediaId) : null, IsCorrect.fromBoolean(aData.isCorrect));
        }
      });
      return Question.create(QuestionId.of(qData.id), QuestionText.of(qData.text), qData.mediaId ? MediaIdVO.of(qData.mediaId) : null, QuestionType.fromString(qData.type), TimeLimit.of(qData.timeLimit), Points.of(qData.points), answers);
    });
    return Quiz.fromDb(QuizId.of(q.id), UserId.of(q.userId), QuizTitle.of(q.title), QuizDescription.of(q.description), Visibility.fromString(q.visibility), QuizStatus.fromString(q.status), QuizCategory.of(q.category), ThemeId.of(q.themeId), q.coverImageId ? MediaIdVO.of(q.coverImageId) : null, q.createdAt, q.playCount, questions);
  }

  private mapMongoToDomain(mongoDoc: MongoQuizDocument): Quiz {
    const questions = mongoDoc.questions.map((qData) => {
        const answers = qData.answers.map((aData) => {
            if (aData.text) {
                return Answer.createTextAnswer(AnswerId.of(aData.id), AnswerText.of(aData.text), IsCorrect.fromBoolean(aData.isCorrect));
            } else {
                return Answer.createMediaAnswer(AnswerId.of(aData.id), aData.mediaId ? MediaIdVO.of(aData.mediaId) : null, IsCorrect.fromBoolean(aData.isCorrect));
            }
        });
        return Question.create(
            QuestionId.of(qData.id),
            QuestionText.of(qData.text),
            qData.mediaId ? MediaIdVO.of(qData.mediaId) : null,
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
        mongoDoc.coverImageId ? MediaIdVO.of(mongoDoc.coverImageId) : null,
        new Date(mongoDoc.createdAt),
        mongoDoc.playCount,
        questions
    );
  }

  async save(quiz: Quiz): Promise<void> {
    const plainQuiz = quiz.toPlainObject();
    const mongoDoc: MongoQuizDocument = {
      _id: plainQuiz.id,
      authorId: plainQuiz.authorId,
      title: plainQuiz.title,
      description: plainQuiz.description,
      visibility: plainQuiz.visibility,
      status: plainQuiz.status,
      category: plainQuiz.category,
      themeId: plainQuiz.themeId,
      coverImageId: plainQuiz.coverImageId,
      createdAt: plainQuiz.createdAt,
      playCount: plainQuiz.playCount,
      questions: plainQuiz.questions.map(q => ({
        ...q,
        answers: q.answers.map(a => ({ ...a }))
      })),
    };

    try {
        const collection = await this.getMongoCollection();
        await collection.replaceOne({ _id: mongoDoc._id }, mongoDoc, { upsert: true });
    } catch (error) {
        console.error('Failed to save to MongoDB, falling back to PostgreSQL.', error);
        const quizEntity = this.pgRepository.create(plainQuiz);
        await this.pgRepository.save(quizEntity);
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
        const quizEntity = await this.pgRepository.findOne({ where: { id: id.value } });
        if (!quizEntity) return null;
        return this.mapPgToDomain(quizEntity);
    }
  }

  async searchByAuthor(authorId?: UserId): Promise<Quiz[]> {
    const query = authorId ? { authorId: authorId.value } : {};
    const domainQuizzes: Quiz[] = [];

    try {
        const collection = await this.getMongoCollection();
        const quizzesCursor = await collection.find(query);
        const quizzesDocs = await quizzesCursor.toArray();
        for (const doc of quizzesDocs) {
            try {
                domainQuizzes.push(this.mapMongoToDomain(doc));
            } catch (mappingError) {
                console.error(`Failed to map MongoDB quiz with id ${doc._id}. Skipping.`, mappingError);
            }
        }
    } catch (error) {
        console.error("Failed to search in MongoDB, falling back to PostgreSQL.", error);
        const findOptions = authorId ? { where: { userId: authorId.value } } : {};
        const quizzes = await this.pgRepository.find(findOptions);
        for (const q of quizzes) {
            try {
                domainQuizzes.push(this.mapPgToDomain(q));
            } catch (mappingError) {
                console.error(`Failed to map PostgreSQL quiz with id ${q.id}. Skipping.`, mappingError);
            }
        }
    }
    
    return domainQuizzes;
  }

  async delete(id: QuizId): Promise<void> {
    try {
        const collection = await this.getMongoCollection();
        await collection.deleteOne({ _id: id.value });
    } catch (error) {
        console.error('Failed to delete from MongoDB, falling back to PostgreSQL.', error);
        await this.pgRepository.delete(id.value);
    }
  }
}
