import { TypeOrmQuizEntity } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmUserEntity } from "../../../user/infrastructure/TypeOrm/TypeOrmUserEntity";
import { TypeOrmUserRepository } from "../../../user/infrastructure/TypeOrm/TypeOrmUserRepository";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { QuizQueryCriteria } from "../../application/Response Types/QuizQueryCriteria";
import { CriteriaApplier } from "../../domain/port/CriteriaApplier";
import { TypeOrmPostgresUserFavoriteQuizEntity } from "./Postgres/Entities/TypeOrmPostgresUserFavoriteQuizEntity";
import { TypeOrmPostgresQuizRepository } from "./Postgres/Repositories/TypeOrmPostgresQuizRepository";
import { TypeOrmPostgresSinglePlayerGameRepository } from "./Postgres/Repositories/TypeOrmPostgresSinglePlayerGameRepository";
import { TypeOrmPostgresUserFavoriteQuizRepository } from "./Postgres/Repositories/TypeOrmPostgresUserFavoriteQuizRepository";
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { QuizRepository } from "../../domain/port/QuizRepository";
import { UserRepository } from "src/lib/user/domain/port/UserRepository";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";

type DbType = "postgres" | "mongo";

const entityMap = {
  postgres: {
    Quiz: TypeOrmQuizEntity,
    User: TypeOrmUserEntity,
    UserFavoriteQuiz: TypeOrmPostgresUserFavoriteQuizEntity,
    SinglePlayerGame: TypeOrmSinglePlayerGameEntity,
  },
};

export class LibraryRepositoryBuilder {
  private quizRepo?: Repository<TypeOrmQuizEntity>;
  private userRepo?: Repository<TypeOrmUserEntity>;
  private userFavRepo?: Repository<TypeOrmPostgresUserFavoriteQuizEntity>;
  private singleGameRepo?: Repository<TypeOrmSinglePlayerGameEntity>;

  constructor(
    private readonly dbType: DbType,
    private readonly dataSource: DataSource
  ) {}

  withEntity(entityName: keyof (typeof entityMap)["postgres"]) {
    const entityClass = entityMap[this.dbType][entityName];
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
  
    return this;
  }

  buildUserFavoriteQuizRepository(
    criteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmPostgresUserFavoriteQuizEntity>,
      QuizQueryCriteria
    >
  ): UserFavoriteQuizRepository {
    if (this.dbType === "postgres") {
      return new TypeOrmPostgresUserFavoriteQuizRepository(
        this.userFavRepo!,
        criteriaApplier
      );
    }
    throw new Error("Mongo UserFavoriteQuizRepository no implementado aún");
  }

  buildQuizRepository(
    advancedCriteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmQuizEntity>,
      QuizQueryCriteria
    >
  ): QuizRepository {
    if (this.dbType === "postgres") {
      return new TypeOrmPostgresQuizRepository(
        this.quizRepo!,
        advancedCriteriaApplier
      );
    }
    throw new Error("Mongo QuizRepository no implementado aún");
  }

  buildUserRepository(): UserRepository {
    if (this.dbType === "postgres") {
      return new TypeOrmUserRepository(this.userRepo!);
    }
    throw new Error("Mongo UserRepository no implementado aún");
  }

  buildSinglePlayerGameRepository(
    advancedCriteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>,
      QuizQueryCriteria
    >
  ): SinglePlayerGameRepository {
    if (this.dbType === "postgres") {
      return new TypeOrmPostgresSinglePlayerGameRepository(
        this.singleGameRepo!,
        advancedCriteriaApplier
      );
    }
    throw new Error("Mongo SinglePlayerGameRepository no implementado aún");
  }
}
