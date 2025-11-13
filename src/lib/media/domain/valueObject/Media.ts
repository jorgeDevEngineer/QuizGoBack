
import { randomUUID } from "crypto";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

// --- VOs de Identidad ---

/**
 * Encapsula un identificador único (UUID) para un Media.
 */
export class MediaId {
  private constructor(public readonly value: string) {
    if (!isValidUUID(value)) {
      throw new Error(
        `MediaId does not have a valid UUID v4 format: ${value}`
      );
    }
  }
  public static of(value: string): MediaId {
    return new MediaId(value);
  }
  public static generate(): MediaId {
    return new MediaId(randomUUID());
  }
}

export class MimeType {
  readonly value: string;
  // Lista blanca de tipos permitidos
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  constructor(value: string) {
    if (!MimeType.ALLOWED_TYPES.includes(value)) {
      throw new Error(`Invalid MimeType: ${value}. Allowed: ${MimeType.ALLOWED_TYPES.join(', ')}`);
    }
    this.value = value;
  }

  // Útil para lógica futura: ¿Es imagen? ¿Es video?
  isImage(): boolean {
    return this.value.startsWith('image/');
  }
}

export class FileSize {
  readonly value: number;
  private static readonly MAX_SIZE_BYTES = 5 * 1024 * 1024; // Ejemplo: 5MB

  constructor(value: number) {
    if (value < 0) throw new Error("File size cannot be negative");
    if (value > FileSize.MAX_SIZE_BYTES) throw new Error("File is too large");
    
    this.value = value;
  }
}

export class StoragePath {
  readonly value: string;

  constructor(value: string) {
    if (value.trim().length === 0) throw new Error("Path cannot be empty");
    this.value = value;
  }
}