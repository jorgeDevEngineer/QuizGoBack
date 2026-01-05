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
import { GetAllUsers } from "../../application/Handlers/Querys/GetAllUsers";
import { GetOneUserById } from "../../application/Handlers/Querys/GetOneUserById";
import { GetOneUserByUserName } from "../../application/Handlers/Querys/GetOneUserByUserName";
import { CreateUser } from "../../application/Handlers/Commands/CreateUser";
import { EditUser } from "../../application/Handlers/Commands/EditUser";
import { DeleteUser } from "../../application/Handlers/Commands/DeleteUser";
import { FindByIdParams, FindByUserNameParams } from "./Validations";
import { UserNotFoundError } from "../../application/error/UserNotFoundError";
import { Create, Edit } from "./Validations";
import { EnableFreeMembership } from "../../application/Handlers/Commands/EnableFreeMembership";
import { EnablePremiumMembership } from "../../application/Handlers/Commands/EnablePremiumMembership";
import { MEMBERSHIP_TYPES } from "../../domain/valueObject/MembershipType";

@Controller("user")
export class UserController {
  constructor(
    @Inject("GetAllUsers") private readonly getAllUsers: GetAllUsers,
    @Inject("GetOneUserById") private readonly getOneUserById: GetOneUserById,
    @Inject("GetOneUserByUserName")
    private readonly getOneUserByUserName: GetOneUserByUserName,
    @Inject("CreateUser") private readonly createUser: CreateUser,
    @Inject("EditUser") private readonly editUser: EditUser,
    @Inject("DeleteUser") private readonly deleteUser: DeleteUser,
    @Inject("EnablePremiumMembership")
    private readonly enablePremiumMembership: EnablePremiumMembership,
    @Inject("EnableFreeMembership")
    private readonly enableFreeMembership: EnableFreeMembership
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
        body.gameStreak,
        body.status
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

  @Get("plans/list")
  async getPlans() {
    return [...Object.values(MEMBERSHIP_TYPES)];
  }

  @Get(":id/subscription")
  async getSubscriptionStatus(@Param() params: FindByIdParams) {
    try {
      const user = await this.getOneUserById.run(params.id);
      return {
        membershipType: user.membership.type.value,
        status: user.membership.isEnabled() ? "enabled" : "disabled",
        expiresAt: user.membership.expiresAt.value,
      };
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      }
    }
  }

  @Post(":id/subscription")
  async enablePremiumSubscription(@Param() params: FindByIdParams) {
    try {
      return await this.enablePremiumMembership.run(params.id);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not enable premium membership: " + error.message
        );
      }
    }
  }

  @Delete(":id/subscription")
  async enableFreeSubscription(@Param() params: FindByIdParams) {
    try {
      return await this.enableFreeMembership.run(params.id);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        throw new NotFoundException("User not found");
      } else {
        throw new InternalServerErrorException(
          "Could not enable free membership: " + error.message
        );
      }
    }
  }
}
