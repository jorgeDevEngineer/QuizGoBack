import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserDescription {
  readonly value: string;
  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid user description");
    }
    this.value = value;
  }
  private isValid(value: string): boolean {
    const maxLength = 500;
    return typeof value === "string" && value.length <= maxLength;
  }
}
