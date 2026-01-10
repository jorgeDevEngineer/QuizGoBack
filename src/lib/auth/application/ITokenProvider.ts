export interface ITokenProvider {
  generateToken(payload: Record<string, any>): Promise<string>;
  validateToken(token: string): Promise<Record<string, any> | null>;
  revokeToken(token: string): Promise<void>;
}
