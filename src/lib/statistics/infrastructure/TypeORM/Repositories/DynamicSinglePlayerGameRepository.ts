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
import { SinglePlayerGameId } from "src/lib/shared/domain/ids";
import { QuizId, UserId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { Repository } from "typeorm";
import { CompletedQuizQueryCriteria } from "src/lib/statistics/application/Response Types/CompletedQuizQueryCriteria";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { TypeOrmPostgresCriteriaApplier } from "../Criteria Appliers/Postgres/TypeOrmPostgresCriteriaApplier";
import {
  MongoCriteriaApplier,
  MongoFindParams,
} from "../Criteria Appliers/Mongo/MongoCriteriaApplier";
import { ObjectId } from "mongodb";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { Optional } from "src/lib/shared/Type Helpers/Optional";

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
    private readonly pgCriteriaApplier: TypeOrmPostgresCriteriaApplier<TypeOrmSinglePlayerGameEntity>,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoCriteriaApplier<MongoSinglePlayerGameDoc>
  ) {}

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

  async findCompletedGames(
    playerId: UserId,
    criteria: CompletedQuizQueryCriteria
  ): Promise<{ games: SinglePlayerGame[]; totalGames: number } | null> {
    try {
      const db = this.mongoAdapter.getConnection("singlePlayerGame");
      const collection = (await db).collection<MongoSinglePlayerGameDoc>(
        "singlePlayerGame"
      );

      // Filtro Base
      const baseFilter: MongoFindParams<any> = {
        filter: {
          playerId: playerId.value,
          status: GameProgressStatus.COMPLETED,
        },
      };

      // Aplicar Criterios
      const { filter, options } = this.mongoCriteriaApplier.apply(
        baseFilter,
        criteria
      );

      // Ejecutar Consulta
      const results = await collection.find(filter, options).toArray();

      const domainData = results.map((doc) => this.mapMongoToDomain(doc));

      return { games: domainData, totalGames: results.length };
    } catch (error) {
      let qb = this.gameRepo.createQueryBuilder("game");
      qb.where("game.playerId = :playerId", {
        playerId: playerId.getValue(),
      }).andWhere("game.status = :status", {
        status: GameProgressStatus.COMPLETED,
      });

      qb = this.pgCriteriaApplier.apply(qb, criteria, "game");

      const entities = await qb.getMany();
      const totalCount = await this.gameRepo.count();
      const domainData = entities.map((entity) => entity.toDomain());
      return { games: domainData, totalGames: totalCount };
    }
  }

  async findById(gameId: SinglePlayerGameId): Promise<SinglePlayerGame | null> {
    try {
      const db = this.mongoAdapter.getConnection("singlePlayerGame");
      const collection = (await db).collection<MongoSinglePlayerGameDoc>(
        "singlePlayerGame"
      );

      const id = gameId.getId();
      const doc = await collection.findOne({ id: id });
      return doc ? this.mapMongoToDomain(doc) : null;
    } catch (error) {
      const entity = await this.gameRepo.findOne({
        where: { gameId: gameId.getId() },
      });
      return entity ? entity.toDomain() : null;
    }
  }
}
