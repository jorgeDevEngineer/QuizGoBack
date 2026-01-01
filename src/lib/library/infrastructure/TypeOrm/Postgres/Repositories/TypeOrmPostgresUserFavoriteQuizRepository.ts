import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFavoriteQuizRepository } from '../../../../domain/port/UserFavoriteQuizRepository';
import { UserFavoriteQuiz } from '../../../../domain/valueObject/UserFavoriteQuiz';
import { TypeOrmPostgresUserFavoriteQuizEntity } from '../Entities/TypeOrmPostgresUserFavoriteQuizEntity';
import { QuizId } from 'src/lib/kahoot/domain/valueObject/Quiz';
import { UserId } from 'src/lib/user/domain/valueObject/UserId';
import { CriteriaApplier } from 'src/lib/library/domain/port/CriteriaApplier';
import { QuizQueryCriteria } from 'src/lib/library/application/Response Types/QuizQueryCriteria';

export class TypeOrmPostgresUserFavoriteQuizRepository
  implements UserFavoriteQuizRepository
{
  constructor(
    @InjectRepository(TypeOrmPostgresUserFavoriteQuizEntity)
    private readonly repository: Repository<TypeOrmPostgresUserFavoriteQuizEntity>,
    private readonly criteriaApplier: CriteriaApplier<SelectQueryBuilder<TypeOrmPostgresUserFavoriteQuizEntity>, QuizQueryCriteria>
  ) {}

  async addFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void> {
    const entity = new TypeOrmPostgresUserFavoriteQuizEntity();
    entity.user_id = favorite.userId.value;
    entity.quiz_id = favorite.quizId.value;
    await this.repository.save(entity);
  }

  async removeFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void> {
    await this.repository.delete({
      user_id: favorite.userId.value,
      quiz_id: favorite.quizId.value,
    });
  }

  async isFavorite(userId: UserId, quizId: QuizId): Promise<boolean> {
    return this.repository.exists({ where: { user_id: userId.value, quiz_id: quizId.value } });
  }
  
  async findFavoritesQuizByUser(userId: UserId, criteria: QuizQueryCriteria): Promise<QuizId[]> {
    let qb = this.repository.createQueryBuilder('fav');
    qb.where('fav.user_id = :userId', { userId: userId.value });

    // 🔑 aplicar criteria genérica
    qb = this.criteriaApplier.apply(qb, criteria, 'fav');

    const rows = await qb.getMany();
    const quizIds = rows.map(row => QuizId.of(row.quiz_id));

    return quizIds;
  }
}