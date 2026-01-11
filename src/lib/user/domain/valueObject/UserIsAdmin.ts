import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserIsAdmin {
  readonly value: boolean;
  constructor(value: boolean) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid isAdmin value");
    }
    this.value = value;
  }
  private isValid(value: boolean): boolean {
    return typeof value === "boolean";
  }
}
