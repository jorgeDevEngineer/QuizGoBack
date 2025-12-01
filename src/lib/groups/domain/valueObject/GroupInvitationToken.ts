export class GroupInvitationToken {
  private constructor(
    private readonly _token: string,
    private readonly _expiresAt: Date,
  ) {}

  static create(token: string, expiresAt: Date): GroupInvitationToken {
    if (!token || typeof token !== "string" || token.trim().length < 16) {
      throw new Error("El token de invitación es inválido.");
    }

    // Validar expiresAt 
    if (!expiresAt || typeof expiresAt.getTime !== "function") {
      throw new Error("La fecha de expiración es inválida.");
    }

    // Validar tiempo
    const now = Date.now();
    const expiresTime = expiresAt.getTime();

    if (isNaN(expiresTime)) {
      throw new Error("La fecha de expiración es inválida.");
    }

    if (expiresTime <= now) {
      throw new Error("La invitación debe expirar en el futuro.");
    }

    return new GroupInvitationToken(token, expiresAt);
  }

  // Factory para token random
  static fromGenerator(
    generatorFn: () => string,
    ttlInDays: number,
    now: Date = new Date(),
  ): GroupInvitationToken {
    const token = generatorFn();

    const expiresAt = new Date(now.getTime());
    expiresAt.setDate(expiresAt.getDate() + ttlInDays);

    return GroupInvitationToken.create(token, expiresAt);
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  isExpired(now: Date = new Date()): boolean {
    return now.getTime() > this._expiresAt.getTime();
  }

  equals(other: GroupInvitationToken): boolean {
    return this._token === other._token;
  }

  toPlainObject() {
    return {
      token: this._token,
      expiresAt: this._expiresAt.toISOString(),
    };
  }
}