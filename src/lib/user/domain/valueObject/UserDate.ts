export class UserDate {
  readonly value: Date;

  constructor(value: Date) {
    if (!this.isValid(value)) {
      throw new Error("Invalid date value");
    }
    this.value = value;
  }

  private isValid(value: Date): boolean {
    return value instanceof Date && !isNaN(value.getTime());
  }
}
