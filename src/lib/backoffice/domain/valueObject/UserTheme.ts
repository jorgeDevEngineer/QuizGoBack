export class UserTheme {
  readonly value: string;
  private static readonly allowedThemes = ["light", "dark", "system"];

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error("Invalid theme value");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    return UserTheme.allowedThemes.includes(value);
  }
}
