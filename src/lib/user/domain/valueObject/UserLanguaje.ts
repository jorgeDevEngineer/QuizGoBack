export class UserLanguage {
  readonly value: string;
  private static readonly allowedLanguages = ["en", "es"];

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error("Invalid language value");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    return UserLanguage.allowedLanguages.includes(value);
  }
}
