export class UserTheme {
  readonly value: "LIGHT" | "DARK";
  private static readonly allowedThemes = ["LIGHT", "DARK"] as const;

  constructor(value: string) {
    const normalized = value.toUpperCase();
    if (!this.isValid(normalized)) {
      throw new Error("Invalid theme value");
    }
    this.value = normalized as "LIGHT" | "DARK";
  }

  private isValid(value: string): boolean {
    return (UserTheme.allowedThemes as readonly string[]).includes(value);
  }
}
