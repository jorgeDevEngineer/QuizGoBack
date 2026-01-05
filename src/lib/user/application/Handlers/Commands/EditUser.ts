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
import { UserNotFoundError } from "./../../error/UserNotFoundError";
import { UserStatus } from "../../../domain/valueObject/UserStatus";

export class EditUser {
  constructor(private readonly userRepository: UserRepository) {}

  async run(
    userName: string,
    email: string,
    hashedPassword: string,
    userType: "student" | "teacher" | "personal",
    avatarUrl: string,
    id: string,
    name: string,
    theme: string,
    language: string,
    gameStreak: number,
    status: "Active" | "Blocked"
  ): Promise<void> {
    const existing = await this.userRepository.getOneById(new UserId(id));
    if (!existing) {
      throw new UserNotFoundError("User not found");
    }
    const userWithSameUserName = await this.userRepository.getOneByName(
      new UserName(userName)
    );
    if (userWithSameUserName && userWithSameUserName.id.value !== id) {
      throw new Error("That name already belongs to another user");
    }

    const user = new User(
      new UserName(userName),
      new UserEmail(email),
      new UserHashedPassword(hashedPassword),
      new UserType(userType),
      new UserAvatarUrl(avatarUrl),
      new UserId(id),
      new UserPlainName(name),
      new UserTheme(theme),
      new UserLanguage(language),
      new UserGameStreak(gameStreak),
      existing.membership,
      existing.createdAt,
      new UserDate(new Date()),
      new UserStatus(status)
    );
    await this.userRepository.edit(user);
  }
}
