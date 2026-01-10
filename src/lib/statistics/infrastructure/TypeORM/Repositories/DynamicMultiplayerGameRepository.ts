import { Injectable } from "@nestjs/common";
import { Optional } from "src/lib/shared/Type Helpers/Optional";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { MultiplayerSessionHistoryRepository } from "../../../domain/port/MultiplayerSessionHistoryRepository";
import { TypeOrmMultiplayerSessionEntity } from "src/lib/multiplayer/infrastructure/repositories/TypeOrm/TypeOrmMultiplayerSessionEntity";
import { MultiplayerSession } from "src/lib/multiplayer/domain/aggregates/MultiplayerSession";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { CompletedQuizQueryCriteria } from "src/lib/statistics/application/Response Types/CompletedQuizQueryCriteria";
import { CriteriaApplier } from "src/lib/library/domain/port/CriteriaApplier";
import { QuizId } from "src/lib/kahoot/domain/valueObject/Quiz";
import { UserId } from "src/lib/user/domain/valueObject/UserId";
import { ObjectId } from "mongodb";
import { QuestionId } from "src/lib/kahoot/domain/valueObject/Question";
import { Player } from "src/lib/multiplayer/domain/entities/Player";
import {
  MultiplayerQuestionResult,
  MultiplayerAnswer,
  LeaderboardEntry,
  Leaderboard,
  SessionProgress,
  SessionPin,
  SessionState,
  SessionStateType,
} from "src/lib/multiplayer/domain/valueObjects/multiplayerVOs";
import {
  PlayerId,
  PlayerNickname,
} from "src/lib/multiplayer/domain/valueObjects/playerVOs";
import { MultiplayerSessionId } from "src/lib/shared/domain/ids";
import { GameScore } from "src/lib/shared/domain/valueObjects";
import { MongoCriteriaApplier } from "../Criteria Appliers/Mongo/MongoCriteriaApplier";

type MongoMultiplayerSessionDoc = {
  _id: ObjectId; // identificador nativo de Mongo
  hostId: string;
  quizId: string;
  sessionPin: string;
  startedAt: Date;
  completedAt?: Date;
  currentQuestionStartTime: Date;
  sessionState: string; // SessionStateType como string

  leaderboard: {
    playerId: string;
    nickname: string;
    score: number;
    rank: number;
    previousRank: number;
  }[];

  progress: {
    currentQuestion: string;
    previousQuestion: string | null;
    totalQuestions: number;
    questionsAnswered: number;
  };

  players: {
    playerId: string;
    nickname: string;
    score: number;
    streak: number;
    isGuest: boolean;
  }[];

  playersAnswers: {
    questionId: string;
    answers: {
      playerId: string;
      questionId: string;
      answerIndex: number[];
      isCorrect: boolean;
      earnedScore: number;
      timeElapsed: number;
    }[];
  }[];
};

