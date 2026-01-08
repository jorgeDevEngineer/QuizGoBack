
import { randomUUID } from "crypto";
import { DomainException } from "../../../shared/exceptions/domain.exception";

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

export class AnswerId {
  private constructor(public readonly value: string) {
    if (!isValidUUID(value)) {
      throw new DomainException(`AnswerId does not have a valid UUID v4 format: ${value}`);
    }
  }
  public static of(value: string): AnswerId {
    return new AnswerId(value);
  }
  public static generate(): AnswerId {
    return new AnswerId(randomUUID());
  }
  public getValue(): string {
    return this.value;
  }
  public equals(other: AnswerId): boolean {
    return this.value === other.value;
  }
}

// ... (resto de VOs de Answer)
export class AnswerText {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 75;

  private constructor(public readonly value: string) {
    if (
      value.length < AnswerText.MIN_LENGTH ||
      value.length > AnswerText.MAX_LENGTH
    ) {
      throw new DomainException(
        `AnswerText must be between ${AnswerText.MIN_LENGTH} and ${AnswerText.MAX_LENGTH} characters.`
      );
    }
  }
  public static of(value: string): AnswerText {
    return new AnswerText(value);
  }
  public getValue(): string {
    return this.value;
  }
}

export class IsCorrect {
  private constructor(public readonly value: boolean) {}

  public static true(): IsCorrect {
    return new IsCorrect(true);
  }

  public static false(): IsCorrect {
    return new IsCorrect(false);
  }

  public static fromBoolean(value: boolean): IsCorrect {
    return new IsCorrect(value);
  }
  
  public getValue(): boolean {
    return this.value;
  }
}
