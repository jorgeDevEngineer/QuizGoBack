import { MembershipType } from "../valueObject/MembershipType.js";
import { MembershipDate } from "../valueObject/MembershipDate.js";

export class Membership {
  readonly type: MembershipType;
  readonly startedAt: MembershipDate;
  readonly expiresAt: MembershipDate;

  constructor(type: "free" | "premium", startedAt: Date, expiresAt: Date) {
    this.type = new MembershipType(type);
    this.startedAt = new MembershipDate(new Date());
    this.expiresAt = new MembershipDate(new Date());
  }
  toPlainObject() {
    return {
      type: this.type.value,
      startedAt: this.startedAt.value,
      expiresAt: this.expiresAt.value,
    };
  }
}
