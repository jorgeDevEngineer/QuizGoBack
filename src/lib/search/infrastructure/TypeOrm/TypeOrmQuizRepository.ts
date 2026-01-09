import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';
import { Collection, Db } from 'mongodb';
import { QuizRepository } from '../../domain/port/QuizRepository';
import { UserRepository } from '../../domain/port/UserRepository';
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
import { MediaId as MediaIdVO } from '../../../media/domain/value-object/MediaId';
import {
  AnswerId,
  AnswerText,
  IsCorrect,
} from '../../domain/valueObject/Answer';
import { SearchParamsDto, SearchResultDto } from '../../application/SearchQuizzesUseCase';
import { DynamicMongoAdapter } from '../../../shared/infrastructure/database/dynamic-mongo.adapter';

// Interfaz para el documento de MongoDB
interface MongoQuizDoc {
  _id?: string;
  id?: string;
  userId?: string;
  authorId?: string;
  title: string;
  description: string;
  visibility: 'public' | 'private';
  status: 'draft' | 'publish';
  category: string;
  themeId: string;
  coverImageId?: string;
  createdAt: Date;
  playCount: number;
  questions: {
    id: string;
    text: string;
    mediaId?: string;
    type: 'quiz' | 'true_false';
    timeLimit: number;
    points: number;
    answers: {
      id: string;
      text?: string;
      mediaId?: string;
      isCorrect: boolean;
    }[];
  }[];
}

@Injectable()
export class TypeOrmQuizRepository implements QuizRepository {
  constructor(
    @InjectRepository(TypeOrmQuizEntity)
    private readonly pgRepository: Repository<TypeOrmQuizEntity>,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    private readonly mongoAdapter: DynamicMongoAdapter,
  ) {}

  /**
   * Obtiene la colección de quizzes de MongoDB para el módulo 'search'
   */
  private async getMongoCollection(): Promise<Collection<MongoQuizDoc>> {
    const db: Db = await this.mongoAdapter.getConnection('search');
    return db.collection<MongoQuizDoc>('quizzes');
  }