@Injectable()
export class DynamicMultiplayerGameRepository
  implements MultiplayerSessionHistoryRepository
{
  constructor(
    @InjectRepository(TypeOrmMultiplayerSessionEntity)
    private readonly sessionRepository: Repository<TypeOrmMultiplayerSessionEntity>,
    private readonly pgCriteriaApplier: CriteriaApplier<
      SelectQueryBuilder<TypeOrmMultiplayerSessionEntity>,
      CompletedQuizQueryCriteria
    >,
    private readonly mongoAdapter: DynamicMongoAdapter,
    private readonly mongoCriteriaApplier: MongoCriteriaApplier<MongoMultiplayerSessionDoc>
  ) {}

  async findCompletedSessions(
    playerId: UserId,
    criteria: CompletedQuizQueryCriteria
  ): Promise<[MultiplayerSession[], number]> {
    try {
      // 🔹 Mongo
      const db = await this.mongoAdapter.getConnection("multiplayerSessions");
      const collection = db.collection<MongoMultiplayerSessionDoc>(
        "multiplayerSessions"
      );

      const params = {
        filter: {
          sessionState: "COMPLETED",
          "players.playerId": playerId.getValue(),
        },
      };

      const { filter, options } = this.mongoCriteriaApplier.apply(
        params,
        criteria
      );
      const docs = await collection.find(filter, options).toArray();
      const total = await collection.countDocuments(filter);

      const sessions = docs.map((doc) => this.mapMongoToDomain(doc));
      return [sessions, total];
    } catch (error) {
      // 🔹 Postgres
      let qb = this.sessionRepository.createQueryBuilder("multiPlayerSession");

      qb.andWhere(`multiPlayerSession.sessionState = :status`, {
        status: "COMPLETED",
      });

      qb.andWhere(`multiPlayerSession.players @> :playerJson`, {
        playerJson: JSON.stringify([{ playerId: playerId.getValue() }]),
      });

      qb = this.pgCriteriaApplier.apply(qb, criteria, "multiPlayerSession");

      const [entities, total] = await qb.getManyAndCount();
      return [entities.map((entity) => entity.toDomain()), total];
    }
  }

  async findbyId(
    sessionId: MultiplayerSessionId
  ): Promise<MultiplayerSession | null> {
    try {
      const db = await this.mongoAdapter.getConnection("multiplayerSessions");
      const collection = db.collection<MongoMultiplayerSessionDoc>(
        "multiplayerSessions"
      );
      const id = sessionId.getId();
      const doc = await collection.findOne({ id: id });
      return doc ? this.mapMongoToDomain(doc) : null;
    } catch (error) {
      const entity = await this.sessionRepository.findOne({
        where: { sessionId: sessionId.getId() },
      });
      return entity ? entity.toDomain() : null;
    }
  }

  private mapMongoToDomain(
    doc: MongoMultiplayerSessionDoc
  ): MultiplayerSession {
    // 🔹 Convertir players JSON a Map<PlayerId, Player>
    const playersMap = new Map<string, Player>();
    doc.players.forEach((playerJson) => {
      const player = Player.create(
        PlayerId.of(playerJson.playerId),
        PlayerNickname.create(playerJson.nickname),
        GameScore.create(playerJson.score),
        playerJson.streak,
        playerJson.isGuest
      );
      playersMap.set(playerJson.playerId, player);
    });

    // 🔹 Convertir playersAnswers JSON a Map<QuestionId, MultiplayerQuestionResult>
    const answersMap = new Map<string, MultiplayerQuestionResult>();
    doc.playersAnswers.forEach((resultJson) => {
      const questionId = QuestionId.of(resultJson.questionId);

      const answersMapForQuestion = new Map<string, MultiplayerAnswer>();
      resultJson.answers.forEach((answerJson) => {
        const answer = MultiplayerAnswer.create(
          PlayerId.of(answerJson.playerId),
          QuestionId.of(answerJson.questionId),
          answerJson.answerIndex,
          answerJson.isCorrect,
          GameScore.create(answerJson.earnedScore),
          answerJson.timeElapsed
        );
        answersMapForQuestion.set(answerJson.playerId, answer);
      });

      const questionResult = MultiplayerQuestionResult.fromMap(
        questionId,
        answersMapForQuestion
      );
      answersMap.set(resultJson.questionId, questionResult);
    });

    // 🔹 Convertir leaderboard JSON a Leaderboard
    const leaderboardEntries: LeaderboardEntry[] = doc.leaderboard.map(
      (entryJson) =>
        LeaderboardEntry.create(
          PlayerId.of(entryJson.playerId),
          PlayerNickname.create(entryJson.nickname),
          GameScore.create(entryJson.score),
          entryJson.rank,
          entryJson.previousRank
        )
    );
    const leaderboard = Leaderboard.fromMap(leaderboardEntries);

    // 🔹 Convertir progress JSON a SessionProgress
    const progress = SessionProgress.create(
      QuestionId.of(doc.progress.currentQuestion),
      doc.progress.previousQuestion
        ? new Optional<QuestionId>(QuestionId.of(doc.progress.previousQuestion))
        : new Optional<QuestionId>(undefined),
      doc.progress.totalQuestions,
      doc.progress.questionsAnswered
    );

    // 🔹 Crear el agregado MultiplayerSession
    return MultiplayerSession.fromDb(
      MultiplayerSessionId.of(doc._id.toString()),
      UserId.of(doc.hostId),
      QuizId.of(doc.quizId),
      SessionPin.create(doc.sessionPin),
      new Date(doc.startedAt),
      new Optional<Date>(
        doc.completedAt ? new Date(doc.completedAt) : undefined
      ),
      new Date(doc.currentQuestionStartTime),
      SessionState.createAsAny(doc.sessionState as SessionStateType),
      leaderboard,
      progress,
      playersMap,
      answersMap
    );
  }
}
