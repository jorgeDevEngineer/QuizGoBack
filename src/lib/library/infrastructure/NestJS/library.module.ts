import { Module } from "@nestjs/common";
import { LibraryController } from "./library.controller";
import { AddUserFavoriteQuizCommandHanlder } from "../../application/Handlers/Commands/AddUserFavoriteQuizCommandHandler";
import { DeleteUserFavoriteQuizCommandHandler } from "../../application/Handlers/Commands/DeleteUserFavoriteQuizCommandHandler";
import { GetUserFavoriteQuizzesQueryHandler } from "../../application/Handlers/Querys/GetUserFavoriteQuizzesQueryHandler";
import { GetAllUserQuizzesQueryHandler } from "../../application/Handlers/Querys/GetAllUserQuizzesQueryHandler";
import { GetUserInProgressQuizzesQueryHandler } from "../../application/Handlers/Querys/GetUserInProgessQuizzesQueryHandler";
import { GetUserCompletedQuizzesQueryHandler } from "../../application/Handlers/Querys/GetUserCompletedQuizzesQueryHandler";
import { UserFavoriteQuizRepository } from "../../domain/port/UserFavoriteQuizRepository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmPostgresUserFavoriteQuizEntity } from "../TypeOrm/Entities/TypeOrmPostgresUserFavoriteQuizEntity";
import { TypeOrmQuizEntity } from "../../../kahoot/infrastructure/TypeOrm/TypeOrmQuizEntity";
import { UserRepository } from "../../../user/domain/port/UserRepository";
import { TypeOrmUserEntity } from "../../../user/infrastructure/TypeOrm//TypeOrmUserEntity";
import { SinglePlayerGameRepository } from "../../domain/port/SinglePlayerRepository";
import { TypeOrmSinglePlayerGameEntity } from "src/lib/singlePlayerGame/infrastructure/TypeOrm/TypeOrmSinglePlayerGameEntity";
import { QuizRepository } from "../../domain/port/QuizRepository";
import { DataSource } from "typeorm";
import { GetAllUserQuizzesDomainService } from "../../domain/services/Queries/GetAllUserQuizzesDomainService";
import { GetUserInProgressQuizzesDomainService } from "../../domain/services/Queries/GetUserInProgressQuizzesDomainService";
import { DynamicMongoAdapter } from "../../../shared/infrastructure/database/dynamic-mongo.adapter";
import { GetUserFavoriteQuizzesDomainService } from "../../domain/services/Queries/GetUserFavoriteQuizzesDomainService";
import { GetUserCompletedQuizzesDomainService } from "../../domain/services/Queries/GetUserCompletedQuizzesDomainService";
import { AddUserFavoriteQuizDomainService } from "../../domain/services/Commands/AddUserFavoriteQuizDomainService";
import { DeleteUserFavoriteQuizDomainService } from "../../domain/services/Commands/DeleteUserFavoriteQuizDomainService";
import { ILoggerPort } from "src/lib/shared/aspects/logger/domain/ports/logger.port";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";
import { ErrorHandlingDecoratorWithEither } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling-either";
import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";
import { LibraryRepositoryBuilder } from "../TypeOrm/libraryBuilder";
import { MultiplayerSessionHistoryRepository } from "../../domain/port/MultiplayerSessionHistoryRepository";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TypeOrmPostgresUserFavoriteQuizEntity,
      TypeOrmQuizEntity,
      TypeOrmUserEntity,
      TypeOrmSinglePlayerGameEntity,
    ]),
    LoggerModule,
  ],
  controllers: [LibraryController],
  providers: [
    // Repositorios construidos con sus criteria appliers correspondientes
    {
      provide: "LibraryRepositoryBuilder",
      useFactory: (
        dataSource: DataSource,
        mongoAdapter: DynamicMongoAdapter
      ) => {
        return new LibraryRepositoryBuilder(dataSource, mongoAdapter)
          .withEntity("UserFavoriteQuiz")
          .withEntity("Quiz")
          .withEntity("User")
          .withEntity("SinglePlayerGame")
          .withEntity("MultiplayerSession");
      },
      inject: [DataSource, DynamicMongoAdapter],
    },
    {
      provide: "UserFavoriteQuizRepository",
      useFactory: (builder: LibraryRepositoryBuilder) =>
        builder.buildUserFavoriteQuizRepository(),
      inject: ["LibraryRepositoryBuilder"],
    },
    {
      provide: "QuizRepository",
      useFactory: (builder: LibraryRepositoryBuilder) =>
        builder.buildQuizRepository(),
      inject: ["LibraryRepositoryBuilder"],
    },
    {
      provide: "UserRepository",
      useFactory: (builder: LibraryRepositoryBuilder) =>
        builder.buildUserRepository(),
      inject: ["LibraryRepositoryBuilder"],
    },
    {
      provide: "SinglePlayerGameRepository",
      useFactory: (builder: LibraryRepositoryBuilder) =>
        builder.buildSinglePlayerGameRepository(),
      inject: ["LibraryRepositoryBuilder"],
    },
    {
      provide: "MultiplayerSessionHistoryRepository",
      useFactory: (builder: LibraryRepositoryBuilder) =>
        builder.buildMultiplayerSessionHistoryRepository(),
      inject: ["LibraryRepositoryBuilder"],
    },
    {
      provide: "AddUserFavoriteQuizDomainService",
      useFactory: (
        userFavoriteRepository: UserFavoriteQuizRepository,
        quizRepository: QuizRepository,
        userRepository: UserRepository
      ) =>
        new AddUserFavoriteQuizDomainService(
          userFavoriteRepository,
          quizRepository,
          userRepository
        ),
      inject: [
        "UserFavoriteQuizRepository",
        "QuizRepository",
        "UserRepository",
      ],
    },
    {
      provide: "AddUserFavoriteQuizCommandHandler",
      useFactory: (
        logger: ILoggerPort,
        domainService: AddUserFavoriteQuizDomainService
      ) => {
        const realHandler = new AddUserFavoriteQuizCommandHanlder(
          domainService
        );
        const withErrorHandling = new ErrorHandlingDecoratorWithEither(
          realHandler,
          logger,
          "AddUserFavoriteQuizCommandHanlder"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "AddUserFavoriteQuizCommandHandler"
        );
      },
      inject: ["ILoggerPort", "AddUserFavoriteQuizDomainService"],
    },
    {
      provide: "DeleteUserFavoriteQuizDomainService",
      useFactory: (repository: UserFavoriteQuizRepository) =>
        new DeleteUserFavoriteQuizDomainService(repository),
      inject: ["UserFavoriteQuizRepository"],
    },
    {
      provide: "DeleteUserFavoriteQuizCommandHandler",
      useFactory: (
        logger: ILoggerPort,
        domainService: DeleteUserFavoriteQuizDomainService
      ) => {
        const realHandler = new DeleteUserFavoriteQuizCommandHandler(
          domainService
        );
        const withErrorHandling = new ErrorHandlingDecoratorWithEither(
          realHandler,
          logger,
          "DeleteUserFavoriteQuizCommandHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "DeleteUserFavoriteQuizCommandHandler"
        );
      },
      inject: ["ILoggerPort", "DeleteUserFavoriteQuizDomainService"],
    },
    {
      provide: "GetUserFavoriteQuizzesDomainService",
      useFactory: (
        favoritesRepo: UserFavoriteQuizRepository,
        userRepo: UserRepository,
        quizRepo: QuizRepository
      ) =>
        new GetUserFavoriteQuizzesDomainService(
          favoritesRepo,
          quizRepo,
          userRepo
        ),
      inject: [
        "UserFavoriteQuizRepository",
        "UserRepository",
        "QuizRepository",
      ],
    },
    {
      provide: "GetUserFavoriteQuizzesQueryHandler",
      useFactory: (
        logger: ILoggerPort,
        domainService: GetUserFavoriteQuizzesDomainService
      ) => {
        const realHandler = new GetUserFavoriteQuizzesQueryHandler(
          domainService
        );
        const withErrorHandling = new ErrorHandlingDecoratorWithEither(
          realHandler,
          logger,
          "GetUserFavoriteQuizzesQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetUserFavoriteQuizzesQueryHandler"
        );
      },
      inject: ["ILoggerPort", "GetUserFavoriteQuizzesDomainService"],
    },
    {
      provide: "GetAllUserQuizzesDomainService",
      useFactory: (quizRepository: QuizRepository, userRepo: UserRepository) =>
        new GetAllUserQuizzesDomainService(quizRepository, userRepo),
      inject: ["QuizRepository", "UserRepository"],
    },
    {
      provide: "GetAllUserQuizzesQueryHandler",
      useFactory: (domainService: GetAllUserQuizzesDomainService) =>
        new GetAllUserQuizzesQueryHandler(domainService),
      inject: ["GetAllUserQuizzesDomainService"],
    },
    {
      provide: "GetUserInProgressQuizzesDomainService",
      useFactory: (
        singlePlayerRepo: SinglePlayerGameRepository,
        multiPlayerRepo: MultiplayerSessionHistoryRepository,
        quizRepo: QuizRepository,
        userRepo: UserRepository
      ) =>
        new GetUserInProgressQuizzesDomainService(
          singlePlayerRepo,
          multiPlayerRepo,
          quizRepo,
          userRepo
        ),
      inject: [
        "SinglePlayerGameRepository",
        "QuizRepository",
        "UserRepository",
        "MultiplayerSessionHistoryRepository",
      ],
    },
    {
      provide: "GetUserInProgressQuizzesQueryHandler",
      useFactory: (
        logger: ILoggerPort,
        domainService: GetUserInProgressQuizzesDomainService
      ) => {
        const realHandler = new GetUserInProgressQuizzesQueryHandler(
          domainService
        );
        const withErrorHandling = new ErrorHandlingDecoratorWithEither(
          realHandler,
          logger,
          "GetUserInProgressQuizzesQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetUserInProgressQuizzesQueryHandler"
        );
      },
      inject: ["ILoggerPort", "GetUserInProgressQuizzesDomainService"],
    },
    {
      provide: "GetUserCompletedQuizzesDomainService",
      useFactory: (
        quizRepository: QuizRepository,
        userRepo: UserRepository,
        singlePlayerRepo: SinglePlayerGameRepository,
        multiPlayerRepo: MultiplayerSessionHistoryRepository
      ) =>
        new GetUserCompletedQuizzesDomainService(
          quizRepository,
          userRepo,
          singlePlayerRepo,
          multiPlayerRepo
        ),
      inject: [
        "QuizRepository",
        "UserRepository",
        "SinglePlayerGameRepository",
        "MultiplayerSessionHistoryRepository",
      ],
    },
    {
      provide: "GetUserCompletedQuizzesQueryHandler",
      useFactory: (
        logger: ILoggerPort,
        domainService: GetUserCompletedQuizzesDomainService
      ) => {
        const realHandler = new GetUserCompletedQuizzesQueryHandler(
          domainService
        );
        const withErrorHandling = new ErrorHandlingDecoratorWithEither(
          realHandler,
          logger,
          "GetUserCompletedQuizzesQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetUserCompletedQuizzesQueryHandler"
        );
      },
      inject: ["ILoggerPort", "GetUserCompletedQuizzesDomainService"],
    },
  ],
})
export class LibraryModule {}
