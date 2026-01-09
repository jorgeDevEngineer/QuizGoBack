import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserStatus {
  readonly value: "Active" | "Blocked";
  constructor(value: "Active" | "Blocked") {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid user status");
    }
    this.value = value;
  }
  private isValid(value: "Active" | "Blocked"): boolean {
    return value === "Active" || value === "Blocked";
  }
}
