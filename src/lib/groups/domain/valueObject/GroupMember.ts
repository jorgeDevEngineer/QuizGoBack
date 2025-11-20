// --- Rol del miembro dentro del grupo ---

type GroupRoleValue = "admin" | "member";

export class GroupRole {
  private constructor(public readonly value: GroupRoleValue) {}

  public static admin(): GroupRole {
    return new GroupRole("admin");
  }

  public static member(): GroupRole {
    return new GroupRole("member");
  }

  public static fromString(value: string): GroupRole {
    const valid: GroupRoleValue[] = ["admin", "member"];
    if (!valid.includes(value as GroupRoleValue)) {
      throw new Error(
        `Invalid GroupRole: ${value}. Must be 'admin' or 'member'.`,
      );
    }
    return new GroupRole(value as GroupRoleValue);
  }
}
