import { MongoRepository, FindOptionsWhere } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserFavoriteQuizRepository } from "../../../../domain/port/UserFavoriteQuizRepository";
import { UserFavoriteQuiz } from "../../../../domain/valueObject/UserFavoriteQuiz";
import { TypeOrmMongoUserFavoriteQuizEntity } from "../Entities/TypeOrmMongoUserFavoriteQuizEntity";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { CriteriaApplier } from "src/lib/library/domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "src/lib/library/application/Response Types/QuizQueryCriteria";

export class TypeOrmMongoUserFavoriteQuizRepository
  implements UserFavoriteQuizRepository
{
  constructor(
    @InjectRepository(TypeOrmMongoUserFavoriteQuizEntity)
    private readonly repository: MongoRepository<TypeOrmMongoUserFavoriteQuizEntity>,
    private readonly criteriaApplier: CriteriaApplier<
      {
        where: FindOptionsWhere<TypeOrmMongoUserFavoriteQuizEntity>;
        skip?: number;
        take?: number;
      },
      QuizQueryCriteria
    >
  ) {}

  async addFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void> {
    const entity = new TypeOrmMongoUserFavoriteQuizEntity();
    entity.user_id = favorite.userId.value;
    entity.quiz_id = favorite.quizId.value;
    await this.repository.insertOne(entity);
  }

  async removeFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void> {
    await this.repository.deleteOne({
      user_id: favorite.userId.value,
      quiz_id: favorite.quizId.value,
    });
  }

  async isFavorite(userId: UserId, quizId: QuizId): Promise<boolean> {
    const exists = await this.repository.findOne({
      where: { user_id: userId.value, quiz_id: quizId.value },
    });
    return !!exists;
  }

  async findFavoritesQuizByUser(
    userId: UserId,
    criteria: QuizQueryCriteria
  ): Promise<QuizId[]> {
    // 🔑 Base filter
    const baseOptions = { where: { user_id: userId.value } };

    // 🔑 aplicar criteria genérica (solo skip y take)
    const options = this.criteriaApplier.apply(baseOptions, criteria, "fav");

    const rows = await this.repository.find(options);
    return rows.map((row) => QuizId.of(row.quiz_id));
  }
}
