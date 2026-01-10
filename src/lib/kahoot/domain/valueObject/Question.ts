
import { randomUUID } from "crypto";
import { DomainException } from "../../../shared/exceptions/domain.exception";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

// --- VOs de Identidad ---

export class QuestionId {
  private constructor(public readonly value: string) {
    if (!isValidUUID(value)) {
      throw new DomainException(
        `QuestionId does not have a valid UUID v4 format: ${value}`
      );
    }
  }
  public static of(value: string): QuestionId {
    return new QuestionId(value);
  }
  public static generate(): QuestionId {
    return new QuestionId(randomUUID());
  }
  public equals(id: QuestionId): boolean {
    return id.getValue() === this.value;
  }
  public getValue():string {
    return this.value;
  }
}

// --- VOs de Contenido ---

export class QuestionText {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 120;

  private constructor(public readonly value: string) {
    if (
      value.length < QuestionText.MIN_LENGTH ||
      value.length > QuestionText.MAX_LENGTH
    ) {
      throw new DomainException(
        `QuestionText must be between ${QuestionText.MIN_LENGTH} and ${QuestionText.MAX_LENGTH} characters.`
      );
    }
  }
  public static of(value: string): QuestionText {
    return new QuestionText(value);
  }
  public getValue(): string {
    return this.value;
  }
}

// --- VOs de Configuración y Estado ---

export type QuestionTypeValue = "quiz" | "true_false" | "multiple";

export class QuestionType {
  private constructor(public readonly value: QuestionTypeValue) {}

  public static quiz(): QuestionType {
    return new QuestionType("quiz");
  }

  public static trueFalse(): QuestionType {
    return new QuestionType("true_false");
  }

  public static fromString(value: string): QuestionType {
    const sanitizedValue = this.sanitizeValue(value);
    if (!this.isValid(sanitizedValue)) {
      throw new DomainException(
        `Invalid QuestionType: ${value}. Must be 'quiz', 'single', 'true_false', or 'multiple'.`
      );
    }
    return new QuestionType(sanitizedValue as QuestionTypeValue);
  }
  
  private static sanitizeValue(value: string): string {
    return value === 'single' ? 'quiz' : value;
  }

  private static isValid(value: string): value is QuestionTypeValue {
    const validTypes: QuestionTypeValue[] = ["quiz", "true_false", "multiple"];
    return validTypes.includes(value as QuestionTypeValue);
  }
  
  public getValue(): QuestionTypeValue{
    return this.value;
  }
}

export class TimeLimit {
  private static readonly ALLOWED_VALUES: ReadonlySet<number> = new Set([
    5, 10, 20, 30, 45, 60, 90, 120, 180, 240,
  ]);

  private constructor(public readonly value: number) {
    if (!Number.isInteger(value)) {
      throw new DomainException("TimeLimit must be an integer (in seconds).");
    }

    if (!TimeLimit.ALLOWED_VALUES.has(value)) {
      throw new DomainException(
        `Invalid TimeLimit: ${value}. Must be one of [${Array.from(
          TimeLimit.ALLOWED_VALUES
        ).join(", ")}] seconds.`
      );
    }
  }

  public static of(value: number): TimeLimit {
    return new TimeLimit(value);
  }

  public static getAllowedValues(): number[] {
    return Array.from(TimeLimit.ALLOWED_VALUES);
  }

  public getValue(): number {
    return this.value;
  }
}

export class Points {
  private static readonly ALLOWED_VALUES: ReadonlySet<number> = new Set([
    0, 500, 1000, 2000,
  ]);

  private constructor(public readonly value: number) {
    if (!Number.isInteger(value)) {
      throw new DomainException("Points must be an integer.");
    }

    if (!Points.ALLOWED_VALUES.has(value)) {
      throw new DomainException(
        `Invalid Points: ${value}. Must be one of [${Array.from(
          Points.ALLOWED_VALUES
        ).join(", ")}]`
      );
    }
  }

  public static of(value: number): Points {
    return new Points(value);
  }

  public static getAllowedValues(): number[] {
    return Array.from(Points.ALLOWED_VALUES);
  }

  public getValue(): number {
    return this.value;
  }
}
