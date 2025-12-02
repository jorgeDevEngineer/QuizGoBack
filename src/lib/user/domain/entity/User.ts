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
    id: string,
    userName: string,
    email: string,
    hashedPassword: string,
    userType: "student" | "teacher" | "personal",
    avatarUrl: string,
    name?: string,
    theme?: string,
    language?: string,
    gameStreak?: number,
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = new UserId(id);
    this.userName = new UserName(userName);
    this.email = new UserEmail(email);
    this.hashedPassword = new UserHashedPassword(hashedPassword);
    this.userType = new UserType(userType);
    this.avatarUrl = new UserAvatarUrl(avatarUrl);
    if (!name) this.name = new UserPlainName("");
    else this.name = new UserPlainName(name);
    if (!theme) this.theme = new UserTheme("light");
    else this.theme = new UserTheme(theme);
    if (!language) this.language = new UserLanguage("es");
    else this.language = new UserLanguage(language);
    if (!gameStreak) this.gameStreak = new UserGameStreak(0);
    else this.gameStreak = new UserGameStreak(gameStreak);
    if (!createdAt) this.createdAt = new UserDate(new Date());
    else this.createdAt = new UserDate(createdAt);
    if (!updatedAt) this.updatedAt = new UserDate(this.createdAt.value);
    else this.updatedAt = new UserDate(updatedAt);
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
