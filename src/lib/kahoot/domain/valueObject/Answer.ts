// 3. Answer (Entidad Interna)

// Es una entidad gestionada por Question.
// _id: AnswerId (Value Object)
// _content: AnswerContent (Value Object)
// _isCorrect: IsCorrect (Value Object)

import { randomUUID } from "crypto";

// --- (Asumimos que isValidUUID existe en este ámbito) ---
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

// --- VOs de Identidad ---

/**
 * Encapsula un identificador único (UUID) para una Respuesta (Answer).
 */
export class AnswerId {
  private constructor(public readonly value: string) {
    if (!isValidUUID(value)) {
      throw new Error(
        `AnswerId does not have a valid UUID v4 format: ${value}`
      );
    }
  }
  public static of(value: string): AnswerId {
    return new AnswerId(value);
  }
  public static generate(): AnswerId {
    return new AnswerId(randomUUID());
  }
}

// --- VOs de Contenido ---

/**
 * Encapsula el texto de una opción de respuesta, validando su longitud.
 */
export class AnswerText {
  // Límites para el texto de una respuesta
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 75; // Como en tu ejemplo

  private constructor(public readonly value: string) {
    if (
      value.length < AnswerText.MIN_LENGTH ||
      value.length > AnswerText.MAX_LENGTH
    ) {
      throw new Error(
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

/**
 * Encapsula el estado de "correctitud" de una respuesta.
 * Provee semántica de dominio sobre un booleano primitivo.
 */
export class IsCorrect {
  private constructor(public readonly value: boolean) {}
  /**
   * Crea una instancia que representa 'Correcto'.
   */

  public static true(): IsCorrect {
    return new IsCorrect(true);
  }
  /**
   * Crea una instancia que representa 'Incorrecto'.
   */

  public static false(): IsCorrect {
    return new IsCorrect(false);
  }
  /**
   * Crea una instancia a partir de un valor booleano primitivo.
   * Útil para deserialización o mapeo desde la base de datos.
   */

  public static fromBoolean(value: boolean): IsCorrect {
    return new IsCorrect(value);
  }
  public getValue(): boolean {
    return this.value;
  }
}
