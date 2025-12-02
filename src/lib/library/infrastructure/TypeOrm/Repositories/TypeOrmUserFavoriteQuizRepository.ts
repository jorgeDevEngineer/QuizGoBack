import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFavoriteQuizRepository } from '../../../domain/port/UserFavoriteQuizRepository';
import { UserFavoriteQuiz } from '../../../domain/valueObject/UserFavoriteQuiz';
import { TypeOrmUserFavoriteQuizEntity } from '../Entities/TypeOrmUserFavoriteQuizEntity';
import { QuizId, UserId } from 'src/lib/kahoot/domain/valueObject/Quiz';

export class TypeOrmUserFavoriteQuizRepository
  implements UserFavoriteQuizRepository
{
  constructor(
    @InjectRepository(TypeOrmUserFavoriteQuizEntity)
    private readonly repository: Repository<TypeOrmUserFavoriteQuizEntity>,
  ) {}

  async addFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void> {
    const entity = new TypeOrmUserFavoriteQuizEntity();
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
    return this.repository.exist({ where: { user_id: userId.value, quiz_id: quizId.value } });
  }
  
  async findFavoritesQuizByUser(userId: UserId): Promise<QuizId[]> {
    const favorites = await this.repository.find({ where: { user_id: userId.value } });
    return favorites.map((fav) => QuizId.of(fav.quiz_id));
  }
}