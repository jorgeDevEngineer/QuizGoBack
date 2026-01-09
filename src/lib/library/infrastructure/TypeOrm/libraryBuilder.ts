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
import { TypeOrmPostgresUserFavoriteQuizEntity } from "./Postgres/Entities/TypeOrmPostgresUserFavoriteQuizEntity";
import { TypeOrmPostgresQuizRepository } from "./Postgres/Repositories/TypeOrmPostgresQuizRepository";
import { TypeOrmPostgresSinglePlayerGameRepository } from "./Postgres/Repositories/TypeOrmPostgresSinglePlayerGameRepository";
import { TypeOrmPostgresUserFavoriteQuizRepository } from "./Postgres/Repositories/TypeOrmPostgresUserFavoriteQuizRepository";
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { QuizRepository } from "../../domain/port/QuizRepository";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";

// Appliers
import { TypeOrmPostgresCriteriaApplier } from "./Criteria Appliers/Postgres/TypeOrmPostgresCriteriaApplier";
import { TypeOrmPostgresAdvancedCriteriaApplier } from "./Criteria Appliers/Postgres/TypeOrmPostgresAdvancedCriteriaApplier";
import { TypeOrmMongoCriteriaApplier } from "./Criteria Appliers/Mongo/TypeOrmMongoCriteriaApplier";
import { TypeOrmMongoUserFavoriteQuizEntity } from "./Mongo/Entities/TypeOrmMongoUserFavoriteQuizEntity";
import { DynamicMongoAdapter } from "../../../shared/infrastructure/database/dynamic-mongo.adapter";

type DbType = "postgres" | "mongo";

const entityMap = {
  postgres: {
    Quiz: TypeOrmQuizEntity,
    User: TypeOrmUserEntity,
    UserFavoriteQuiz: TypeOrmPostgresUserFavoriteQuizEntity,
    SinglePlayerGame: TypeOrmSinglePlayerGameEntity,
  },
  mongo: {
    // Aquí irían las entidades Mongo equivalentes
    Quiz: undefined,
    User: undefined,
    UserFavoriteQuiz: undefined,
    SinglePlayerGame: undefined,
  },
};

export class LibraryRepositoryBuilder {
  private quizRepo?: Repository<TypeOrmQuizEntity> | MongoRepository<any>;
  private userRepo?: Repository<TypeOrmUserEntity> | MongoRepository<any>;
  private userFavRepo?:
    | Repository<TypeOrmPostgresUserFavoriteQuizEntity>
    | MongoRepository<TypeOrmMongoUserFavoriteQuizEntity>;
  private singleGameRepo?:
    | Repository<TypeOrmSinglePlayerGameEntity>
    | MongoRepository<any>;

  constructor(
    private readonly dbType: DbType,
    private readonly dataSource: DataSource,
    private readonly mongoAdapter: DynamicMongoAdapter
  ) {}

  withEntity(entityName: keyof (typeof entityMap)["postgres"]) {
    const entityClass = entityMap[this.dbType][entityName];
    if (!entityClass)
      throw new Error(
        `Entidad ${entityName} no implementada para ${this.dbType}`
      );

    if (this.dbType === "postgres") {
      switch (entityName) {
        case "Quiz":
          this.quizRepo = this.dataSource.getRepository(entityClass);
          break;
        case "User":
          this.userRepo = this.dataSource.getRepository(entityClass);
          break;
        case "UserFavoriteQuiz":
          this.userFavRepo = this.dataSource.getRepository(entityClass);
          break;
        case "SinglePlayerGame":
          this.singleGameRepo = this.dataSource.getRepository(entityClass);
          break;
      }
    } else {
      switch (entityName) {
        case "Quiz":
          this.quizRepo = this.dataSource.getMongoRepository(entityClass);
          break;
        case "User":
          this.userRepo = this.dataSource.getMongoRepository(entityClass);
          break;
        case "UserFavoriteQuiz":
          this.userFavRepo = this.dataSource.getMongoRepository(entityClass);
          break;
        case "SinglePlayerGame":
          this.singleGameRepo = this.dataSource.getMongoRepository(entityClass);
          break;
      }
    }

    return this;
  }

  buildUserFavoriteQuizRepository(): UserFavoriteQuizRepository {
    if (this.dbType === "postgres") {
      const criteriaApplier =
        new TypeOrmPostgresCriteriaApplier<TypeOrmPostgresUserFavoriteQuizEntity>();
      return new TypeOrmPostgresUserFavoriteQuizRepository(
        this.userFavRepo!,
        criteriaApplier
      );
    } else {
      const criteriaApplier =
        new TypeOrmMongoCriteriaApplier<TypeOrmMongoUserFavoriteQuizEntity>();
      // Aquí iría el repositorio Mongo equivalente
      throw new Error("Mongo UserFavoriteQuizRepository no implementado aún");
    }
  }

  buildQuizRepository(): QuizRepository {
    if (this.dbType === "postgres") {
      const criteriaApplier =
        new TypeOrmPostgresAdvancedCriteriaApplier<TypeOrmQuizEntity>();
      return new TypeOrmPostgresQuizRepository(this.quizRepo!, criteriaApplier);
    } else {
      const criteriaApplier = new TypeOrmMongoCriteriaApplier<any>();
      throw new Error("Mongo QuizRepository no implementado aún");
    }
  }

  buildUserRepository(): UserRepository {
    if (this.dbType === "postgres") {
      return new TypeOrmUserRepository(this.userRepo!, this.mongoAdapter);
    }
    throw new Error("Mongo UserRepository no implementado aún");
  }

  buildSinglePlayerGameRepository(): SinglePlayerGameRepository {
    if (this.dbType === "postgres") {
      const criteriaApplier =
        new TypeOrmPostgresAdvancedCriteriaApplier<TypeOrmSinglePlayerGameEntity>();
      return new TypeOrmPostgresSinglePlayerGameRepository(
        this.singleGameRepo!,
        criteriaApplier
      );
    } else {
      const criteriaApplier = new TypeOrmMongoCriteriaApplier<any>();
      throw new Error("Mongo SinglePlayerGameRepository no implementado aún");
    }
  }
}
