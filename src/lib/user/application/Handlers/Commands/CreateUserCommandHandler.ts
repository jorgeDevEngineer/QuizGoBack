import { UserRepository } from "../../../domain/port/UserRepository";
import { User } from "../../../domain/aggregate/User";
import { UserId } from "../../../domain/valueObject/UserId";
import { UserName } from "../../../domain/valueObject/UserName";
import { UserEmail } from "../../../domain/valueObject/UserEmail";
import { UserHashedPassword } from "../../../domain/valueObject/UserHashedPassword";
import { UserType } from "../../../domain/valueObject/UserType";
import { UserAvatarUrl } from "../../../domain/valueObject/UserAvatarUrl";
import { UserPlainName } from "../../../domain/valueObject/UserPlainName";
import { UserTheme } from "../../../domain/valueObject/UserTheme";
import { UserLanguage } from "../../../domain/valueObject/UserLanguaje";
import { UserGameStreak } from "../../../domain/valueObject/UserGameStreak";
import { UserDate } from "../../../domain/valueObject/UserDate";
import { Membership } from "../../../domain/entity/Membership.js";
import { MembershipType } from "../../../domain/valueObject/MembershipType.js";
import { MembershipDate } from "../../../domain/valueObject/MembershipDate.js";
import { UserStatus } from "../../../domain/valueObject/UserStatus";
import { IHandler } from "src/lib/shared/IHandler";
import { Either } from "src/lib/shared/Type Helpers/Either";
import { DomainException } from "src/lib/shared/exceptions/DomainException";
import { CreateUser } from "../../Parameter Objects/CreateUser";
import { Result } from "src/lib/shared/Type Helpers/result";

export class CreateUserCommandHandler
  implements IHandler<CreateUser, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: CreateUser): Promise<Result<void>> {
    const newUser = new User(
      new UserName(command.userName),
      new UserEmail(command.email),
      new UserHashedPassword(command.hashedPassword),
      new UserType(command.userType),
      new UserAvatarUrl(command.avatarUrl),
      command.id ? new UserId(command.id) : undefined,
      command.name ? new UserPlainName(command.name) : undefined,
      command.theme ? new UserTheme(command.theme) : undefined,
      command.language ? new UserLanguage(command.language) : undefined,
      typeof command.gameStreak === "number"
        ? new UserGameStreak(command.gameStreak)
        : undefined,
      command.membership
        ? new Membership(
            new MembershipType(command.membership.type),
            new MembershipDate(command.membership.startedAt),
            new MembershipDate(command.membership.expiresAt)
          )
        : undefined,
      command.createdAt ? new UserDate(command.createdAt) : undefined,
      command.updatedAt ? new UserDate(command.updatedAt) : undefined,
      command.status ? new UserStatus(command.status) : undefined
    );
    const userWithSameId = await this.userRepository.getOneById(newUser.id);
    const userWithSameUserName = await this.userRepository.getOneByName(
      newUser.userName
    );
    if (userWithSameId) {
      throw new Error("User with this ID already exists");
    }
    if (userWithSameUserName) {
      throw new Error("User with this username already exists");
    }
    await this.userRepository.create(newUser);
    return Result.ok<void>();
  }
}
