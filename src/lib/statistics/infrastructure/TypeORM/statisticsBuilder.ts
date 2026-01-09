import { TypeOrmQuizEntity } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { DataSource, Repository } from "typeorm";
import { TypeOrmQuizRepository } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizRepository";
import { TypeOrmPostgresCriteriaApplier } from "./Criteria Appliers/Postgres/TypeOrmPostgresCriteriaApplier";
import { DynamicSinglePlayerGameRepository } from "./Repositories/DynamicSinglePlayerGameRepository";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { MongoCriteriaApplier } from "./Criteria Appliers/Mongo/MongoCriteriaApplier";
import { TypeOrmMultiplayerSessionEntity } from "src/lib/multiplayer/infrastructure/repositories/TypeOrm/TypeOrmMultiplayerSessionEntity";
import { DynamicMultiplayerGameRepository } from "./Repositories/DynamicMultiplayerGameRepository";
import { MultiplayerSessionHistoryRepository } from "../../domain/port/MultiplayerSessionHistoryRepository";

const entityMap = {
  postgres: {
    Quiz: TypeOrmQuizEntity,
    SinglePlayerGame: TypeOrmSinglePlayerGameEntity,
    MultiplayerSession: TypeOrmMultiplayerSessionEntity,
  },
};

export class StatisticsRepositoryBuilder {
  private quizRepo?: Repository<TypeOrmQuizEntity>;
  private singleGameRepo?: Repository<TypeOrmSinglePlayerGameEntity>;
  private sessionRepository?: Repository<TypeOrmMultiplayerSessionEntity>;

  constructor(
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly dataSource: DataSource
  ) {}

  withEntity(entityName: keyof (typeof entityMap)["postgres"]) {
    const entityClass = entityMap["postgres"][entityName];
    if (entityName === "Quiz")
      this.quizRepo = this.dataSource.getRepository(
        entityClass as typeof TypeOrmQuizEntity
      );
    if (entityName === "SinglePlayerGame")
      this.singleGameRepo = this.dataSource.getRepository(
        entityClass as typeof TypeOrmSinglePlayerGameEntity
      );
    if (entityName === "MultiplayerSession") {
      this.sessionRepository = this.dataSource.getRepository(
        entityClass as typeof TypeOrmMultiplayerSessionEntity
      );
    }

    return this;
  }

  buildQuizRepository(): QuizRepository {
    return new TypeOrmQuizRepository(this.quizRepo!, this.mongoAdapter);
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

  buildMultiplayerSessionHistoryRepository(): MultiplayerSessionHistoryRepository {
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
