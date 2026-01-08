import { Get, Module } from "@nestjs/common";
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
import { EnablePremiumMembershipCommandHandler } from "../../application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { EnableFreeMembershipCommandHandler } from "../../application/Handlers/Commands/EnableFreeMembershipCommandHandler";
import { ErrorHandlingDecorator } from "src/lib/shared/aspects/error-handling/application/decorators/error-handling.decorator";
import { LoggingUseCaseDecorator } from "src/lib/shared/aspects/logger/application/decorators/logging.decorator";
import { ILoggerPort, LOGGER_PORT } from "src/lib/shared/aspects/logger/domain/ports/logger.port";
import { LoggerModule } from "src/lib/shared/aspects/logger/infrastructure/logger.module";

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserEntity]), LoggerModule],
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
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'GetAllUsersQueryHandler');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'GetAllUsersQueryHandler');
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: GetOneUserByIdQueryHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new GetOneUserByIdQueryHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'GetOneUserByIdQueryHandler');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'GetOneUserByIdQueryHandler');
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: GetOneUserByUserNameQueryHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new GetOneUserByUserNameQueryHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'GetOneUserByUserNameQueryHandler');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'GetOneUserByUserNameQueryHandler');
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: CreateUserCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new CreateUserCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'CreateUserCommandHandler');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'CreateUserCommandHandler');
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: DeleteUserCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new DeleteUserCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'DeleteUserCommandHandler');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'DeleteUserCommandHandler');
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: EditUserCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new EditUserCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'EditUserCommandHandler');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'EditUserCommandHandler');
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: EnablePremiumMembershipCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new EnablePremiumMembershipCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'EnablePremiumMembershipCommandHandler');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'EnablePremiumMembershipCommandHandler');
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
    {
      provide: EnableFreeMembershipCommandHandler,
      useFactory: (logger: ILoggerPort, repository: TypeOrmUserRepository) => {
        const useCase = new EnableFreeMembershipCommandHandler(repository);
        const withErrorHandling = new ErrorHandlingDecorator(useCase, logger, 'EnableFreeMembershipCommandHandler');
        return new LoggingUseCaseDecorator(withErrorHandling, logger, 'EnableFreeMembershipCommandHandler');
      },
      inject: [LOGGER_PORT, "UserRepository"],
    },
  ],
})
export class UserModule {}
