import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
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
import { UserNotFoundError } from "../../domain/error/UserNotFoundError";
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
    return (await this.getAllUsers.run()).map((user) => user.toPlainObject());
  }

  @Get(":id")
  async getOneById(@Param() params: FindByIdParams) {
    try {
      return (await this.getOneUserById.run(params.id)).toPlainObject();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      }
    }
  }

  @Get(":userName")
  async getOneUserByName(@Param() params: FindByUserNameParams) {
    try {
      return (
        await this.getOneUserByUserName.run(params.userName)
      ).toPlainObject();
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      }
    }
  }

  @Post()
  async create(@Body() body: Create) {
    return await this.createUser.run(
      body.id,
      body.userName,
      body.email,
      body.hasshedPassword,
      body.userType,
      body.avatarUrl
    );
  }

  @Put(":id")
  async edit(@Param() params: FindByIdParams, @Body() body: Edit) {
    const user = await this.getOneUserById.run(params.id);
    if (!user) {
      throw new Error("User not found");
    }
    return await this.editUser.run(
      user.id.value,
      body.userName,
      body.email,
      body.hasshedPassword,
      body.userType,
      body.avatarUrl,
      body.name,
      body.theme,
      body.language,
      body.gameStreak
    );
  }

  @Delete(":id")
  async delete(@Param() params: FindByIdParams) {
    return await this.deleteUser.run(params.id);
  }
}
