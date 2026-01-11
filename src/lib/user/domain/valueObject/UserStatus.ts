import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserStatus {
  readonly value: "active" | "blocked";
  constructor(value: string) {
    const normalized = value.toLowerCase();
    if (!this.isValid(normalized)) {
      throw new DomainException("Invalid user status");
    }
    this.value = normalized as "active" | "blocked";
  }
  private isValid(value: string): boolean {
    return value === "active" || value === "blocked";
  }
}
