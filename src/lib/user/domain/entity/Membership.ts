import { MembershipType } from "../valueObject/MembershipType.js";
import { MembershipDate } from "../valueObject/MembershipDate.js";

export class Membership {
  readonly type: MembershipType;
  readonly startedAt: MembershipDate;
  readonly expiresAt: MembershipDate;

  constructor(
    type: MembershipType,
    startedAt: MembershipDate,
    expiresAt: MembershipDate
  ) {
    this.type = type;
    this.startedAt = startedAt;
    this.expiresAt = expiresAt;
  }
  toPlainObject() {
    return {
      type: this.type.value,
      startedAt: this.startedAt.value,
      expiresAt: this.expiresAt.value,
    };
  }
  public static createFreeMembership() {
    return new Membership(
      new MembershipType("free"),
      new MembershipDate(new Date()),
      new MembershipDate(new Date())
    );
  }
  public static createPremiumMembership() {
    return new Membership(
      new MembershipType("premium"),
      new MembershipDate(new Date()),
      new MembershipDate(
        new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      )
    );
  }

  isPremium(): boolean {
    return this.type.value === "premium";
  }

  isEnabled(): boolean {
    const now = new Date();
    return now >= this.startedAt.value && now <= this.expiresAt.value;
  }
}
