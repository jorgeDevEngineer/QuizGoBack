const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

// --- ID del grupo ---

export class GroupId {
  private constructor(public readonly value: string) {
    if (!isValidUUID(value)) {
      throw new Error(`GroupId does not have a valid UUID v4 format: ${value}`);
    }
  }
  public static of(value: string): GroupId {
    return new GroupId(value);
  }
}

// --- Nombre del grupo ---

export class GroupName {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 20;

  private constructor(public readonly value: string) {
    const trimmed = value.trim();
    if (
      trimmed.length < GroupName.MIN_LENGTH ||
      trimmed.length > GroupName.MAX_LENGTH
    ) {
      throw new Error(
        `GroupName must be between ${GroupName.MIN_LENGTH} and ${GroupName.MAX_LENGTH} characters.`,
      );
    }
    this.value = trimmed;
  }

  public static of(value: string): GroupName {
    return new GroupName(value);
  }
}

// --- Descripción del grupo ---

export class GroupDescription {
  private static readonly MAX_LENGTH = 200;

  private constructor(public readonly value: string) {
    const trimmed = value.trim();
    if (trimmed.length > GroupDescription.MAX_LENGTH) {
      throw new Error(
        `GroupDescription cannot be longer than ${GroupDescription.MAX_LENGTH} characters.`,
      );
    }
    this.value = trimmed;
  }

  public static of(value: string): GroupDescription {
    return new GroupDescription(value);
  }
}