import { DomainException } from "src/lib/shared/exceptions/domain.exception";

export type UserRole = "user" | "admin";

export class UserRoles {
  readonly value: UserRole[];
  constructor(value?: UserRole[]) {
    const normalized = this.normalize(value);
    if (!this.isValid(normalized)) {
      throw new DomainException("Invalid user roles");
    }
    this.value = normalized;
  }

  private normalize(value?: UserRole[]): UserRole[] {
    const allowed: UserRole[] = ["user", "admin"];
    const input = Array.isArray(value) ? value : ["user"];
    const filtered = input.filter((r): r is UserRole =>
      allowed.includes(r as UserRole)
    );
    const unique = Array.from(new Set(filtered));
    return unique.length ? unique : ["user"];
  }

  private isValid(value: UserRole[]): boolean {
    return value.every((r) => r === "user" || r === "admin");
  }
}
