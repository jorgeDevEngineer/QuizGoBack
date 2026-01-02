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
import { GetCompletedQuizSummaryDomainService } from "../../domain/services/GetCompletedQuizSummaryDomainService";
import { GetCompletedQuizSummaryQueryHandler } from "../../application/Handlers/GetCompletedQuizSummaryQueryHandler";
import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";
import { ILoggerPort } from "src/lib/shared/aspects/logger/domain/ports/logger.port";
import { ErrorHandlingDecoratorWithEither } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling-either";
import { StatisticsRepositoryBuilder } from "../TypeORM/statisticsBuilder";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TypeOrmQuizEntity,
      TypeOrmSinglePlayerGameEntity,
    ]),
    LoggerModule,
  ],
  controllers: [StatisticsController],
  providers: [
    {
      provide: "StatisticsRepositoryBuilder",
      useFactory: (dataSource: DataSource) => {
        const dbType: "postgres" | "mongo" =
          (process.env.STATISTICS_DB_TYPE as "postgres" | "mongo") ||
          "postgres";
        return new StatisticsRepositoryBuilder(dbType, dataSource)
          .withEntity("Quiz")
          .withEntity("SinglePlayerGame");
      },
      inject: [DataSource],
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
        builder: StatisticsRepositoryBuilder
      ) => builder.buildSinglePlayerGameRepository(),
      inject: ["StatisticsRepositoryBuilder"],
    },
    {
      provide: "GetUserResultsDomainService",
      useFactory: (
        singleGameRepo: SinglePlayerGameRepository,
        quizRepo: QuizRepository
      ) => new GetUserResultsDomainService(singleGameRepo, quizRepo),
      inject: ["SinglePlayerGameRepository", "QuizRepository"],
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
      provide: "GetCompletedQuizSummaryDomainService",
      useFactory: (
        singleGameRepo: SinglePlayerGameRepository,
        quizRepo: QuizRepository
      ) => new GetCompletedQuizSummaryDomainService(singleGameRepo, quizRepo),
      inject: ["SinglePlayerGameRepository", "QuizRepository"],
    },
    {
      provide: "GetCompletedQuizSummaryQueryHandler",
      useFactory: (
        logger: ILoggerPort,
        dService: GetCompletedQuizSummaryDomainService
      ) => {
        const realHandler = new GetCompletedQuizSummaryQueryHandler(dService);
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
      inject: ["ILoggerPort", "GetCompletedQuizSummaryDomainService"],
    },
  ],
})
export class StatisticsModule {}
