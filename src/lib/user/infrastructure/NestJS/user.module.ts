import { Get, Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmUserEntity } from "../TypeOrm/TypeOrmUserEntity";
import { UserController } from "./user.controller";
import { TypeOrmUserRepository } from "../TypeOrm/TypeOrmUserRepository";
import { GetOneUserByIdQueryHandler } from "../../application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { GetAllUsersQueryHandler } from "../../application/Handlers/Querys/GetAllUsersQueryHandler";
import { CreateUserCommandHandler } from "../../application/Handlers/Commands/CreateUserCommandHandler";
import { DeleteUserCommandHandler } from "../../application/Handlers/Commands/DeleteUserCommandHandler";
import { EditUserCommandHandler } from "../../application/Handlers/Commands/EditUserCommandHandler";
import { GetOneUserByUserNameQueryHandler } from "../../application/Handlers/Querys/GetOneUserByUserNameQueryHandler";
import { GetOneUserByEmailQueryHandler } from "../../application/Handlers/Querys/GetOneUserByEmailQueryHandler";
import { EnablePremiumMembershipCommandHandler } from "../../application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { EnableFreeMembershipCommandHandler } from "../../application/Handlers/Commands/EnableFreeMembershipCommandHandler";
import { ErrorHandlingDecorator } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling.decorator";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";
import { AuthorizationDecorator } from "src/lib/shared/aspects/auth/application/decorators/authorization.decorator";
import {
  ILoggerPort,
  LOGGER_PORT,
} from "src/lib/shared/aspects/logger/domain/ports/logger.port";
import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";
import { AuthAspectModule } from "src/lib/shared/aspects/auth/infrastructure/auth.module";
import { AuthModule } from "src/lib/auth/infrastructure/NestJs/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([TypeOrmUserEntity]),
    forwardRef(() => AuthModule),
    LoggerModule,
    AuthAspectModule,
  ],
  controllers: [UserController],
  providers: [
    {
      provide: "UserRepository",
      useClass: TypeOrmUserRepository,
    },
    {
      provide: GetAllUsersQueryHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new GetAllUsersQueryHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "GetAllUsersQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetAllUsersQueryHandler"
        );
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: GetOneUserByIdQueryHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new GetOneUserByIdQueryHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "GetOneUserByIdQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetOneUserByIdQueryHandler"
        );
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: GetOneUserByUserNameQueryHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new GetOneUserByUserNameQueryHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "GetOneUserByUserNameQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetOneUserByUserNameQueryHandler"
        );
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: GetOneUserByEmailQueryHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new GetOneUserByEmailQueryHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "GetOneUserByEmailQueryHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "GetOneUserByEmailQueryHandler"
        );
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: CreateUserCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new CreateUserCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "CreateUserCommandHandler"
        );
        return new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "CreateUserCommandHandler"
        );
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: DeleteUserCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new DeleteUserCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "DeleteUserCommandHandler"
        );
        const withLogging = new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "DeleteUserCommandHandler"
        );
        return new AuthorizationDecorator(withLogging);
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: EditUserCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new EditUserCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "EditUserCommandHandler"
        );
        const withLogging = new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "EditUserCommandHandler"
        );
        return new AuthorizationDecorator(withLogging);
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: EnablePremiumMembershipCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new EnablePremiumMembershipCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "EnablePremiumMembershipCommandHandler"
        );
        const withLogging = new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "EnablePremiumMembershipCommandHandler"
        );
        return new AuthorizationDecorator(withLogging);
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: EnableFreeMembershipCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new EnableFreeMembershipCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(
          useCase,
          logger,
          "EnableFreeMembershipCommandHandler"
        );
        const withLogging = new LoggingUseCaseDecorator(
          withErrorHandling,
          logger,
          "EnableFreeMembershipCommandHandler"
        );
        return new AuthorizationDecorator(withLogging);
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
  ],
  exports: [
    "UserRepository",
    TypeOrmModule,
    CreateUserCommandHandler,
    GetOneUserByEmailQueryHandler,
    GetOneUserByUserNameQueryHandler,
    GetOneUserByIdQueryHandler,
  ],
})
export class UserModule {}
