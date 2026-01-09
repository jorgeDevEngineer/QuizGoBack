import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserAvatarUrl {
  readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid avatar URL");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
}
