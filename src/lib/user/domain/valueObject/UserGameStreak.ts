export class UserGameStreak {
  readonly value: number;
  private static readonly MIN_STREAK = 0;

  constructor(value: number) {
    if (!this.isValid(value)) {
      throw new Error("Invalid game streak value");
    }
    this.value = value;
  }

  private isValid(value: number): boolean {
    return value >= UserGameStreak.MIN_STREAK;
  }
}
