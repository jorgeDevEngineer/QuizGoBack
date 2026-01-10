import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ITokenProvider } from "../../application/providers/ITokenProvider";

@Injectable()
export class JwtTokenProvider implements ITokenProvider {
  private revoked = new Set<string>();

  constructor(private readonly jwtService: JwtService) {}

  async generateToken(payload: Record<string, any>): Promise<string> {
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<Record<string, any> | null> {
    if (this.revoked.has(token)) return null;
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }

  async revokeToken(token: string): Promise<void> {
    this.revoked.add(token);
  }
}
