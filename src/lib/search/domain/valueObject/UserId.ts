export class UserId {
  readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error("Invalid User ID format");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    // Example validation: User ID must be a non-empty string (customize as needed)
    return typeof value === "string" && value.trim().length > 0;
  }
}
