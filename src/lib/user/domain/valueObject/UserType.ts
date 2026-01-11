import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserType {
  readonly value: "STUDENT" | "TEACHER";

  constructor(value: string) {
    const normalized = value.toUpperCase();
    if (!this.isValid(normalized)) {
      throw new DomainException("Invalid user type");
    }
    this.value = normalized as "STUDENT" | "TEACHER";
  }

  private isValid(value: string): boolean {
    const validTypes = ["STUDENT", "TEACHER"];
    return validTypes.includes(value);
  }
}
