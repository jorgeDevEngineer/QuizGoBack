import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserPlainName {
  readonly value: string;
  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid user plain name");
    }
    this.value = value;
  }
  private isValid(value: string): boolean {
    const minLength = 0;
    const maxLength = 20;
    return value.length >= minLength && value.length <= maxLength;
  }
}
