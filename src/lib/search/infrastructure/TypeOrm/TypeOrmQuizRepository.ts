import {  In, Like, Repository } from 'typeorm';
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
import { SearchParamsDto, SearchResultDto } from '../../application/SearchQuizzesUseCase';
import { CategoriesDTO } from '../../application/GetCategoriesUseCase';

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

  async find(id: QuizId): Promise<Quiz | null> {
    const quizEntity = await this.repository.findOne({
      where: { id: id.value },
    });
    if (!quizEntity) return null;
    return this.mapToDomain(quizEntity);
  }

  async search(params: SearchParamsDto): Promise<SearchResultDto> {
    // Opciones base
    const where: any = {
      visibility: 'public',
      status: 'published',
    };
  
    // Filtro por categorías
    if (params.categories?.length) {
      where.category = In(params.categories);
    }
  
    // patron de busqueda es un or entre el titulo y la descripcion
    if (params.q) {
      where.or = [
        { title: Like(`%${params.q}%`) },
        { description: Like(`%${params.q}%`) },
      ];
    }
  
    // Contar total
    const totalCount = await this.repository.count({
      where
      
    });
  
    // Obtener datos con paginación y orden
    const data = await this.repository.find({
      where,
      //todo: agregar relacion con user para obtener el nombre del autor
      skip: params.page * params.limit,
      take: params.limit,
    });
  
    const totalPages = Math.ceil(totalCount / params.limit);
  
    return {
      data: data.map((q) => this.mapToDomain(q)),
      pagination: {
        page: params.page,
        limit: params.limit,
        totalCount,
        totalPages,
      },
    };
  }

  async findFeatured(limit: number): Promise<Quiz[]> {
    const quizzes = await this.repository.find({

        where: {
          visibility: 'public',
          status: 'published',
        },
        order: {
          playCount: 'DESC',
        },
        take: limit,
      });
    return quizzes.map((q) => this.mapToDomain(q));
  }

  async getCategories(): Promise<QuizCategory[]> {
    const categories = await this.repository.createQueryBuilder('quiz')
    .select('category')
    .distinct(true)
    .getRawMany();
    return categories.map((c) => QuizCategory.of(c.category));
  }

}
