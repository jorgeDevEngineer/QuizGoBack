import { Get, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmUserEntity } from "../TypeOrm/TypeOrmUserEntity";
import { UserController } from "./user.controller";
import { TypeOrmUserRepository } from "../TypeOrm/TypeOrmUserRepository";
import { GetOneUserById } from "../../application/Handlers/Querys/GetOneUserById";
import { GetAllUsers } from "../../application/Handlers/Querys/GetAllUsers";
import { CreateUser } from "../../application/Handlers/Commands/CreateUser";
import { DeleteUser } from "../../application/Handlers/Commands/DeleteUser";
import { EditUser } from "../../application/Handlers/Commands/EditUser";
import { GetOneUserByUserName } from "../../application/Handlers/Querys/GetOneUserByUserName";
import { EnablePremiumMembership } from "../../application/Handlers/Commands/EnablePremiumMembership";
import { EnableFreeMembership } from "../../application/Handlers/Commands/EnableFreeMembership";

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUserEntity])],
  controllers: [UserController],
  providers: [
    {
      provide: "UserRepository",
      useClass: TypeOrmUserRepository,
    },
    {
      provide: "GetAllUsers",
      useFactory: (repository: TypeOrmUserRepository) =>
        new GetAllUsers(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "GetOneUserById",
      useFactory: (repository: TypeOrmUserRepository) =>
        new GetOneUserById(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "GetOneUserByUserName",
      useFactory: (repository: TypeOrmUserRepository) =>
        new GetOneUserByUserName(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "CreateUser",
      useFactory: (repository: TypeOrmUserRepository) =>
        new CreateUser(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "DeleteUser",
      useFactory: (repository: TypeOrmUserRepository) =>
        new DeleteUser(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "EditUser",
      useFactory: (repository: TypeOrmUserRepository) =>
        new EditUser(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "EnablePremiumMembership",
      useFactory: (repository: TypeOrmUserRepository) =>
        new EnablePremiumMembership(repository),
      inject: ["UserRepository"],
    },
    {
      provide: "EnableFreeMembership",
      useFactory: (repository: TypeOrmUserRepository) =>
        new EnableFreeMembership(repository),
      inject: ["UserRepository"],
    },
  ],
})
export class UserModule {}
