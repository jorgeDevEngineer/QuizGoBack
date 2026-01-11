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
import { UserStatus } from "../valueObject/UserStatus";

export class User {
  readonly id: UserId;
  readonly userName: UserName;
  readonly email: UserEmail;
  readonly hashedPassword: UserHashedPassword;
  readonly userType: UserType;
  readonly avatarUrl: UserAvatarUrl;
  readonly name: UserPlainName;
  readonly description: string;
  readonly roles: ("user" | "admin")[];
  readonly theme: UserTheme; // Default: 'light'
  readonly language: UserLanguage; // Default: 'es'
  readonly gameStreak: UserGameStreak; // Default: 0
  membership: Membership;
  readonly createdAt: UserDate;
  updatedAt: UserDate;
  status: UserStatus;
  readonly isAdmin: boolean;
  constructor(
    userName: UserName,
    email: UserEmail,
    hashedPassword: UserHashedPassword,
    userType: UserType,
    avatarUrl: UserAvatarUrl,
    id?: UserId,
    name?: UserPlainName,
    description?: string,
    theme?: UserTheme,
    language?: UserLanguage,
    gameStreak?: UserGameStreak,
    membership?: Membership,
    createdAt?: UserDate,
    updatedAt?: UserDate,
    status?: UserStatus,
    isAdmin?: boolean,
    roles?: ("user" | "admin")[]
  ) {
    this.userName = userName;
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.userType = userType;
    this.avatarUrl = avatarUrl ? avatarUrl : new UserAvatarUrl("");
    this.id = id ? id : UserId.generateId();
    this.name = name ? name : new UserPlainName("");
    this.description = description ?? "";
    this.theme = theme ? theme : new UserTheme("light");
    this.language = language ? language : new UserLanguage("es");
    this.gameStreak = gameStreak ? gameStreak : new UserGameStreak(0);
    this.membership = membership
      ? membership
      : Membership.createFreeMembership();
    this.createdAt = createdAt ? createdAt : new UserDate(new Date());
    this.updatedAt = updatedAt ? updatedAt : new UserDate(this.createdAt.value);
    this.status = status ? status : new UserStatus("Active");
    this.isAdmin = isAdmin ? isAdmin : false;
    this.roles = roles && roles.length ? roles : ["user"];
  }

  toPlainObject() {
    return {
      id: this.id.value,
      email: this.email.value,
      username: this.userName.value,
      type: this.userType.value,
      state: this.status.value,
      preferences: {
        theme: this.theme.value,
      },
      userProfileDetails: {
        name: this.name.value,
        description: this.description,
        avatarAssetUrl: this.avatarUrl.value,
      },
      isPremium: this.membership.isPremium(),
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
