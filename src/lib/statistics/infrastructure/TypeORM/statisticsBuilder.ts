import { TypeOrmQuizEntity } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { DataSource, Repository } from "typeorm";
import { TypeOrmQuizRepository } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizRepository";
import { TypeOrmPostgresCriteriaApplier } from "./Criteria Appliers/Postgres/TypeOrmPostgresCriteriaApplier";
import { DynamicSinglePlayerGameRepository } from "./DynamicSinglePlayerGameRepository";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { MongoCriteriaApplier } from "./Criteria Appliers/Mongo/MongoCriteriaApplier";

type DbType = "postgres" | "mongo";

const entityMap = {
  postgres: {
    Quiz: TypeOrmQuizEntity,
    SinglePlayerGame: TypeOrmSinglePlayerGameEntity,
  },
};

export class StatisticsRepositoryBuilder {
  private quizRepo?: Repository<TypeOrmQuizEntity>;
  private singleGameRepo?: Repository<TypeOrmSinglePlayerGameEntity>;

  constructor(private readonly dbType: DbType, private readonly dataSource: DataSource) {}

  withEntity(entityName: keyof (typeof entityMap)["postgres"]) {
    const entityClass = entityMap[this.dbType][entityName];
    if (entityName === "Quiz")
      this.quizRepo = this.dataSource.getRepository(entityClass);
    if (entityName === "SinglePlayerGame")
      this.singleGameRepo = this.dataSource.getRepository(entityClass);

    return this;
  }

  buildQuizRepository(): QuizRepository {
    if (this.dbType === "postgres") {
      return new TypeOrmQuizRepository(this.quizRepo!, null);
    }
    throw new Error("Mongo QuizRepository no implementado aún");
  }

  buildSinglePlayerGameRepository( mongoAdapter: DynamicMongoAdapter
  ): SinglePlayerGameRepository {
    if (this.dbType === "postgres") {
      const criteriaApplier = new TypeOrmPostgresCriteriaApplier<TypeOrmSinglePlayerGameEntity>();
      const mongoCriteriaApplier = new MongoCriteriaApplier<any>();
      return new DynamicSinglePlayerGameRepository(
        this.singleGameRepo!,
        criteriaApplier,
        mongoAdapter,
        mongoCriteriaApplier
      );
    }
    throw new Error("Mongo SinglePlayerGameRepository no implementado aún");
  }
}
