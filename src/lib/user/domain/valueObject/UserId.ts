import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserId {
  readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid User ID format");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    const UUID_V4_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return (
      typeof value === "string" &&
      value.trim().length > 0 &&
      UUID_V4_REGEX.test(value)
    );
  }

  public static of(value: string): UserId {
    return new UserId(value);
  }

  public getValue(): string {
    return this.value;
  }

  public static generateId(): UserId {
    return new UserId(crypto.randomUUID());
  }
}
