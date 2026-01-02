export class UserType {
  readonly value: "student" | "teacher" | "personal";

  constructor(value: "student" | "teacher" | "personal") {
    if (!this.isValid(value)) {
      throw new Error("Invalid user type");
    }
    this.value = value;
  }

  private isValid(value: "student" | "teacher" | "personal"): boolean {
    const validTypes = ["student", "teacher", "personal"];
    return validTypes.includes(value);
  }
}
