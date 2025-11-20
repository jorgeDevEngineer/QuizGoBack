const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

export class GroupQuizAttemptId {
  private constructor(public readonly value: string) {
    if (!isValidUUID(value)) {
      throw new Error(
        `GroupQuizAttemptId does not have a valid UUID v4 format: ${value}`,
      );
    }
  }

  public static of(value: string): GroupQuizAttemptId {
    return new GroupQuizAttemptId(value);
  }
}