import { Repository, SelectQueryBuilder } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { UserFavoriteQuizRepository } from "../../../domain/port/UserFavoriteQuizRepository";
import { UserFavoriteQuiz } from "../../../domain/valueObject/UserFavoriteQuiz";
import { TypeOrmPostgresUserFavoriteQuizEntity } from "../Entities/TypeOrmPostgresUserFavoriteQuizEntity";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { CriteriaApplier } from "src/lib/library/domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "src/lib/library/application/Response Types/QuizQueryCriteria";
import { ObjectId } from "mongodb";
import { MongoFindParams } from "../Criteria Appliers/Mongo/MongoAdvancedCriteriaApplier";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { MongoCriteriaApplier } from "../Criteria Appliers/Mongo/MongoCriteriaApplier";

type MongoUserFavoriteQuizDoc = {
  _id: ObjectId;
  userId: string;
  quizId: string;
};

export class DynamicUserFavoriteQuizRepository
  implements UserFavoriteQuizRepository
{
  constructor(
    @InjectRepository(TypeOrmPostgresUserFavoriteQuizEntity)
    private readonly repository: Repository<TypeOrmPostgresUserFavoriteQuizEntity>,
    private readonly pgCriteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmPostgresUserFavoriteQuizEntity>,
      QuizQueryCriteria
    >,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoCriteriaApplier<MongoUserFavoriteQuizDoc>
  ) {}

  async addFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void> {
    try {
      const db = await this.mongoAdapter.getConnection("favorite");
      const collection = db.collection<MongoUserFavoriteQuizDoc>(
        "userFavoriteQuizzes"
      );

      await collection.insertOne({
        _id: new ObjectId(),
        userId: favorite.userId.value,
        quizId: favorite.quizId.value,
      });
    } catch {
      const entity = new TypeOrmPostgresUserFavoriteQuizEntity();
      entity.user_id = favorite.userId.value;
      entity.quiz_id = favorite.quizId.value;
      await this.repository.save(entity);
    }
  }

  async removeFavoriteQuiz(favorite: UserFavoriteQuiz): Promise<void> {
    try {
      const db = await this.mongoAdapter.getConnection("favorite");
      const collection = db.collection<MongoUserFavoriteQuizDoc>(
        "userFavoriteQuizzes"
      );

      await collection.deleteOne({
        userId: favorite.userId.value,
        quizId: favorite.quizId.value,
      });
    } catch {
      await this.repository.delete({
        user_id: favorite.userId.value,
        quiz_id: favorite.quizId.value,
      });
    }
  }

  async isFavorite(userId: UserId, quizId: QuizId): Promise<boolean> {
    try {
      const db = await this.mongoAdapter.getConnection("favorite");
      const collection = db.collection<MongoUserFavoriteQuizDoc>(
        "userFavoriteQuizzes"
      );

      const count = await collection.countDocuments({
        userId: userId.value,
        quizId: quizId.value,
      });
      return count > 0;
    } catch {
      return this.repository.exists({
        where: { user_id: userId.value, quiz_id: quizId.value },
      });
    }
  }

  async findFavoritesQuizByUser(
    userId: UserId,
    criteria: QuizQueryCriteria
  ): Promise<QuizId[]> {
    try {
      const db = await this.mongoAdapter.getConnection("favorite");
      const collection = db.collection<MongoUserFavoriteQuizDoc>(
        "userFavoriteQuizzes"
      );

      const params: MongoFindParams<MongoUserFavoriteQuizDoc> = {
        filter: { userId: userId.value },
      };

      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );
      const docs = await collection.find(filter, options).toArray();

      return docs.map((doc) => QuizId.of(doc.quizId));
    } catch {
      let qb = this.repository.createQueryBuilder("fav");
      qb.where("fav.user_id = :userId", { userId: userId.value });

      qb = this.pgCriteriaApplier.apply(qb, criteria, "fav");

      const rows = await qb.getMany();
      return rows.map((row) => QuizId.of(row.quiz_id));
    }
  }
}
