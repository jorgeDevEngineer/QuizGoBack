import { InjectRepository } from "@nestjs/typeorm";
import { SinglePlayerGameRepository } from "../../../domain/port/SinglePlayerRepository";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { Injectable } from "@nestjs/common";
import { SinglePlayerGame } from "src/lib/singlePlayerGame/domain/aggregates/SinglePlayerGame";
import {
  EvaluatedAnswer,
  GameProgress,
  GameProgressStatus,
  PlayerAnswer,
  QuestionResult,
} from "src/lib/singlePlayerGame/domain/valueObjects/SinglePlayerGameVOs";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CriteriaApplier } from "src/lib/library/domain/port/CriteriaApplier";
import { QuizQueryCriteria } from "src/lib/library/application/Response Types/QuizQueryCriteria";
import { MongoFindParams } from "../Criteria Appliers/Mongo/MongoAdvancedCriteriaApplier";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { ObjectId } from "mongodb";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";
import { MongoCriteriaApplier } from "../Criteria Appliers/Mongo/MongoCriteriaApplier";

type MongoSinglePlayerGameDoc = {
  _id: ObjectId; // ID nativo de Mongo
  gameId: string; // si lo guardas explícito además del _id
  quizId: string;
  playerId: string;
  totalQuestions: number;
  progress: number;
  score: number;
  startedAt: Date;
  completedAt?: Date;
  questionResults: {
    questionId: string;
    answerIndex: number[];
    timeUsedMs: number;
    wasCorrect: boolean;
    pointsEarned: number;
  }[];
};

@Injectable()
export class DynamicSinglePlayerGameRepository
  implements SinglePlayerGameRepository
{
  constructor(
    @InjectRepository(TypeOrmSinglePlayerGameEntity)
    private readonly gameRepo: Repository<TypeOrmSinglePlayerGameEntity>,
    private readonly pgCriteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmSinglePlayerGameEntity>,
      QuizQueryCriteria
    >,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoCriteriaApplier<MongoSinglePlayerGameDoc>
  ) {}

  async findInProgressGames(
    playerId: UserId,
    criteria: QuizQueryCriteria
  ): Promise<[SinglePlayerGame[], number]> {
    try {
      // 🔑 Intentar Mongo primero
      const db = await this.mongoAdapter.getConnection("singlePlayerGame");
      const collection =
        db.collection<MongoSinglePlayerGameDoc>("singlePlayerGame");

      const params: MongoFindParams<any> = {
        filter: {
          playerId: playerId.getValue(),
          status: GameProgressStatus.IN_PROGRESS,
        },
      };

      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );
      const docs = await collection
        .find(filter, options)
        .sort({ startedAt: -1 })
        .toArray();

      return [docs.map((doc) => this.mapMongoToDomain(doc)), docs.length];
    } catch {
      // 🔑 Fallback a Postgres
      let qb = this.gameRepo.createQueryBuilder("game");
      qb.where("game.playerId = :playerId", {
        playerId: playerId.getValue(),
      }).andWhere("game.status = :status", {
        status: GameProgressStatus.IN_PROGRESS,
      });

      qb = this.pgCriteriaApplier.apply(qb, criteria, "game");

      const [entities, totalCount] = await qb.getManyAndCount();
      return [entities.map((entity) => entity.toDomain()), totalCount];
    }
  }

  async findCompletedGames(
    playerId: UserId,
    criteria: QuizQueryCriteria
  ): Promise<[SinglePlayerGame[], number]> {
    try {
      // 🔑 Intentar Mongo primero
      const db = await this.mongoAdapter.getConnection("singlePlayerGame");
      const collection =
        db.collection<MongoSinglePlayerGameDoc>("singlePlayerGame");

      const params: MongoFindParams<any> = {
        filter: {
          playerId: playerId.getValue(),
          status: GameProgressStatus.COMPLETED,
        },
      };

      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );
      const docs = await collection
        .find(filter, options)
        .sort({ startedAt: -1 })
        .toArray();

      return [docs.map((doc) => this.mapMongoToDomain(doc)), docs.length];
    } catch {
      // 🔑 Fallback a Postgres
      let qb = this.gameRepo.createQueryBuilder("game");
      qb.where("game.playerId = :playerId", {
        playerId: playerId.getValue(),
      }).andWhere("game.status = :status", {
        status: GameProgressStatus.COMPLETED,
      });

      qb = this.pgCriteriaApplier.apply(qb, criteria, "game");
      qb.orderBy("game.startedAt", "DESC");

      const [entities, totalCount] = await qb.getManyAndCount();
      return [entities.map((entity) => entity.toDomain()), totalCount];
    }
  }

  private mapMongoToDomain(doc: MongoSinglePlayerGameDoc): SinglePlayerGame {
    const questionResults = doc.questionResults.map((qr) => {
      const playerAnswer = PlayerAnswer.create(
        QuestionId.of(qr.questionId),
        qr.answerIndex,
        qr.timeUsedMs
      );

      const evaluatedAnswer = EvaluatedAnswer.create(
        qr.wasCorrect,
        qr.pointsEarned
      );

      return QuestionResult.create(
        QuestionId.of(qr.questionId),
        playerAnswer,
        evaluatedAnswer
      );
    });

    return SinglePlayerGame.fromDb(
      SinglePlayerGameId.of(doc._id.toString()),
      QuizId.of(doc.quizId),
      doc.totalQuestions,
      UserId.of(doc.playerId),
      GameProgress.create(doc.progress),
      GameScore.create(doc.score),
      new Date(doc.startedAt),
      doc.completedAt
        ? new Optional<Date>(new Date(doc.completedAt))
        : new Optional(),
      questionResults
    );
  }
}
