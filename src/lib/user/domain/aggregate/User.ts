import { UserName } from "../valueObject/UserName";
import { UserEmail } from "../valueObject/UserEmail";
import { UserHashedPassword } from "../valueObject/UserHashedPassword";
import { UserType } from "../valueObject/UserType";
import { UserAvatarId } from "src/lib/user/domain/valueObject/UserAvatarId";
import { UserTheme } from "../valueObject/UserTheme";
import { UserLanguage } from "../valueObject/UserLanguaje";
import { UserGameStreak } from "../valueObject/UserGameStreak";
import { UserDate } from "../valueObject/UserDate";
import { UserId } from "../valueObject/UserId";
import { UserPlainName } from "../valueObject/UserPlainName";
import { UserDescription } from "../valueObject/UserDescription";
import { UserRoles } from "../valueObject/UserRoles";
import { UserIsAdmin } from "../valueObject/UserIsAdmin";
import { Membership } from "../entity/Membership.js";
import { UserStatus } from "../valueObject/UserStatus";
import { de } from "zod/v4/locales";

export class User {
  readonly id: UserId;
  readonly userName: UserName;
  readonly email: UserEmail;
  readonly hashedPassword: UserHashedPassword;
  readonly userType: UserType;
  readonly avatarAssetId: UserAvatarId;
  readonly name: UserPlainName;
  readonly description: UserDescription;
  readonly roles: UserRoles;
  readonly theme: UserTheme; // Default: 'light'
  readonly language: UserLanguage; // Default: 'es'
  readonly gameStreak: UserGameStreak; // Default: 0
  membership: Membership;
  readonly createdAt: UserDate;
  updatedAt: UserDate;
  status: UserStatus;
  readonly isAdmin: UserIsAdmin;
  constructor(
    userName: UserName,
    email: UserEmail,
    hashedPassword: UserHashedPassword,
    userType: UserType,
    avatarAssetId: UserAvatarId,
    id?: UserId,
    name?: UserPlainName,
    description?: UserDescription,
    theme?: UserTheme,
    language?: UserLanguage,
    gameStreak?: UserGameStreak,
    membership?: Membership,
    createdAt?: UserDate,
    updatedAt?: UserDate,
    status?: UserStatus,
    isAdmin?: UserIsAdmin,
    roles?: UserRoles
  ) {
    this.userName = userName;
    this.email = email;
    this.hashedPassword = hashedPassword;
    this.userType = userType;
    this.avatarAssetId = avatarAssetId ? avatarAssetId : new UserAvatarId("");
    this.id = id ? id : UserId.generateId();
    this.name = name ? name : new UserPlainName("");
    this.description = description ? description : new UserDescription("");
    this.theme = theme ? theme : new UserTheme("LIGHT");
    this.language = language ? language : new UserLanguage("es");
    this.gameStreak = gameStreak ? gameStreak : new UserGameStreak(0);
    this.membership = membership
      ? membership
      : Membership.createFreeMembership();
    this.createdAt = createdAt ? createdAt : new UserDate(new Date());
    this.updatedAt = updatedAt ? updatedAt : new UserDate(this.createdAt.value);
    this.status = status ? status : new UserStatus("active");
    this.isAdmin = isAdmin ? isAdmin : new UserIsAdmin(false);
    this.roles = roles ? roles : new UserRoles(["user"]);
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
        description: this.description.value,
        avatarAssetId: this.avatarAssetId.value,
      },
      isPremium: this.membership.isPremium(),
    };
  }

  toPlainObjectResumed() {
    const result = this.toPlainObject();
    delete result.preferences;
    return result;
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
