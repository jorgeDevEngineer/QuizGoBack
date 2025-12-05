export class MembershipType {
  readonly value: "free" | "premium";
  constructor(value: "free" | "premium") {
    if (!this.isValid(value)) {
      throw new Error("Invalid membership type");
    }
    this.value = value;
  }

  private isValid(value: string): value is "free" | "premium" {
    return value === "free" || value === "premium";
  }
}
