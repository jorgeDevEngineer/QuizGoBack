import {
  DataSource,
  Repository,
  SelectQueryBuilder,
  MongoRepository,
} from "typeorm";
import { TypeOrmQuizEntity } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmUserEntity } from "../../../user/infrastructure/TypeOrm/TypeOrmUserEntity";
import { TypeOrmUserRepository } from "../../../user/infrastructure/TypeOrm/TypeOrmUserRepository";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { TypeOrmPostgresUserFavoriteQuizEntity } from "./Entities/TypeOrmPostgresUserFavoriteQuizEntity";
import { DynamicQuizRepository } from "./Repositories/DynamicQuizRepository";
import { DynamicSinglePlayerGameRepository } from "./Repositories/DynamicSinglePlayerGameRepository";
import { DynamicUserFavoriteQuizRepository } from "./Repositories/DynamicUserFavoriteQuizRepository";
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { QuizRepository } from "../../domain/port/QuizRepository";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";

// Appliers
import { TypeOrmPostgresCriteriaApplier } from "./Criteria Appliers/Postgres/TypeOrmPostgresCriteriaApplier";
import { TypeOrmPostgresAdvancedCriteriaApplier } from "./Criteria Appliers/Postgres/TypeOrmPostgresAdvancedCriteriaApplier";
import { MongoCriteriaApplier } from "./Criteria Appliers/Mongo/MongoCriteriaApplier";
import { DynamicMongoAdapter } from "../../../shared/infrastructure/database/dynamic-mongo.adapter";
import { TypeOrmMultiplayerSessionEntity } from "src/lib/multiplayer/infrastructure/repositories/TypeOrm/TypeOrmMultiplayerSessionEntity";
import { DynamicMultiplayerGameRepository } from "./Repositories/DynamicMultiplayerGameRepository";

const entityMap = {
  postgres: {
    Quiz: TypeOrmQuizEntity,
    User: TypeOrmUserEntity,
    UserFavoriteQuiz: TypeOrmPostgresUserFavoriteQuizEntity,
    SinglePlayerGame: TypeOrmSinglePlayerGameEntity,
    MultiplayerSession: TypeOrmMultiplayerSessionEntity,
  },
};

export class LibraryRepositoryBuilder {
  private quizRepo?: Repository<TypeOrmQuizEntity>;
  private userRepo?: Repository<TypeOrmUserEntity>;
  private userFavRepo?: Repository<TypeOrmPostgresUserFavoriteQuizEntity>;
  private singleGameRepo?: Repository<TypeOrmSinglePlayerGameEntity>;
  private sessionRepository?: Repository<TypeOrmMultiplayerSessionEntity>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly mongoAdapter: DynamicMongoAdapter
  ) {}

  withEntity(entityName: keyof (typeof entityMap)["postgres"]) {
    const entityClass = entityMap["postgres"][entityName];
    if (!entityClass) {
      throw new Error(`Entidad ${entityName} no implementada`);
    }
    switch (entityName) {
      case "Quiz":
        this.quizRepo = this.dataSource.getRepository(
          entityClass as typeof TypeOrmQuizEntity
        );
        break;
      case "User":
        this.userRepo = this.dataSource.getRepository(
          entityClass as typeof TypeOrmUserEntity
        );
        break;
      case "UserFavoriteQuiz":
        this.userFavRepo = this.dataSource.getRepository(
          entityClass as typeof TypeOrmPostgresUserFavoriteQuizEntity
        );
        break;
      case "SinglePlayerGame":
        this.singleGameRepo = this.dataSource.getRepository(
          entityClass as typeof TypeOrmSinglePlayerGameEntity
        );
        break;
      case "MultiplayerSession":
        this.sessionRepository = this.dataSource.getRepository(
          entityClass as typeof TypeOrmMultiplayerSessionEntity
        );
        break;
    }
    return this;
  }

  buildUserFavoriteQuizRepository(): UserFavoriteQuizRepository {
    const criteriaApplier =
      new TypeOrmPostgresCriteriaApplier<TypeOrmPostgresUserFavoriteQuizEntity>();
    const mongoCriteriaApplier = new MongoCriteriaApplier<any>();
    return new DynamicUserFavoriteQuizRepository(
      this.userFavRepo!,
      criteriaApplier,
      this.mongoAdapter,
      mongoCriteriaApplier
    );
  }

  buildQuizRepository(): QuizRepository {
    const criteriaApplier =
      new TypeOrmPostgresAdvancedCriteriaApplier<TypeOrmQuizEntity>();
    const mongoCriteriaApplier = new MongoCriteriaApplier<any>();
    return new DynamicQuizRepository(
      this.quizRepo!,
      criteriaApplier,
      this.mongoAdapter,
      mongoCriteriaApplier
    );
  }

  buildUserRepository(): UserRepository {
    return new TypeOrmUserRepository(this.userRepo!, this.mongoAdapter);
  }

  buildSinglePlayerGameRepository(): SinglePlayerGameRepository {
    const criteriaApplier =
      new TypeOrmPostgresCriteriaApplier<TypeOrmSinglePlayerGameEntity>();
    const mongoCriteriaApplier = new MongoCriteriaApplier<any>();
    return new DynamicSinglePlayerGameRepository(
      this.singleGameRepo!,
      criteriaApplier,
      this.mongoAdapter,
      mongoCriteriaApplier
    );
  }

  buildMultiplayerSessionHistoryRepository() {
    const criteriaAplier =
      new TypeOrmPostgresCriteriaApplier<TypeOrmMultiplayerSessionEntity>();
    const mongoCriteriaApplier = new MongoCriteriaApplier<any>();
    return new DynamicMultiplayerGameRepository(
      this.sessionRepository!,
      criteriaAplier,
      this.mongoAdapter,
      mongoCriteriaApplier
    );
  }
}
