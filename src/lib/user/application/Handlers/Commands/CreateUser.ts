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

export class CreateUser {
  constructor(private readonly userRepository: UserRepository) {}

  async run(
    userName: string,
    email: string,
    hashedPassword: string,
    userType: "student" | "teacher" | "personal",
    avatarUrl: string,
    id?: string,
    name?: string,
    theme?: string,
    language?: string,
    gameStreak?: number,
    membership?: { type: "free" | "premium"; startedAt: Date; expiresAt: Date },
    createdAt?: Date,
    updatedAt?: Date,
    status?: "Active" | "Blocked"
  ): Promise<void> {
    const newUser = new User(
      new UserName(userName),
      new UserEmail(email),
      new UserHashedPassword(hashedPassword),
      new UserType(userType),
      new UserAvatarUrl(avatarUrl),
      id ? new UserId(id) : undefined,
      name ? new UserPlainName(name) : undefined,
      theme ? new UserTheme(theme) : undefined,
      language ? new UserLanguage(language) : undefined,
      typeof gameStreak === "number"
        ? new UserGameStreak(gameStreak)
        : undefined,
      membership
        ? new Membership(
            new MembershipType(membership.type),
            new MembershipDate(membership.startedAt),
            new MembershipDate(membership.expiresAt)
          )
        : undefined,
      createdAt ? new UserDate(createdAt) : undefined,
      updatedAt ? new UserDate(updatedAt) : undefined,
      status ? new UserStatus(status) : undefined
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
  }
}
