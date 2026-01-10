import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmQuizEntity } from "src/lib/kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { StatisticsController } from "./statistics.controller";
import { DataSource } from "typeorm";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";
import { QuizRepository } from "src/lib/kahoot/domain/port/QuizRepository";
import { GetUserResultsDomainService } from "../../domain/services/GetUserResultsDomainService";
import { GetUserResultsQueryHandler } from "../../application/Handlers/GetUserResultsQueryHandler";
import { GetSingleCompletedQuizSummaryDomainService } from "../../domain/services/GetSingleCompletedQuizSummaryDomainService";
import { GetSingleCompletedQuizSummaryQueryHandler } from "../../application/Handlers/GetSingleCompletedQuizSummaryQueryHandler";
import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";
import { ILoggerPort } from "src/lib/shared/aspects/logger/domain/ports/logger.port";
import { ErrorHandlingDecoratorWithEither } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling-either";
import { StatisticsRepositoryBuilder } from "../TypeORM/statisticsBuilder";
import { DynamicMongoAdapter } from "src/lib/shared/infrastructure/database/dynamic-mongo.adapter";
import { DatabaseModule } from "src/lib/shared/infrastructure/database/database.module";
import { MultiplayerSessionHistoryRepository } from "../../domain/port/MultiplayerSessionHistoryRepository";
import { GetSessionReportDomainService } from "../../domain/services/GetSessionReportDomainService";
import { GetSessionReportQueryHandler } from "../../application/Handlers/GetSessionReportQueryHandler";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TypeOrmQuizEntity,
      TypeOrmSinglePlayerGameEntity,
    ]),
    LoggerModule,
    DatabaseModule,
  ],
  controllers: [StatisticsController],
  providers: [
    {
      provide: "StatisticsRepositoryBuilder",
      useFactory: (
        dataSource: DataSource,
        mongoAdapter: DynamicMongoAdapter
      ) => {
        return new StatisticsRepositoryBuilder(mongoAdapter, dataSource)
          .withEntity("Quiz")
          .withEntity("SinglePlayerGame")
          .withEntity("MultiplayerSession");
      },
      inject: [DataSource, DynamicMongoAdapter],
    },
    {
      provide: "QuizRepository",
      useFactory: (builder: StatisticsRepositoryBuilder) =>
        builder.buildQuizRepository(),
      inject: ["StatisticsRepositoryBuilder"],
    },
    {
      provide: "SinglePlayerGameRepository",
      useFactory: (
        builder: StatisticsRepositoryBuilder,
        mongoAdapter: DynamicMongoAdapter
      ) => builder.buildSinglePlayerGameRepository(),
      inject: ["StatisticsRepositoryBuilder", DynamicMongoAdapter],
    },
    {
      provide: "MultiplayerSessionHistoryRepository",
      useFactory: (
        builder: StatisticsRepositoryBuilder,
        mongoAdapter: DynamicMongoAdapter
      ) => builder.buildMultiplayerSessionHistoryRepository(),
      inject: ["StatisticsRepositoryBuilder"],
    },
    {
      provide: "GetUserResultsDomainService",
      useFactory: (
        singleGameRepo: SinglePlayerGameRepository,
        quizRepo: QuizRepository,
        multiSessionRepo: MultiplayerSessionHistoryRepository
      ) =>
        new GetUserResultsDomainService(
          singleGameRepo,
          multiSessionRepo,
          quizRepo
        ),
      inject: [
        "SinglePlayerGameRepository",
        "QuizRepository",
        "MultiplayerSessionHistoryRepository",
      ],
    },
    {
      provide: "GetUserResultsQueryHandler",
      useFactory: (
        logger: ILoggerPort,
        dService: GetUserResultsDomainService
      ) => {
        const realHandler = new GetUserResultsQueryHandler(dService);
        const withErrorHandling = new ErrorHandlingDecoratorWithEither(
          realHandler,
          logger,
          "GetUserResultsQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetUserResultsQueryHandler"
        );
      },
      inject: ["ILoggerPort", "GetUserResultsDomainService"],
    },
    {
      provide: "GetSingleCompletedQuizSummaryDomainService",
      useFactory: (
        singleGameRepo: SinglePlayerGameRepository,
        quizRepo: QuizRepository
      ) =>
        new GetSingleCompletedQuizSummaryDomainService(
          singleGameRepo,
          quizRepo
        ),
      inject: ["SinglePlayerGameRepository", "QuizRepository"],
    },
    {
      provide: "GetSingleCompletedQuizSummaryQueryHandler",
      useFactory: (
        logger: ILoggerPort,
        dService: GetSingleCompletedQuizSummaryDomainService
      ) => {
        const realHandler = new GetSingleCompletedQuizSummaryQueryHandler(
          dService
        );
        const withErrorHandling = new ErrorHandlingDecoratorWithEither(
          realHandler,
          logger,
          "GetCompletedQuizSummaryQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetCompletedQuizSummaryQueryHandler"
        );
      },
      inject: ["ILoggerPort", "GetSingleCompletedQuizSummaryDomainService"],
    },
    {
      provide: "GetSessionReportDomainService",
      useFactory: (
        multiSessionRepo: MultiplayerSessionHistoryRepository,
        quizRepo: QuizRepository
      ) => new GetSessionReportDomainService(multiSessionRepo, quizRepo),
      inject: ["MultiplayerSessionHistoryRepository", "QuizRepository"],
    },
    {
      provide: "GetSessionReportQueryHandler",
      useFactory: (
        logger: ILoggerPort,
        dService: GetSessionReportDomainService
      ) => {
        const realHandler = new GetSessionReportQueryHandler(dService);
        const withErrorHandling = new ErrorHandlingDecoratorWithEither(
          realHandler,
          logger,
          "GetSessionReportQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetSessionReportQueryHandler"
        );
      },
      inject: ["ILoggerPort", "GetSessionReportDomainService"],
    },
  ],
})
export class StatisticsModule {}
