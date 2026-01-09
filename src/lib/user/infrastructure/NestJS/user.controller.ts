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
import { GetAllUsersQueryHandler } from "../../application/Handlers/Querys/GetAllUsersQueryHandler";
import { GetOneUserByIdQueryHandler } from "../../application/Handlers/Querys/GetOneUserByIdQueryHandler";
import { GetOneUserByUserNameQueryHandler } from "../../application/Handlers/Querys/GetOneUserByUserNameQueryHandler";
import { CreateUserCommandHandler } from "../../application/Handlers/Commands/CreateUserCommandHandler";
import { CreateUser } from "../../application/Parameter Objects/CreateUser";
import { EditUserCommandHandler } from "../../application/Handlers/Commands/EditUserCommandHandler";
import { DeleteUserCommandHandler } from "../../application/Handlers/Commands/DeleteUserCommandHandler";
import { FindByIdParams, FindByUserNameParams } from "./Validations";
import { UserNotFoundError } from "../../application/error/UserNotFoundError";
import { Create, Edit } from "./Validations";
import { EnableFreeMembershipCommandHandler } from "../../application/Handlers/Commands/EnableFreeMembershipCommandHandler";
import { EnablePremiumMembershipCommandHandler } from "../../application/Handlers/Commands/EnablePremiumMembershipCommandHandler";
import { MEMBERSHIP_TYPES } from "../../domain/valueObject/MembershipType";
import { GetAllUsers } from "../../application/Parameter Objects/GetAllUsers";
import { GetOneUserById } from "../../application/Parameter Objects/GetOneUserById";
import { GetOneUserByUserName } from "../../application/Parameter Objects/GetOneUserByUserName";
import { EditUser } from "../../application/Parameter Objects/EditUser";
import { DeleteUser } from "../../application/Parameter Objects/DeleteUser";
import { EnableFreeMembership } from "../../application/Parameter Objects/EnableFreeMembership";
import { EnablePremiumMembership } from "../../application/Parameter Objects/EnablePremiumMembership";
import { Result } from "src/lib/shared/Type Helpers/result";
import { User } from "../../domain/aggregate/User";

@Controller("user")
export class UserController {
  constructor(
    @Inject(GetAllUsersQueryHandler)
    private readonly getAllUsers: GetAllUsersQueryHandler,
    @Inject(GetOneUserByIdQueryHandler)
    private readonly getOneUserById: GetOneUserByIdQueryHandler,
    @Inject(GetOneUserByUserNameQueryHandler)
    private readonly getOneUserByUserName: GetOneUserByUserNameQueryHandler,
    @Inject(CreateUserCommandHandler)
    private readonly createUserCommandHandler: CreateUserCommandHandler,
    @Inject(EditUserCommandHandler)
    private readonly editUser: EditUserCommandHandler,
    @Inject(DeleteUserCommandHandler)
    private readonly deleteUser: DeleteUserCommandHandler,
    @Inject(EnablePremiumMembershipCommandHandler)
    private readonly enablePremiumMembership: EnablePremiumMembershipCommandHandler,
    @Inject(EnableFreeMembershipCommandHandler)
    private readonly enableFreeMembership: EnableFreeMembershipCommandHandler
  ) {}

  handleResult<T>(result: Result<T>): T {
    if (result.isFailure) {
      if (result.error instanceof UserNotFoundError) {
        throw new NotFoundException(result.error.message);
      }
      throw new InternalServerErrorException(result.error.message);
    }
    return result.getValue()!;
  }

  @Get()
  async getAll() {
    const query = new GetAllUsers();
    const result = await this.getAllUsers.execute(query);
    return this.handleResult(result).map((user) => user.toPlainObject());
  }

  @Get(":id")
  async getOneById(@Param() params: FindByIdParams) {
    const query = new GetOneUserById(params.id);
    const result = await this.getOneUserById.execute(query);
    return this.handleResult(result).toPlainObject();
  }

  @Get("username/:userName")
  async getOneUserByName(@Param() params: FindByUserNameParams) {
    const query = new GetOneUserByUserName(params.userName);
    const result = await this.getOneUserByUserName.execute(query);
    return this.handleResult(result).toPlainObject();
  }

  @Post()
  async create(@Body() body: Create) {
    try {
      const createUser = new CreateUser(
        body.userName,
        body.email,
        body.hashedPassword,
        body.userType,
        body.avatarUrl
      );
      const result = await this.createUserCommandHandler.execute(createUser);
      return this.handleResult(result);
    } catch (error) {
      throw new InternalServerErrorException(
        "Could not create user : " + error.message
      );
    }
  }

  @Patch(":id")
  async edit(@Param() params: FindByIdParams, @Body() body: Edit) {
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    const user = this.handleResult(userResult);
    const editUserCommand = new EditUser(
      body.userName,
      body.email,
      body.hashedPassword,
      body.userType,
      body.avatarUrl,
      user.id.value,
      body.name,
      body.theme,
      body.language,
      body.gameStreak,
      body.status
    );
    const editResult = await this.editUser.execute(editUserCommand);
    return this.handleResult(editResult);
  }

  @Delete(":id")
  async delete(@Param() params: FindByIdParams) {
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    this.handleResult(userResult);
    const deleteUserCommand = new DeleteUser(params.id);
    const deleteResult = await this.deleteUser.execute(deleteUserCommand);
    return this.handleResult(deleteResult);
  }

  @Get("plans/list")
  async getPlans() {
    return [...Object.values(MEMBERSHIP_TYPES)];
  }

  @Get(":id/subscription")
  async getSubscriptionStatus(@Param() params: FindByIdParams) {
    const query = new GetOneUserById(params.id);
    const userResult = await this.getOneUserById.execute(query);
    const user = this.handleResult(userResult);
    return {
      membershipType: user.membership.type.value,
      status: user.membership.isEnabled() ? "enabled" : "disabled",
      expiresAt: user.membership.expiresAt.value,
    };
  }

  @Post(":id/subscription")
  async enablePremiumSubscription(@Param() params: FindByIdParams) {
    const command = new EnablePremiumMembership(params.id);
    const result = await this.enablePremiumMembership.execute(command);
    return this.handleResult(result);
  }

  @Delete(":id/subscription")
  async enableFreeSubscription(@Param() params: FindByIdParams) {
    const command = new EnableFreeMembership(params.id);
    const result = await this.enableFreeMembership.execute(command);
    return this.handleResult(result);
  }
}
