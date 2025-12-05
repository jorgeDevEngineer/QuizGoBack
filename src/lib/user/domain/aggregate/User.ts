import { UserName } from "../valueObject/UserName";
import { UserEmail } from "../valueObject/UserEmail";
import { UserHashedPassword } from "../valueObject/UserHashedPassword";
import { UserType } from "../valueObject/UserType";
import { UserAvatarUrl } from "../valueObject/UserAvatarUrl";
import { UserTheme } from "../valueObject/UserTheme";
import { UserLanguage } from "../valueObject/UserLanguaje";
import { UserGameStreak } from "../valueObject/UserGameStreak";
import { UserDate } from "../valueObject/UserDate";
import { UserId } from "../valueObject/UserId";
import { UserPlainName } from "../valueObject/UserPlainName";
import { create } from "domain";

export class User {
  readonly id: UserId;
  readonly userName: UserName;
  readonly email: UserEmail;
  readonly hashedPassword: UserHashedPassword;
  readonly userType: UserType;
  readonly avatarUrl: UserAvatarUrl;
  readonly name: UserPlainName;
  readonly theme: UserTheme; // Default: 'light'
  readonly language: UserLanguage; // Default: 'es'
  readonly gameStreak: UserGameStreak; // Default: 0
  readonly createdAt: UserDate;
  readonly updatedAt: UserDate;
  constructor(
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
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.userName = new UserName(userName);
    this.email = new UserEmail(email);
    this.hashedPassword = new UserHashedPassword(hashedPassword);
    this.userType = new UserType(userType);
    this.avatarUrl = new UserAvatarUrl(avatarUrl);
    this.id = id ? new UserId(id) : UserId.generateId();
    this.name = name ? new UserPlainName(name) : new UserPlainName("");
    this.theme = theme ? new UserTheme(theme) : new UserTheme("light");
    this.language = language
      ? new UserLanguage(language)
      : new UserLanguage("es");
    this.gameStreak = gameStreak
      ? new UserGameStreak(gameStreak)
      : new UserGameStreak(0);
    this.createdAt = createdAt
      ? new UserDate(createdAt)
      : new UserDate(new Date());
    this.updatedAt = updatedAt
      ? new UserDate(updatedAt)
      : new UserDate(this.createdAt.value);
  }

  toPlainObject() {
    return {
      id: this.id.value,
      userName: this.userName.value,
      name: this.name.value,
      email: this.email.value,
      userType: this.userType.value,
      avatarUrl: this.avatarUrl.value,
      theme: this.theme.value,
      language: this.language.value,
      gameStreak: this.gameStreak.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }
}
