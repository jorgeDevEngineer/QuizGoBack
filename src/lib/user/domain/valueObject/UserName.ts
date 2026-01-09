import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserName {
  readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid user name");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    const minLength = 6;
    const maxLength = 20;
    const regex = /^[a-zA-Z0-9_]+$/;
    return (
      value.length >= minLength &&
      value.length <= maxLength &&
      regex.test(value)
    );
  }
}
