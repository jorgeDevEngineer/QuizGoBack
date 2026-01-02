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
import { Membership } from "../entity/Membership.js";

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
  membership: Membership;
  readonly createdAt: UserDate;
  updatedAt: UserDate;
  status: string
  constructor(
    userName: UserName,
    email: UserEmail,
    hashedPassword: UserHashedPassword,
    userType: UserType,
    avatarUrl: UserAvatarUrl,
    id?: UserId,
    name?: UserPlainName,
    theme?: UserTheme,
    language?: UserLanguage,
    gameStreak?: UserGameStreak,
    membership?: Membership,
    createdAt?: UserDate,
    updatedAt?: UserDate,
    status?: string
  ) {
    this.userName = userName;
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.userType = userType;
    this.avatarUrl = avatarUrl;
    this.id = id ? id : UserId.generateId();
    this.name = name ? name : new UserPlainName("");
    this.theme = theme ? theme : new UserTheme("light");
    this.language = language ? language : new UserLanguage("es");
    this.gameStreak = gameStreak ? gameStreak : new UserGameStreak(0);
    this.membership = membership
      ? membership
      : Membership.createFreeMembership();
    this.createdAt = createdAt ? createdAt : new UserDate(new Date());
    this.updatedAt = updatedAt ? updatedAt : new UserDate(this.createdAt.value);
    this.status = status ? status : 'Active';
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
      membership: this.membership.toPlainObject(),
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
    };
  }

  hasPremiumMembershipEnabled(): boolean {
    return this.membership.isPremium() && this.membership.isEnabled();
  }

  enablePremiumMembership(): void {
    this.membership = Membership.createPremiumMembership();
    this.updatedAt = new UserDate(new Date());
  }

  enableFreeMembership(): void {
    this.membership = Membership.createFreeMembership();
    this.updatedAt = new UserDate(new Date());
  }
}
