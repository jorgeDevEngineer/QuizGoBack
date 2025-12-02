import { Get, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmUserEntity } from "../TypeOrm/TypeOrmUserEntity";
import { UserController } from "./user.controller";
import { TypeOrmUserRepository } from "../TypeOrm/TypeOrmUserRepository";
import { GetOneUserById } from "../../aplication/GetOneUserById";
import { GetAllUsers } from "../../aplication/GetAllUsers";
import { CreateUser } from "../../aplication/CreateUser";
import { DeleteUser } from "../../aplication/DeleteUser";
import { EditUser } from "../../aplication/EditUser";
import { GetOneUserByUserName } from "../../aplication/GetOneUserByUserName";

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
  ],
})
export class UserModule {}