  private mapToDomain(q: TypeOrmQuizEntity | MongoQuizDoc): Quiz {
    // Obtener el id dependiendo de si es Mongo (_id o id) o PG (id)
    const quizId = q.id || (q as MongoQuizDoc)._id;
    // En MongoDB el campo puede ser 'authorId', en PG es 'userId'
    const authorId = q.userId || (q as MongoQuizDoc).authorId;

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
      QuizId.of(quizId),
      UserId.of(authorId),
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
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      // Buscar por 'id' o '_id' según cómo esté almacenado el documento
      const result = await collection.findOne({ $or: [{ id: id.value }, { _id: id.value }] });

      if (!result) return null;
      return this.mapToDomain(result);
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for find operation.',error);
      const quizEntity = await this.pgRepository.findOne({
        where: { id: id.value },
      });
      if (!quizEntity) return null;
      return this.mapToDomain(quizEntity);
    }
  }

  async search(params: SearchParamsDto): Promise<SearchResultDto> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();

      // Construir filtro de MongoDB
      const filter: Record<string, unknown> = {};

      if (params.categories?.length) {
        filter.category = { $in: params.categories };
      }

      if (params.q) {
        filter.$or = [
          { title: { $regex: params.q, $options: 'i' } },
          { description: { $regex: params.q, $options: 'i' } },
        ];
      }

      // Contar total
      const totalCount = await collection.countDocuments(filter);

      // Ordenamiento
      const sortField = params.orderBy || 'createdAt';
      const sortDirection = params.order?.toUpperCase() === 'ASC' ? 1 : -1;
      const sort: Record<string, 1 | -1> = { [sortField]: sortDirection };

      // Paginación
      const skip = (params.page - 1) * params.limit;

      const data = await collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(params.limit)
        .toArray();

      const resultData = await Promise.all(
        data.map(async (q) => {
          // En MongoDB el campo puede ser 'authorId', en PG es 'userId'
          const authorId = q.userId || q.authorId;
          return {
            id: q.id || q._id,
            title: q.title,
            description: q.description,
            themeId: q.themeId,
            category: q.category,
            author: {
              id: authorId,
              name: await this.userRepository.getNameById(authorId),
            },
            coverImageId: q.coverImageId || null,
            playCount: q.playCount,
            createdAt: q.createdAt,
            visibility: q.visibility,
            Status: q.status,
          };
        }),
      );

      const totalPages = Math.ceil(totalCount / params.limit);

      return {
        data: resultData,
        pagination: {
          page: params.page,
          limit: params.limit,
          totalCount,
          totalPages,
        },
      };
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for search operation.',error);

      const qb = this.pgRepository.createQueryBuilder('quiz');

      if (params.categories?.length) {
        qb.andWhere('quiz.category IN (:...categories)', { categories: params.categories });
      }

      if (params.q) {
        qb.andWhere('(quiz.title LIKE :q OR quiz.description LIKE :q)', { q: `%${params.q}%` });
      }

      // Aplicar ordenamiento
      if (params.orderBy) {
        const orderDirection = params.order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        qb.orderBy(`quiz.${params.orderBy}`, orderDirection);
      } else {
        // Ordenamiento por defecto
        qb.orderBy('quiz.createdAt', 'DESC');
      }

      const totalCount = await qb.getCount();

      // Corregir el cálculo del skip: página 1 debe empezar en índice 0
      const skip = (params.page - 1) * params.limit;
      const data = await qb
        .skip(skip)
        .take(params.limit)
        .getMany();

      const resultData = await Promise.all(
        data.map(async (q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          themeId: q.themeId,
          category: q.category,
          author: {
            id: q.userId,
            name: await this.userRepository.getNameById(q.userId),
          },
          coverImageId: q.coverImageId,
          playCount: q.playCount,
          createdAt: q.createdAt,
          visibility: q.visibility,
          Status: q.status,
        })),
      );

      const totalPages = Math.ceil(totalCount / params.limit);

      return {
        data: resultData,
        pagination: {
          page: params.page,
          limit: params.limit,
          totalCount,
          totalPages,
        },
      };
    }
  }

  async findFeatured(limit: number): Promise<SearchResultDto> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();

      const quizzes = await collection
        .find({
          visibility: 'public',
          status: 'publish',
        })
        .sort({ playCount: -1 })
        .limit(limit)
        .toArray();

      const resultData = await Promise.all(
        quizzes.map(async (q) => {
          // En MongoDB el campo puede ser 'authorId', en PG es 'userId'
          const authorId = q.userId || q.authorId;
          return {
            id: q.id || q._id,
            title: q.title,
            description: q.description,
            themeId: q.themeId,
            category: q.category,
            author: {
              id: authorId,
              name: await this.userRepository.getNameById(authorId),
            },
            coverImageId: q.coverImageId || null,
            playCount: q.playCount,
            createdAt: q.createdAt,
            visibility: q.visibility,
            Status: q.status,
          };
        }),
      );

      return {
        data: resultData,
        pagination: {
          page: 1,
          limit: limit,
          totalCount: quizzes.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for findFeatured operation.',error);

      const quizzes = await this.pgRepository.find({
        where: {
          visibility: 'public',
          status: 'publish',
        },
        order: {
          playCount: 'DESC',
        },
        take: limit,
      });

      const resultData = await Promise.all(
        quizzes.map(async (q) => ({
          id: q.id,
          title: q.title,
          description: q.description,
          themeId: q.themeId,
          category: q.category,
          author: {
            id: q.userId,
            name: await this.userRepository.getNameById(q.userId),
          },
          coverImageId: q.coverImageId,
          playCount: q.playCount,
          createdAt: q.createdAt,
          visibility: q.visibility,
          Status: q.status,
        })),
      );

      return {
        data: resultData,
        pagination: {
          page: 1,
          limit: limit,
          totalCount: quizzes.length,
          totalPages: 1,
        },
      };
    }
  }

  async getCategories(): Promise<{ name: string }[]> {
    try {
      // 1. Intenta usar MongoDB
      const collection = await this.getMongoCollection();
      const categories = await collection.distinct('category');
      return categories.map((c) => ({ name: c }));
    } catch (error) {
      // 2. Si MongoDB falla, usa PostgreSQL como fallback
      console.log('MongoDB connection not available, falling back to PostgreSQL for getCategories operation.',error);

      const categories = await this.pgRepository.createQueryBuilder('quiz')
        .select('category')
        .distinct(true)
        .getRawMany();
      return categories.map((c) => ({ name: c.category }));
    }
  }
}
