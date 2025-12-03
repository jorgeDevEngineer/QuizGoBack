// 2. Question (Entidad Interna)

// Es una entidad, pero su vida y validación dependen 100% del Quiz padre.
// _id: QuestionId (Value Object)
// _text: QuestionText (Value Object)
// _type: QuestionType (Value Object)
// _timeLimit: TimeLimit (Value Object)
// _points: Points (Value Object)

import { randomUUID } from "crypto";
const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

// --- VOs de Identidad ---

/**
 * Encapsula un identificador único (UUID) para una Pregunta.
 */
export class QuestionId {
  private constructor(public readonly value: string) {
    if (!isValidUUID(value)) {
      throw new Error(
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

/**
 * Encapsula el texto de una pregunta, validando su longitud.
 */
export class QuestionText {
  private static readonly MIN_LENGTH = 1;
  private static readonly MAX_LENGTH = 120; // Límite más grande que un título

  private constructor(public readonly value: string) {
    if (
      value.length < QuestionText.MIN_LENGTH ||
      value.length > QuestionText.MAX_LENGTH
    ) {
      throw new Error(
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

// El tipo ahora solo incluye las dos opciones válidas
type QuestionTypeValue = "quiz" | "true_false" | "multiple";

/**
 * Encapsula el tipo de pregunta (quiz de opción múltiple o verdadero/falso).
 */
export class QuestionType {
  private constructor(public readonly value: QuestionTypeValue) {}

  /**
   * Representa una pregunta de opción múltiple (varias respuestas, 1 correcta).
   */
  public static quiz(): QuestionType {
    return new QuestionType("quiz");
  }

  /**
   * Representa una pregunta de verdadero o falso.
   */
  public static trueFalse(): QuestionType {
    return new QuestionType("true_false");
  }

  public static fromString(value: string): QuestionType {
    // La lista de validación ahora es más corta
    const validTypes: QuestionTypeValue[] = ["quiz", "true_false"];
    if (!validTypes.includes(value as QuestionTypeValue)) {
      throw new Error(
        `Invalid QuestionType: ${value}. Must be 'quiz' or 'true_false'.`
      );
    }
    return new QuestionType(value as QuestionTypeValue);
  }

  public getValue(): QuestionTypeValue{
    return this.value;
  }
}

/**
 * Encapsula el límite de tiempo (en segundos) para una pregunta.
 * El tiempo debe ser uno de los valores predefinidos.
 */
export class TimeLimit {
  // Lista de valores permitidos en segundos
  private static readonly ALLOWED_VALUES: ReadonlySet<number> = new Set([
    5, 10, 20, 30, 45, 60, 90, 120, 180, 240,
  ]);

  private constructor(public readonly value: number) {
    // 1. Validar que sea un entero (buena práctica)
    if (!Number.isInteger(value)) {
      throw new Error("TimeLimit must be an integer (in seconds).");
    }

    // 2. Validar que esté en la lista de valores permitidos
    if (!TimeLimit.ALLOWED_VALUES.has(value)) {
      throw new Error(
        `Invalid TimeLimit: ${value}. Must be one of [${Array.from(
          TimeLimit.ALLOWED_VALUES
        ).join(", ")}] seconds.`
      );
    }
  }

  public static of(value: number): TimeLimit {
    return new TimeLimit(value);
  }

  /**
   * Helper para obtener los valores permitidos desde fuera,
   * si la UI necesita mostrarlos, por ejemplo.
   */
  public static getAllowedValues(): number[] {
    return Array.from(TimeLimit.ALLOWED_VALUES);
  }

  public getValue(): number {
    return this.value;
  }
}

/**
 * Encapsula la puntuación asignada a una pregunta.
 * La puntuación debe ser uno de los valores predefinidos.
 */
export class Points {
  // Lista de valores de puntuación permitidos
  private static readonly ALLOWED_VALUES: ReadonlySet<number> = new Set([
    0, 1000, 2000,
  ]);

  private constructor(public readonly value: number) {
    // 1. Validar que sea un entero
    if (!Number.isInteger(value)) {
      throw new Error("Points must be an integer.");
    }

    // 2. Validar que esté en la lista de valores permitidos
    if (!Points.ALLOWED_VALUES.has(value)) {
      throw new Error(
        `Invalid Points: ${value}. Must be one of [${Array.from(
          Points.ALLOWED_VALUES
        ).join(", ")}]`
      );
    }
  }

  public static of(value: number): Points {
    return new Points(value);
  }

  /**
   * Helper para obtener los valores permitidos (útil para la UI).
   */
  public static getAllowedValues(): number[] {
    return Array.from(Points.ALLOWED_VALUES);
  }

  public getValue(): number {
    return this.value;
  }
}
