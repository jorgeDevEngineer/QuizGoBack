import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import { GetAllUsers } from "../../aplication/GetAllUsers";
import { GetOneUserById } from "../../aplication/GetOneUserById";
import { GetOneUserByUserName } from "../../aplication/GetOneUserByUserName";
import { CreateUser } from "../../aplication/CreateUser";
import { EditUser } from "../../aplication/EditUser";
import { DeleteUser } from "../../aplication/DeleteUser";
import { FindByIdParams, FindByUserNameParams } from "./Validations";
import { UserNotFoundError } from "../../aplication/error/UserNotFoundError";
import { Create, Edit } from "./Validations";

@Controller("user")
export class UserController {
  constructor(
    @Inject("GetAllUsers") private readonly getAllUsers: GetAllUsers,
    @Inject("GetOneUserById") private readonly getOneUserById: GetOneUserById,
    @Inject("GetOneUserByUserName")
    private readonly getOneUserByUserName: GetOneUserByUserName,
    @Inject("CreateUser") private readonly createUser: CreateUser,
    @Inject("EditUser") private readonly editUser: EditUser,
    @Inject("DeleteUser") private readonly deleteUser: DeleteUser
  ) {}

  @Get()
  async getAll() {
    try {
      return (await this.getAllUsers.run()).map((user) => user.toPlainObject());
    } catch (error) {
      throw new InternalServerErrorException(
        "Could not fetch users: " + error.message
      );
    }
  }

  @Get(":id")
  async getOneById(@Param() params: FindByIdParams) {
    try {
      return (await this.getOneUserById.run(params.id)).toPlainObject();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not fetch users: " + error.message
        );
      }
    }
  }

  @Get("username/:userName")
  async getOneUserByName(@Param() params: FindByUserNameParams) {
    try {
      return (
        await this.getOneUserByUserName.run(params.userName)
      ).toPlainObject();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not fetch users: " + error.message
        );
      }
    }
  }

  @Post()
  async create(@Body() body: Create) {
    try {
      return await this.createUser.run(
        body.userName,
        body.email,
        body.hashedPassword,
        body.userType,
        body.avatarUrl
      );
    } catch (error) {
      throw new InternalServerErrorException(
        "Could not create user : " + error.message
      );
    }
  }

  @Patch(":id")
  async edit(@Param() params: FindByIdParams, @Body() body: Edit) {
    try {
      const user = await this.getOneUserById.run(params.id);
      return await this.editUser.run(
        body.userName,
        body.email,
        body.hashedPassword,
        body.userType,
        body.avatarUrl,
        user.id.value,
        body.name,
        body.theme,
        body.language,
        body.gameStreak
      );
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not edit user : " + error.message
        );
      }
    }
  }

  @Delete(":id")
  async delete(@Param() params: FindByIdParams) {
    try {
      const user = await this.getOneUserById.run(params.id);
      return await this.deleteUser.run(params.id);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not delete user : " + error.message
        );
      }
    }
  }
}
