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