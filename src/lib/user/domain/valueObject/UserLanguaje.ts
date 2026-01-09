import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export class UserLanguage {
  readonly value: string;
  private static readonly allowedLanguages = ["en", "es"];

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException("Invalid language value");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    return UserLanguage.allowedLanguages.includes(value);
  }
}
