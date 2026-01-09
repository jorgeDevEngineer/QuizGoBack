import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserDate {
  readonly value: Date;

  constructor(value: Date) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid date value");
    }
    this.value = value;
  }

  private isValid(value: Date): boolean {
    return value instanceof Date && !isNaN(value.getTime());
  }
}
