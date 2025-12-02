export class UserHashedPassword {
  readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error("Invalid password format");
    }
    this.value = value;
  }

  private isValid(value: string): boolean {
    // Example validation: password must be a valid hash (e.g., bcrypt hash)
    const hashRegex = /^\$2[ayb]\$.{56}$/; // Regex for bcrypt hashes
    return hashRegex.test(value);
  }
}
