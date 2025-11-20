const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

// --- ID de la invitación ---

export class GroupInvitationId {
  private constructor(public readonly value: string) {
    if (!isValidUUID(value)) {
      throw new Error(
        `GroupInvitationId does not have a valid UUID v4 format: ${value}`,
      );
    }
  }

  public static of(value: string): GroupInvitationId {
    return new GroupInvitationId(value);
  }
}

// --- Token que viaja en el link de invitación ---

export class InvitationToken {
  private static readonly MIN_LENGTH = 10;
  private static readonly MAX_LENGTH = 255;

  private constructor(public readonly value: string) {
    if (
      value.length < InvitationToken.MIN_LENGTH ||
      value.length > InvitationToken.MAX_LENGTH
    ) {
      throw new Error(
        `InvitationToken must be between ${InvitationToken.MIN_LENGTH} and ${InvitationToken.MAX_LENGTH} characters.`,
      );
    }
  }

  public static of(value: string): InvitationToken {
    return new InvitationToken(value);
  }
}

// --- Estado de la invitación ---

type InvitationStatusValue = "ACTIVE" | "EXPIRED" | "REVOKED";

export class InvitationStatus {
  private constructor(public readonly value: InvitationStatusValue) {}

  public static active(): InvitationStatus {
    return new InvitationStatus("ACTIVE");
  }

  public static expired(): InvitationStatus {
    return new InvitationStatus("EXPIRED");
  }

  public static revoked(): InvitationStatus {
    return new InvitationStatus("REVOKED");
  }

  public static fromString(value: string): InvitationStatus {
    const valid: InvitationStatusValue[] = ["ACTIVE", "EXPIRED", "REVOKED"];
    if (!valid.includes(value as InvitationStatusValue)) {
      throw new Error(
        `Invalid InvitationStatus: ${value}. Must be 'ACTIVE', 'EXPIRED' or 'REVOKED'.`,
      );
    }
    return new InvitationStatus(value as InvitationStatusValue);
  }
}