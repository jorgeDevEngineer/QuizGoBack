import { randomUUID } from 'crypto';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

export class MediaId {
  readonly value: string;

  private constructor(value: string) {
    if (!isValidUUID(value)) {
      throw new Error(`MediaId does not have a valid UUID v4 format: ${value}`);
    }
    this.value = value;
  }

  static generate(): MediaId {
    return new MediaId(randomUUID());
  }

  static of(value: string): MediaId {
    return new MediaId(value);
  }
  public getValue():string {
    return this.value;
  }
}

export class MimeType {
  readonly value: string;

  constructor(value: string) {
    // Aquí podrías añadir validaciones, p.ej. con una expresión regular
    this.value = value;
  }
}

export class FileSize {
  readonly value: number;

  constructor(value: number) {
    if (value <= 0) {
      throw new Error('File size must be positive');
    }
    this.value = value;
  }
}
