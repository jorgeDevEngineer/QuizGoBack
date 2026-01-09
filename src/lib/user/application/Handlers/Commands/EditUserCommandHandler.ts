import { User } from "../../../domain/aggregate/User";
import { UserRepository } from "../../../domain/port/UserRepository";
import { UserDate } from "../../../domain/valueObject/UserDate";
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
import { UserNotFoundException } from "../../exceptions/UserNotFoundException";
import { UserStatus } from "../../../domain/valueObject/UserStatus";
import { IHandler } from "src/lib/shared/IHandler";
import { EditUser } from "../../Parameter Objects/EditUser";
import { Result } from "src/lib/shared/Type Helpers/result";

export class EditUserCommandHandler
  implements IHandler<EditUser, Result<void>>
{
  constructor(private readonly userRepository: UserRepository) {}

  async execute(command: EditUser): Promise<Result<void>> {
    const existing = await this.userRepository.getOneById(
      new UserId(command.id)
    );
    if (!existing) {
      return Result.fail(new UserNotFoundException());
    }
    const userWithSameUserName = await this.userRepository.getOneByName(
      new UserName(command.userName)
    );
    if (userWithSameUserName && userWithSameUserName.id.value !== command.id) {
      return Result.fail(
        new Error("That name already belongs to another user")
      );
    }

    const user = new User(
      new UserName(command.userName),
      new UserEmail(command.email),
      new UserHashedPassword(command.hashedPassword),
      new UserType(command.userType),
      new UserAvatarUrl(command.avatarUrl),
      new UserId(command.id),
      new UserPlainName(command.name),
      new UserTheme(command.theme),
      new UserLanguage(command.language),
      new UserGameStreak(command.gameStreak),
      existing.membership,
      existing.createdAt,
      new UserDate(new Date()),
      new UserStatus(command.status)
    );
    await this.userRepository.edit(user);
    return Result.ok(undefined);
  }
}
