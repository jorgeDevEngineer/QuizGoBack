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