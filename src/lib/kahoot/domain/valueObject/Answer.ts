
import { randomUUID } from "crypto";

// --- VOs de Identidad ---

export class AnswerId {
  private constructor(public readonly value: string) {}

  public static of(value: string | number): AnswerId {
    return new AnswerId(String(value));
  }

  public static generate(): AnswerId {
    return new AnswerId(randomUUID());
  }
}

// --- VOs de Contenido ---

export class AnswerText {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 75;

  private constructor(public readonly value: string) {
    if (value.length < AnswerText.MIN_LENGTH) {
      throw new Error(
        `AnswerText must be at least ${AnswerText.MIN_LENGTH} character long`
      );
    }
    if (value.length > AnswerText.MAX_LENGTH) {
      throw new Error(
        `AnswerText must be at most ${AnswerText.MAX_LENGTH} characters long`
      );
    }
  }

  public static of(value: string): AnswerText {
    return new AnswerText(value);
  }
}

export class IsCorrect {
  private constructor(public readonly value: boolean) {}

  public static fromBoolean(value: boolean): IsCorrect {
    return new IsCorrect(value);
  }

  public static true(): IsCorrect {
    return new IsCorrect(true);
  }

  public static false(): IsCorrect {
    return new IsCorrect(false);
  }
}
